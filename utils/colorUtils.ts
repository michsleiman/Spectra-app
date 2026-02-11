
import { OKLCH } from '../types';

/**
 * Basic OKLCH to RGB/HEX conversion implementation.
 * Note: Professional systems often use complex matrices. This is a robust standard approximation.
 */
export function oklchToHex(oklch: OKLCH): string {
  const { l, c, h } = oklch;
  const hr = (h / 360) * 2 * Math.PI;
  
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const toUint8 = (c: number) => {
    const val = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(val * 255)));
  };

  const r8 = toUint8(r);
  const g8 = toUint8(g);
  const b8 = toUint8(b_);

  return `#${((1 << 24) + (r8 << 16) + (g8 << 8) + b8).toString(16).slice(1).toUpperCase()}`;
}

export function hexToOklch(hex: string): OKLCH {
  // Simple hex to RGB to OKLCH conversion
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  const l_ = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m_ = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s_ = 0.0883024619 * rl + 0.2817188976 * gl + 0.6299787405 * bl;

  const l = Math.pow(l_, 1 / 3);
  const m = Math.pow(m_, 1 / 3);
  const s = Math.pow(s_, 1 / 3);

  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const b_ = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  const C = Math.sqrt(a * a + b_ * b_);
  let H = (Math.atan2(b_, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

export function calculateContrast(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getUsageRecommendation(id: number): string {
  if (id <= 100) return "Subtle backgrounds, borders";
  if (id <= 300) return "Surface coloring, secondary elements";
  if (id <= 500) return "Interaction states, UI components";
  if (id <= 600) return "Primary actions, focus states";
  if (id <= 800) return "Body text, small icons";
  return "Headlines, high-contrast text";
}
