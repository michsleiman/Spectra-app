import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

/**
 * SECURITY NOTE: 
 * For production, move this logic to a Vercel Serverless Function (/api/generate).
 * This prevents users from seeing your API_KEY in the browser's Network tab.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function checkTrialStatus(email: string): Promise<{ allowed: boolean; remaining: number; message?: string }> {
  // SIMULATION: In production, replace this with a fetch to your Vercel KV database
  // Example: const res = await fetch(`/api/credits?email=${email}`);
  
  const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
  if (usedEmails.includes(email.toLowerCase())) {
    return { allowed: false, remaining: 0, message: "This email has already used its trial credit." };
  }
  
  return { allowed: true, remaining: 1 };
}

export async function interpretIntent(prompt: string, email: string): Promise<AIResponse> {
  // Final safety check
  const status = await checkTrialStatus(email);
  if (!status.allowed) {
    throw new Error(status.message || "No credits remaining.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Translate the following designer intent for a color system into a structured technical configuration.
    Designer Intent: "${prompt}"
    
    Return a rationale and a list of color systems (Brand, Neutral, Success, Error, Warning, Base).
    For each, suggest a base Hue (0-360) and base Chroma (0-0.4) in OKLCH space.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rationale: { type: Type.STRING },
          systems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['brand', 'neutral', 'success', 'error', 'warning', 'base'] },
                baseHue: { type: Type.NUMBER },
                baseChroma: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["name", "type", "baseHue", "baseChroma", "description"]
            }
          }
        },
        required: ["rationale", "systems"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("The AI response did not contain any text content.");
  }

  // Record credit usage
  const usedEmails = JSON.parse(localStorage.getItem('spectra_used_trials') || '[]');
  usedEmails.push(email.toLowerCase());
  localStorage.setItem('spectra_used_trials', JSON.stringify(usedEmails));

  return JSON.parse(text);
}