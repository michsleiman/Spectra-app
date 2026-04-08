
import { OKLCH, ColorStep, ColorSystem } from '../types';
import { oklchToHex, calculateContrast, getUsageRecommendation } from './colorUtils';

/**
 * Stable Perceptual Scale Generator for OKLCH.
 */
export function generateScale(system: ColorSystem): ColorStep[] {
  const getStepIDs = (count: number) => {
    const base = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    if (count <= 11) return base.slice(0, count);
    const ids = [...base];
    for (let i = 11; i < count; i++) {
      ids.push(950 + (i - 10) * 50);
    }
    return ids;
  };

  const stepIDs = getStepIDs(system.stepCount || 11);
  const activeAnchors = system.steps.filter(s => s.isLocked);
  
  // 1. SYSTEM IDENTITY
  const seedHue = system.baseHue;
  const seedChroma = system.baseChroma;
  const { darkness, steepness, punch, hueRotation } = system.controls;

  // 2. CONSTRUCT ANCHOR MAP
  // For the "base" interpolation, we only use the boundary anchors and the system seed.
  // We ignore user-locked steps during the interpolation phase to allow the global system 
  // parameters (Hue, Chroma, etc.) to apply to all unlocked steps uniformly.
  let anchorPoints: Array<{ id: number; oklch: OKLCH }> = [];

  // Boundary Points (The pure white and the calculated black/deep-tone)
  const blackL = 0.05 * (1 - darkness);
  const whiteHue = (seedHue + hueRotation) % 360;
  const blackHue = (seedHue - hueRotation + 360) % 360;

  const whiteAnchor = { id: 0, oklch: { l: 0.998, c: 0.001, h: whiteHue } };
  const blackAnchor = { id: 1000, oklch: { l: blackL, c: 0.005, h: blackHue } };

  anchorPoints.push(whiteAnchor);
  anchorPoints.push(blackAnchor);

  // VIRTUAL MIDPOINT (The Seed)
  const baseStepId = system.baseStepId || 500;
  const baseL = system.baseLightness !== undefined ? system.baseLightness : 0.5;
  
  // Map the baseStepId to its virtualId equivalent so it aligns with the interpolation curve
  const baseStepIdx = stepIDs.indexOf(baseStepId);
  const baseVirtualId = baseStepIdx !== -1 
    ? 50 + (baseStepIdx / (stepIDs.length - 1)) * 900 
    : 500;

  anchorPoints.push({ id: baseVirtualId, oklch: { l: baseL, c: seedChroma, h: seedHue } });

  anchorPoints.sort((a, b) => a.id - b.id);

  // 3. GENERATE SCALE
  return stepIDs.map((id, index) => {
    // If it's locked, return it as-is (refreshing contrast only)
    // This implements the "cannot be changed what so ever" rule.
    const locked = system.steps.find(s => s.id === id && s.isLocked);
    if (locked) return { 
      ...locked, 
      contrastOnWhite: calculateContrast(locked.hex, "#FFFFFF"), 
      contrastOnBlack: calculateContrast(locked.hex, "#000000") 
    };

    // VIRTUAL ID for interpolation: Map the index to the 50-950 range 
    // so the colors always span the full perceptual range regardless of label count.
    const virtualId = stepIDs.length > 1 
      ? 50 + (index / (stepIDs.length - 1)) * 900 
      : 500;

    // Find bounding anchors using virtualId
    let lowerIdx = 0;
    for (let i = 0; i < anchorPoints.length - 1; i++) {
      if (virtualId >= anchorPoints[i].id && virtualId <= anchorPoints[i+1].id) {
        lowerIdx = i;
        break;
      }
    }

    const lower = anchorPoints[lowerIdx];
    const upper = anchorPoints[lowerIdx + 1];
    const t = (virtualId - lower.id) / (upper.id - lower.id);

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
    
    // Apply Chroma Punch using virtualId
    const midWeight = Math.max(0, Math.cos(((virtualId - 500) / 750) * Math.PI / 2));
    c *= (1 + (punch * 0.8 * midWeight));

    // Perceptual Clamping
    const gamutLimiter = Math.sin(l * Math.PI);
    const finalC = c * Math.pow(gamutLimiter, 0.45);

    const finalOklch: OKLCH = { l, c: finalC, h };
    let hex = oklchToHex(finalOklch);

    // USER OVERRIDE: Neutral 50 should be #F6F6F6
    if (system.type === 'neutral' && id === 50) {
      hex = '#F6F6F6';
    }

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
