import React, { useState, useEffect } from 'react';
import { interpretIntent, checkTrialStatus } from '../services/geminiService';

interface AIPromptModalProps {
  onClose: () => void;
  onApply: (results: any) => void;
}

type ModalStep = 'identity' | 'prompt' | 'exhausted';

const AIPromptModal: React.FC<AIPromptModalProps> = ({ onClose, onApply }) => {
  const [step, setStep] = useState<ModalStep>('identity');
  const [email, setEmail] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill email if they've already identified but not generated
  useEffect(() => {
    const saved = localStorage.getItem('spectra_trial_email');
    if (saved) setEmail(saved);
  }, []);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await checkTrialStatus(email);
      if (status.allowed) {
        localStorage.setItem('spectra_trial_email', email);
        setStep('prompt');
      } else {
        setStep('exhausted');
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await interpretIntent(prompt, email);
      onApply(results);
    } catch (err: any) {
      setError(err.message || 'Failed to interpret intent. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-xl rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        {/* MODAL HEADER */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
               </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">Spectra AI Partner</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Experimental Color Reasoning</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 pt-2">
          {/* STEP 1: IDENTITY */}
          {step === 'identity' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-indigo-600/5 border border-indigo-500/10 p-5 rounded-2xl">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  To prevent abuse and maintain high quality for everyone, we offer <span className="text-indigo-400 font-black">1 trial credit</span> per user. Enter your email to begin your session.
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">Email Identification</label>
                  <input 
                    type="email"
                    autoFocus
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all placeholder:text-zinc-700 text-lg font-medium"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-400 text-xs font-bold px-1">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? 'Verifying...' : 'Request Access'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: PROMPT AREA */}
          {step === 'prompt' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-zinc-400">Describe your design system intent.</p>
                <div className="bg-indigo-600/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-500/20 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  1 Credit Remaining
                </div>
              </div>

              <form onSubmit={handleSubmitPrompt} className="space-y-4">
                <textarea
                  autoFocus
                  className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-zinc-700 leading-relaxed"
                  placeholder="e.g. A sleek cyberpunk theme with neon violet accents and high-contrast carbon grays. Optimized for dark mode gaming dashboards."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                {error && <p className="text-red-400 text-xs font-bold px-1">{error}</p>}

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setStep('identity')}
                    className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className={`flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 ${isLoading ? 'opacity-50' : ''}`}
                  >
                    {isLoading ? 'Generating...' : 'Compute Palette'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: EXHAUSTED */}
          {step === 'exhausted' && (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Trial Exhausted</h3>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                    This email address ({email}) has already utilized its free trial credit for Spectra AI.
                  </p>
               </div>
               <button 
                 onClick={onClose}
                 className="px-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
               >
                 Close Window
               </button>
            </div>
          )}
        </div>
        
        <div className="px-8 py-5 bg-zinc-950/50 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-600">
          <div className="flex items-center gap-4">
             <span className="uppercase font-black tracking-widest opacity-50">Identity: {email || 'Unverified'}</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-1 h-1 bg-indigo-500 rounded-full" />
             <span className="font-bold">Gemini 3 Pro Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;