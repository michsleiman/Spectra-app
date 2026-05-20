import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Trash2, 
  Plus, 
  Settings2, 
  X, 
  Grid3X3, 
  Layers, 
  LayoutGrid, 
  Ruler, 
  ArrowLeft,
  Maximize2,
  Minimize2,
  Crosshair,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  DimensionsData, 
  DimensionSystem, 
  RadiusSystem, 
  DimensionSemanticToken,
  DimensionStep,
  RadiusStep
} from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

export const DEFAULT_DIMENSIONS: DimensionsData = {
  spacing: {
    id: 'spacing-default',
    name: 'Spacing System',
    baseValue: 4,
    scale: [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256, 320, 384, 480],
    scaleNames: {
      1: '1', 2: '2', 3: '3', 4: '4', 6: '6', 8: '8', 10: '10', 12: '12', 
      16: '16', 20: '20', 24: '24', 32: '32', 40: '40', 48: '48', 
      64: '64', 80: '80', 96: '96', 128: '128', 160: '160', 192: '192',
      256: '256', 320: '320', 384: '384', 480: '480'
    },
    steps: []
  },
  radius: {
    id: 'radius-default',
    name: 'Radius System',
    steps: []
  },
  semantics: [
    { id: 's-xs', name: 'spacing-xs', value: 1, category: 'Spacing', type: 'spacing' },
    { id: 's-sm', name: 'spacing-sm', value: 2, category: 'Spacing', type: 'spacing' },
    { id: 's-md', name: 'spacing-md', value: 4, category: 'Spacing', type: 'spacing' },
    { id: 's-lg', name: 'spacing-lg', value: 6, category: 'Spacing', type: 'spacing' },
    { id: 's-xl', name: 'spacing-xl', value: 8, category: 'Spacing', type: 'spacing' },
    { id: 's-2xl', name: 'spacing-2xl', value: 12, category: 'Spacing', type: 'spacing' },
    { id: 's-3xl', name: 'spacing-3xl', value: 16, category: 'Spacing', type: 'spacing' },
    { id: 's-4xl', name: 'spacing-4xl', value: 20, category: 'Spacing', type: 'spacing' },
    { id: 's-5xl', name: 'spacing-5xl', value: 24, category: 'Spacing', type: 'spacing' },
    { id: 's-6xl', name: 'spacing-6xl', value: 32, category: 'Spacing', type: 'spacing' },
    { id: 's-7xl', name: 'spacing-7xl', value: 40, category: 'Spacing', type: 'spacing' },
    { id: 's-8xl', name: 'spacing-8xl', value: 48, category: 'Spacing', type: 'spacing' },
    { id: 'w-content', name: 'width-content', value: 160, category: 'Widths', type: 'spacing' },
    { id: 'w-container', name: 'width-container', value: 320, category: 'Widths', type: 'spacing' },
    { id: 'p-mobile', name: 'padding-mobile', value: 4, category: 'Container Padding', type: 'spacing' },
    { id: 'p-desktop', name: 'padding-desktop', value: 8, category: 'Container Padding', type: 'spacing' },
    { id: 'r-none', name: 'radius-none', value: 0, category: 'Radius', type: 'radius' },
    { id: 'r-sm', name: 'radius-sm', value: 1, category: 'Radius', type: 'radius' },
    { id: 'r-md', name: 'radius-md', value: 2, category: 'Radius', type: 'radius' },
    { id: 'r-lg', name: 'radius-lg', value: 3, category: 'Radius', type: 'radius' },
    { id: 'r-xl', name: 'radius-xl', value: 4, category: 'Radius', type: 'radius' },
    { id: 'r-2xl', name: 'radius-2xl', value: 6, category: 'Radius', type: 'radius' },
    { id: 'r-3xl', name: 'radius-3xl', value: 8, category: 'Radius', type: 'radius' },
    { id: 'r-full', name: 'radius-full', value: 999, category: 'Radius', type: 'radius' }
  ]
};

interface DimensionsToolProps {
  system: DimensionsData;
  setSystem: React.Dispatch<React.SetStateAction<DimensionsData>>;
  onBack: () => void;
  // Accept and ignore additional props from App.tsx
  palette?: any;
  typographySystem?: any;
}

