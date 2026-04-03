import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ColorSystem, ColorStep, OKLCH, SystemControls, SemanticToken, SystemType, ThemeMode, Snapshot } from '../types';
import { hexToOklch, oklchToHex, hexToHsl, hslToHex } from '../utils/colorUtils';
import PlaygroundView from './PlaygroundView';

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
  onUpdateStepCount: (count: number) => void;
  allLocked: boolean;
  onRegenerate: () => void;
  // Snapshot props
  snapshots: Snapshot[];
  onSaveSnapshot: (name: string) => void;
  onRestoreSnapshot: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
}

const SnapshotNamingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Save Snapshot</h3>
        <p className="text-zinc-500 text-xs sm:text-sm mb-6">Give your current color state a name to save it to your history.</p>
        
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dark Mode V2"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6 text-sm sm:text-base"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(name);
              setName('');
            }
            if (e.key === 'Escape') onClose();
          }}
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(name);
              setName('');
            }}
            className="w-full sm:flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            Save Snapshot
          </button>
        </div>
      </div>
    </div>
  );
};

const ScaleInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-10 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">Scale Adjustments</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-indigo-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Luminance Punch</h4>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Boosts chroma (saturation) in the middle of the scale. This makes your midtones more vibrant and "punchy" without affecting the pure white and deep black ends of the palette.
            </p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-indigo-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Atmospheric Drift</h4>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Rotates the hue between the light and dark ends of the scale. This simulates natural lighting conditions where shadows and highlights often have slightly different color temperatures.
            </p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-indigo-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Curve Steepness</h4>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Adjusts the lightness distribution. Higher values create a steeper curve, pushing more colors towards the light and dark extremes and creating higher contrast in the mid-range.
            </p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-indigo-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Black Point</h4>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Sets the floor for the darkest color in your scale. Increasing this value prevents the scale from reaching pure black, which is useful for creating softer, more modern UI themes.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-8 bg-zinc-950/50 border-t border-zinc-800 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

