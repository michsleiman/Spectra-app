import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ColorSystem, Palette, SystemType, SystemControls, AIResponse, SemanticToken, ThemeMode, Snapshot, TypographySystem, DimensionsData } from './types';
import { generateScale } from './utils/interpolation';
import { hexToOklch } from './utils/colorUtils';
import { generateInitialSemantics, refreshSemantics } from './utils/semanticEngine';
import Sidebar from './components/Sidebar';
import MainCanvas from './components/MainCanvas';
import Toolbar from './components/Toolbar';
import AIPromptModal from './components/AIPromptModal';
import UnifiedExportModal from './components/UnifiedExportModal';
import Launcher from './components/Launcher';
import TypographyTool, { DEFAULT_SYSTEM as DEFAULT_TYPOGRAPHY_SYSTEM } from './components/TypographyTool';
import DimensionsTool, { DEFAULT_DIMENSIONS } from './components/DimensionsTool';

const DEFAULT_CONTROLS: SystemControls = {
  punch: 0.15,
  steepness: 0.4, 
  darkness: 0.05, 
  hueRotation: 0,
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
      baseLightness: 0.5,
      baseStepId: 500,
      controls: controls,
      stepCount: 2,
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
    baseLightness: 0.5,
    baseStepId: 500,
    controls: controls,
    stepCount: 11,
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
  const [currentTool, setCurrentTool] = useState<'launcher' | 'colors' | 'typography' | 'dimensions'>('launcher');
  const [systems, setSystems] = useState<ColorSystem[]>(INITIAL_SYSTEMS);
  const [activeSystemId, setActiveSystemId] = useState<string>(INITIAL_SYSTEMS[0].id);
  const [viewMode, setViewMode] = useState<'scales' | 'semantics'>('scales');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    const saved = localStorage.getItem('spectra-snapshots');
    return saved ? JSON.parse(saved) : [];
  });
  const [typographySystem, setTypographySystem] = useState<TypographySystem>(() => {
    const saved = localStorage.getItem('spectra-typography');
    if (!saved) return DEFAULT_TYPOGRAPHY_SYSTEM;
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_TYPOGRAPHY_SYSTEM, ...parsed };
    } catch (e) {
      return DEFAULT_TYPOGRAPHY_SYSTEM;
    }
  });

  const [dimensionsSystem, setDimensionsSystem] = useState<DimensionsData>(() => {
    const saved = localStorage.getItem('spectra-dimensions-v11');
    if (!saved) return DEFAULT_DIMENSIONS;
    try {
      const parsed = JSON.parse(saved);
      // Merge semantics by id to ensure default tokens (including Size category scales) are never lost
      const mergedSemantics = [...DEFAULT_DIMENSIONS.semantics];
      if (parsed.semantics && Array.isArray(parsed.semantics)) {
        parsed.semantics.forEach((tok: any) => {
          const existsIdx = mergedSemantics.findIndex(s => s.id === tok.id);
          if (existsIdx > -1) {
            // Keep user overrides/customization, but normalize keys to title case if needed
            let category = tok.category;
            if (category === 'Component size') category = 'Component Size';
            if (category === 'Surface size') category = 'Surface Size';
            if (category === 'Layout size') category = 'Layout Size';
            mergedSemantics[existsIdx] = { ...mergedSemantics[existsIdx], ...tok, category };
          } else {
            mergedSemantics.push(tok);
          }
        });
      }
      return { 
        ...DEFAULT_DIMENSIONS, 
        ...parsed,
        semantics: mergedSemantics
      };
    } catch (e) {
      return DEFAULT_DIMENSIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('spectra-snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem('spectra-typography', JSON.stringify(typographySystem));
  }, [typographySystem]);

  useEffect(() => {
    localStorage.setItem('spectra-dimensions-v11', JSON.stringify(dimensionsSystem));
  }, [dimensionsSystem]);

  const handleSaveSnapshot = useCallback((name: string) => {
    const newSnapshot: Snapshot = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `Snapshot ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      systems: JSON.parse(JSON.stringify(systems)) // Deep clone
    };
    setSnapshots(prev => [newSnapshot, ...prev]);
  }, [systems]);

  const handleRestoreSnapshot = useCallback((id: string) => {
    const snapshot = snapshots.find(s => s.id === id);
    if (snapshot) {
      setSystems(JSON.parse(JSON.stringify(snapshot.systems)));
    }
  }, [snapshots]);

  const handleDeleteSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  }, []);

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
        return s;
      });
      
      setSemantics(current => refreshSemantics(newSystems, current, theme));
      return newSystems;
    });
  }, [theme]);

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

  const handleReorderSystems = useCallback((newOrder: ColorSystem[]) => {
    setSystems(newOrder);
  }, []);

  const handleLockStep = (stepId: number, hex: string, updateBase = false) => {
    if (activeSystem.type === 'base') return;
    const newOklch = hexToOklch(hex);
    
    updateSystem(activeSystemId, sys => {
      const nextSteps = sys.steps.map(s => {
        if (s.id === stepId) {
          // If we are updating the base (from Perceptual Matrix), we don't lock the step
          return { ...s, hex, oklch: newOklch, isLocked: updateBase ? s.isLocked : true };
        }
        return s;
      });

      return {
        ...sys,
        steps: nextSteps,
        baseHue: updateBase ? newOklch.h : sys.baseHue,
        baseChroma: updateBase ? newOklch.c : sys.baseChroma,
        baseLightness: updateBase ? newOklch.l : sys.baseLightness,
        baseStepId: updateBase ? stepId : sys.baseStepId
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



  useEffect(() => {
    setSemantics(current => refreshSemantics(systems, current, theme));
  }, [theme, systems]);

  const handleUpdateStepCount = (count: number) => {
    if (activeSystem.type === 'base') return;
    updateSystem(activeSystemId, sys => ({ ...sys, stepCount: count }));
  };

  return (
    <AnimatePresence mode="wait">
      {currentTool === 'launcher' ? (
        <motion.div
          key="launcher"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full w-full"
        >
          <Launcher onSelectTool={(tool) => setCurrentTool(tool as any)} />
        </motion.div>
      ) : currentTool === 'typography' ? (
        <motion.div
          key="typography"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full w-full"
        >
          <TypographyTool 
            onBack={() => setCurrentTool('launcher')} 
            system={typographySystem}
            setSystem={setTypographySystem}
            palette={{ 
              id: '1', 
              name: 'Spectra Export', 
              systems, 
              semantics, 
              globalSettings: { masterControls: DEFAULT_CONTROLS } 
            }}
          />
        </motion.div>
      ) : currentTool === 'dimensions' ? (
        <motion.div
          key="dimensions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full w-full"
        >
          <DimensionsTool 
            onBack={() => setCurrentTool('launcher')} 
            system={dimensionsSystem}
            setSystem={setDimensionsSystem}
            palette={{ 
              id: '1', 
              name: 'Spectra Export', 
              systems, 
              semantics, 
              globalSettings: { masterControls: DEFAULT_CONTROLS } 
            }}
            typographySystem={typographySystem}
          />
        </motion.div>
      ) : (
        <motion.div
          key="colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex h-[100dvh] w-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30"
        >
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
              viewMode={viewMode}
              systems={systems} 
              activeSystemId={activeSystemId} 
              onSelectSystem={handleSelectSystem}
              onDeleteSystem={handleDeleteSystem}
              onReorderSystems={handleReorderSystems}
              onOpenAI={() => setIsAIModalOpen(true)}
              onAddSystem={(name, type, hex) => {
                const id = Math.random().toString(36).substr(2, 9);
                const newSys = createSystem(id, name, type, hexToOklch(hex).h, hexToOklch(hex).c);
                setSystems(prev => [...prev.slice(0, -1), newSys, prev[prev.length - 1]]);
                setActiveSystemId(id);
                setIsSidebarOpen(false);
              }}
              onUpdateSystemName={(id, name) => setSystems(prev => prev.map(s => s.id === id ? { ...s, name } : s))}
              onCloseMobile={() => setIsSidebarOpen(false)}
              onBackToLauncher={() => setCurrentTool('launcher')}
              semantics={semantics}
              theme={theme}
              onUpdateSemantic={handleUpdateSemantic}
              onAddSemantic={handleAddSemantic}
              onDeleteSemantic={handleDeleteSemantic}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <Toolbar 
              paletteName="Spectra Core" 
              viewMode={viewMode}
              onToggleView={setViewMode}
              onOpenAI={() => setIsAIModalOpen(true)}
              onExport={() => setIsExportModalOpen(true)}
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
                onUpdateControls={controls => updateSystem(activeSystemId, s => ({ ...s, controls }))}
                onLockStep={handleLockStep}
                onUnlockStep={handleUnlockStep}
                onToggleLockAll={handleToggleLockAll}
                onUpdateSemantic={handleUpdateSemantic}
                onAddSemantic={handleAddSemantic}
                onDeleteSemantic={handleDeleteSemantic}
                onUpdateStepCount={handleUpdateStepCount}
                allLocked={activeSystem.steps.every(s => s.isLocked)}
                onRegenerate={() => updateSystem(activeSystemId, s => s)}
                snapshots={snapshots}
                onSaveSnapshot={handleSaveSnapshot}
                onRestoreSnapshot={handleRestoreSnapshot}
                onDeleteSnapshot={handleDeleteSnapshot}
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
            <UnifiedExportModal 
              palette={{ 
                id: '1', 
                name: 'Spectra Export', 
                systems, 
                semantics, 
                globalSettings: { masterControls: DEFAULT_CONTROLS } 
              }} 
              typographySystem={typographySystem}
              dimensionsSystem={dimensionsSystem}
              onClose={() => setIsExportModalOpen(false)} 
              initialTools={['colors', 'typography', 'dimensions']}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;