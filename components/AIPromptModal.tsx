import React, { useState, useEffect } from 'react';
import { checkTrialStatus, submitWaitlist } from '../services/geminiService';

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
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await checkTrialStatus(cleanEmail);
      if (!status.allowed) {
        setStep('exhausted');
        setIsLoading(false);
        return;
      }

      const success = await submitWaitlist(cleanEmail);
      
      if (success) {
        localStorage.setItem('spectra_trial_email', cleanEmail);
        
        const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
        if (!usedEmails.includes(cleanEmail)) {
          usedEmails.push(cleanEmail);
          localStorage.setItem('spectra_used_trials', JSON.stringify(usedEmails));
        }
        
        setStep('success');
      } else {
        setError("Connection error. Please try again later.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="bg-zinc-900 w-full max-w-xl rounded-[2rem] sm:rounded-[3rem] border border-zinc-800 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 pt-8 pb-4 sm:px-10 sm:pt-10 sm:pb-4 flex justify-between items-start flex-shrink-0">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-600/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
               <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
               </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Spectra Access</h2>
              <p className="text-zinc-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5 sm:mt-1">Managed Beta Enrollment</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-1 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 pt-2 sm:px-10 sm:py-10 sm:pt-4 overflow-y-auto custom-scrollbar">
          {/* STEP 1: IDENTITY */}
          {step === 'identity' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white text-base sm:text-lg font-bold">Join the waitlist</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Spectra AI is currently in <span className="text-indigo-400 font-bold italic">private beta</span>. 
                  Submit your email to request an invitation and get your first generation credit once approved.
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-5 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-600 ml-1">Work Email</label>
                  <input 
                    type="email"
                    autoFocus
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-zinc-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all placeholder:text-zinc-700 text-base sm:text-lg font-medium"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? 'Processing...' : 'Submit Request'}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SUCCESS MESSAGE */}
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
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Request Sent!</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm max-w-[260px] sm:max-w-sm mx-auto leading-relaxed">
                    We've received your request for <span className="text-white font-bold">{email}</span>. 
                    You'll receive a confirmation email once your trial is ready.
                  </p>
               </div>
            </div>
          )}

          {/* STEP 3: EXHAUSTED */}
          {step === 'exhausted' && (
            <div className="text-center py-8 sm:py-12 space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-500 border border-zinc-700">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-white">Request Pending</h3>
                  <p className="text-zinc-500 text-xs sm:text-sm max-w-[240px] sm:max-w-xs mx-auto leading-relaxed">
                    A request for <span className="text-zinc-300 font-bold">{email}</span> has already been submitted and is awaiting approval.
                  </p>
               </div>
               <button 
                 onClick={onClose}
                 className="px-10 sm:px-12 py-4 sm:py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto"
               >
                 Close Window
               </button>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 sm:px-10 sm:py-6 bg-zinc-950/50 border-t border-zinc-800/50 flex items-center justify-between text-[8px] sm:text-[10px] text-zinc-600 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
             <span className="uppercase font-black tracking-widest opacity-50">Status: {step === 'success' ? 'Requested' : 'Guest'}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
             <span className="w-1 h-1 bg-indigo-500 rounded-full" />
             <span className="font-bold">Waitlist Protocol v1.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;