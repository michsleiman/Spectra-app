import { AIResponse } from "../types";

/**
 * SECURITY NOTE: 
 * Direct client-side SDK usage has been removed to prevent API Key leakage.
 * All AI reasoning is now directed to a (future) secure server-side endpoint.
 */

export async function checkTrialStatus(email: string): Promise<{ allowed: boolean; remaining: number; message?: string }> {
  // Check if this email has already submitted a request in this browser session
  const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
  if (usedEmails.includes(email.toLowerCase())) {
    return { allowed: false, remaining: 0, message: "This email has already requested access." };
  }
  
  return { allowed: true, remaining: 1 };
}

export async function interpretIntent(prompt: string, email: string): Promise<AIResponse> {
  // This function is currently bypassed by the "Waitlist" flow in AIPromptModal.
  // To re-enable AI, this should be a fetch() call to a secure Vercel Function:
  // return await (await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ prompt, email }) })).json();
  
  throw new Error("AI Generation is currently restricted to approved beta users.");
}