
export interface OKLCH {
  l: number; // 0 to 1 (Lightness)
  c: number; // 0 to 0.4 (Chroma)
  h: number; // 0 to 360 (Hue)
}

export interface ColorStep {
  id: number; // e.g., 500
  hex: string;
  oklch: OKLCH;
  usage: string;
  isLocked: boolean;
  contrastOnWhite: number;
  contrastOnBlack: number;
}

export type SystemType = 'brand' | 'neutral' | 'success' | 'error' | 'warning' | 'base';

export interface SystemControls {
  punch: number; 
  steepness: number; 
  darkness: number; 
  accessibilitySafe: boolean;
}

export interface ColorSystem {
  id: string;
  name: string;
  type: SystemType;
  steps: ColorStep[];
  description: string;
  controls: SystemControls;
  baseHue: number;    
  baseChroma: number; 
}

export type SemanticCategory = string;

export interface SemanticToken {
  id: string;
  name: string;
  category: SemanticCategory;
  systemType: SystemType;
  lightStep: number | 'white' | 'black';
  darkStep: number | 'white' | 'black';
  hex: string;
  parent?: string;
  stepName?: string;
}

export interface Palette {
  id: string;
  name: string;
  systems: ColorSystem[];
  semantics: SemanticToken[];
  globalSettings: {
    syncCurves: boolean;
    masterControls: SystemControls;
  };
}

export interface AIResponse {
  rationale: string;
  systems: Array<{
    name: string;
    type: SystemType;
    baseHue: number;
    baseChroma: number;
    description: string;
  }>;
}

export type ThemeMode = 'light' | 'dark';
