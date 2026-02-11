
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function interpretIntent(prompt: string): Promise<AIResponse> {
  const response = await ai.models.generateContent({
    // Using gemini-3-pro-preview for high-reasoning task of mapping descriptive intent to technical color spaces.
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

  return JSON.parse(response.text);
}
