import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ColorSystem, SystemType, SemanticToken, ThemeMode } from '../types';

interface SidebarProps {
  viewMode: 'scales' | 'semantics';
  systems: ColorSystem[];
  activeSystemId: string;
  onSelectSystem: (id: string) => void;
  onDeleteSystem: (id: string) => void;
  onAddSystem: (name: string, type: SystemType, hex: string) => void;
  onUpdateSystemName: (id: string, name: string) => void;
  syncCurves: boolean;
  onToggleSync: () => void;
  onOpenAI: () => void;
  onCloseMobile?: () => void;
  // Semantic props
  semantics: SemanticToken[];
  theme: ThemeMode;
  onUpdateSemantic: (tokenId: string, systemType: SystemType, stepId: number | 'white' | 'black') => void;
  onAddSemantic: (token: Partial<SemanticToken>) => void;
  onDeleteSemantic: (tokenId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  viewMode,
  systems, 
  activeSystemId, 
  onSelectSystem, 
  onDeleteSystem,
  onAddSystem,
  onUpdateSystemName,
  syncCurves,
  onToggleSync,
  onOpenAI,
  onCloseMobile,
  semantics,
  theme,
  onUpdateSemantic,
  onAddSemantic,
  onDeleteSemantic
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingSemantics, setIsEditingSemantics] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Semantic Form State
  const [newSem, setNewSem] = useState({
    name: '',
    category: 'Text',
    systemType: 'neutral' as SystemType,
    step: 500 as number | 'white' | 'black'
  });

