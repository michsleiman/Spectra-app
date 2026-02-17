import React, { useState, useEffect } from 'react';
import { checkTrialStatus, submitWaitlist, interpretIntent } from '../services/geminiService';
import { AIResponse } from '../types';

interface AIPromptModalProps {
  onClose: () => void;
  onApply: (results: AIResponse) => void;
}

type ModalStep = 'identity' | 'prompt' | 'generating' | 'success' | 'exhausted';

const LOADING_MESSAGES = [
  "Analyzing perceptual color space...",
  "Calculating OKLCH luminance curves...",
  "Synthesizing harmonious hue rotations...",
  "Optimizing for WCAG contrast ratios...",
  "Calibrating atmospheric drift...",
  "Refining chroma boundaries..."
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AIPromptModal: React.FC<AIPromptModalProps> = ({ onClose, onApply }) => {
  const [step, setStep] = useState<ModalStep>('identity');
  const [email, setEmail] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('spectra_trial_email');
    const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
    
    if (saved) {
      setEmail(saved);
      if (usedEmails.includes(saved.toLowerCase())) {
        setStep('prompt');
      }
    }
  }, []);

  useEffect(() => {
    let interval: number;
    if (step === 'generating') {
      interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email is required.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g., name@company.com).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
      if (usedEmails.includes(cleanEmail)) {
        localStorage.setItem('spectra_trial_email', cleanEmail);
        setStep('prompt');
        return;
      }

      const success = await submitWaitlist(cleanEmail);
      if (success) {
        localStorage.setItem('spectra_trial_email', cleanEmail);
        usedEmails.push(cleanEmail);
        localStorage.setItem('spectra_used_trials', JSON.stringify(usedEmails));
        setStep('success');
      } else {
        setError("This email could not be processed. Please verify the address and try again.");
      }
    } catch (err) {
      setError("We encountered an issue processing your request. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStep('generating');
    setError(null);

    try {
      const result = await interpretIntent(prompt, email);
      onApply(result);
    } catch (err) {
      setError("AI Generation failed. Please try a more descriptive prompt.");
      setStep('prompt');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="bg-zinc-900 w-full max-w-xl rounded-[2.5rem] sm:rounded-[3rem] border border-zinc-800 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 pt-8 pb-4 sm:px-10 sm:pt-10 sm:pb-4 flex justify-between items-start flex-shrink-0">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-600/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
               <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
               </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Spectra AI</h2>
              <p className="text-zinc-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5 sm:mt-1">
                {step === 'identity' ? 'Beta Enrollment' : 'Generative Perceptual Design'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-1 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-zinc-800 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 pt-2 sm:px-10 sm:py-10 sm:pt-4 overflow-y-auto custom-scrollbar">
          {/* STEP 1: IDENTITY (WAITLIST) */}
          {step === 'identity' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white text-base sm:text-lg font-bold">Join the private beta</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Spectra AI is currently in <span className="text-indigo-400 font-bold italic">restricted preview</span>. 
                  Enroll in the waitlist to unlock generative palette capabilities.
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-5 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-600 ml-1">Email Address</label>
                  <input 
                    type="email"
                    autoFocus
                    required
                    className={`w-full bg-zinc-950 border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-zinc-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all placeholder:text-zinc-700 text-base sm:text-lg font-medium ${error ? 'border-red-500/50' : 'border-zinc-800'}`}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-[10px] sm:text-xs font-bold px-1 animate-in shake duration-300">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="group w-full bg-white text-black py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 sm:gap-4"
                >
                  {isLoading ? 'Processing...' : 'Unlock Early Access'}
                  <svg className="w-3.5 h-3.5 sm:w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: PROMPTING */}
          {step === 'prompt' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Access Granted: {email}</h3>
                  </div>
                  <h3 className="text-white text-base sm:text-xl font-bold">What are we building today?</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Describe a brand, a mood, or a specific aesthetic. Spectra will generate a complete technical color system.
                  </p>
               </div>

               <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="relative group">
                    <textarea 
                      autoFocus
                      required
                      className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-zinc-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all placeholder:text-zinc-800 text-sm sm:text-base font-medium resize-none leading-relaxed"
                      placeholder="e.g. A premium financial dashboard that feels secure, modern, and deep. Use a primary deep sea blue with a high-energy coral accent..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Gemini 3 Pro</div>
                  </div>

                  {error && <p className="text-red-400 text-xs font-bold px-1">{error}</p>}

                  <button 
                    type="submit"
                    disabled={!prompt.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] shadow-[0_20px_40px_rgba(79,70,229,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                  >
                    Generate Perceptual Palette
                  </button>
               </form>
            </div>
          )}

          {/* STEP 3: GENERATING (LOADING) */}
          {step === 'generating' && (
            <div className="text-center py-20 sm:py-28 space-y-10 animate-in zoom-in-95 duration-700">
               <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
                  <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin duration-[2000ms]" />
                  <div className="absolute inset-4 border-r-2 border-indigo-500/30 rounded-full animate-spin-reverse duration-[3000ms]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <p className="text-white text-base sm:text-lg font-black tracking-tight animate-in fade-in slide-in-from-bottom-2 key={loadingMsgIdx}">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>
                  <div className="flex justify-center gap-1.5">
                    {[0,1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === loadingMsgIdx ? 'w-8 bg-indigo-500' : 'w-2 bg-zinc-800'}`} />
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* STEP 4: SUCCESS (WAITLIST) */}
          {step === 'success' && (
            <div className="text-center py-10 sm:py-20 space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-700">
               <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                  <div className="relative w-full h-full bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
               </div>
               
               <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Request Sent</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm max-w-[260px] sm:max-w-sm mx-auto leading-relaxed">
                    We've received your request for <span className="text-white font-bold">{email}</span>. 
                    Invitation codes are distributed in cycles. Check your inbox soon.
                  </p>
               </div>
               <button 
                 onClick={() => setStep('prompt')}
                 className="px-10 sm:px-12 py-4 sm:py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto"
               >
                 Continue to Trial
               </button>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 sm:px-10 sm:py-6 bg-zinc-950/50 border-t border-zinc-800/50 flex items-center justify-between text-[8px] sm:text-[10px] text-zinc-600 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
             <span className="uppercase font-black tracking-widest opacity-50">
               Status: {step === 'prompt' || step === 'generating' ? 'Authorized' : 'Unverified'}
             </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
             <span className="w-1 h-1 bg-indigo-500 rounded-full" />
             <span className="font-bold opacity-60">Waitlist Protocol v1.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;