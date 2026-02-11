import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ColorSystem, Palette, SystemType, SystemControls, AIResponse, SemanticToken, ThemeMode } from './types';
import { generateScale } from './utils/interpolation';
import { hexToOklch } from './utils/colorUtils';
import { generateInitialSemantics, refreshSemantics } from './utils/semanticEngine';
import Sidebar from './components/Sidebar';
import MainCanvas from './components/MainCanvas';
import Toolbar from './components/Toolbar';
import AIPromptModal from './components/AIPromptModal';
import ExportModal from './components/ExportModal';

const DEFAULT_CONTROLS: SystemControls = {
  punch: 0.15,
  steepness: 0.4, // Globally decreased from 0.6 to 0.4 for a more linear lightness distribution
  darkness: 0, // Decreased to the max (0) globally for lighter deep tones
  accessibilitySafe: true
};

const createSystem = (id: string, name: string, type: SystemType, hue: number, chroma: number, customDarkness?: number): ColorSystem => {
  const controls = { ...DEFAULT_CONTROLS };
  if (customDarkness !== undefined) {
    controls.darkness = customDarkness;
  }

  if (type === 'base') {
    return {
      id,
      name,
      type,
      description: "Immutable fundamental base colors.",
      baseHue: hue,
      baseChroma: chroma,
      controls: controls,
      steps: [
        {
          id: 0,
          hex: '#FFFFFF',
          oklch: hexToOklch('#FFFFFF'),
          usage: 'Pure White',
          isLocked: true,
          contrastOnWhite: 1,
          contrastOnBlack: 21
        },
        {
          id: 1000,
          hex: '#000000',
          oklch: hexToOklch('#000000'),
          usage: 'Pure Black',
          isLocked: true,
          contrastOnWhite: 21,
          contrastOnBlack: 1
        }
      ]
    };
  }

  const base: ColorSystem = {
    id,
    name,
    type,
    description: `Professional ${name} scale optimized for UI layering.`,
    baseHue: hue,
    baseChroma: chroma,
    controls: controls,
    steps: []
  };
  base.steps = generateScale(base);
  return base;
};

const INITIAL_SYSTEMS: ColorSystem[] = [
  createSystem('brand-1', 'Brand', 'brand', 255, 0.18),
  createSystem('neutral-1', 'Neutral', 'neutral', 255, 0.015),
  createSystem('success-1', 'Success', 'success', 145, 0.15),
  createSystem('error-1', 'Error', 'error', 25, 0.18),
  createSystem('warning-1', 'Warning', 'warning', 75, 0.16),
  createSystem('base-1', 'Base', 'base', 0, 0),
];

