
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
  hueRotation: number; // New: -60 to 60 degrees
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
  baseLightness?: number;
  baseStepId?: number;
  stepCount: number;
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

export interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  systems: ColorSystem[];
}

export interface TypographyStep {
  id: string;
  name: string;
  fontSize: number; // px
  lineHeight: number; // ratio (e.g., 1.5)
  letterSpacing: number; // em (e.g., 0.05)
  fontWeight: number; // 400, 500, etc.
}

export interface FontSystem {
  id: string;
  name: string;
  family: string;
  steps: TypographyStep[];
}

export interface TypographySemanticToken {
  id: string;
  name: string;
  category: string;
  fontSystemId: string;
  stepId: string;
}

export interface TypographySystem {
  fontSystems: FontSystem[];
  baseGrid: number;
  isGridSnapped: boolean;
  baseRem: number;
  scaleFactor: number;
  isScaleSynced: boolean;
  responsiveScale: number; // Factor for mobile scaling (e.g. 0.8)
  isResponsiveEnabled: boolean;
  semantics: TypographySemanticToken[];
}

export interface DimensionStep {
  id: string;
  name: string;
  value: number; // in pixels
}

export interface DimensionSystem {
  id: string;
  name: string;
  baseValue: number; // e.g. 4
  scale: number[]; // e.g. [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64]
  scaleNames: Record<number, string>; // New: Mapping from scale value to display name
  steps: DimensionStep[];
}

export interface RadiusStep {
  id: string;
  name: string;
  value: number; // in pixels
  isFull: boolean;
}

export interface RadiusSystem {
  id: string;
  name: string;
  steps: RadiusStep[];
}

export interface DimensionSemanticToken {
  id: string;
  name: string;
  category: string;
  type: 'spacing' | 'radius';
  value: number | string; // The step multiplier (e.g. 2 for 8px) or the radius step ID
}

export interface DimensionsData {
  spacing: DimensionSystem;
  radius: RadiusSystem;
  semantics: DimensionSemanticToken[];
}
