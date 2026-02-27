
import React, { useState } from 'react';
import { SemanticToken, ThemeMode, ColorSystem, SystemType } from '../types';

interface PlaygroundViewProps {
  semantics: SemanticToken[];
  theme: ThemeMode;
  onToggleTheme: () => void;
  allSystems: ColorSystem[];
  onUpdateSemantic: (tokenId: string, systemType: SystemType, stepId: number | 'white' | 'black') => void;
  onAddSemantic: (token: Partial<SemanticToken>) => void;
  onDeleteSemantic: (tokenId: string) => void;
}

type PlaygroundMode = 'normal' | 'loading';
type DensityMode = 'comfortable' | 'compact';

interface SpecContextType {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  get: (id: string) => string;
}

const SpecContext = React.createContext<SpecContextType | null>(null);

const SpecWrapper: React.FC<{ children: React.ReactNode; tokens: string[]; className?: string; position?: 'top' | 'bottom' }> = ({ children, tokens, className = "", position = 'top' }) => {
  const context = React.useContext(SpecContext);
  const id = React.useId();
  if (!context) return <>{children}</>;

  const { hoveredId, setHoveredId, get } = context;
  const isHovered = hoveredId === id;

  return (
    <div 
      className={`relative group/spec ${className} ${isHovered ? 'z-[9999]' : 'z-auto'}`}
      onMouseEnter={() => setHoveredId(id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {children}
      {isHovered && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-[9999] pointer-events-none ${position === 'top' ? '-top-2 -translate-y-full' : '-bottom-2 translate-y-full'}`}>
          <div className="flex flex-col gap-1 p-1.5 rounded-lg shadow-2xl border animate-in fade-in zoom-in duration-200" style={{ backgroundColor: get('bg-brand'), borderColor: get('border-brand') }}>
            {tokens.map(t => (
              <div key={t} className="flex items-center gap-2 px-1.5 py-0.5 rounded bg-black/20">
                <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: get(t) }} />
                <span className="text-[8px] font-black whitespace-nowrap uppercase tracking-widest" style={{ color: get('text-on-brand') }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
          <div className={`w-2 h-2 rotate-45 absolute left-1/2 -translate-x-1/2 border-r border-b ${position === 'top' ? '-bottom-1' : '-top-1 rotate-[225deg]'}`} style={{ backgroundColor: get('bg-brand'), borderColor: get('border-brand') }} />
        </div>
      )}
    </div>
  );
};

const PlaygroundView: React.FC<PlaygroundViewProps> = ({ 
  semantics, 
  theme, 
  onToggleTheme,
  allSystems,
  onUpdateSemantic,
  onAddSemantic,
  onDeleteSemantic
}) => {
  const [mode, setMode] = useState<PlaygroundMode>('normal');
  const [density, setDensity] = useState<DensityMode>('comfortable');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const get = (id: string) => semantics.find(s => s.id === id)?.hex || 'transparent';

  // Helper to construct semantic shadows
  const getShadow = (opacity: number = 0.1) => {
    const color = get('shadow-color');
    // Convert hex to rgba for opacity if needed, or just use the hex if it's already dark
    return `0 4px 20px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  const isCompact = density === 'compact';
  const isLoading = mode === 'loading';

  return (
    <SpecContext.Provider value={{ hoveredId, setHoveredId, get }}>
      <div className={`w-full h-full overflow-hidden flex flex-col transition-colors duration-500`} style={{ backgroundColor: get('bg-primary') }}>
        
        {/* PLAYGROUND TOOLBAR */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-4 overflow-x-auto no-scrollbar" style={{ borderColor: get('border-subtle'), backgroundColor: get('bg-secondary') }}>
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: get('text-primary') }}>Mode</span>
              <div className="flex p-1 rounded-lg border shrink-0" style={{ borderColor: get('border-secondary'), backgroundColor: get('bg-primary') }}>
                {(['normal', 'loading'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center min-h-[24px] shrink-0 ${mode === m ? '' : 'opacity-50 hover:opacity-100'}`}
                    style={{ 
                      backgroundColor: mode === m ? get('bg-brand') : 'transparent', 
                      color: mode === m ? get('text-on-brand') : get('text-primary'),
                      boxShadow: mode === m ? getShadow(0.2) : 'none'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: get('text-primary') }}>Density</span>
              <div className="flex p-1 rounded-lg border shrink-0" style={{ borderColor: get('border-secondary'), backgroundColor: get('bg-primary') }}>
                {(['comfortable', 'compact'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center min-h-[24px] shrink-0 ${density === d ? '' : 'opacity-50 hover:opacity-100'}`}
                    style={{ 
                      backgroundColor: density === d ? get('bg-brand') : 'transparent', 
                      color: density === d ? get('text-on-brand') : get('text-primary'),
                      boxShadow: density === d ? getShadow(0.2) : 'none'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={onToggleTheme}
              className="flex items-center gap-3 px-4 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{ backgroundColor: get('bg-tertiary'), borderColor: get('border-secondary'), color: get('text-primary'), boxShadow: getShadow(0.05) }}
            >
              {theme === 'light' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Dark Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE TOKENS BAR - Main Attraction */}
        <div className="lg:hidden flex-shrink-0 px-4 py-3 border-b overflow-x-auto no-scrollbar flex items-center gap-3 bg-zinc-900/20" style={{ borderColor: get('border-subtle') }}>
          {semantics.filter(s => !s.parent).map(token => (
            <div 
              key={token.id} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 shrink-0 transition-all active:scale-95"
              style={{ boxShadow: getShadow(0.05) }}
            >
              <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: token.hex }} />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-0.5">{token.category}</span>
                <span className="text-[10px] font-bold text-zinc-200 leading-none">{token.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`flex-1 overflow-y-auto transition-all duration-500 ${isCompact ? 'p-4' : 'p-8 lg:p-12'}`}>
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* DASHBOARD HEADER */}
            <header className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isCompact ? 'pb-4' : 'pb-8'}`} style={{ borderColor: get('border-subtle') }}>
              <div className={isLoading ? 'animate-pulse' : ''}>
                <SpecWrapper tokens={['text-primary']} position="bottom">
                  <h1 className={`${isCompact ? 'text-xl' : 'text-3xl'} font-black tracking-tight`} style={{ color: get('text-primary') }}>
                    {isLoading ? 'Loading Analytics...' : 'Analytics Overview'}
                  </h1>
                </SpecWrapper>
                <SpecWrapper tokens={['text-secondary']} position="bottom">
                  <p className="text-sm" style={{ color: get('text-secondary') }}>
                    {isLoading ? 'Fetching latest data points...' : 'Welcome back, here is what\'s happening today.'}
                  </p>
                </SpecWrapper>
              </div>
              <div className="flex items-center gap-3">
                <SpecWrapper tokens={['bg-secondary', 'border-secondary', 'text-primary']} position="bottom">
                  <button 
                    className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95`} 
                    style={{ backgroundColor: get('bg-secondary'), borderColor: get('border-secondary'), color: get('text-primary'), boxShadow: getShadow(0.05) }}
                  >
                    Download Report
                  </button>
                </SpecWrapper>
                <SpecWrapper tokens={['bg-brand', 'text-on-brand']} position="bottom">
                  <button 
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95`} 
                    style={{ backgroundColor: get('bg-brand'), color: get('text-on-brand'), boxShadow: getShadow(0.2) }}
                  >
                    Create Project
                  </button>
                </SpecWrapper>
              </div>
            </header>

            {/* STATS GRID */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-3' : 'gap-6'}`}>
              <SpecWrapper tokens={['bg-secondary', 'border-subtle', 'text-primary', 'bg-success-subtle', 'foreground-success', 'border-success']} className="flex-1">
                <StatCard label="Total Revenue" value="$128,430" change="+12.5%" trend="up" get={get} getShadow={getShadow} isCompact={isCompact} isLoading={isLoading} />
              </SpecWrapper>
              <SpecWrapper tokens={['bg-secondary', 'border-subtle', 'text-primary', 'bg-success-subtle', 'foreground-success', 'border-success']} className="flex-1">
                <StatCard label="Active Users" value="2,420" change="+3.2%" trend="up" get={get} getShadow={getShadow} isCompact={isCompact} isLoading={isLoading} />
              </SpecWrapper>
              <SpecWrapper tokens={['bg-secondary', 'border-subtle', 'text-primary', 'bg-error-subtle', 'foreground-error', 'border-error']} className="flex-1">
                <StatCard label="Conversion Rate" value="4.8%" change="-0.4%" trend="down" get={get} getShadow={getShadow} isCompact={isCompact} isLoading={isLoading} />
              </SpecWrapper>
              <SpecWrapper tokens={['bg-secondary', 'border-subtle', 'text-primary', 'bg-success-subtle', 'foreground-success', 'border-success']} className="flex-1">
                <StatCard label="Churn Rate" value="1.2%" change="-0.1%" trend="up" get={get} getShadow={getShadow} isCompact={isCompact} isLoading={isLoading} />
              </SpecWrapper>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* CHART / MAIN FEED */}
              <div className="lg:col-span-2 space-y-6">
                <SpecWrapper tokens={['bg-secondary', 'border-subtle', 'text-secondary', 'bg-brand', 'bg-brand-subtle', 'viz-grid']}>
                  <div className={`rounded-[2.5rem] border flex flex-col ${isCompact ? 'p-6' : 'p-10'}`} style={{ backgroundColor: get('bg-secondary'), borderColor: get('border-subtle'), boxShadow: getShadow(0.05) }}>
                    <div className="flex items-center justify-between mb-6">
                      <SpecWrapper tokens={['text-secondary']}>
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em]" style={{ color: get('text-secondary') }}>Performance Trend</h3>
                      </SpecWrapper>
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: get('bg-brand') }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: get('bg-brand-subtle') }} />
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="h-32 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: get('skeleton-base'), borderTopColor: get('bg-brand') }} />
                      </div>
                    ) : (
                      <div className="h-32 flex items-end gap-2 px-2 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-full h-px" style={{ backgroundColor: get('viz-grid') }} />
                          ))}
                        </div>
                        
                        {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85, 60, 95].map((h, i) => {
                          const barColor = i === 7 ? get('bg-brand') : get('bg-brand-subtle');

                          return (
                            <div 
                              key={i} 
                              className="flex-1 rounded-t-lg transition-all duration-1000 ease-out hover:scale-y-110 cursor-pointer relative z-10" 
                              style={{ 
                                height: `${h}%`, 
                                backgroundColor: barColor
                              }} 
                            />
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4 px-2 text-[9px] font-black uppercase tracking-widest" style={{ color: get('text-tertiary') }}>
                      <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                    </div>
                  </div>
                </SpecWrapper>

                {/* RECENT ACTIVITY */}
                <div className="space-y-4">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2" style={{ color: get('text-secondary') }}>Recent Activity</h3>
                  <div className="space-y-2">
                    <SpecWrapper tokens={['bg-secondary', 'text-primary', 'bg-brand', 'text-tertiary']}>
                      <ActivityItem user="Alex Rivera" action="completed the" target="Onboarding Flow" time="2m ago" get={get} isCompact={isCompact} isLoading={isLoading} />
                    </SpecWrapper>
                    <SpecWrapper tokens={['bg-secondary', 'text-primary', 'bg-brand', 'text-tertiary']}>
                      <ActivityItem user="Sarah Chen" action="uploaded" target="Q3 Assets" time="15m ago" get={get} isCompact={isCompact} isLoading={isLoading} />
                    </SpecWrapper>
                    <SpecWrapper tokens={['bg-secondary', 'text-primary', 'foreground-error', 'text-tertiary']}>
                      <ActivityItem user="System" action="detected an" target="API Latency Spike" time="1h ago" type="error" get={get} isCompact={isCompact} isLoading={isLoading} />
                    </SpecWrapper>
                    <SpecWrapper tokens={['bg-secondary', 'text-primary', 'foreground-success', 'text-tertiary']}>
                      <ActivityItem user="Mike Ross" action="joined the" target="Design Team" time="3h ago" type="success" get={get} isCompact={isCompact} isLoading={isLoading} />
                    </SpecWrapper>
                  </div>
                </div>
              </div>

              {/* SIDEBAR / NOTIFICATIONS */}
              <div className="space-y-6">
                {/* NOTIFICATIONS */}
                <SpecWrapper tokens={['bg-primary', 'border-subtle', 'text-secondary']}>
                  <div className={`rounded-[2.5rem] border ${isCompact ? 'p-6' : 'p-8'}`} style={{ backgroundColor: get('bg-primary'), borderColor: get('border-subtle') }}>
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: get('text-secondary') }}>Notifications</h3>
                    <div className="space-y-4">
                      <SpecWrapper tokens={['bg-warning-subtle', 'border-subtle', 'foreground-warning', 'text-primary', 'text-secondary']}>
                        <NotificationItem title="Security Alert" desc="New login from San Francisco, CA" type="warning" get={get} isLoading={isLoading} />
                      </SpecWrapper>
                      <SpecWrapper tokens={['bg-success-subtle', 'border-subtle', 'foreground-success', 'text-primary', 'text-secondary']}>
                        <NotificationItem title="Deployment Successful" desc="Version 2.4.0 is now live" type="success" get={get} isLoading={isLoading} />
                      </SpecWrapper>
                      <SpecWrapper tokens={['bg-error-subtle', 'border-subtle', 'foreground-error', 'text-primary', 'text-secondary']}>
                        <NotificationItem title="Billing Failed" desc="Your subscription could not be renewed" type="error" get={get} isLoading={isLoading} />
                      </SpecWrapper>
                    </div>
                  </div>
                </SpecWrapper>

                {/* PLAYGROUND INFO CARD */}
                <SpecWrapper tokens={['bg-brand', 'text-on-brand', 'bg-tertiary', 'text-primary']}>
                  <div className={`rounded-[2.5rem] relative overflow-hidden group cursor-pointer transition-all active:scale-[0.98] ${isCompact ? 'p-6' : 'p-8'}`} style={{ backgroundColor: get('bg-brand'), boxShadow: getShadow(0.3) }}>
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:scale-125 transition-transform duration-1000" style={{ backgroundColor: get('bg-tertiary'), opacity: 0.1 }} />
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-xl font-black leading-tight" style={{ color: get('text-on-brand') }}>Test Your System</h3>
                      <p className="text-xs opacity-80" style={{ color: get('text-on-brand') }}>This interactive playground uses your semantic tokens in real-time. Change your mappings to see the UI adapt instantly.</p>
                      <button className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors" style={{ backgroundColor: get('bg-tertiary'), color: get('text-primary'), boxShadow: getShadow(0.2) }}>Explore Components</button>
                    </div>
                  </div>
                </SpecWrapper>

              </div>
            </div>
          </div>
        </div>
      </div>
    </SpecContext.Provider>
  );
};

