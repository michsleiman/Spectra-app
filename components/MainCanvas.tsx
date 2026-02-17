import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ColorSystem, ColorStep, OKLCH, SystemControls, SemanticToken, SystemType, ThemeMode } from '../types';
import { hexToOklch, oklchToHex } from '../utils/colorUtils';
import SemanticView from './SemanticView';

interface MainCanvasProps {
  viewMode: 'scales' | 'semantics';
  theme: ThemeMode;
  onToggleTheme: () => void;
  system: ColorSystem;
  semantics: SemanticToken[];
  allSystems: ColorSystem[];
  onUpdateControls: (controls: SystemControls) => void;
  onLockStep: (id: number, hex: string, clearOthers?: boolean) => void;
  onUnlockStep: (id: number) => void;
  onToggleLockAll: () => void;
  onUpdateSemantic: (tokenId: string, systemType: SystemType, stepId: number | 'white' | 'black') => void;
  onAddSemantic: (token: Partial<SemanticToken>) => void;
  onDeleteSemantic: (tokenId: string) => void;
  allLocked: boolean;
  onRegenerate: () => void;
  isSynced?: boolean;
}

type InputFormat = 'hex' | 'rgb' | 'oklch';

const MainCanvas: React.FC<MainCanvasProps> = ({ 
  viewMode, 
  theme,
  onToggleTheme,
  system, 
  semantics, 
  allSystems,
  onUpdateControls, 
  onLockStep, 
  onUnlockStep, 
  onToggleLockAll, 
  onUpdateSemantic,
  onAddSemantic,
  onDeleteSemantic,
  allLocked, 
  onRegenerate, 
  isSynced 
}) => {
  const [format, setFormat] = useState<InputFormat>('oklch');
  const [oklch, setOklch] = useState<OKLCH>({ l: 0.5, c: 0.15, h: 250 });
  const [quickStep, setQuickStep] = useState(500);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  const quickColor = useMemo(() => oklchToHex(oklch), [oklch]);
  const [localHex, setLocalHex] = useState(quickColor);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalHex(quickColor);
  }, [quickColor]);

  // Click outside to close swatch menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId !== null && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const rgb = useMemo(() => {
    const hex = quickColor;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return { r, g, b };
  }, [quickColor]);

  const handleOklchChange = (key: keyof OKLCH, val: number) => {
    let n = val;
    if (key === 'l') n = Math.max(0, Math.min(1, val));
    if (key === 'c') n = Math.max(0, Math.min(0.4, val));
    if (key === 'h') n = (val + 360) % 360;
    setOklch(prev => ({ ...prev, [key]: n }));
  };

  const handleRgbChange = (key: 'r' | 'g' | 'b', val: number) => {
    const n = Math.max(0, Math.min(255, val));
    const newRgb = { ...rgb, [key]: n };
    const hex = `#${((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b).toString(16).slice(1).toUpperCase()}`;
    setOklch(hexToOklch(hex));
  };

  const handleLocalHexChange = (val: string) => {
    const formatted = val.startsWith('#') ? val : `#${val}`;
    setLocalHex(formatted.toUpperCase());
    if (/^#[0-9A-F]{6}$/i.test(formatted)) {
      setOklch(hexToOklch(formatted));
    }
  };

  const handleEditStep = (step: ColorStep) => {
    setOklch(step.oklch);
    setQuickStep(step.id);
    setActiveMenuId(null);
  };

  const driftGradient = useMemo(() => {
    const baseH = system.baseHue;
    const c = Math.max(0.1, system.baseChroma);
    let stops = [];
    for(let i = -60; i <= 60; i += 30) {
      stops.push(oklchToHex({l: 0.7, c, h: (baseH + i + 360) % 360}));
    }
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [system.baseHue, system.baseChroma]);

  const lGradient = useMemo(() => {
    return `linear-gradient(to right, ${oklchToHex({l: 0, c: oklch.c, h: oklch.h})}, ${oklchToHex({l: 0.5, c: oklch.c, h: oklch.h})}, ${oklchToHex({l: 1, c: oklch.c, h: oklch.h})})`;
  }, [oklch.c, oklch.h]);

  const cGradient = useMemo(() => {
    return `linear-gradient(to right, ${oklchToHex({l: oklch.l, c: 0, h: oklch.h})}, ${oklchToHex({l: oklch.l, c: 0.4, h: oklch.h})})`;
  }, [oklch.l, oklch.h]);

  const hGradient = useMemo(() => {
    let stops = [];
    for(let i=0; i<=360; i+=60) {
      stops.push(oklchToHex({l: oklch.l, c: Math.max(0.1, oklch.c), h: i}));
    }
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [oklch.l, oklch.c]);

  const rGradient = useMemo(() => `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`, [rgb.g, rgb.b]);
  const gGradient = useMemo(() => `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`, [rgb.r, rgb.b]);
  const bGradient = useMemo(() => `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`, [rgb.r, rgb.g]);

  const isBaseSystem = system.type === 'base';

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950">
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
          viewMode === 'scales' 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-12 pointer-events-none'
        }`}
      >
        <main className="h-full overflow-y-auto scroll-smooth">
          <header className="hidden sm:flex max-w-[1600px] mx-auto mb-0 flex-col md:flex-row md:items-end justify-between gap-4 py-6 px-6 sm:px-12 text-zinc-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">{system.name}</h1>
                {isSynced && !isBaseSystem && (
                  <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                    Synced
                  </span>
                )}
              </div>
            </div>
          </header>

          <div className="max-w-[1600px] mx-auto px-6 sm:px-12 pb-24 lg:pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
              {!isBaseSystem && (
                <div className="lg:col-span-3">
                  <div className="bg-zinc-950 sm:rounded-[2rem] p-0 sm:p-8 sm:border sm:border-zinc-800 shadow-2xl relative overflow-hidden group flex flex-col h-full">
                    <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 xl:gap-10 flex-1">
                      <div className="xl:col-span-4 sticky top-0 z-30 sm:relative sm:top-auto px-0 sm:px-0 flex flex-col h-full">
                        <div className="bg-zinc-950/90 backdrop-blur-3xl border-b border-zinc-800/50 sm:border-0 p-4 sm:p-0 flex flex-col flex-1">
                           <div className="flex items-center justify-between mb-4 sm:hidden px-2">
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                 <span className="text-xs font-black uppercase tracking-widest text-white">{system.name}</span>
                              </div>
                              {isSynced && <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Synced</span>}
                           </div>
                           <div 
                             className="w-full min-h-[128px] xl:flex-1 rounded-[2rem] sm:rounded-[1.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden transition-all duration-500"
                             style={{ backgroundColor: quickColor }}
                           >
                              <div className="relative z-10 flex flex-col items-center gap-2">
                                 <span className={`font-mono font-black text-sm lg:text-xl select-all transition-all tracking-widest ${oklch.l > 0.5 ? 'text-black' : 'text-white'}`}>
                                   {quickColor}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="hidden xl:block mt-8 w-full space-y-3 px-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1 block">Anchor Step</label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1 h-12">
                                <select 
                                  value={quickStep}
                                  onChange={(e) => setQuickStep(parseInt(e.target.value))}
                                  className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none text-center"
                                >
                                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                              <button 
                                onClick={() => onLockStep(quickStep, quickColor, true)}
                                className="flex-[1.5] h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] shadow-md shadow-indigo-600/10 active:scale-[0.97] transition-all whitespace-nowrap"
                              >
                                Update
                              </button>
                            </div>
                        </div>
                      </div>

                      <div className="xl:col-span-8 px-6 pt-12 pb-6 sm:p-0 space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                          <div className="space-y-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Perceptual Matrix</h3>
                          </div>
                          <div className="flex bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800/50 w-full sm:w-auto">
                            {['oklch', 'rgb', 'hex'].map((f) => (
                              <button
                                key={f}
                                onClick={() => setFormat(f as any)}
                                className={`flex-1 sm:flex-none px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${format === f ? 'bg-zinc-800 text-indigo-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-400'}`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="relative">
                          <div className="min-h-[130px] sm:min-h-[150px]">
                            {format === 'oklch' && (
                              <div key="oklch-view" className="space-y-4 sm:space-y-6 animate-[fade-in-slide-down_0.2s_ease-out]">
                                <ControlSliderRaw label="Lightness" val={oklch.l} max={1} step={0.001} gradient={lGradient} onChange={v => handleOklchChange('l', v)} />
                                <ControlSliderRaw label="Chroma" val={oklch.c} max={0.4} step={0.001} gradient={lGradient} onChange={v => handleOklchChange('c', v)} />
                                <ControlSliderRaw label="Hue" val={oklch.h} max={360} step={1} gradient={hGradient} onChange={v => handleOklchChange('h', v)} />
                              </div>
                            )}
                            {format === 'rgb' && (
                              <div key="rgb-view" className="space-y-4 sm:space-y-6 animate-[fade-in-slide-down_0.2s_ease-out]">
                                <ControlSliderRaw label="Red" val={rgb.r} max={255} step={1} gradient={rGradient} onChange={v => handleRgbChange('r', v)} />
                                <ControlSliderRaw label="Green" val={rgb.g} max={255} step={1} gradient={gGradient} onChange={v => handleRgbChange('g', v)} />
                                <ControlSliderRaw label="Blue" val={rgb.b} max={255} step={1} gradient={bGradient} onChange={v => handleRgbChange('b', v)} />
                              </div>
                            )}
                            {format === 'hex' && (
                              <div key="hex-view" className="flex flex-col gap-6 animate-[fade-in-slide-down_0.2s_ease-out]">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">HEX Literal</label>
                                <div className="relative group">
                                  <input 
                                    type="text" 
                                    value={localHex} 
                                    onChange={(e) => handleLocalHexChange(e.target.value)}
                                    maxLength={7}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 lg:p-10 text-3xl lg:text-4xl font-mono font-black text-white text-center focus:outline-none focus:ring-4 focus:ring-indigo-600/20 uppercase tracking-tighter transition-all"
                                  />
                                  <div className="absolute inset-0 rounded-[2rem] border border-white/5 pointer-events-none" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="xl:hidden pt-2 border-t border-zinc-900/50">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center px-4 h-12">
                                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mr-2">Step</span>
                                 <select 
                                   value={quickStep}
                                   onChange={(e) => setQuickStep(parseInt(e.target.value))}
                                   className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none appearance-none text-center"
                                 >
                                   {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(s => (
                                     <option key={s} value={s}>{s}</option>
                                   ))}
                                 </select>
                              </div>
                              <button 
                                onClick={() => onLockStep(quickStep, quickColor, true)}
                                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all"
                              >
                                Update
                              </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isBaseSystem && (
                <div className="lg:col-span-1">
                  <div className="bg-zinc-950 rounded-[2rem] p-8 border border-zinc-800 shadow-xl flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">SCALE ADJUSTMENT</h3>
                    </div>
                    <div className="space-y-8 flex-1 flex flex-col justify-start">
                      <ControlSlider label="Luminance Punch" value={system.controls.punch} onChange={v => onUpdateControls({...system.controls, punch: v})} />
                      <ControlSlider label="Atmospheric Drift" value={(system.controls.hueRotation + 60) / 120} gradient={driftGradient} onChange={v => onUpdateControls({...system.controls, hueRotation: (v * 120) - 60})} />
                      <ControlSlider label="Curve Steepness" value={system.controls.steepness} onChange={v => onUpdateControls({...system.controls, steepness: v})} />
                      <ControlSlider label="Black Point" value={system.controls.darkness} onChange={v => onUpdateControls({...system.controls, darkness: v})} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 mt-8">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Color Palette</h3>
                  {!isBaseSystem && (
                    <button 
                      onClick={onToggleLockAll}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        allLocked 
                          ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      {allLocked ? 'Unlock All' : 'Lock All'}
                    </button>
                  )}
               </div>
               <div className="flex w-full rounded-xl overflow-x-auto lg:overflow-hidden shadow-2xl border border-white/5 bg-zinc-950">
                  <div className="flex min-w-full lg:min-w-0 flex-1">
                  {system.steps.map((step) => {
                    const isImmutable = isBaseSystem;
                    const contrastTextColor = step.contrastOnBlack > step.contrastOnWhite ? 'text-black' : 'text-white';
                    const isMenuOpen = activeMenuId === step.id;
                    
                    return (
                      <div 
                        key={step.id} 
                        className={`group relative flex-1 min-w-[100px] lg:min-w-0 h-48 lg:h-64 transition-all ${isImmutable ? 'cursor-default' : 'cursor-default'} ${step.isLocked && !isImmutable ? 'z-20 ring-2 ring-indigo-500 ring-inset shadow-[0_0_30px_rgba(99,102,241,0.3)]' : ''}`}
                        style={{ backgroundColor: step.hex }}
                      >
                         <div className={`absolute inset-0 flex flex-col justify-between p-4 pointer-events-none`}>
                            <div className="flex justify-between items-start pointer-events-auto relative">
                              <span className={`text-[11px] font-black tracking-tighter ${contrastTextColor}`}>{step.id}</span>
                              
                              {!isImmutable && (
                                <div className="relative" ref={isMenuOpen ? menuRef : null}>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(isMenuOpen ? null : step.id);
                                    }}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                      isMenuOpen 
                                        ? 'bg-white/30 backdrop-blur-md opacity-100' 
                                        : 'bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100'
                                    } ${contrastTextColor}`}
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                    </svg>
                                  </button>

                                  {isMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 min-w-[140px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                                      <div className="p-1.5 flex flex-col">
                                        <button 
                                          onClick={() => handleEditStep(step)}
                                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors text-left"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                          <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if (step.isLocked) onUnlockStep(step.id);
                                            else onLockStep(step.id, step.hex);
                                            setActiveMenuId(null);
                                          }}
                                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors text-left"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            {step.isLocked ? (
                                              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                            ) : (
                                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            )}
                                          </svg>
                                          <span className="text-[10px] font-black uppercase tracking-widest">{step.isLocked ? 'Unlock' : 'Lock'}</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <div className={`flex flex-col gap-1.5 leading-none opacity-80 ${contrastTextColor}`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black">W</span>
                                  <span className="text-[11px] font-mono font-black">{step.contrastOnWhite.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black">B</span>
                                  <span className="text-[11px] font-mono font-black">{step.contrastOnBlack.toFixed(1)}</span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-mono font-black break-all uppercase tracking-tighter ${contrastTextColor}`}>{step.hex}</span>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                  </div>
               </div>
            </div>

            {isBaseSystem && (
              <div className="bg-zinc-950 sm:rounded-[2rem] p-8 sm:p-20 sm:border sm:border-zinc-800 flex flex-col items-center text-center mt-8 text-zinc-100">
                <div className="max-w-md space-y-6">
                   <div className="w-16 h-1 bg-zinc-800 mx-auto rounded-full" />
                   <h2 className="text-2xl font-black text-white">Base Neutrals</h2>
                   <p className="text-zinc-500 text-sm leading-relaxed">Immutable fundamental black and white steps used for pure UI layering and absolute contrast boundaries.</p>
                   <div className="flex justify-center gap-6 pt-6">
                      {system.steps.map(s => (
                        <div key={s.id} className="space-y-3">
                           <div className="w-24 h-32 rounded-3xl shadow-2xl border border-white/5" style={{ backgroundColor: s.hex }} />
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{s.usage}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${viewMode === 'semantics' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}>
        <SemanticView semantics={semantics} systems={allSystems} theme={theme} onToggleTheme={onToggleTheme} onUpdate={onUpdateSemantic} onAddSemantic={onAddSemantic} onDeleteSemantic={onDeleteSemantic} />
      </div>
    </div>
  );
};

const ControlSlider: React.FC<{label: string, value: number, gradient?: string, onChange: (v: number) => void}> = ({label, value, gradient, onChange}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em]">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-400 font-mono">{Math.round(value * 100)}%</span>
    </div>
    <div className="relative h-2 bg-zinc-900 rounded-full">
       {gradient && <div className="absolute inset-0 rounded-full opacity-40" style={{ background: gradient }} />}
       <input type="range" min="0" max="1" step="0.01" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full appearance-none opacity-0 cursor-pointer z-30" />
       <div className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${value * 100}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-xl border-2 border-indigo-600 z-10" />
       </div>
    </div>
  </div>
);

const ControlSliderRaw: React.FC<{
  label: string, 
  val: number, 
  max: number, 
  step: number, 
  gradient?: string, 
  onChange: (v: number) => void
}> = ({label, val, max, step, gradient, onChange}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em]">
      <span className="text-zinc-500">{label}</span>
      <div className="flex items-center">
        <input 
          type="number" 
          min="0" max={max} step={step} 
          value={label === 'Hue' ? Math.round(val) : parseFloat(val.toFixed(3))} 
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          className="bg-transparent text-white font-mono text-right w-20 focus:outline-none focus:bg-zinc-800/50 rounded-lg px-2 py-0.5 transition-colors"
        />
      </div>
    </div>
    <div className="relative h-2.5 rounded-full flex items-center group">
      <div className="absolute inset-0 rounded-full" style={{ background: gradient || 'rgba(255,255,255,0.05)' }} />
      <div className="absolute w-5 h-5 bg-white rounded-full shadow-2xl border-2 border-zinc-950 pointer-events-none z-10 transition-transform group-active:scale-125" style={{ left: `calc(${(val / max) * 100}% - 10px)` }} />
      <input type="range" min="0" max={max} step={step} value={val} onChange={(e) => onChange(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20" style={{ margin: 0 }} />
    </div>
  </div>
);

export default MainCanvas;