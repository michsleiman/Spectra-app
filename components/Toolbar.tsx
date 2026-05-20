import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './Button';
import { ChevronDown, Download, Check } from 'lucide-react';

interface ToolbarProps {
  paletteName: string;
  onOpenAI: () => void;
  onExport: () => void;
  onUndo: () => void;
  canUndo: boolean;
  viewMode: 'scales' | 'semantics';
  onToggleView: (mode: 'scales' | 'semantics') => void;
  onToggleSidebar: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  paletteName, 
  onOpenAI, 
  onExport, 
  onUndo, 
  canUndo, 
  viewMode, 
  onToggleView,
  onToggleSidebar
}) => {
  const [exportState, setExportState] = useState<'idle' | 'success'>('idle');

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