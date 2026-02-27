import React, { useState, useRef, useEffect } from 'react';

interface ToolbarProps {
  paletteName: string;
  onOpenAI: () => void;
  onExport: () => void;
  onCopyToFigma: (mode: 'light' | 'dark') => Promise<boolean>;
  onUndo: () => void;
  canUndo: boolean;
  viewMode: 'scales' | 'semantics';
  onToggleView: (mode: 'scales' | 'semantics') => void;
  onToggleSidebar: () => void;
}

const FigmaLogo = () => (
  <svg 
    className="w-4 h-4 flex-shrink-0 overflow-visible" 
    viewBox="0 0 38 67" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 0C8.5 0 0 8.5 0 19C0 24.5 2.5 29.5 6.5 32.5C2.5 35.5 0 40.5 0 46C0 56.5 8.5 65 19 65C29.5 65 38 56.5 38 46V19C38 8.5 29.5 0 19 0Z" fill="white" fillOpacity="0.01"/>
    <path d="M9.5 28.5C14.7467 28.5 19 24.2467 19 19C19 13.7533 14.7467 9.5 9.5 9.5C4.25329 9.5 0 13.7533 0 19C0 24.2467 4.25329 28.5 9.5 28.5Z" fill="#F24E1E"/>
    <path d="M28.5 28.5C33.7467 28.5 38 24.2467 38 19C38 13.7533 33.7467 9.5 28.5 9.5C23.2533 9.5 19 13.7533 19 19C19 24.2467 23.2533 28.5 28.5 28.5Z" fill="#FF7262"/>
    <path d="M9.5 47.5C14.7467 47.5 19 43.2467 19 38C19 32.7533 14.7467 28.5 9.5 28.5C4.25329 28.5 0 32.7533 0 38C0 43.2467 4.25329 47.5 9.5 47.5Z" fill="#1ABCFE"/>
    <path d="M9.5 66.5C14.7467 66.5 19 62.2533 19 57V47.5H9.5C4.25329 47.5 0 51.7467 0 57C0 62.2533 4.25329 66.5 9.5 66.5Z" fill="#0ACF83"/>
    <path d="M28.5 47.5C33.7467 47.5 38 43.2467 38 38C38 32.7533 33.7467 28.5 28.5 28.5C23.2533 28.5 19 32.7533 19 38C19 43.2467 23.2533 47.5 28.5 47.5Z" fill="#A259FF"/>
  </svg>
);

const Toolbar: React.FC<ToolbarProps> = ({ 
  paletteName, 
  onOpenAI, 
  onExport, 
  onCopyToFigma,
  onUndo, 
  canUndo, 
  viewMode, 
  onToggleView,
  onToggleSidebar
}) => {
  const [showFigmaMenu, setShowFigmaMenu] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFigmaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async (mode: 'light' | 'dark') => {
    const success = await onCopyToFigma(mode);
    if (success) {
      setCopyState('copied');
      setShowFigmaMenu(false);
      setTimeout(() => setCopyState('idle'), 2500);
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex-shrink-0 z-40">
      <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-6 sm:px-12">
        <div className="flex items-center gap-3 lg:gap-8">
          <button 
            onClick={onToggleSidebar}
            className="hamburger-trigger p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <nav className="flex bg-zinc-900 p-1.5 rounded-full border border-zinc-800 shrink-0">
            <button 
              onClick={() => onToggleView('scales')}
              className={`px-4 lg:px-7 py-2 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'scales' ? 'bg-zinc-800 text-indigo-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Scales
            </button>
            <button 
              onClick={() => onToggleView('semantics')}
              className={`px-4 lg:px-7 py-2 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'semantics' ? 'bg-zinc-800 text-indigo-400 shadow-lg border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Semantics
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-5 h-full py-2">
          <div className="flex items-center gap-3 h-full">
            <div className="relative h-full flex items-center" ref={menuRef}>
              <button 
                onClick={() => copyState === 'idle' && setShowFigmaMenu(!showFigmaMenu)}
                className={`hidden sm:flex px-6 lg:px-7 py-2.5 text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-full transition-all border items-center gap-3.5 ${
                  copyState === 'copied' 
                    ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                }`}
              >
                <FigmaLogo />
                {copyState === 'copied' ? (
                  <>
                    <span className="animate-in fade-in slide-in-from-left-2 duration-300">Copied to Figma</span>
                    <svg className="w-4 h-4 ml-0.5 animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <span>Copy to Figma</span>
                )}
              </button>

              {showFigmaMenu && (
                <div className="absolute top-full right-0 mt-3 min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => handleCopy('light')}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors group"
                    >
                      <div className="w-4 h-4 rounded bg-white border border-zinc-700 flex-shrink-0" />
                      <span className="text-[11px] font-bold">Light Mode</span>
                    </button>
                    <button 
                      onClick={() => handleCopy('dark')}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors group"
                    >
                      <div className="w-4 h-4 rounded bg-zinc-950 border border-zinc-800 flex-shrink-0" />
                      <span className="text-[11px] font-bold">Dark Mode</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={onExport}
              className="hidden sm:block px-6 lg:px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-full transition-colors shadow-lg shadow-indigo-600/20 border border-indigo-500/50"
            >
              Export Variables
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;