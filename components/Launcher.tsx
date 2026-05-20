import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Type, ChevronRight, Ruler, Box } from 'lucide-react';

interface LauncherProps {
  onSelectTool: (tool: 'colors' | 'typography' | 'dimensions') => void;
}

const Launcher: React.FC<LauncherProps> = ({ onSelectTool }) => {
  const [activePreview, setActivePreview] = useState<'color' | 'typography'>('color');

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePreview(prev => prev === 'color' ? 'typography' : 'color');
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const tools = [
    {
      id: 'colors',
      title: 'Color Systems',
      description: 'Perceptual color scaling with OKLCH interpolation and AI semantic generation.',
      icon: Palette,
      active: true,
      features: ['OKLCH Interpolation', 'Semantic Tokens', 'AI Generation']
    },
    {
      id: 'typography',
      title: 'Typography',
      description: 'Systematic type scaling and pairing engine with vertical rhythm and contrast optimization.',
      icon: Type,
      active: true,
      features: ['Fluid Scaling', 'Contrast Checks', 'Optical Sizing']
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-y-auto relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Main Switchable Contents Container */}
      <div className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-6 sm:px-10 py-12 relative z-15">
        {/* Elegant 2-Column Split Bento Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6 sm:pt-10 mb-10 w-full">
          {/* Left Asymmetric Brand Column */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-zinc-900/20 border border-zinc-900/80 rounded-3xl p-8 sm:p-10 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            
            <div className="space-y-6">
              {/* Prominent SPECTRA Brand Logo */}
              <div className="flex flex-col items-start gap-1">
                 <svg width="220" height="55" viewBox="0 0 600 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible h-14 w-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <defs>
                        <linearGradient id="launcher-split-grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: '#FF4D4D', stopOpacity: 1}} /> 
                            <stop offset="100%" style={{stopColor: '#FF9E2C', stopOpacity: 1}} /> 
                        </linearGradient>
                        <linearGradient id="launcher-split-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: '#00C853', stopOpacity: 1}} /> 
                            <stop offset="100%" style={{stopColor: '#0091EA', stopOpacity: 1}} /> 
                        </linearGradient>
                        <linearGradient id="launcher-split-grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: '#6200EA', stopOpacity: 1}} /> 
                            <stop offset="100%" style={{stopColor: '#AA00FF', stopOpacity: 1}} /> 
                        </linearGradient>
                    </defs>
                    <g transform="translate(0, 25) scale(0.85)">
                        <path d="M10,40 C30,10 90,10 110,40 C130,70 10,70 30,40 Z" fill="url(#launcher-split-grad1)" opacity="0.85" style={{mixBlendMode: 'screen'}} />
                        <path d="M40,60 C60,30 120,30 140,60 C160,90 40,90 60,60 Z" fill="url(#launcher-split-grad2)" opacity="0.85" style={{mixBlendMode: 'screen'}}/>
                        <path d="M25,80 C45,50 105,50 125,80 C145,110 25,110 45,80 Z" fill="url(#launcher-split-grad3)" opacity="0.85" style={{mixBlendMode: 'screen'}}/>
                    </g>
                    <text x="175" y="94" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '72px', letterSpacing: '-2px', fill: '#FFFFFF' }}>SPECTRA</text>
                 </svg>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                 Build design systems that <span className="text-indigo-400">scale flawlessly.</span>
              </h2>

              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                 An engineering-first orchestration utility designed to map spatial metrics, fluid scales, human-contrast ratios, and token variables seamlessly.
              </p>

              {/* Dynamic Previews Carousel Box */}
              <div className="bg-zinc-950/80 rounded-2xl border border-zinc-900/60 p-5 font-mono text-[11px] leading-relaxed text-zinc-500 shadow-inner relative group-hover:border-zinc-800 transition-colors duration-350">
                <div className="flex items-center justify-between border-b border-zinc-900/80 pb-3 mb-4">
                  {/* Carousel Tabs selection */}
                  <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-850/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreview('color');
                      }}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                        activePreview === 'color'
                          ? 'bg-indigo-650 text-white shadow'
                          : 'text-zinc-550 hover:text-zinc-300'
                      }`}
                    >
                      Colors
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreview('typography');
                      }}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                        activePreview === 'typography'
                          ? 'bg-pink-650 text-white shadow'
                          : 'text-zinc-550 hover:text-zinc-300'
                      }`}
                    >
                      Type
                    </button>
                  </div>
                  
                  {/* Decorative Carousel Indicator dots */}
                  <div className="flex items-center gap-1.5">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreview('color');
                      }}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${activePreview === 'color' ? 'bg-indigo-500 w-3' : 'bg-zinc-800'}`} 
                    />
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreview('typography');
                      }}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${activePreview === 'typography' ? 'bg-pink-500 w-3' : 'bg-zinc-800'}`} 
                    />
                  </div>
                </div>

                <div className="relative h-[130px] flex flex-col justify-start overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activePreview === 'color' ? (
                      <motion.div
                        key="color-preview"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                        className="h-full flex flex-col justify-between space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Color Spectrum Engine</span>
                          <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" /> Active Swatches
                          </span>
                        </div>
                        {/* Gradient ramp preview */}
                        <div className="h-1 w-full rounded bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 opacity-80" />
                        
                        {/* Swatches block */}
                        <div className="grid grid-cols-5 gap-1 text-center">
                          <div className="space-y-0.5">
                            <div className="h-6 rounded bg-indigo-950 border border-indigo-900/60 flex items-center justify-center text-indigo-400 font-bold font-sans text-[8px]">900</div>
                            <span className="text-[7px] text-zinc-650 block">#1e1b4b</span>
                          </div>
                          <div className="space-y-0.5">
                            <div className="h-6 rounded bg-indigo-800 flex items-center justify-center text-indigo-100 font-bold font-sans text-[8px]">700</div>
                            <span className="text-[7px] text-zinc-650 block">#4338ca</span>
                          </div>
                          <div className="space-y-0.5">
                            <div className="h-6 rounded bg-indigo-500 flex items-center justify-center text-white font-bold font-sans text-[8px]">500</div>
                            <span className="text-[7px] text-zinc-500 block">#6366f1</span>
                          </div>
                          <div className="space-y-0.5">
                            <div className="h-6 rounded bg-indigo-300 flex items-center justify-center text-indigo-950 font-bold font-sans text-[8px]">300</div>
                            <span className="text-[7px] text-zinc-650 block">#a5b4fc</span>
                          </div>
                          <div className="space-y-0.5">
                            <div className="h-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-950 font-bold font-sans text-[8px]">100</div>
                            <span className="text-[7px] text-zinc-650 block">#e0e7ff</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-zinc-550 pt-1 border-t border-zinc-900/40">
                          <span>Contrast Rating (vs. Slate Base):</span>
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">7.4:1 AAA Pass</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="typography-preview"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                        className="h-full flex flex-col justify-between space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-pink-400 tracking-widest">Typographic Specimen</span>
                          <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Ratio: 1.250 (Major Third)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Big elegant text glyph icon */}
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center text-xl font-serif text-white font-black select-none pointer-events-none shadow-md">
                            Aa
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <h4 className="text-zinc-300 font-sans font-black text-[10px]">Inter & Space Grotesk Pair</h4>
                            <p className="text-zinc-550 font-sans text-[9px] leading-snug">
                              Synchronized visual weights with -0.02em tracking presets.
                            </p>
                          </div>
                        </div>
                        <div className="mt-1 pt-1.5 border-t border-zinc-900/50 space-y-0.5">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-pink-400/85">Display Scale Base:</span>
                            <span className="text-zinc-400">16px → 20px → 25px → 31px → 39px</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Right Asymmetric Active Modules & Roadmap Column */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">

            {/* Vertical interactive modules layout */}
            <div className="space-y-4">
              {tools.map((tool, idx) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + (idx * 0.08), duration: 0.3 }}
                  onClick={() => onSelectTool(tool.id as any)}
                  className="group flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer hover:border-indigo-500/40 hover:bg-zinc-900 shadow-lg hover:shadow-[0_0_25px_rgba(99,102,241,0.06)]"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-md transition-all duration-300 group-hover:bg-indigo-600 group-hover:border-indigo-500">
                      <tool.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">
                         {tool.title}
                      </h3>
                      <p className="text-zinc-500 text-xs font-normal leading-relaxed max-w-md mt-0.5 group-hover:text-zinc-300 transition-colors duration-300">
                         {tool.description}
                      </p>
                    </div>
                  </div>

                  {/* Exciting New Call-to-Action Design */}
                  <div className="mt-3 sm:mt-0 shrink-0 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1.25 bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white group-hover:shadow-[0_0_12px_rgba(99,102,241,0.35)] transition-all duration-300">
                      Open Module
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1 duration-300" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Integrated Roadmap section showing active development progress */}
            <div className="bg-zinc-900/10 border border-zinc-900/50 rounded-2xl p-5 sm:p-6 mt-2">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Roadmap Primitives</span>
                 <span className="text-[8px] font-black uppercase tracking-widest bg-zinc-950 px-2 py-0.5 border border-zinc-900 rounded text-zinc-600">v1.3 In Development</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-zinc-950/40 border border-zinc-900/40 p-4 rounded-xl">
                   <div className="flex items-center justify-between mb-1.5">
                     <div className="flex items-center gap-2">
                       <Ruler className="w-4 h-4 text-indigo-400" />
                       <span className="text-xs font-black text-white">Dimensions</span>
                     </div>
                     <span className="text-[9px] font-mono text-indigo-400 font-bold">85% Progress</span>
                   </div>
                   <p className="text-[10px] text-zinc-500 leading-normal mb-3">Corner curves, space scale bases & dynamic spacing layouts.</p>
                   <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" style={{ width: '85%' }} />
                   </div>
                 </div>
                 <div className="bg-zinc-950/40 border border-zinc-900/40 p-4 rounded-xl">
                   <div className="flex items-center justify-between mb-1.5">
                     <div className="flex items-center gap-2">
                       <Box className="w-4 h-4 text-purple-400" />
                       <span className="text-xs font-black text-white">Component Lab</span>
                     </div>
                     <span className="text-[9px] font-mono text-purple-400 font-bold">40% Progress</span>
                   </div>
                   <p className="text-[10px] text-zinc-500 leading-normal mb-3">State orchestrator variables and high-fidelity code wrappers.</p>
                   <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" style={{ width: '40%' }} />
                   </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
 
      {/* Footer */}
      <footer className="relative z-20 px-8 pb-8 mt-auto">
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em] text-center">
           SPECTRA BY <a href="https://www.michelsleiman.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-indigo-400 transition-colors">Michel Sleiman</a>
        </p>
      </footer>
    </div>
  );
};

export default Launcher;
