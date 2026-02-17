import React, { useState, useEffect } from 'react';
import { checkTrialStatus } from '../services/geminiService';

interface AIPromptModalProps {
  onClose: () => void;
  onApply: (results: any) => void;
}

type ModalStep = 'identity' | 'success' | 'exhausted';

const AIPromptModal: React.FC<AIPromptModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<ModalStep>('identity');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
        if (!usedEmails.includes(email.toLowerCase())) {
          usedEmails.push(email.toLowerCase());
          localStorage.setItem('spectra_used_trials', JSON.stringify(usedEmails));
        }
        
        setStep('success');
      } else {
        setStep('exhausted');
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-500">
      <div className="bg-zinc-900 w-full max-w-xl rounded-[3rem] border border-zinc-800 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)]">
        
        {/* MODAL HEADER */}
        <div className="px-10 pt-10 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
               <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
               </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">Spectra Access</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Managed AI Deployment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-zinc-800 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-10 pt-4">
          {/* STEP 1: IDENTITY */}
          {step === 'identity' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <h3 className="text-white text-lg font-bold">Join the waitlist</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Spectra AI is currently in <span className="text-indigo-400 font-bold italic">private beta</span>. 
                  Submit your email to request an invitation and get your first generation credit once approved.
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1">Work Email</label>
                  <input 
                    type="email"
                    autoFocus
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all placeholder:text-zinc-700 text-lg font-medium"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-400 text-xs font-bold px-1">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="group w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {isLoading ? 'Processing...' : 'Request Invitation'}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SUCCESS MESSAGE */}
          {step === 'success' && (
            <div className="text-center py-20 space-y-8 animate-in zoom-in-95 duration-700">
               <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                  <div className="relative w-full h-full bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white">Request Sent!</h3>
                  <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                    We've received your request for <span className="text-white font-bold">{email}</span>. 
                    You'll receive a confirmation email once your trial is ready.
                  </p>
               </div>
            </div>
          )}

          {/* STEP 3: EXHAUSTED */}
          {step === 'exhausted' && (
            <div className="text-center py-12 space-y-8 animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-500 border border-zinc-700">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white">Request Pending</h3>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
                    A request for <span className="text-zinc-300 font-bold">{email}</span> has already been submitted and is awaiting approval.
                  </p>
               </div>
               <button 
                 onClick={onClose}
                 className="px-12 py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
               >
                 Close Window
               </button>
            </div>
          )}
        </div>
        
        <div className="px-10 py-6 bg-zinc-950/50 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-600">
          <div className="flex items-center gap-4">
             <span className="uppercase font-black tracking-widest opacity-50">Status: {step === 'success' ? 'Requested' : 'Guest'}</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-1 h-1 bg-indigo-500 rounded-full" />
             <span className="font-bold">Waitlist Protocol v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;