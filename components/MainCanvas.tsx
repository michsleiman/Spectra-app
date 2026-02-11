import React, { useState, useMemo, useEffect } from 'react';
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
  
  // Local buffer for HEX input to allow typing without immediate validation resets
  const quickColor = useMemo(() => oklchToHex(oklch), [oklch]);
  const [localHex, setLocalHex] = useState(quickColor);

  // Sync local HEX buffer when OKLCH changes via sliders or external updates
  useEffect(() => {
    setLocalHex(quickColor);
  }, [quickColor]);

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
    
    // Only update the system if the HEX is valid and complete
    if (/^#[0-9A-F]{6}$/i.test(formatted)) {
      setOklch(hexToOklch(formatted));
    }
  };

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

  // Contextual RGB Gradients
  const rGradient = useMemo(() => `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`, [rgb.g, rgb.b]);
  const gGradient = useMemo(() => `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`, [rgb.r, rgb.b]);
  const bGradient = useMemo(() => `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`, [rgb.r, rgb.g]);

  const isBaseSystem = system.type === 'base';

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-900/40">
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
          viewMode === 'scales' 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-12 pointer-events-none'
        }`}
      >
        <main className="h-full overflow-y-auto px-4 lg:px-12 py-6">
          <header className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
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

          <div className="max-w-[1600px] mx-auto canvas-layout-container">
            <div className="canvas-layout-main space-y-8">
              {!isBaseSystem && (
                <div className="bg-zinc-950 rounded-[2rem] p-6 border border-zinc-800 shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-4 flex flex-col items-center">
                      <div 
                        className="w-full aspect-[4/3] sm:aspect-square rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/5 flex items-center justify-center relative overflow-hidden transition-all duration-300"
                        style={{ backgroundColor: quickColor }}
                      >
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent pointer-events-none" />
                          <span className={`font-mono font-black text-xl lg:text-2xl select-all px-6 py-2 rounded-2xl bg-black/10 backdrop-blur-2xl transition-all ${oklch.l > 0.5 ? 'text-black' : 'text-white'}`}>
                            {quickColor}
                          </span>
                      </div>
                      
                      <div className="mt-8 w-full space-y-3">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2 block">Anchor Step</label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <select 
                                value={quickStep}
                                onChange={(e) => setQuickStep(parseInt(e.target.value))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none text-center"
                              >
                                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(s => (
                                  <option key={s} value={s}>Step {s}</option>
                                ))}
                              </select>
                            </div>
                            <button 
                              onClick={() => onLockStep(quickStep, quickColor, true)}
                              className="flex-[1.5] bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-[0.97] transition-all whitespace-nowrap"
                            >
                              Update System
                            </button>
                          </div>
                      </div>
                    </div>

                    <div className="xl:col-span-8 space-y-10">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Perceptual Matrix</h3>
                        <div className="flex bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800/50 w-full sm:w-auto">
                          {['oklch', 'rgb', 'hex'].map((f) => (
                            <button
                              key={f}
                              onClick={() => setFormat(f as any)}
                              className={`flex-1 sm:flex-none px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${format === f ? 'bg-zinc-800 text-indigo-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-400'}`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        {/* Switchable views with minimal fade & slide transition */}
                        <div className="min-h-[220px]">
                          {format === 'oklch' && (
                            <div key="oklch-view" className="space-y-10 animate-[fade-in-slide-down_0.2s_ease-out]">
                              <ControlSliderRaw label="Lightness" val={oklch.l} max={1} step={0.001} gradient={lGradient} onChange={v => handleOklchChange('l', v)} />
                              <ControlSliderRaw label="Chroma" val={oklch.c} max={0.4} step={0.001} gradient={cGradient} onChange={v => handleOklchChange('c', v)} />
                              <ControlSliderRaw label="Hue" val={oklch.h} max={360} step={1} gradient={hGradient} onChange={v => handleOklchChange('h', v)} displaySuffix="°" />
                            </div>
                          )}

                          {format === 'rgb' && (
                            <div key="rgb-view" className="space-y-10 animate-[fade-in-slide-down_0.2s_ease-out]">
                              <ControlSliderRaw label="Red" val={rgb.r} max={255} step={1} gradient={rGradient} onChange={v => handleRgbChange('r', v)} />
                              <ControlSliderRaw label="Green" val={rgb.g} max={255} step={1} gradient={gGradient} onChange={v => handleRgbChange('g', v)} />
                              <ControlSliderRaw label="Blue" val={rgb.b} max={255} step={1} gradient={bGradient} onChange={v => handleRgbChange('b', v)} />
                            </div>
                          )}

                          {format === 'hex' && (
                            <div key="hex-view" className="flex flex-col gap-6 animate-[fade-in-slide-down_0.2s_ease-out]">
                              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">HEX Literal</label>
                              <input 
                                type="text" 
                                value={localHex} 
                                onChange={(e) => handleLocalHexChange(e.target.value)}
                                maxLength={7}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 lg:p-10 text-2xl lg:text-3xl font-mono font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-600 uppercase tracking-tighter transition-all"
                              />
                              <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest">Enter 6-digit hex code to anchor scale</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                 <div className="flex items-center justify-between px-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Color Scale</h3>
                    {!isBaseSystem && (
                      <button 
                        onClick={onToggleLockAll}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          allLocked 
                            ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {allLocked ? 'Unlock' : 'Lock All'}
                      </button>
                    )}
                 </div>
                 <div className="flex w-full rounded-[1.5rem] overflow-x-auto lg:overflow-hidden shadow-2xl border border-white/5 scrollbar-hide bg-zinc-950">
                    <div className="flex min-w-full lg:min-w-0 flex-1">
                    {system.steps.map((step) => {
                      const isImmutable = isBaseSystem;
                      const contrastTextColor = step.contrastOnBlack > step.contrastOnWhite ? 'text-black' : 'text-white';
                      
                      return (
                        <div 
                          key={step.id} 
                          className={`group relative flex-1 min-w-[90px] lg:min-w-0 h-44 lg:h-56 transition-all ${isImmutable ? 'cursor-default' : 'cursor-pointer hover:lg:z-10'} ${step.isLocked && !isImmutable ? 'z-20' : ''}`}
                          style={{ backgroundColor: step.hex }}
                          onClick={() => {
                            if (isImmutable) return;
                            if (step.isLocked) onUnlockStep(step.id);
                            else onLockStep(step.id, step.hex);
                          }}
                        >
                           <div className={`absolute inset-0 flex flex-col justify-between p-3.5 pointer-events-none`}>
                              <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-black ${contrastTextColor}`}>{step.id}</span>
                                {!isImmutable && (
                                  <div className={`flex items-center justify-center translate-x-1 -translate-y-0.5 ${contrastTextColor} transition-opacity duration-200 ${step.isLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                    <svg className="w-3.5 h-3.5 drop-shadow-sm overflow-visible" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className={`flex flex-col gap-1.5 leading-none ${contrastTextColor}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-black">W</span>
                                    <span className="text-[12px] font-mono font-black">{step.contrastOnWhite.toFixed(1)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-black">B</span>
                                    <span className="text-[12px] font-mono font-black">{step.contrastOnBlack.toFixed(1)}</span>
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
            </div>

            <div className="canvas-layout-side space-y-8">
              {!isBaseSystem && (
                <div className="bg-zinc-950 rounded-[2rem] p-6 border border-zinc-800 shadow-xl space-y-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Scale adjustments</h3>
                  </div>

                  <div className="space-y-12">
                    <ControlSlider 
                        label="Luminance Punch" 
                        value={system.controls.punch} 
                        onChange={v => onUpdateControls({...system.controls, punch: v})} 
                    />
                    <ControlSlider 
                        label="Curve Steepness" 
                        value={system.controls.steepness} 
                        onChange={v => onUpdateControls({...system.controls, steepness: v})} 
                    />
                    <ControlSlider 
                        label="Black Point" 
                        value={system.controls.darkness} 
                        onChange={v => onUpdateControls({...system.controls, darkness: v})} 
                    />
                  </div>

                  <div className="pt-8 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between p-5 bg-zinc-900/40 rounded-xl border border-zinc-800/30">
                        <p className="text-[11px] font-black text-zinc-100 uppercase tracking-[0.2em]">WCAG Safe</p>
                        <div 
                          onClick={() => onUpdateControls({...system.controls, accessibilitySafe: !system.controls.accessibilitySafe})}
                          className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${system.controls.accessibilitySafe ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${system.controls.accessibilitySafe ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
          viewMode === 'semantics' 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-12 pointer-events-none'
        }`}
      >
        <SemanticView 
          semantics={semantics} 
          systems={allSystems} 
          theme={theme} 
          onToggleTheme={onToggleTheme}
          onUpdate={onUpdateSemantic}
          onAddSemantic={onAddSemantic}
          onDeleteSemantic={onDeleteSemantic}
        />
      </div>
    </div>
  );
};

const ControlSlider: React.FC<{label: string, value: number, onChange: (v: number) => void}> = ({label, value, onChange}) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
      <span className="text-zinc-500">{label}</span>
    </div>
    <div className="relative h-2 bg-zinc-900 rounded-full">
       <input 
          type="range" min="0" max="1" step="0.01" value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full appearance-none opacity-0 cursor-pointer z-30"
       />
       <div className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${value * 100}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-indigo-600 z-10" />
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
  onChange: (v: number) => void,
  displaySuffix?: string
}> = ({label, val, max, step, gradient, onChange, displaySuffix = ''}) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
      <span className="text-zinc-500">{label}</span>
      <div className="flex items-center">
        <input 
          type="number" 
          min="0" max={max} step={step} 
          value={displaySuffix === '°' ? Math.round(val) : parseFloat(val.toFixed(3))} 
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          className="bg-transparent text-white font-mono text-right w-16 focus:outline-none focus:bg-zinc-800 rounded px-1"
        />
        {displaySuffix && <span className="text-white font-mono ml-0.5">{displaySuffix}</span>}
      </div>
    </div>
    <div className="relative h-3 rounded-full flex items-center">
      <div 
        className="absolute inset-0 rounded-full" 
        style={{ background: gradient || 'rgba(255,255,255,0.05)' }} 
      />
      <div 
        className="absolute w-5 h-5 bg-white rounded-full shadow-xl border-2 border-zinc-900 pointer-events-none z-10"
        style={{ left: `calc(${(val / max) * 100}% - 10px)` }}
      />
      <input 
        type="range" min="0" max={max} step={step} value={val} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20"
        style={{ margin: 0 }}
      />
    </div>
  </div>
);

export default MainCanvas;