const DimensionsTool: React.FC<DimensionsToolProps> = ({ system, setSystem, onBack }) => {
  const [viewMode, setViewMode] = useState<'semantic' | 'preview'>('preview');
  const [hoveredMultiplier, setHoveredMultiplier] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<number | null>(null);
  const [editingSemantic, setEditingSemantic] = useState<DimensionSemanticToken | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Local form state
  const [tempValue, setTempValue] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempSemanticName, setTempSemanticName] = useState('');
  
  // Delete Popovers
  const [scaleToDelete, setScaleToDelete] = useState<number | null>(null);
  const [semanticToDelete, setSemanticToDelete] = useState<string | null>(null);

  const handleEditScale = (val: number) => {
    setEditingValue(val);
    setTempValue(val.toString());
    setTempName(system.spacing.scaleNames?.[val] || val.toString());
    setIsModalOpen(true);
  };

  const handleDeleteScale = (val: number) => {
    setScaleToDelete(val);
  };

  const confirmDeleteScale = () => {
    if (scaleToDelete !== null) {
      setSystem(prev => ({
        ...prev,
        spacing: {
          ...prev.spacing,
          scale: prev.spacing.scale.filter(v => v !== scaleToDelete),
          scaleNames: prev.spacing.scaleNames ? Object.fromEntries(
            Object.entries(prev.spacing.scaleNames).filter(([k]) => Number(k) !== scaleToDelete)
          ) : {}
        }
      }));
      setScaleToDelete(null);
    }
  };

  const handleAddScale = () => {
    setEditingValue(null);
    setTempValue('');
    setTempName('');
    setIsModalOpen(true);
  };

  const [errorStatus, setErrorStatus] = useState<{ name?: string, size?: string } | null>(null);

  const handleSaveScale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    const val = parseFloat(tempValue);
    if (isNaN(val)) return;

    if (activeCategory) {
      // Validate Semantic
      const nameExists = system.semantics.some(s => s.name.toLowerCase() === tempSemanticName.toLowerCase() && s.id !== editingSemantic?.id);
      
      if (nameExists) {
        setErrorStatus({ name: "This token name already exists" });
        return;
      }

      if (editingSemantic) {
        setSystem(prev => ({
          ...prev,
          semantics: prev.semantics.map(s => s.id === editingSemantic.id ? {
            ...s,
            name: tempSemanticName,
            value: val,
            type: activeCategory === 'Radius' ? 'radius' : 'spacing'
          } as DimensionSemanticToken : s)
        }));
      } else {
        const newSemantic: DimensionSemanticToken = {
          id: `sem-${Date.now()}`,
          name: tempSemanticName,
          value: val,
          category: activeCategory,
          type: activeCategory === 'Radius' ? 'radius' : 'spacing'
        };
        setSystem(prev => ({
          ...prev,
          semantics: [...prev.semantics, newSemantic]
        }));
      }
    } else {
      // Validate Scale
      const sizeExists = system.spacing.scale.some(s => s === val && s !== editingValue);
      const nameExists = Object.values(system.spacing.scaleNames || {}).some(n => n.toLowerCase() === tempName.toLowerCase() && (editingValue === null || system.spacing.scaleNames?.[editingValue] !== n));

      if (sizeExists || nameExists) {
        setErrorStatus({
          size: sizeExists ? "This size already exists" : undefined,
          name: nameExists ? "This name already exists" : undefined
        });
        return;
      }

      setSystem(prev => {
        const newScale = [...prev.spacing.scale];
        if (editingValue !== null) {
          const idx = newScale.indexOf(editingValue);
          newScale[idx] = val;
        } else {
          newScale.push(val);
        }
        return {
          ...prev,
          spacing: {
            ...prev.spacing,
            scale: newScale.sort((a, b) => a - b),
            scaleNames: {
              ...(prev.spacing.scaleNames || {}),
              [val]: tempName || val.toString()
            }
          }
        };
      });
    }

    setIsModalOpen(false);
    setEditingValue(null);
    setEditingSemantic(null);
    setActiveCategory(null);
    setErrorStatus(null);
  };

  const handleEditSemantic = (token: DimensionSemanticToken) => {
    setEditingSemantic(token);
    setActiveCategory(token.category);
    setTempSemanticName(token.name);
    setTempValue(token.value.toString());
    setIsModalOpen(true);
  };

  const handleDeleteSemantic = (id: string) => {
    setSemanticToDelete(id);
  };

  const confirmDeleteSemantic = () => {
    if (semanticToDelete) {
      setSystem(prev => ({
        ...prev,
        semantics: prev.semantics.filter(s => s.id !== semanticToDelete)
      }));
      setSemanticToDelete(null);
    }
  };

  const handleAddSemantic = (category: string) => {
    setEditingSemantic(null);
    setActiveCategory(category);
    setTempSemanticName('');
    setTempValue(system.spacing.scale[0].toString());
    setIsModalOpen(true);
  };

  const getSemanticValue = (id: string): number => {
    const token = system.semantics.find(s => s.id === id);
    if (!token) return 0;
    const mult = typeof token.value === 'string' ? parseFloat(token.value) : token.value;
    return mult * system.spacing.baseValue;
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-indigo-500/30">
      {/* Visual Ruler Navigation */}
      <header className="h-20 shrink-0 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/80 px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-8">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all flex items-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center rotate-3 shadow-xl shadow-indigo-500/20">
                 <Ruler className="w-5 h-5 text-white" />
               </div>
               Geometric Engine
            </h1>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-0.5 ml-11">Foundation modulator v2.0</span>
          </div>

          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-2xl border border-zinc-800/50">
            <button 
              onClick={() => setViewMode('semantic')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'semantic' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Semantic Mapping
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Composition Lab
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Base Value</span>
               <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
                 <button 
                   onClick={() => setSystem(prev => ({ ...prev, spacing: { ...prev.spacing, baseValue: Math.max(1, prev.spacing.baseValue - 1) } }))}
                   className="p-2 hover:bg-zinc-900 border-r border-zinc-800 text-zinc-500"
                 >
                   -
                 </button>
                 <span className="px-4 text-sm font-mono font-black text-indigo-400">{system.spacing.baseValue}px</span>
                 <button 
                   onClick={() => setSystem(prev => ({ ...prev, spacing: { ...prev.spacing, baseValue: prev.spacing.baseValue + 1 } }))}
                   className="p-2 hover:bg-zinc-900 border-l border-zinc-800 text-zinc-500"
                 >
                   +
                 </button>
               </div>
             </div>
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Foundation Sidebar: The Visual Ruler */}
        <aside className="w-[380px] shrink-0 border-r border-zinc-900 bg-zinc-950 flex flex-col relative z-40">
           <div className="p-8 border-b border-zinc-900 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                   <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Grid3X3 className="w-4 h-4 text-indigo-500" />
                     Logical Foundations
                   </h2>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Multipliers based on {system.spacing.baseValue}px base</p>
                </div>
                <button 
                  onClick={handleAddScale}
                  className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/5"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {system.spacing.scale.map(val => (
                <div 
                  key={val}
                  onMouseEnter={() => setHoveredMultiplier(val)}
                  onMouseLeave={() => setHoveredMultiplier(null)}
                  className={`group relative p-4 rounded-2xl transition-all border ${hoveredMultiplier === val ? 'bg-zinc-900 border-zinc-700 shadow-2xl scale-[1.02] -translate-x-1' : 'bg-zinc-900/40 border-zinc-800/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono transition-all ${hoveredMultiplier === val ? 'bg-indigo-500 text-white rotate-6' : 'bg-zinc-950 text-zinc-500'}`}>
                        {val}x
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${hoveredMultiplier === val ? 'text-indigo-400' : 'text-zinc-400'}`}>
                          dimension-{system.spacing.scaleNames?.[val] || val}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-lg font-black text-white">{val * system.spacing.baseValue}</span>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase italic">px</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditScale(val)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteScale(val)} className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rich Delete Confirmation Tooltip-style Popover */}
                  <AnimatePresence>
                     {scaleToDelete === val && (
                       <div className="absolute top-0 right-0 z-50 p-2 transform translate-x-full">
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.9, x: -10 }}
                           animate={{ opacity: 1, scale: 1, x: 0 }}
                           exit={{ opacity: 0, scale: 0.9, x: -10 }}
                           className="bg-zinc-900 border border-red-500/30 rounded-2xl p-4 shadow-2xl w-48 text-center"
                         >
                            <h4 className="text-[10px] font-black text-white uppercase tracking-tight mb-3">Delete this foundation?</h4>
                            <div className="grid grid-cols-2 gap-2">
                               <Button variant="secondary" size="sm" onClick={() => setScaleToDelete(null)}>No</Button>
                               <Button variant="primary" size="sm" onClick={() => confirmDeleteScale()} className="!bg-red-500 border-none">Yes</Button>
                            </div>
                         </motion.div>
                       </div>
                     )}
                  </AnimatePresence>
                </div>
              ))}
           </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-hidden flex relative">
          {viewMode === 'semantic' ? (
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-10 bg-zinc-950">
               <div className="max-w-6xl mx-auto space-y-24 pb-20">
                  {/* Spacing System */}
                  <section>
                    <div className="flex items-center gap-6 mb-12">
                      <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Spacing System</h2>
                      <div className="h-[1px] flex-1 bg-zinc-900" />
                    </div>

                    <div className="space-y-16">
                      {['Spacing', 'Widths', 'Container Padding', 'Screens'].map(subCat => (
                        <div key={subCat} className="space-y-6">
                           <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center gap-2">
                               <div className="w-1 h-4 bg-indigo-500" />
                               {subCat}
                            </h3>
                            <button 
                              onClick={() => handleAddSemantic(subCat)}
                              className="p-1 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all uppercase tracking-widest flex items-center gap-2"
                            >
                              <Plus className="w-3 h-3" />
                              Add Token
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {system.semantics.filter(s => s.category === subCat).map(token => {
                              const isHighlighted = hoveredMultiplier === token.value;
                              const pxValue = (token.value as number) * system.spacing.baseValue;
                              
                              return (
                                <div 
                                  key={token.id} 
                                  className={`relative bg-zinc-900 border px-4 py-3 rounded-xl group transition-all flex items-center justify-between gap-4 ${isHighlighted ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-zinc-900 shadow-xl' : 'border-zinc-800/40 hover:border-zinc-700'}`}
                                >
                                   <div className="flex flex-col min-w-0">
                                     <div className="flex items-center gap-2">
                                       <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isHighlighted ? 'text-indigo-400' : 'text-zinc-200'}`}>{token.name}</span>
                                       {isHighlighted && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                                     </div>
                                     <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                                       dimension-{system.spacing.scaleNames?.[token.value as number] || token.value}
                                     </span>
                                   </div>

                                   <div className="flex items-center gap-3 shrink-0">
                                     <div className="text-right">
                                       <div className={`text-xs font-black font-mono leading-none ${isHighlighted ? 'text-indigo-300' : 'text-zinc-300'}`}>
                                         {pxValue}px
                                       </div>
                                       <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Output</div>
                                     </div>
                                     
                                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditSemantic(token)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white">
                                          <Settings2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDeleteSemantic(token.id)} className="p-1.5 hover:bg-red-500/10 rounded-md text-zinc-600 hover:text-red-400">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                     </div>
                                   </div>

                                   {/* Semantic Token Delete Confirmation */}
                                   <AnimatePresence>
                                      {semanticToDelete === token.id && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[calc(100%+8px)] pointer-events-none">
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-zinc-900 border border-red-500/30 rounded-2xl p-4 shadow-2xl pointer-events-auto text-center"
                                          >
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-tight mb-3">Delete {token.name}?</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                              <Button variant="secondary" size="sm" onClick={() => setSemanticToDelete(null)}>No</Button>
                                              <Button variant="primary" size="sm" onClick={() => confirmDeleteSemantic()} className="!bg-red-500 border-none">Yes</Button>
                                            </div>
                                          </motion.div>
                                        </div>
                                      )}
                                   </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Radius System Section */}
                  <section>
                     <div className="flex items-center gap-6 mb-12">
                      <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Radius System</h2>
                      <div className="h-[1px] flex-1 bg-zinc-900" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {system.semantics.filter(s => s.category === 'Radius').map(token => {
                        const isHighlighted = hoveredMultiplier === token.value;
                        const pxValue = (token.value as number) * system.spacing.baseValue;

                        return (
                          <div 
                             key={token.id} 
                             className={`bg-zinc-900 border p-4 rounded-3xl group transition-all space-y-4 ${isHighlighted ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-800/60 hover:border-zinc-700'}`}
                          >
                             <div className="flex items-center justify-between gap-4">
                               <div className="flex flex-col min-w-0">
                                 <div className="flex items-center gap-2">
                                   <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isHighlighted ? 'text-emerald-400' : 'text-zinc-200'}`}>{token.name}</span>
                                 </div>
                                 <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                                   dimension-{system.spacing.scaleNames?.[token.value as number] || token.value}
                                 </span>
                               </div>
                               <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditSemantic(token)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white">
                                    <Settings2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteSemantic(token.id)} className="p-1.5 hover:bg-red-500/10 rounded-md text-zinc-600 hover:text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                             </div>

                             <div className={`flex items-center justify-center py-6 rounded-2xl border transition-colors ${isHighlighted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-950/50 border-zinc-800/30'}`}>
                                <div 
                                  style={{ borderRadius: `${pxValue}px` }}
                                  className={`w-16 h-16 transition-all duration-300 ${isHighlighted ? 'bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]' : 'bg-emerald-500/10 border border-emerald-500/30'}`}
                                />
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
               </div>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-12 bg-zinc-950">
               <div className="max-w-[1200px] mx-auto space-y-24 pb-20">
                  
                  {/* Pattern Header */}
                  <div className="flex flex-col gap-4 text-center items-center">
                    <div className="inline-flex items-center gap-3 opacity-50 px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                       <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Composition Lab</span>
                    </div>
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter max-w-2xl text-center">
                      Consistency through logic foundations.
                    </h2>
                  </div>

                  <div className="grid grid-cols-12 gap-12 font-sans text-left">
                    {/* SOCIAL CARD */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                       <div className="flex items-center gap-3 px-4">
                         <div className="w-8 h-px bg-zinc-800" />
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Architectural Spec: Card</span>
                       </div>

                       <div 
                        style={{ 
                          borderRadius: `${getSemanticValue('r-2xl')}px`,
                          padding: `${getSemanticValue('s-8xl')}px`,
                        }}
                        className={`bg-zinc-900/40 border border-zinc-800/50 relative overflow-hidden transition-all duration-500 group shadow-2xl ${hoveredMultiplier === system.semantics.find(s => s.id === 'r-2xl')?.value ? 'ring-8 ring-indigo-500/10 border-indigo-500/40 scale-[1.01]' : ''}`}
                      >
                         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                           style={{ 
                             backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                             backgroundSize: `${system.spacing.baseValue * 4}px ${system.spacing.baseValue * 4}px` 
                           }} 
                         />
                         
                         <div className="flex flex-col gap-8 relative z-10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div 
                                  style={{ borderRadius: `${getSemanticValue('r-xl')}px` }}
                                  className={`w-14 h-14 bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all ${hoveredMultiplier === system.semantics.find(s => s.id === 'r-xl')?.value ? 'scale-110 ring-4 ring-indigo-500/20' : ''}`}
                                />
                                <div className="space-y-1.5 text-left">
                                   <div className="h-4 w-32 bg-white rounded-full" />
                                   <div className="h-2 w-20 bg-zinc-700 rounded-full" />
                                </div>
                              </div>
                              <div 
                                style={{ 
                                  padding: `${getSemanticValue('s-xs')}px`,
                                  borderRadius: `${getSemanticValue('r-md')}px`
                                }}
                                className={`bg-white/5 border border-white/10 transition-all ${hoveredMultiplier === system.semantics.find(s => s.id === 's-xs')?.value ? 'bg-indigo-500/20 border-indigo-500' : ''}`}
                              >
                                <Plus className="w-5 h-5 text-white" />
                              </div>
                            </div>

                            <div 
                              style={{ 
                                borderRadius: `${getSemanticValue('r-xl')}px`,
                                height: '240px'
                              }}
                              className={`w-full bg-zinc-950 border border-zinc-800/80 flex items-center justify-center transition-all ${hoveredMultiplier === system.semantics.find(s => s.id === 'r-xl')?.value ? 'border-indigo-500 ring-4 ring-indigo-500/10' : ''}`}
                            >
                               <Settings2 className={`w-12 h-12 transition-colors ${hoveredMultiplier ? 'text-indigo-500' : 'text-zinc-800'}`} />
                            </div>

                            <div className="flex flex-col gap-3">
                               <div className="h-5 w-full bg-zinc-800 rounded-full" />
                               <div className="h-5 w-2/3 bg-zinc-800 rounded-full opacity-50" />
                            </div>

                            <div className="flex gap-4">
                               <div 
                                 style={{ 
                                   height: '48px', 
                                   borderRadius: `${getSemanticValue('r-lg')}px`,
                                   padding: `0 ${getSemanticValue('s-7xl')}px` 
                                  }}
                                 className={`flex-1 bg-indigo-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all ${hoveredMultiplier === system.semantics.find(s => s.id === 'r-lg')?.value ? 'scale-105 shadow-xl shadow-indigo-500/30' : ''}`}
                               >
                                 Action Item
                               </div>
                               <button 
                                 style={{ height: '48px', width: '48px', borderRadius: `${getSemanticValue('r-lg')}px` }} 
                                 className="bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                               >
                                 <ArrowLeft className="w-4 h-4 text-zinc-500 rotate-180" />
                               </button>
                            </div>
                         </div>

                         {hoveredMultiplier && (
                            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
                         )}
                      </div>
                    </div>

                    {/* INTERACTIVE LIST */}
                    <div className="col-span-12 lg:col-span-5 space-y-8">
                      <div className="flex items-center gap-3 px-4">
                         <div className="w-8 h-px bg-zinc-800" />
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Vertical Rhythm</span>
                       </div>

                       <div 
                        style={{ 
                          borderRadius: `${getSemanticValue('r-2xl')}px`,
                          padding: `${getSemanticValue('s-md')}px`,
                          gap: `${getSemanticValue('s-sm')}px`
                        }}
                        className={`bg-zinc-900 border border-zinc-800/60 flex flex-col transition-all overflow-hidden ${hoveredMultiplier === system.semantics.find(s => s.id === 'r-2xl')?.value ? 'border-emerald-500 ring-4 ring-emerald-500/10' : ''}`}
                      >
                         {[1,2,3,4,5].map(i => (
                           <div 
                             key={i}
                             style={{ 
                               borderRadius: `${getSemanticValue('r-xl')}px`,
                               padding: `${getSemanticValue('s-4xl')}px`
                             }}
                             className={`flex items-center justify-between transition-all duration-300 ${i === 1 ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-zinc-950/40 border border-transparent hover:border-zinc-800'}`}
                           >
                              <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-indigo-400' : 'bg-zinc-700'}`} />
                                <div className="space-y-1.5 text-left">
                                   <div className={`h-2 text-[10px] font-black uppercase tracking-widest ${i === 1 ? 'text-indigo-400' : 'text-zinc-500'}`}>Log Entry 0{i}</div>
                                   <div className="h-1.5 w-32 bg-zinc-800/50 rounded-full" />
                                </div>
                              </div>
                              <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-6 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white italic">
                    {activeCategory ? (
                      editingSemantic ? `Edit ${activeCategory} Token` : `Add ${activeCategory} Token`
                    ) : (
                      editingValue !== null ? 'Edit Scale Factor' : 'Add Scale Factor'
                    )}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Geometric Modulation</p>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setActiveCategory(null);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveScale} className="p-6 space-y-6">
                {activeCategory && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Token Name</label>
                    <input 
                      type="text"
                      autoFocus
                      required
                      value={tempSemanticName}
                      onChange={(e) => {
                        setTempSemanticName(e.target.value);
                        setErrorStatus(null);
                      }}
                      className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-lg font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${errorStatus?.name ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800'}`}
                      placeholder={`${activeCategory.toLowerCase()}-custom`}
                    />
                    {errorStatus?.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errorStatus.name}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                      {activeCategory ? 'Maps to Dimension' : 'Value (X)'}
                    </label>
                    {activeCategory ? (
                      <select
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none"
                      >
                        {system.spacing.scale.map(s => (
                          <option key={s} value={s}>
                            dim-{system.spacing.scaleNames?.[s] || s} ({s * system.spacing.baseValue}px)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <input 
                          type="number"
                          step="0.01"
                          autoFocus
                          required
                          value={tempValue}
                          onChange={(e) => {
                            setTempValue(e.target.value);
                            setErrorStatus(null);
                          }}
                          className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-lg font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${errorStatus?.size ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800'}`}
                          placeholder="4"
                        />
                        {errorStatus?.size && <p className="text-[10px] text-red-500 font-bold ml-1">{errorStatus.size}</p>}
                      </>
                    )}
                  </div>
                  {!activeCategory && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Suffix (Name)</label>
                      <input 
                        type="text"
                        value={tempName}
                        onChange={(e) => {
                          setTempName(e.target.value);
                          setErrorStatus(null);
                        }}
                        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-lg font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${errorStatus?.name ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800'}`}
                        placeholder="4"
                      />
                      {errorStatus?.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errorStatus.name}</p>}
                    </div>
                  )}
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-indigo-500/50 uppercase tracking-widest">Calculated Output</span>
                      <Info className="w-2.5 h-2.5 text-zinc-700" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase italic">Base: {system.spacing.baseValue}px</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-indigo-400">
                      {isNaN(parseFloat(tempValue)) ? '0' : (parseFloat(tempValue) * system.spacing.baseValue).toFixed(1).replace(/\.0$/, '')}
                    </span>
                    <span className="text-xs font-black text-indigo-500/50 uppercase italic">pixels</span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                >
                  {activeCategory ? (
                    editingSemantic ? 'Update Token' : 'Add Token'
                  ) : (
                    editingValue !== null ? 'Update Scale' : 'Add to Foundations'
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DimensionsTool;
