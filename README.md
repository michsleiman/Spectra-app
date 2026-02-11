# SPECTRA • Perceptual Color Engine

**Spectra** is a professional-grade color engine designed to take the guesswork out of building enterprise-scale design systems. 

Most color generators use standard math (HSL/Hex) that often results in "muddy" or visually inconsistent scales. Spectra uses the **OKLCH perceptual color space** to ensure every shade has identical visual weight across different hues.

## ✨ Key Features

- **Perceptual Accuracy:** Built on OKLCH for uniform lightness and saturation curves.
- **Constraint-Based Anchoring:** Lock specific brand colors and let the engine interpolate the harmony.
- **Semantic-First Workflow:** Map colors to UI tokens (like `text-primary`) for Light and Dark modes simultaneously.
- **AI Design Partner:** Describe a "vibe" and let Gemini draft your technical starting point.
- **Figma Integration:** Export entire systems as Variable-ready JSON or copy live SVG artboards.

## 🚀 Deployment

This project is optimized for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Add your `API_KEY` (Gemini API) in the **Environment Variables** section of the Vercel dashboard.
3. Deploy!

## 🛠️ Technical Stack

- **Framework:** React 19 (No-Build ESM Workflow)
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API (@google/genai)
- **Color Science:** OKLCH interpolation with S-curve lightness shaping

---
*Created by a Senior Design Systems Engineer & Color Science Expert.*