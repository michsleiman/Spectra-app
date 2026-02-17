import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, SystemType } from "../types";

/**
 * PRODUCTION NOTE: 
 * Using the provided Formspree endpoint for beta waitlist collection.
 */
const WEBHOOK_URL = 'https://formspree.io/f/meelkwoj'; 

export async function checkTrialStatus(email: string): Promise<{ allowed: boolean; remaining: number; message?: string }> {
  // Simple check: if they are in the 'used' list, they are already on the waitlist.
  // In a real app, this would check a backend for approval status.
  const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
  const isWaitlisted = usedEmails.includes(email.toLowerCase());
  
  return { 
    allowed: true, // We allow the modal to proceed to either "Join Waitlist" or "Prompt"
    remaining: isWaitlisted ? 1 : 0 
  };
}

export async function submitWaitlist(email: string): Promise<boolean> {
  if (!WEBHOOK_URL) return true;

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Design a professional color system based on this prompt: "${prompt}". 
    The system must follow OKLCH perceptual color principles. 
    Explain the color science rationale (e.g., why these specific hues and chroma levels were chosen for the brand identity).
    Generate a Brand system, a Neutral system, and semantic systems (Success, Error, Warning).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rationale: { 
            type: Type.STRING, 
            description: "A professional explanation of the color science and design choices." 
          },
          systems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { 
                  type: Type.STRING, 
                  description: "One of: brand, neutral, success, error, warning" 
                },
                baseHue: { 
                  type: Type.NUMBER, 
                  description: "Hue angle from 0 to 360" 
                },
                baseChroma: { 
                  type: Type.NUMBER, 
                  description: "Chroma level from 0.01 to 0.35" 
                },
                description: { type: Type.STRING }
              },
              required: ["name", "type", "baseHue", "baseChroma"]
            }
          }
        },
        required: ["rationale", "systems"]
      }
    }
  });

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("AI failed to generate a response.");
  
  return JSON.parse(jsonStr) as AIResponse;
}