
import React, { useState } from 'react';
import { interpretIntent } from '../services/geminiService';

interface AIPromptModalProps {
  onClose: () => void;
  onApply: (results: any) => void;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ onClose, onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await interpretIntent(prompt);
      onApply(results);
    } catch (err) {
      setError('Failed to interpret intent. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="bg-zinc-900 w-full max-w-xl rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-indigo-500 text-3xl">✨</span>
                AI Design Partner
              </h2>
              <p className="text-zinc-400 text-sm">
                Describe the "vibe" or functional requirements of your color system.
              </p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              autoFocus
              className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-zinc-600"
              placeholder="e.g. I'm building a professional medical dashboard. Trustworthy deep teal as primary, high-readability grays."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className={`px-8 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all flex items-center gap-2 ${isLoading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Thinking...' : 'Generate System'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-4 text-xs text-zinc-500">
          <span className="uppercase font-bold tracking-widest text-zinc-600">Tip:</span>
          Try asking for specific moods like "minimalist futuristic" or "warm organic tones".
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;