const App: React.FC = () => {
  const [systems, setSystems] = useState<ColorSystem[]>(INITIAL_SYSTEMS);
  const [activeSystemId, setActiveSystemId] = useState<string>(INITIAL_SYSTEMS[0].id);
  const [viewMode, setViewMode] = useState<'scales' | 'semantics'>('scales');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [syncCurves, setSyncCurves] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeSystem = useMemo(() => 
    systems.find(s => s.id === activeSystemId) || systems[0], 
  [systems, activeSystemId]);

  const [semantics, setSemantics] = useState<SemanticToken[]>(() => generateInitialSemantics(INITIAL_SYSTEMS, 'dark'));

  const updateSystem = useCallback((id: string, updater: (sys: ColorSystem) => ColorSystem) => {
    setSystems(prev => {
      const newSystems = prev.map(s => {
        if (s.id === id) {
          const updated = updater(s);
          if (updated.type !== 'base') {
            updated.steps = generateScale(updated);
          }
          return updated;
        }
        if (syncCurves && id !== s.id && s.type !== 'base') {
          const source = updater(prev.find(x => x.id === id)!);
          return {
            ...s,
            controls: source.controls,
            steps: generateScale({ ...s, controls: source.controls })
          };
        }
        return s;
      });
      
      setSemantics(current => refreshSemantics(newSystems, current, theme));
      return newSystems;
    });
  }, [syncCurves, theme]);

  const handleDeleteSystem = useCallback((id: string) => {
    setSystems(prev => {
      const toDelete = prev.find(s => s.id === id);
      if (!toDelete || toDelete.type === 'base' || prev.length <= 1) return prev;
      
      const filtered = prev.filter(s => s.id !== id);
      if (activeSystemId === id) {
        setActiveSystemId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeSystemId]);

  const handleLockStep = (stepId: number, hex: string, clearOthers = false) => {
    if (activeSystem.type === 'base') return;
    const newOklch = hexToOklch(hex);
    
    updateSystem(activeSystemId, sys => {
      const nextSteps = sys.steps.map(s => {
        if (s.id === stepId) return { ...s, hex, oklch: newOklch, isLocked: true };
        if (clearOthers) return { ...s, isLocked: false };
        return s;
      });

      return {
        ...sys,
        baseHue: clearOthers ? newOklch.h : sys.baseHue,
        baseChroma: clearOthers ? newOklch.c : sys.baseChroma,
        steps: nextSteps
      };
    });
  };

  const handleUnlockStep = (stepId: number) => {
    if (activeSystem.type === 'base') return;
    updateSystem(activeSystemId, sys => ({
      ...sys,
      steps: sys.steps.map(s => s.id === stepId ? { ...s, isLocked: false } : s)
    }));
  };

  const handleToggleLockAll = () => {
    if (activeSystem.type === 'base') return;
    const allAreLocked = activeSystem.steps.every(s => s.isLocked);
    updateSystem(activeSystemId, sys => ({
      ...sys,
      steps: sys.steps.map(s => ({ ...s, isLocked: !allAreLocked }))
    }));
  };

  const handleUpdateSemantic = (tokenId: string, systemType: SystemType, stepId: number | 'white' | 'black') => {
    setSemantics(prev => {
      const updated = prev.map(t => {
        if (t.id === tokenId) {
          const field = theme === 'light' ? 'lightStep' : 'darkStep';
          return { ...t, systemType, [field]: stepId };
        }
        return t;
      });
      return refreshSemantics(systems, updated, theme);
    });
  };

  const handleAddSemantic = (token: Partial<SemanticToken>) => {
    const newToken: SemanticToken = {
      id: token.id || `custom-${Date.now()}`,
      name: token.name || 'Custom Token',
      category: token.category || 'Text',
      systemType: 'neutral',
      lightStep: 500,
      darkStep: 500,
      hex: '#888888',
      ...token
    };
    setSemantics(prev => refreshSemantics(systems, [...prev, newToken], theme));
  };

  const handleDeleteSemantic = (tokenId: string) => {
    setSemantics(prev => prev.filter(t => t.id !== tokenId));
  };

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);

  const handleSelectSystem = (id: string) => {
    setActiveSystemId(id);
    setIsSidebarOpen(false); 
  };

  const handleCopyToFigma = useCallback(async (mode: ThemeMode) => {
    const isDarkArtboard = mode === 'dark';
    const canvasBg = isDarkArtboard ? '#0A0A0B' : '#FFFFFF';
    const primaryText = isDarkArtboard ? '#FFFFFF' : '#18181B';
    const secondaryText = isDarkArtboard ? '#71717A' : '#71717A';
    const borderCol = isDarkArtboard ? '#27272A' : '#E4E4E7';
    const cardBg = isDarkArtboard ? '#141416' : '#F9F9FB';
    const stripeBg = isDarkArtboard ? '#1C1C1E' : '#F1F1F4';
    const accentColor = '#6366F1';

    const getHex = (sysType: SystemType, step: number | 'white' | 'black') => {
      if (step === 'white') return '#FFFFFF';
      if (step === 'black') return '#000000';
      const sys = systems.find(s => s.type === sysType);
      return sys?.steps.find(s => s.id === step)?.hex || '#888888';
    };

    const getSysName = (sysType: SystemType) => {
      const sys = systems.find(s => s.type === sysType);
      return sys?.name || sysType.charAt(0).toUpperCase() + sysType.slice(1);
    };

    const rowHeight = 110;
    const swatchWidth = 64;
    const swatchHeight = 54;
    const semRowHeight = 48;
    const categoryHeaderHeight = 64;
    const width = 1120;

    const visibleSemantics = semantics.filter(s => !s.parent);
    const categoryOrder = ['Text', 'Border', 'Foreground', 'Background'];
    const activeCategories = categoryOrder.filter(cat => visibleSemantics.some(s => s.category === cat));
    const totalHeight = 300 + (systems.length * rowHeight) + (activeCategories.length * categoryHeaderHeight) + (visibleSemantics.length * semRowHeight) + 100;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>`;
    svg += `<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect id="Artboard Background" width="${width}" height="${totalHeight}" fill="${canvasBg}" />`;
    
    svg += `<g id="Spectra Palette: ${mode.toUpperCase()}">`;
    
    // 1. HEADER
    svg += `<g id="System Info">`;
    svg += `<text x="40" y="60" fill="${primaryText}" font-family="Inter, sans-serif" font-size="32" font-weight="900">SPECTRA CORE</text>`;
    svg += `<text x="40" y="88" fill="${secondaryText}" font-family="Inter, sans-serif" font-size="12" font-weight="700" letter-spacing="0.1em">DESIGN SYSTEM TOKENS • ${mode.toUpperCase()} ARTBOARD</text>`;
    svg += `</g>`;

    // 2. PRIMITIVE SCALES
    let currentY = 160;
    svg += `<g id="Primitives Section">`;
    svg += `<text x="40" y="${currentY - 30}" fill="${secondaryText}" font-family="Inter, sans-serif" font-size="11" font-weight="800" letter-spacing="0.25em">PRIMITIVE SCALES</text>`;
    
    systems.forEach((sys) => {
      svg += `<g id="Scale: ${sys.name}">`;
      svg += `<rect id="Bounding Box" x="30" y="${currentY - 15}" width="${width - 60}" height="${rowHeight - 10}" rx="16" fill="${cardBg}" stroke="${borderCol}" stroke-width="1" />`;
      svg += `<text x="50" y="${currentY + 28}" fill="${primaryText}" font-family="Inter, sans-serif" font-size="14" font-weight="800">${sys.name}</text>`;
      
      sys.steps.forEach((step, i) => {
        const x = 180 + (i * (swatchWidth + 8));
        const textColor = step.contrastOnBlack > step.contrastOnWhite ? '#000000' : '#FFFFFF';
        
        const displayStepLabel = (sys.type === 'base') 
          ? (step.id === 0 ? 'W' : (step.id === 1000 ? 'B' : step.id))
          : step.id;

        svg += `<g id="${sys.name} / ${displayStepLabel}">`;
        svg += `<rect x="${x}" y="${currentY}" width="${swatchWidth}" height="${swatchHeight}" rx="10" fill="${step.hex}" />`;
        svg += `<text x="${x + 8}" y="${currentY + 18}" fill="${textColor}" font-family="Inter, sans-serif" font-size="9" font-weight="900" xml:space="preserve">${displayStepLabel}</text>`;
        svg += `<text x="${x + 8}" y="${currentY + 40}" fill="${textColor}" font-family="JetBrains Mono, monospace" font-size="8" font-weight="500" xml:space="preserve">${step.hex}</text>`;
        svg += `</g>`;
      });
      svg += `</g>`;
      currentY += rowHeight;
    });
    svg += `</g>`;

    // 3. SEMANTIC MAPPINGS (BIDIRECTIONAL)
    currentY += 60;
    svg += `<g id="Semantics Section">`;
    svg += `<text x="40" y="${currentY - 30}" fill="${secondaryText}" font-family="Inter, sans-serif" font-size="11" font-weight="800" letter-spacing="0.25em">SEMANTIC SYSTEM MAPPINGS (ALL MODES)</text>`;
    
    svg += `<g id="Table Header">`;
    svg += `<rect x="40" y="${currentY - 5}" width="${width - 80}" height="42" rx="14" fill="${isDarkArtboard ? '#1C1C1E' : '#F4F4F5'}" />`;
    svg += `<text x="65" y="${currentY + 22}" fill="${secondaryText}" font-family="Inter, sans-serif" font-size="10" font-weight="900" letter-spacing="0.05em">TOKEN NAME</text>`;
    svg += `<text x="420" y="${currentY + 22}" fill="${secondaryText}" font-family="Inter, sans-serif" font-size="10" font-weight="900" letter-spacing="0.05em">LIGHT MAPPING</text>`;
    svg += `<text x="770" y="${currentY + 22}" fill="${secondaryText}" font-family="Inter, sans-serif" font-size="10" font-weight="900" letter-spacing="0.05em">DARK MAPPING</text>`;
    svg += `</g>`;
    
    currentY += 56;

    activeCategories.forEach(cat => {
      const catTokens = visibleSemantics.filter(s => s.category === cat);
      if (catTokens.length === 0) return;

      svg += `<g id="Group: ${cat}">`;
      svg += `<text x="50" y="${currentY + 10}" fill="${accentColor}" font-family="Inter, sans-serif" font-size="10" font-weight="900" letter-spacing="0.1em">${cat.toUpperCase()}</text>`;
      svg += `<rect x="40" y="${currentY + 24}" width="${width - 80}" height="1" fill="${borderCol}" />`;
      currentY += 48;

      catTokens.forEach((sem, idx) => {
        const hexLight = getHex(sem.systemType, sem.lightStep);
        const hexDark = getHex(sem.systemType, sem.darkStep);
        
        const getLabel = (step: number | 'white' | 'black') => {
          if (step === 'white') return 'Base W';
          if (step === 'black') return 'Base B';
          return `${getSysName(sem.systemType)} ${step}`;
        };

        svg += `<g id="Token: ${sem.name}">`;
        if (idx % 2 === 0) {
          svg += `<rect id="Row Fill" x="40" y="${currentY - 14}" width="${width - 80}" height="${semRowHeight}" rx="12" fill="${stripeBg}" />`;
        }

        svg += `<text x="65" y="${currentY + 16}" fill="${primaryText}" font-family="Inter, sans-serif" font-size="13" font-weight="700">${sem.name}</text>`;
        
        // Light Column
        svg += `<g id="Light: ${sem.name}">`;
        svg += `<rect x="420" y="${currentY}" width="26" height="26" rx="9" fill="${hexLight}" stroke="${borderCol}" stroke-width="1.5" />`;
        svg += `<text x="458" y="${currentY + 16}" fill="${primaryText}" font-family="Inter, sans-serif" font-size="11" font-weight="700" xml:space="preserve">${getLabel(sem.lightStep)} <tspan fill="${secondaryText}" font-family="JetBrains Mono" font-weight="500" font-size="10"> — ${hexLight}</tspan></text>`;
        svg += `</g>`;

        // Dark Column
        svg += `<g id="Dark: ${sem.name}">`;
        svg += `<rect x="770" y="${currentY}" width="26" height="26" rx="9" fill="${hexDark}" stroke="${borderCol}" stroke-width="1.5" />`;
        svg += `<text x="808" y="${currentY + 16}" fill="${primaryText}" font-family="Inter, sans-serif" font-size="11" font-weight="700" xml:space="preserve">${getLabel(sem.darkStep)} <tspan fill="${secondaryText}" font-family="JetBrains Mono" font-weight="500" font-size="10"> — ${hexDark}</tspan></text>`;
        svg += `</g>`;

        svg += `</g>`;
        currentY += semRowHeight;
      });
      svg += `</g>`;
      currentY += 24; 
    });
    
    svg += `</g>`;
    svg += `</g>`;
    svg += `</svg>`;
    
    try {
      await navigator.clipboard.writeText(svg);
      return true;
    } catch (err) {
      console.error("Figma copy failed:", err);
      const textArea = document.createElement("textarea");
      textArea.value = svg;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (e) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }, [systems, semantics]);

  useEffect(() => {
    setSemantics(current => refreshSemantics(systems, current, theme));
  }, [theme, systems]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        sidebar-responsive-container
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          systems={systems} 
          activeSystemId={activeSystemId} 
          onSelectSystem={handleSelectSystem}
          onDeleteSystem={handleDeleteSystem}
          syncCurves={syncCurves}
          onToggleSync={() => setSyncCurves(!syncCurves)}
          onAddSystem={(name, type, hex) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newSys = createSystem(id, name, type, hexToOklch(hex).h, hexToOklch(hex).c);
            setSystems(prev => [...prev.slice(0, -1), newSys, prev[prev.length - 1]]);
            setActiveSystemId(id);
            setIsSidebarOpen(false);
          }}
          onUpdateSystemName={(id, name) => setSystems(prev => prev.map(s => s.id === id ? { ...s, name } : s))}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Toolbar 
          paletteName="Spectra Core" 
          viewMode={viewMode}
          onToggleView={setViewMode}
          onOpenAI={() => setIsAIModalOpen(true)}
          onExport={() => setIsExportModalOpen(true)}
          onCopyToFigma={handleCopyToFigma}
          canUndo={false}
          onUndo={() => {}}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="flex-1 relative overflow-hidden">
          <MainCanvas 
            viewMode={viewMode}
            theme={theme}
            onToggleTheme={toggleTheme}
            system={activeSystem}
            semantics={semantics}
            allSystems={systems}
            isSynced={syncCurves}
            onUpdateControls={controls => updateSystem(activeSystemId, s => ({ ...s, controls }))}
            onLockStep={handleLockStep}
            onUnlockStep={handleUnlockStep}
            onToggleLockAll={handleToggleLockAll}
            onUpdateSemantic={handleUpdateSemantic}
            onAddSemantic={handleAddSemantic}
            onDeleteSemantic={handleDeleteSemantic}
            allLocked={activeSystem.steps.every(s => s.isLocked)}
            onRegenerate={() => updateSystem(activeSystemId, s => s)}
          />
        </div>
      </div>

      {isAIModalOpen && (
        <AIPromptModal 
          onClose={() => setIsAIModalOpen(false)} 
          onApply={(ai: AIResponse) => {
            const newSystems = ai.systems.map(s => createSystem(Math.random().toString(), s.name, s.type, s.baseHue, s.baseChroma));
            const baseSystem = systems.find(s => s.type === 'base') || createSystem('base-1', 'Base', 'base', 0, 0);
            setSystems([...newSystems, baseSystem]);
            setIsAIModalOpen(false);
          }}
        />
      )}

      {isExportModalOpen && (
        <ExportModal 
          palette={{ 
            id: '1', 
            name: 'Spectra Export', 
            systems, 
            semantics, 
            globalSettings: { syncCurves, masterControls: DEFAULT_CONTROLS } 
          }} 
          onClose={() => setIsExportModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;