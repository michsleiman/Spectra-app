
import React, { useMemo, useState } from 'react';
import { ColorSystem, SemanticToken, ThemeMode, SemanticCategory, SystemType } from '../types';

interface SemanticViewProps {
  semantics: SemanticToken[];
  systems: ColorSystem[];
  theme: ThemeMode;
  onToggleTheme: () => void;
  onUpdate: (tokenId: string, systemType: SystemType, stepId: number | 'white' | 'black') => void;
  onAddSemantic: (token: Partial<SemanticToken>) => void;
  onDeleteSemantic: (tokenId: string) => void;
}

const SemanticView: React.FC<SemanticViewProps> = ({ semantics, systems, theme, onToggleTheme, onUpdate, onAddSemantic, onDeleteSemantic }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [mobileTab, setMobileTab] = useState<'tokens' | 'preview'>('tokens');
  
  // New Token State
  const [newToken, setNewToken] = useState({
    name: '',
    category: 'Text',
    customCategory: '',
    systemType: 'neutral' as SystemType,
    step: 500 as number | 'white' | 'black'
  });

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

  const handleAddSubmit = () => {
    if (!newToken.name.trim()) return;
    
    const finalCategory = newToken.category === 'new' ? newToken.customCategory : newToken.category;
    if (!finalCategory.trim()) return;

    onAddSemantic({
      id: `custom-${Date.now()}`,
      name: newToken.name,
      category: finalCategory,
      systemType: newToken.systemType,
      lightStep: newToken.step,
      darkStep: newToken.step
    });

    setIsAdding(false);
    setNewToken({
      name: '',
      category: 'Text',
      customCategory: '',
      systemType: 'neutral',
      step: 500
    });
  };

  return (
    <div className={`flex flex-col lg:flex-row w-full h-full overflow-hidden transition-colors duration-500 ${theme === 'light' ? 'bg-white' : 'bg-[#0A0A0B]'}`}>
      
      {/* Registry Column - Secondary Background */}
      <div className={`
        w-full lg:w-[480px] xl:w-[540px] border-r flex flex-col overflow-hidden z-10 h-full
        ${mobileTab === 'tokens' ? 'flex' : 'hidden lg:flex'}
        ${theme === 'light' ? 'bg-[#F9FAFB] border-zinc-200' : 'bg-[#0E0E0F] border-zinc-800'}
      `}>
        {/* MOBILE VIEW NAVIGATION - Robust sticky header */}
        <div className="lg:hidden sticky top-0 z-50 bg-inherit border-b border-zinc-200 dark:border-zinc-800 p-4">
            <div className={`flex bg-zinc-900/10 p-1 rounded-2xl border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <button 
                  onClick={() => setMobileTab('tokens')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'tokens' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}
                >
                  Tokens
                </button>
                <button 
                  onClick={() => setMobileTab('preview')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}
                >
                  Preview
                </button>
            </div>
        </div>

        <header className="p-6 lg:p-8 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
              <h1 className={`text-xl lg:text-2xl font-black tracking-tight ${theme === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>Semantics</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`p-2 rounded-xl border transition-all ${
                  isAdding 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : theme === 'light' 
                      ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isAdding ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                </svg>
              </button>
              <button 
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-all ${
                  theme === 'light' 
                    ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* ADD TOKEN FORM */}
          {isAdding && (
            <div className={`mt-6 p-5 rounded-[2rem] border animate-in fade-in slide-in-from-top-4 duration-300 ${
              theme === 'light' ? 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50' : 'bg-zinc-900/40 border-zinc-800'
            }`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Token Name</label>
                    <input 
                      autoFocus
                      className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-zinc-800 text-white'
                      }`}
                      placeholder="e.g. brand-subtle"
                      value={newToken.name}
                      onChange={e => setNewToken({...newToken, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Category</label>
                    <select 
                      className={`w-full text-xs p-3 rounded-xl border outline-none ${
                        theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-zinc-800 text-white'
                      }`}
                      value={newToken.category}
                      onChange={e => setNewToken({...newToken, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="new">+ Create New</option>
                    </select>
                  </div>
                </div>

                {newToken.category === 'new' && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">New Category Name</label>
                    <input 
                      className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-zinc-800 text-white'
                      }`}
                      placeholder="e.g. Navigation"
                      value={newToken.customCategory}
                      onChange={e => setNewToken({...newToken, customCategory: e.target.value})}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Source System</label>
                    <select 
                      className={`w-full text-xs p-3 rounded-xl border outline-none ${
                        theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-zinc-800 text-white'
                      }`}
                      value={newToken.systemType}
                      onChange={e => setNewToken({...newToken, systemType: e.target.value as SystemType})}
                    >
                      {systems.map(sys => <option key={sys.id} value={sys.type}>{sys.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Step</label>
                    <select 
                      className={`w-full text-xs p-3 rounded-xl border outline-none ${
                        theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-zinc-800 text-white'
                      }`}
                      value={newToken.step}
                      onChange={e => {
                        const v = e.target.value;
                        setNewToken({...newToken, step: (v === 'white' || v === 'black') ? v : parseInt(v)});
                      }}
                    >
                      <option value="white">White</option>
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleAddSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                >
                  Create Semantic Token
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-8 lg:space-y-10 pb-24">
          {categories.map((cat) => {
            const catTokens = visibleSemantics.filter(s => s.category === cat);
            if (catTokens.length === 0) return null;
            
            return (
              <section key={cat} className="space-y-3">
                <div className="flex items-center gap-4 px-2">
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {cat}
                  </h3>
                  <div className={`flex-1 h-px ${theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
                </div>
                <div className="space-y-1">
                  {catTokens.map((sem) => (
                    <SemanticRow 
                      key={sem.id} 
                      sem={sem} 
                      theme={theme} 
                      systems={systems}
                      onUpdate={onUpdate}
                      onDelete={onDeleteSemantic}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Preview Column - Primary Background */}
      <div className={`
        flex-1 flex flex-col relative h-full transition-colors duration-500
        ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}
        ${theme === 'light' ? 'bg-white' : 'bg-[#0A0A0B]'}
      `}>
        {/* MOBILE VIEW NAVIGATION - Sticky header for preview too */}
        <div className="lg:hidden sticky top-0 z-50 bg-inherit border-b border-zinc-200 dark:border-zinc-800 p-4">
            <div className={`flex bg-zinc-900/10 p-1 rounded-2xl border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <button 
                  onClick={() => setMobileTab('tokens')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'tokens' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}
                >
                  Tokens
                </button>
                <button 
                  onClick={() => setMobileTab('preview')}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}
                >
                  Preview
                </button>
            </div>
        </div>

        {/* Vertical alignment fix for mobile preview - items-start ensures it doesn't clip the top */}
        <div className="h-full w-full flex items-start lg:items-center justify-center p-4 xl:p-12 overflow-y-auto">
          <div className="w-full max-w-4xl pt-8 lg:pt-0 pb-24 lg:pb-0">
             <LivePreview semantics={semantics} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

const SemanticRow: React.FC<{ 
  sem: SemanticToken; 
  theme: ThemeMode; 
  systems: ColorSystem[]; 
  onUpdate: (tokenId: string, systemType: SystemType, stepId: number | 'white' | 'black') => void;
  onDelete: (tokenId: string) => void;
}> = ({ sem, theme, systems, onUpdate, onDelete }) => {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  const currentStep = theme === 'light' ? sem.lightStep : sem.darkStep;

  // VISUAL SYNC: If the step is W or B, we visually lock the system dropdown to 'base'.
  const displaySystemType = (currentStep === 'white' || currentStep === 'black') ? 'base' : sem.systemType;

  return (
    <div className={`flex flex-row items-center justify-between h-12 py-2 px-3 rounded-2xl transition-all group gap-2 ${
      theme === 'light' ? 'hover:bg-zinc-200/50' : 'hover:bg-zinc-900/60'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0 flex-1 h-full">
        <div 
          className="w-4 h-4 rounded-full shadow-sm border border-zinc-200/30 flex-shrink-0" 
          style={{ backgroundColor: sem.hex }}
        />
        <span className={`text-[11px] font-bold tracking-tight truncate leading-none pt-[1px] ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>
          {sem.name}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 h-full">
        <div className={`flex items-center gap-0.5 p-0.5 rounded-xl border transition-colors h-10 ${
          theme === 'light' ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950 border-zinc-800'
        }`}>
          <div className="relative flex items-center h-full">
            <select 
                value={displaySystemType}
                onChange={(e) => onUpdate(sem.id, e.target.value as SystemType, currentStep)}
                className={`bg-transparent text-[8px] sm:text-[9px] font-black uppercase tracking-widest pl-2 pr-4 h-full outline-none transition-colors appearance-none cursor-pointer text-left ${
                theme === 'light' ? 'text-zinc-700' : 'text-zinc-400'
                }`}
            >
                {systems.map(sys => (
                <option key={sys.id} value={sys.type} className={theme === 'light' ? 'text-zinc-900 bg-white' : 'text-white bg-zinc-950'}>
                    {sys.name}
                </option>
                ))}
            </select>
            <div className="absolute right-1 pointer-events-none opacity-40">
                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </div>
          </div>
          
          <div className={`w-px h-3 self-center ${theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
          
          <div className="relative flex items-center h-full">
            <select 
                value={currentStep}
                onChange={(e) => {
                const val = e.target.value;
                const step = (val === 'white' || val === 'black') ? val : parseInt(val);
                const systemToUse = (val === 'white' || val === 'black') ? 'base' : sem.systemType;
                onUpdate(sem.id, systemToUse as SystemType, step as any);
                }}
                className={`bg-transparent text-[8px] sm:text-[9px] font-mono font-black pl-2 pr-4 h-full outline-none transition-colors appearance-none cursor-pointer text-center ${
                theme === 'light' ? 'text-zinc-700' : 'text-zinc-400'
                }`}
            >
                <option value="white" className={theme === 'light' ? 'text-zinc-900 bg-white' : 'text-white bg-zinc-950'}>W</option>
                {steps.map(s => (
                <option key={s} value={s} className={theme === 'light' ? 'text-zinc-900 bg-white' : 'text-white bg-zinc-950'}>{s}</option>
                ))}
                <option value="black" className={theme === 'light' ? 'text-zinc-900 bg-white' : 'text-white bg-zinc-950'}>B</option>
            </select>
            <div className="absolute right-1 pointer-events-none opacity-40">
                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </div>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(sem.id); }}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            theme === 'light' ? 'text-zinc-400 hover:bg-red-50 hover:text-red-500' : 'text-zinc-600 hover:bg-red-500/10 hover:text-red-500'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

const LivePreview = ({ semantics, theme }: { semantics: SemanticToken[], theme: ThemeMode }) => {
  const get = (id: string) => semantics.find(s => s.id === id)?.hex || '#888';

  return (
    <div className="w-full space-y-8 lg:space-y-10 py-4">
      {/* 1. Typography Section */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: get('text-primary') }}>
          I am a Primary Text color
        </h1>
        <h2 className="text-lg md:text-xl font-bold opacity-90" style={{ color: get('text-secondary') }}>
          I am a Secondary Text color
        </h2>
        <p className="text-xs md:text-sm leading-relaxed max-w-2xl opacity-80" style={{ color: get('text-tertiary') }}>
          I am a Tertiary Text color. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Cras sit amet consequat leo, vitae commodo metus. Ut eget consectetur nisi, ac 
          eleifend metus. In eu elit placerat, iaculis nulla ac.
        </p>
      </div>

      {/* 2. Buttons Row */}
      <div className="flex flex-wrap items-center gap-4">
        <button className="h-12 px-6 flex items-center justify-center rounded-full text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95" style={{ backgroundColor: get('bg-brand'), color: get('text-white') }}>
          Primary button
        </button>
        <button className="h-12 px-6 flex items-center justify-center rounded-full text-xs font-black uppercase tracking-widest border transition-all active:scale-95" style={{ backgroundColor: get('bg-primary'), borderColor: get('border-primary'), color: get('text-primary') }}>
          Secondary button
        </button>
        <button className="h-12 px-6 flex items-center justify-center rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95" style={{ color: get('text-primary') }}>
          Tertiary button
        </button>
      </div>

      {/* 3. Inputs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: get('text-primary') }}>Email address</label>
            <div className="relative">
                <input 
                    type="email" 
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm shadow-sm"
                    style={{ backgroundColor: 'transparent', borderColor: get('border-brand'), color: get('text-primary') }}
                />
            </div>
            <p className="text-[10px] font-bold" style={{ color: get('text-secondary') }}>Please enter a valid email address</p>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: get('text-error') }}>Email address</label>
            <div className="relative">
                <input 
                    type="email" 
                    defaultValue="email-example.com"
                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all pr-10 text-sm shadow-sm"
                    style={{ backgroundColor: 'transparent', borderColor: get('border-error'), color: get('text-primary') }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: get('text-primary') }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
            </div>
            <p className="text-[10px] font-bold" style={{ color: get('text-error') }}>Please use a valid email address format</p>
        </div>
      </div>

      {/* 4. Form Controls Grid */}
      <div className="flex flex-wrap items-start gap-8">
        <ControlItem label="Default state" helper="Unselected option" color={get('text-primary')} secondary={get('text-tertiary')}>
            <div className="w-5 h-5 rounded border-2 border-zinc-700"></div>
        </ControlItem>
        <ControlItem label="Selected state" helper="Selected option" color={get('text-primary')} secondary={get('text-tertiary')}>
            <div className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ backgroundColor: get('bg-brand') }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
        </ControlItem>
        <ControlItem label="Disabled state" helper="Cannot be selected" color={get('text-primary')} secondary={get('text-tertiary')}>
            <div className="w-5 h-5 rounded border-2 border-zinc-700 bg-zinc-100 flex items-center justify-center opacity-50">
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
        </ControlItem>
      </div>

      {/* 5. Alerts & Banners */}
      <div className="space-y-3">
        {/* Complex Alert (Warning) */}
        <div className="p-6 rounded-xl border-2 relative overflow-hidden shadow-lg" style={{ backgroundColor: get('bg-warning-light'), borderColor: get('border-warning') }}>
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ color: get('fg-warning') }}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                        <h5 className="text-base font-black" style={{ color: get('text-warning') }}>Global cart warning message</h5>
                        <button style={{ color: get('text-primary') }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-xs opacity-80" style={{ color: get('text-primary') }}>
                        Mensarum enim voragines et varias voluptatum inlecebras, ne longius progrediar.
                    </p>
                </div>
            </div>
        </div>

        {/* Simpler Banner (Error) */}
        <div className="px-5 py-3 rounded-xl border-2 flex items-center justify-between shadow-md" style={{ backgroundColor: get('bg-error-light'), borderColor: get('border-error') }}>
            <div className="flex items-center gap-3">
                <div className="shrink-0" style={{ color: get('fg-error') }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <span className="text-xs font-bold" style={{ color: get('text-primary') }}>Global cart error message</span>
            </div>
            <button style={{ color: get('text-primary') }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

const ControlItem = ({ children, label, helper, color, secondary }: { children?: React.ReactNode, label: string, helper: string, color: string, secondary: string }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5">{children}</div>
        <div>
            <p className="text-[12px] font-black tracking-tight leading-tight" style={{ color }}>{label}</p>
            <p className="text-[10px] leading-tight opacity-60 mt-0.5" style={{ color: secondary }}>{helper}</p>
        </div>
    </div>
)

export default SemanticView;