  // Semantic grouping logic
  const categories = useMemo(() => {
    const preferredOrder = ['Text', 'Border', 'Foreground', 'Background'];
    const cats = Array.from(new Set(semantics.map(s => s.category))) as string[];
    
    return cats.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [semantics]);

  const visibleSemantics = useMemo(() => {
    return semantics.filter(tok => !tok.parent);
  }, [semantics]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleAdd = () => {
    if (viewMode === 'scales') {
      if (newName.trim()) {
        onAddSystem(newName.trim(), 'brand', '#3b82f6');
        setNewName('');
        setIsAdding(false);
      }
    } else {
      if (newSem.name.trim()) {
        onAddSemantic({
          id: `custom-${Date.now()}`,
          name: newSem.name,
          category: newSem.category,
          systemType: newSem.systemType,
          lightStep: newSem.step,
          darkStep: newSem.step
        });
        setNewSem({ name: '', category: 'Text', systemType: 'neutral', step: 500 });
        setIsAdding(false);
      }
    }
  };

  const handleStartEdit = (e: React.MouseEvent, system: ColorSystem) => {
    e.stopPropagation();
    setEditingId(system.id);
    setEditingName(system.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onUpdateSystemName(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-full h-full border-r border-zinc-800 bg-zinc-950 flex flex-col shadow-2xl lg:shadow-none">
      {/* BRANDING SECTION */}
      <div className="px-4 py-5 border-b border-zinc-900 flex flex-col items-center relative">
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="absolute right-4 top-4 p-2 text-zinc-600 hover:text-white sm:hidden transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="w-full flex justify-center">
            <svg width="220" height="55" viewBox="0 0 600 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#FF4D4D', stopOpacity: 1}} /> 
                        <stop offset="100%" style={{stopColor: '#FF9E2C', stopOpacity: 1}} /> 
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#00C853', stopOpacity: 1}} /> 
                        <stop offset="100%" style={{stopColor: '#0091EA', stopOpacity: 1}} /> 
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#6200EA', stopOpacity: 1}} /> 
                        <stop offset="100%" style={{stopColor: '#AA00FF', stopOpacity: 1}} /> 
                    </linearGradient>
                    
                    <style>
                        {`.logo-text { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 64px; letter-spacing: -1px; fill: #FFFFFF; }`}
                    </style>
                </defs>

                <g transform="translate(20, 25) scale(0.8)">
                    <path d="M10,40 C30,10 90,10 110,40 C130,70 10,70 30,40 Z" fill="url(#grad1)" opacity="0.85" style={{mixBlendMode: 'screen'}} />
                    <path d="M40,60 C60,30 120,30 140,60 C160,90 40,90 60,60 Z" fill="url(#grad2)" opacity="0.85" style={{mixBlendMode: 'screen'}}/>
                    <path d="M25,80 C45,50 105,50 125,80 C145,110 25,110 45,80 Z" fill="url(#grad3)" opacity="0.85" style={{mixBlendMode: 'screen'}}/>
                </g>

                <text x="180" y="94" className="logo-text">SPECTRA</text>
            </svg>
        </div>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em] leading-tight mt-1 text-center">Color Systems, Solved</p>
      </div>

      <div className="p-4 flex items-center justify-between mt-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          {viewMode === 'scales' ? 'Color Systems' : 'Semantic Tokens'}
        </h2>
        <div className="flex items-center gap-1">
          {viewMode === 'semantics' && (
            <button 
              onClick={() => setIsEditingSemantics(!isEditingSemantics)}
              className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all ${isEditingSemantics ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              {isEditingSemantics ? 'Done' : 'Edit'}
            </button>
          )}
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all p-2 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
        {viewMode === 'scales' ? (
          <>
            {isAdding && (
              <div className="p-3 bg-zinc-900 rounded-lg mb-4 space-y-3 border border-zinc-800 mx-2 shadow-2xl">
                <input 
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                  placeholder="System name..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded text-xs font-semibold text-white">Add</button>
                  <button onClick={() => setIsAdding(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-1.5 rounded text-xs font-semibold text-white">Cancel</button>
                </div>
              </div>
            )}

            {systems.map(system => {
              const isActive = system.id === activeSystemId;
              const isEditing = editingId === system.id;
              const previewColor = system.steps.find(s => s.id === 500)?.hex || system.steps[0].hex;
              const isBase = system.type === 'base';
              
              return (
                <div
                  key={system.id}
                  onClick={() => onSelectSystem(system.id)}
                  className={`group w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all cursor-pointer relative ${
                    isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                  }`}
                >
                  <div 
                    className={`w-3 h-3 rounded-full border border-white/10 transition-transform flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                    style={{ backgroundColor: previewColor }}
                  />
                  
                  <div className="flex-1 overflow-hidden flex items-center justify-between">
                    {isEditing ? (
                      <input
                        ref={editInputRef}
                        className="w-full bg-zinc-950 border border-indigo-500 rounded px-1.5 py-0.5 text-sm text-white focus:outline-none"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate pr-2">{system.name}</p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleStartEdit(e, system)}
                            className={`transition-opacity duration-150 p-1 hover:bg-zinc-700 rounded ${
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {!isBase && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSystem(system.id);
                              }}
                              className={`transition-opacity duration-150 p-1 hover:bg-red-900/40 rounded ${
                                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <svg className="w-3 h-3 text-zinc-500 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="mt-4 mx-2">
               <button 
                 onClick={onOpenAI}
                 className="w-full flex items-center gap-3 px-3 py-3 border border-dashed border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-xl transition-all group"
               >
                  <div className="w-3 h-3 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                     <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                     </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-indigo-400 transition-colors">
                    Generate with AI
                  </span>
               </button>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-900/50 mx-2">
              <div 
                onClick={onToggleSync}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${syncCurves ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}
              >
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${syncCurves ? 'text-indigo-400' : 'text-zinc-500'}`}>Master Palette Sync</p>
                  <p className="text-[9px] text-zinc-500 leading-tight mt-1">Locks curves across all systems.</p>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${syncCurves ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${syncCurves ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 pt-2">
            {isAdding && (
              <div className="p-3 bg-zinc-900 rounded-lg mb-4 space-y-3 border border-zinc-800 mx-2 shadow-2xl">
                <div className="space-y-2">
                  <input 
                    autoFocus
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                    placeholder="Token name (e.g. text-brand)"
                    value={newSem.name}
                    onChange={e => setNewSem({...newSem, name: e.target.value})}
                  />
                  <select 
                    className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded px-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none text-zinc-400"
                    value={newSem.category}
                    onChange={e => setNewSem({...newSem, category: e.target.value})}
                  >
                    {['Text', 'Border', 'Foreground', 'Background'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded text-xs font-semibold text-white">Add</button>
                  <button onClick={() => setIsAdding(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-1.5 rounded text-xs font-semibold text-white">Cancel</button>
                </div>
              </div>
            )}
            {categories.map((cat) => {
              const catTokens = visibleSemantics.filter(s => s.category === cat);
              if (catTokens.length === 0) return null;
              
              return (
                <section key={cat} className="space-y-2">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 px-3">
                    {cat}
                  </h3>
                  <div className="space-y-1">
                    {catTokens.map((sem) => (
                      <SemanticRow 
                        key={sem.id} 
                        sem={sem} 
                        theme={theme} 
                        systems={systems}
                        isEditing={isEditingSemantics}
                        onUpdate={onUpdateSemantic}
                        onDelete={onDeleteSemantic}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-zinc-950/20 border-t border-zinc-900/50">
        <p className="text-[10px] text-zinc-700 font-medium uppercase tracking-widest text-center">
          SPECTRA BY <a href="https://www.michelsleiman.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">Michel Sleiman</a>
        </p>
      </div>
    </div>
  );
};

const SemanticRow: React.FC<{ 
  sem: SemanticToken; 
  theme: ThemeMode; 
  systems: ColorSystem[]; 
  isEditing: boolean;
  onUpdate: (tokenId: string, systemType: SystemType, stepId: number | 'white' | 'black') => void;
  onDelete: (tokenId: string) => void;
}> = ({ sem, theme, systems, isEditing, onUpdate, onDelete }) => {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  const currentStep = theme === 'light' ? sem.lightStep : sem.darkStep;
  const displaySystemType = (currentStep === 'white' || currentStep === 'black') ? 'base' : sem.systemType;

  return (
    <div className="flex items-center px-2 py-1.5 rounded-xl hover:bg-zinc-900/40 transition-all group gap-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isEditing && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(sem.id); }}
            className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-all shrink-0"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div 
          className="w-3 h-3 rounded-full border border-white/10 flex-shrink-0" 
          style={{ backgroundColor: sem.hex }}
        />
        <span className="text-[11px] font-bold text-zinc-200 leading-tight">
          {sem.name}
        </span>
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1 shrink-0">
          <div className="relative w-24">
            <select 
              value={displaySystemType}
              onChange={(e) => onUpdate(sem.id, e.target.value as SystemType, currentStep)}
              className="w-full h-8 bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest px-2 rounded-lg outline-none appearance-none cursor-pointer text-zinc-400 hover:border-zinc-700 transition-colors"
            >
              {systems.map(sys => (
                <option key={sys.id} value={sys.type} className="bg-zinc-950 text-white">
                  {sys.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative w-14">
            <select 
              value={currentStep}
              onChange={(e) => {
                const val = e.target.value;
                const step = (val === 'white' || val === 'black') ? val : parseInt(val);
                const systemToUse = (val === 'white' || val === 'black') ? 'base' : sem.systemType;
                onUpdate(sem.id, systemToUse as SystemType, step as any);
              }}
              className="w-full h-8 bg-zinc-900 border border-zinc-800 text-[9px] font-mono font-black px-1 rounded-lg outline-none appearance-none cursor-pointer text-zinc-400 hover:border-zinc-700 transition-colors text-center"
            >
              <option value="white" className="bg-zinc-950 text-white">W</option>
              {steps.map(s => (
                <option key={s} value={s} className="bg-zinc-950 text-white">{s}</option>
              ))}
              <option value="black" className="bg-zinc-950 text-white">B</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;