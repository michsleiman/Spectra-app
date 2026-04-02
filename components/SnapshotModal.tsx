import React, { useState, useEffect } from 'react';

interface SnapshotModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

const SnapshotModal: React.FC<SnapshotModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Capture Snapshot</h2>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Save current project state</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Snapshot Name</label>
              <input 
                autoFocus
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vibrant Brand Exploration"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!name.trim()}
                className="flex-[2] px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
              >
                Save Snapshot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SnapshotModal;
