
import { OKLCH, ColorStep, ColorSystem } from '../types';
import { oklchToHex, calculateContrast, getUsageRecommendation } from './colorUtils';

/**
 * Stable Perceptual Scale Generator for OKLCH.
 */
export function generateScale(system: ColorSystem): ColorStep[] {
  const stepIDs = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const activeAnchors = system.steps.filter(s => s.isLocked);
  
  // 1. SYSTEM IDENTITY
  const seedHue = system.baseHue;
  const seedChroma = system.baseChroma;
  const { darkness, steepness, punch, hueRotation } = system.controls;

  // 2. CONSTRUCT ANCHOR MAP
  let anchorPoints: Array<{ id: number; oklch: OKLCH }> = activeAnchors.map(a => ({
    id: a.id,
    oklch: a.oklch
  }));

  // Boundary Points (The pure white and the calculated black/deep-tone)
  const blackL = 0.05 * (1 - darkness);
  
  // ATMOSPHERIC DRIFT: Hue rotates as it approaches boundaries
  // Note: We use 500 as the pivot point where hue is exactly seedHue
  const whiteHue = (seedHue + hueRotation) % 360;
  const blackHue = (seedHue - hueRotation + 360) % 360;

  const whiteAnchor = { id: 0, oklch: { l: 0.998, c: 0.001, h: whiteHue } };
  const blackAnchor = { id: 1000, oklch: { l: blackL, c: 0.005, h: blackHue } };

  if (!anchorPoints.find(a => a.id === 0)) anchorPoints.push(whiteAnchor);
  if (!anchorPoints.find(a => a.id === 1000)) anchorPoints.push(blackAnchor);

  // VIRTUAL MIDPOINT
  if (!anchorPoints.find(a => a.id === 500)) {
    anchorPoints.push({ id: 500, oklch: { l: 0.5, c: seedChroma, h: seedHue } });
  }

  anchorPoints.sort((a, b) => a.id - b.id);

  // 3. GENERATE SCALE
  return stepIDs.map(id => {
    // If it's locked, return it as-is (refreshing contrast only)
    const locked = system.steps.find(s => s.id === id && s.isLocked);
    if (locked) return { 
      ...locked, 
      contrastOnWhite: calculateContrast(locked.hex, "#FFFFFF"), 
      contrastOnBlack: calculateContrast(locked.hex, "#000000") 
    };

    // Find bounding anchors
    let lowerIdx = 0;
    for (let i = 0; i < anchorPoints.length - 1; i++) {
      if (id >= anchorPoints[i].id && id <= anchorPoints[i+1].id) {
        lowerIdx = i;
        break;
      }
    }

    const lower = anchorPoints[lowerIdx];
    const upper = anchorPoints[lowerIdx + 1];
    const t = (id - lower.id) / (upper.id - lower.id);

    // --- CURVE STEEPNESS (LIGHTNESS BIAS) ---
    const getBiasedT = (rawT: number, s: number) => {
      if (s === 0.5) return rawT;
      const p = Math.pow(2, (s - 0.5) * 4);
      return rawT < 0.5 
        ? Math.pow(2 * rawT, p) / 2 
        : 1 - Math.pow(2 * (1 - rawT), p) / 2;
    };

    const t_lightness = getBiasedT(t, steepness);
    const l = lower.oklch.l + (upper.oklch.l - lower.oklch.l) * t_lightness;

    // Hue: Shortest path circular interpolation
    let h1 = lower.oklch.h;
    let h2 = upper.oklch.h;
    if (Math.abs(h2 - h1) > 180) {
      if (h2 > h1) h1 += 360;
      else h2 += 360;
    }
    const h = (h1 + (h2 - h1) * t) % 360;

    // Chroma: Piecewise linear + optional Punch boost
    let c = lower.oklch.c + (upper.oklch.c - lower.oklch.c) * t;
    
    // Apply Chroma Punch
    const midWeight = Math.max(0, Math.cos(((id - 500) / 750) * Math.PI / 2));
    c *= (1 + (punch * 0.8 * midWeight));

    // Perceptual Clamping
    const gamutLimiter = Math.sin(l * Math.PI);
    const finalC = c * Math.pow(gamutLimiter, 0.45);

    const finalOklch: OKLCH = { l, c: finalC, h };
    const hex = oklchToHex(finalOklch);

    return {
      id,
      hex,
      oklch: finalOklch,
      usage: getUsageRecommendation(id),
      isLocked: false,
      contrastOnWhite: calculateContrast(hex, "#FFFFFF"),
      contrastOnBlack: calculateContrast(hex, "#000000")
    };
  });
}