const StatCard = ({ label, value, change, trend, get, getShadow, isCompact, isLoading }: any) => (
  <div 
    className={`rounded-[2rem] border transition-all hover:-translate-y-1 duration-300 group cursor-default ${isCompact ? 'p-5' : 'p-8'}`} 
    style={{ backgroundColor: get('bg-secondary'), borderColor: get('border-subtle'), boxShadow: getShadow(0.05) }}
  >
    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-50" style={{ color: get('text-primary') }}>{label}</p>
    <div className="flex items-end justify-between">
      {isLoading ? (
        <div className="h-8 w-24 rounded-lg animate-pulse" style={{ backgroundColor: get('skeleton-base') }} />
      ) : (
        <h4 className="text-2xl font-black tracking-tight" style={{ color: get('text-primary') }}>{value}</h4>
      )}
      {isLoading ? (
        <div className="h-5 w-12 rounded-full animate-pulse" style={{ backgroundColor: get('skeleton-base') }} />
      ) : (
        <span 
          className={`text-[9px] font-black px-2.5 py-1 rounded-full border`}
          style={{ 
            backgroundColor: trend === 'up' ? get('bg-success-subtle') : get('bg-error-subtle'),
            color: trend === 'up' ? get('foreground-success') : get('foreground-error'),
            borderColor: trend === 'up' ? get('border-success') : get('border-error')
          }}
        >
          {change}
        </span>
      )}
    </div>
  </div>
);

