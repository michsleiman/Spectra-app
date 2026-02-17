import { AIResponse } from "../types";

/**
 * PRODUCTION NOTE: 
 * Replace WEBHOOK_URL with your Formspree, Zapier, or Vercel Function URL.
 * Example: 'https://formspree.io/f/your_id'
 */
const WEBHOOK_URL = ''; 

export async function checkTrialStatus(email: string): Promise<{ allowed: boolean; remaining: number; message?: string }> {
  const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
  if (usedEmails.includes(email.toLowerCase())) {
    return { allowed: false, remaining: 0, message: "This email has already requested access." };
  }
  
  return { allowed: true, remaining: 1 };
}

export async function submitWaitlist(email: string): Promise<boolean> {
  // If no URL is provided yet, we'll just simulate success so the UI works
  if (!WEBHOOK_URL) {
    console.warn("Spectra: No WEBHOOK_URL defined. Data is not being sent externally.");
    return true;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        source: 'Spectra Beta Waitlist',
        timestamp: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error("Waitlist submission failed:", error);
    return false;
  }
}

export async function interpretIntent(prompt: string, email: string): Promise<AIResponse> {
  throw new Error("AI Generation is currently restricted to approved beta users.");
}