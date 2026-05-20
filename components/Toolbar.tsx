import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './Button';
import { ChevronDown, Download, Check } from 'lucide-react';

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
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [exportState, setExportState] = useState<'idle' | 'success'>('idle');

  const handleCopy = async () => {
    const success = await onCopyToFigma('light');
    if (success) {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    }
  };

  const handleExportClick = () => {
    onExport();
    setExportState('success');
    setTimeout(() => setExportState('idle'), 2000);
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

          <div className="flex bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50 relative overflow-hidden shrink-0">
            <motion.div
              className="absolute bg-zinc-800 border border-zinc-700/50 rounded-full shadow-lg"
              initial={false}
              animate={{
                x: viewMode === 'scales' ? 0 : 120,
                width: '120px',
                height: '32px'
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
            
            <button 
              onClick={() => onToggleView('scales')}
              className={`relative z-10 w-[120px] h-8 flex items-center justify-center gap-2 transition-colors duration-300 ${
                viewMode === 'scales' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Scales</span>
            </button>
            <button 
              onClick={() => onToggleView('semantics')}
              className={`relative z-10 w-[120px] h-8 flex items-center justify-center gap-2 transition-colors duration-300 ${
                viewMode === 'semantics' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Live Preview</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-5 h-full py-2">
          <div className="flex items-center gap-2 sm:gap-3 h-full">
            <div className="relative h-full flex items-center">
              <Button 
                variant={copyState === 'copied' ? 'secondary' : 'secondary'}
                onClick={() => copyState === 'idle' && handleCopy()}
                leftIcon={copyState === 'copied' ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} /> : <FigmaLogo />}
                className={copyState === 'copied' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
              >
                <span className={copyState === 'copied' ? '' : 'hidden xs:inline'}>
                  {copyState === 'copied' ? 'Copied' : 'Figma layout'}
                </span>
              </Button>
            </div>

            <Button 
              variant="primary"
              onClick={handleExportClick}
              leftIcon={
                exportState === 'success' ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <Download className="w-4 h-4" strokeWidth={2.5} />
                )
              }
            >
              <span className="hidden xs:inline">{exportState === 'success' ? 'Exported' : 'Export'}</span>
              <span className="xs:hidden">{exportState === 'success' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;