const ActivityItem = ({ user, action, target, time, type, get, isCompact, isLoading }: any) => {
  let dotColor = get('bg-brand');
  if (type === 'error') dotColor = get('foreground-error');
  if (type === 'success') dotColor = get('foreground-success');

  return (
    <div 
      className={`flex items-center justify-between rounded-2xl border border-transparent transition-all group cursor-pointer ${isCompact ? 'p-3' : 'p-5'}`} 
      style={{ backgroundColor: get('bg-secondary') }}
    >
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: get('skeleton-base') }} />
        ) : (
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
        )}
        
        {isLoading ? (
          <div className="h-4 w-48 rounded animate-pulse" style={{ backgroundColor: get('skeleton-base') }} />
        ) : (
          <p className="text-xs" style={{ color: get('text-primary') }}>
            <span className="font-bold">{user}</span> <span className="opacity-60">{action}</span> <span className="font-bold">{target}</span>
          </p>
        )}
      </div>
      <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest" style={{ color: get('text-tertiary') }}>{time}</span>
    </div>
  );
};

const NotificationItem = ({ title, desc, type, get, isLoading }: any) => {
  let iconColor = get('text-secondary');
  let bgColor = get('bg-secondary');
  
  if (type === 'warning') { iconColor = get('foreground-warning'); bgColor = get('bg-warning-subtle'); }
  if (type === 'error') { iconColor = get('foreground-error'); bgColor = get('bg-error-subtle'); }
  if (type === 'success') { iconColor = get('foreground-success'); bgColor = get('bg-success-subtle'); }

  return (
    <div className="flex gap-4 items-start group cursor-pointer">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110`} style={{ backgroundColor: bgColor, borderColor: get('border-subtle'), color: iconColor }}>
        {type === 'warning' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        {type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        {type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <div className="min-w-0 pt-1">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: get('skeleton-base') }} />
            <div className="h-2 w-32 rounded animate-pulse" style={{ backgroundColor: get('skeleton-base') }} />
          </div>
        ) : (
          <>
            <p className="text-xs font-black truncate" style={{ color: get('text-primary') }}>{title}</p>
            <p className="text-[10px] opacity-60 truncate mt-0.5" style={{ color: get('text-secondary') }}>{desc}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PlaygroundView;