type InputFormat = 'hsl' | 'rgb' | 'oklch';

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
  onUpdateStepCount,
  allLocked, 
  onRegenerate,
  snapshots,
  onSaveSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot
}) => {
  const [format, setFormat] = useState<InputFormat>('oklch');
  const [oklch, setOklch] = useState<OKLCH>({ l: 0.5, c: 0.15, h: 250 });
  const [quickStep, setQuickStep] = useState(500);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isHexFocused, setIsHexFocused] = useState(false);
  const [isSnapshotNamingOpen, setIsSnapshotNamingOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const quickColor = useMemo(() => oklchToHex(oklch), [oklch]);
  const [localHex, setLocalHex] = useState(quickColor);

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

  const hsl = useMemo(() => hexToHsl(quickColor), [quickColor]);

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

  const handleHslChange = (key: 'h' | 's' | 'l', val: number) => {
    const newHsl = { ...hsl, [key]: val };
    const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
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

  const hslHGradient = useMemo(() => {
    let stops = [];
    for(let i=0; i<=360; i+=60) {
      stops.push(hslToHex(i, hsl.s, hsl.l));
    }
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [hsl.s, hsl.l]);

  const hslSGradient = useMemo(() => `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`, [hsl.h, hsl.l]);
  const hslLGradient = useMemo(() => `linear-gradient(to right, ${hslToHex(hsl.h, hsl.s, 0)}, ${hslToHex(hsl.h, hsl.s, 50)}, ${hslToHex(hsl.h, hsl.s, 100)})`, [hsl.h, hsl.s]);

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
        <main className="h-full overflow-y-auto scroll-smooth custom-scrollbar">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-12 pt-4 pb-8">
            <div className="flex flex-col gap-4 lg:gap-6">
              {!isBaseSystem && (
                <div className="w-full">
                  <div className="bg-zinc-950 sm:rounded-[2rem] p-0 sm:p-5 sm:border sm:border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col h-full">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1">
                      
                      <div className="lg:col-span-3 sticky top-0 z-30 lg:relative lg:top-auto flex flex-col h-full bg-zinc-950 lg:bg-transparent pb-4 lg:pb-0">
                        <div className="bg-zinc-950 lg:bg-transparent lg:border-0 p-0 lg:p-0 flex flex-col flex-1">
                           <div 
                             className="w-full min-h-[100px] lg:flex-1 rounded-[1.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden transition-all duration-500 group/preview"
                             style={{ backgroundColor: quickColor }}
                           >
                              <div className={`relative z-10 flex flex-col items-center transition-all duration-300 ${isHexFocused ? 'scale-105' : ''}`}>
                                 <input 
                                   type="text"
                                   value={localHex}
                                   onChange={(e) => handleLocalHexChange(e.target.value)}
                                   onFocus={() => setIsHexFocused(true)}
                                   onBlur={() => setIsHexFocused(false)}
                                   maxLength={7}
                                   className={`bg-transparent border-2 rounded-2xl text-center font-mono font-black text-sm lg:text-xl select-all transition-all tracking-widest focus:outline-none uppercase w-[8.5rem] lg:w-[11rem] py-2 cursor-text ${
                                     isHexFocused 
                                       ? 'border-current bg-current/10 shadow-lg' 
                                       : 'border-transparent hover:bg-current/5'
                                   } ${oklch.l > 0.5 ? 'text-black' : 'text-white'}`}
                                   spellCheck={false}
                                 />
                                 <div className={`absolute -bottom-5 transition-all duration-300 pointer-events-none flex items-center gap-1.5 opacity-0 group-hover/preview:opacity-40 group-focus-within/preview:opacity-40 ${
                                   isHexFocused ? 'translate-y-0' : 'translate-y-1'
                                 } ${oklch.l > 0.5 ? 'text-black' : 'text-white'}`}>
                                   <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                   </svg>
                                   <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                     {isHexFocused ? 'Editing...' : 'Edit Hex'}
                                   </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="hidden lg:block mt-4 w-full px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-3 h-9">
                                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mr-1.5">Step</span>
                                 <select 
                                   value={quickStep}
                                   onChange={(e) => setQuickStep(parseInt(e.target.value))}
                                   className="flex-1 bg-transparent text-[11px] font-bold text-white focus:outline-none appearance-none text-center"
                                 >
                                   {system.steps.map(s => (
                                     <option key={s.id} value={s.id}>{s.id}</option>
                                   ))}
                                 </select>
                              </div>
                              <button 
                                onClick={() => onLockStep(quickStep, quickColor, false)}
                                disabled={allLocked}
                                className={`flex-[1.2] h-9 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all whitespace-nowrap shadow-md ${
                                  allLocked 
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/50' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 active:scale-[0.97]'
                                }`}
                              >
                                {allLocked ? 'Locked' : 'Update'}
                              </button>
                            </div>
                        </div>
                      </div>

                      <div className="lg:col-span-6 px-0 pt-6 pb-2 lg:p-0 space-y-3 lg:space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-0.5">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Perceptual Matrix</h3>
                          </div>
                          <div className="flex bg-zinc-900/50 rounded-xl p-0.5 border border-zinc-800/50 w-full sm:w-auto overflow-hidden">
                            {['oklch', 'rgb', 'hsl'].map((f) => (
                              <button
                                key={f}
                                onClick={() => setFormat(f as any)}
                                className={`flex-1 sm:flex-none px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${format === f ? 'bg-zinc-800 text-indigo-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-400'}`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="relative">
                          <div className="min-h-[120px] sm:min-h-[144px]">
                            {format === 'oklch' && (
                              <div key="oklch-view" className="space-y-3 sm:space-y-4 animate-[fade-in-slide-down_0.2s_ease-out]">
                                <ControlSliderRaw label="Lightness" val={oklch.l} max={1} step={0.001} gradient={lGradient} onChange={v => handleOklchChange('l', v)} />
                                <ControlSliderRaw label="Chroma" val={oklch.c} max={0.4} step={0.001} gradient={lGradient} onChange={v => handleOklchChange('c', v)} />
                                <ControlSliderRaw label="Hue" val={oklch.h} max={360} step={1} gradient={hGradient} onChange={v => handleOklchChange('h', v)} />
                              </div>
                            )}
                            {format === 'rgb' && (
                              <div key="rgb-view" className="space-y-3 sm:space-y-4 animate-[fade-in-slide-down_0.2s_ease-out]">
                                <ControlSliderRaw label="Red" val={rgb.r} max={255} step={1} gradient={rGradient} onChange={v => handleRgbChange('r', v)} />
                                <ControlSliderRaw label="Green" val={rgb.g} max={255} step={1} gradient={gGradient} onChange={v => handleRgbChange('g', v)} />
                                <ControlSliderRaw label="Blue" val={rgb.b} max={255} step={1} gradient={bGradient} onChange={v => handleRgbChange('b', v)} />
                              </div>
                            )}
                            {format === 'hsl' && (
                              <div key="hsl-view" className="space-y-3 sm:space-y-4 animate-[fade-in-slide-down_0.2s_ease-out]">
                                <ControlSliderRaw label="Hue" val={hsl.h} max={360} step={1} gradient={hslHGradient} onChange={v => handleHslChange('h', v)} />
                                <ControlSliderRaw label="Saturation" val={hsl.s} max={100} step={1} gradient={hslSGradient} onChange={v => handleHslChange('s', v)} />
                                <ControlSliderRaw label="Lightness" val={hsl.l} max={100} step={1} gradient={hslLGradient} onChange={v => handleHslChange('l', v)} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* MOBILE STEP PICKER */}
                        <div className="lg:hidden pt-4 border-t border-zinc-900/50">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center px-4 h-12">
                                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mr-2">Step</span>
                                 <select 
                                   value={quickStep}
                                   onChange={(e) => setQuickStep(parseInt(e.target.value))}
                                   className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none appearance-none text-center"
                                 >
                                   {system.steps.map(s => (
                                     <option key={s.id} value={s.id}>{s.id}</option>
                                   ))}
                                 </select>
                              </div>
                              <button 
                                onClick={() => onLockStep(quickStep, quickColor, false)}
                                disabled={allLocked}
                                className={`flex-[2] h-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md ${
                                  allLocked 
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/50' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 active:scale-0.98'
                                }`}
                              >
                                {allLocked ? 'Locked' : 'Update'}
                              </button>
                            </div>
                        </div>
                      </div>

                      <div className="lg:col-span-3 px-0 pt-8 pb-4 lg:p-0 space-y-3 lg:space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-900/50 lg:pl-6">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Scale Adjustment</h3>
                          <button 
                            onClick={() => setShowInfoModal(true)}
                            className="p-1.5 text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                            title="Learn about scale adjustments"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                            </svg>
                          </button>
                        </div>

                        <div className="space-y-3">
                          <ControlSlider label="Luminance Punch" value={system.controls.punch} onChange={v => onUpdateControls({...system.controls, punch: v})} />
                          <ControlSlider label="Atmospheric Drift" value={(system.controls.hueRotation + 60) / 120} gradient={driftGradient} onChange={v => onUpdateControls({...system.controls, hueRotation: (v * 120) - 60})} />
                          <ControlSlider label="Curve Steepness" value={system.controls.steepness} onChange={v => onUpdateControls({...system.controls, steepness: v})} />
                          <ControlSlider label="Black Point" value={system.controls.darkness} onChange={v => onUpdateControls({...system.controls, darkness: v})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-lg lg:text-xl font-bold tracking-tight text-white">
                    {system.name} <span className="text-white font-bold">Palette</span>
                  </h2>
                  {!isBaseSystem && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 gap-3">
                        <button 
                          onClick={() => onUpdateStepCount(Math.max(3, system.stepCount - 1))}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest min-w-[50px] text-center">
                          {system.stepCount} Steps
                        </span>
                        <button 
                          onClick={() => onUpdateStepCount(Math.min(21, system.stepCount + 1))}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <button 
                        onClick={onToggleLockAll}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          allLocked 
                            ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {allLocked ? 'Unlock All' : 'Lock All'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
                 <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-950">
                    <div className="grid grid-cols-2 xs:grid-cols-3 md:flex md:flex-row min-w-full md:min-w-0 flex-1">
                    {system.steps.map((step) => {
                      const isImmutable = isBaseSystem;
                      const contrastTextColor = step.contrastOnBlack > step.contrastOnWhite ? 'text-black' : 'text-white';
                      
                      return (
                        <div 
                          key={step.id} 
                          onClick={() => !isImmutable && handleEditStep(step)}
                          className={`group relative h-[120px] md:h-48 md:flex-1 transition-all ${isImmutable ? 'cursor-default' : 'cursor-pointer'} ${step.isLocked && !isImmutable ? 'z-20 ring-2 ring-white/40 ring-inset shadow-[0_0_40px_rgba(0,0,0,0.2)]' : ''}`}
                          style={{ backgroundColor: step.hex }}
                        >
                           <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute top-3 left-3 pointer-events-auto">
                                <span className={`text-[10px] sm:text-[11px] font-black tracking-tighter ${contrastTextColor}`}>{step.id}</span>
                              </div>
                                
                                {!isImmutable && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (step.isLocked) onUnlockStep(step.id);
                                      else onLockStep(step.id, step.hex);
                                    }}
                                    className={`absolute top-0 right-0 w-10 h-10 flex items-center justify-center transition-all pointer-events-auto ${
                                      step.isLocked 
                                        ? 'opacity-100' 
                                        : 'opacity-0 group-hover:opacity-40 hover:!opacity-100'
                                    } ${contrastTextColor}`}
                                    title={step.isLocked ? 'Unlock Color' : 'Lock Color'}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                      {step.isLocked ? (
                                        <>
                                          <rect width="16" height="10" x="4" y="12" rx="2" ry="2" fill="currentColor" stroke="none" />
                                          <path d="M7 12V8a5 5 0 0 1 10 0v4" />
                                        </>
                                      ) : (
                                        <>
                                          <rect width="16" height="10" x="4" y="12" rx="2" ry="2" fill="none" />
                                          <path d="M7 12V8a5 5 0 0 1 9-4" />
                                        </>
                                      )}
                                    </svg>
                                  </button>
                                )}
                              
                              <div className="absolute bottom-3 left-3 right-3 space-y-1.5 sm:space-y-3">
                                <div className={`flex flex-col gap-0.5 sm:gap-1.5 leading-none opacity-80 ${contrastTextColor}`}>
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-[9px] sm:text-[11px] font-black">W</span>
                                    <span className="text-[9px] sm:text-[11px] font-mono font-black">{step.contrastOnWhite.toFixed(1)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-[9px] sm:text-[11px] font-black">B</span>
                                    <span className="text-[9px] sm:text-[11px] font-mono font-black">{step.contrastOnBlack.toFixed(1)}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(step.hex);
                                    setCopiedId(step.id);
                                    setTimeout(() => setCopiedId(null), 1500);
                                  }}
                                  className={`flex items-center justify-start w-fit px-1 py-1 -ml-1 rounded-lg transition-all hover:bg-current/10 active:scale-95 pointer-events-auto group/copy ${contrastTextColor}`}
                                  title="Copy Hex"
                                >
                                  <span className="text-[10px] sm:text-[12px] font-mono font-black whitespace-nowrap uppercase tracking-tighter">
                                    {copiedId === step.id ? 'Copied!' : step.hex}
                                  </span>
                                </button>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                    </div>
                 </div>

              {/* SNAPSHOTS SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-lg lg:text-xl font-bold tracking-tight text-white">
                    Snapshots <span className="text-white font-bold">History</span>
                  </h2>
                  <button 
                    onClick={() => setIsSnapshotNamingOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    Capture State
                  </button>
                </div>
                
                {snapshots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-zinc-900/30 border border-white/5 rounded-[1.5rem] p-4 md:p-5">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-400 font-bold text-[10px]">No snapshots yet</p>
                      <p className="text-zinc-600 text-[9px]">Capture the current color state to save it as a snapshot.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {snapshots.map(snapshot => (
                      <div 
                        key={snapshot.id}
                        className="group relative bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 rounded-xl p-2.5 transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10"
                        onClick={() => onRestoreSnapshot(snapshot.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-white truncate pr-6 uppercase tracking-widest">{snapshot.name}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSnapshot(snapshot.id);
                            }}
                            className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-zinc-900 rounded-md"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden bg-zinc-900 p-0.5">
                          {snapshot.systems.filter(s => s.type !== 'base').map(s => (
                            <div 
                              key={s.id} 
                              className="flex-1 rounded-[1px]" 
                              style={{ backgroundColor: s.steps.find(st => st.id === 500)?.hex || s.steps[0].hex }} 
                              title={s.name}
                            />
                          ))}
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                            {snapshot.systems.length} Systems
                          </span>
                          <div className="flex items-center gap-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
        <PlaygroundView 
          semantics={semantics} 
          theme={theme} 
          onToggleTheme={onToggleTheme} 
          allSystems={allSystems}
          onUpdateSemantic={onUpdateSemantic}
          onAddSemantic={onAddSemantic}
          onDeleteSemantic={onDeleteSemantic}
        />
      </div>

      <SnapshotNamingModal 
        isOpen={isSnapshotNamingOpen}
        onClose={() => setIsSnapshotNamingOpen(false)}
        onSave={(name) => {
          onSaveSnapshot(name);
          setIsSnapshotNamingOpen(false);
        }}
      />

      <ScaleInfoModal 
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
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