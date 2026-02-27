import { ColorSystem, SemanticToken, SemanticCategory, SystemType, ThemeMode } from '../types';

interface SemanticDefinition {
  id: string;
  name: string;
  category: SemanticCategory;
  systemType: SystemType;
  lightStep: number | 'white' | 'black';
  darkStep: number | 'white' | 'black';
  parent?: string;
}

const SEMANTICS: SemanticDefinition[] = [
  // --- TEXT ---
  { id: 'text-primary', name: 'primary', category: 'Text', systemType: 'neutral', lightStep: 900, darkStep: 50 },
  { id: 'text-secondary', name: 'secondary', category: 'Text', systemType: 'neutral', lightStep: 600, darkStep: 300 },
  { id: 'text-tertiary', name: 'tertiary', category: 'Text', systemType: 'neutral', lightStep: 500, darkStep: 500 },
  { id: 'text-disabled', name: 'disabled', category: 'Text', systemType: 'neutral', lightStep: 400, darkStep: 600 },
  { id: 'text-placeholder', name: 'placeholder', category: 'Text', systemType: 'neutral', lightStep: 500, darkStep: 400 },
  { id: 'text-on-brand', name: 'on-brand', category: 'Text', systemType: 'base', lightStep: 'white', darkStep: 'white' },
  { id: 'text-inverse', name: 'inverse', category: 'Text', systemType: 'neutral', lightStep: 950, darkStep: 'white' },
  { id: 'text-brand', name: 'brand', category: 'Text', systemType: 'brand', lightStep: 600, darkStep: 400 },
  { id: 'text-success', name: 'success', category: 'Text', systemType: 'success', lightStep: 600, darkStep: 400 },
  { id: 'text-warning', name: 'warning', category: 'Text', systemType: 'warning', lightStep: 600, darkStep: 400 },
  { id: 'text-error', name: 'error', category: 'Text', systemType: 'error', lightStep: 600, darkStep: 400 },

  // --- BACKGROUND ---
  { id: 'bg-primary', name: 'primary', category: 'Background', systemType: 'neutral', lightStep: 'white', darkStep: 950 },
  { id: 'bg-secondary', name: 'secondary', category: 'Background', systemType: 'neutral', lightStep: 50, darkStep: 900 },
  { id: 'bg-tertiary', name: 'tertiary', category: 'Background', systemType: 'neutral', lightStep: 'white', darkStep: 800 },
  { id: 'bg-brand', name: 'brand', category: 'Background', systemType: 'brand', lightStep: 500, darkStep: 500 },
  { id: 'bg-brand-hover', name: 'brand-hover', category: 'Background', systemType: 'brand', lightStep: 600, darkStep: 400 },
  { id: 'bg-brand-subtle', name: 'brand-subtle', category: 'Background', systemType: 'brand', lightStep: 50, darkStep: 800 },
  { id: 'bg-success', name: 'success', category: 'Background', systemType: 'success', lightStep: 500, darkStep: 500 },
  { id: 'bg-success-subtle', name: 'success-subtle', category: 'Background', systemType: 'success', lightStep: 50, darkStep: 800 },
  { id: 'bg-warning', name: 'warning', category: 'Background', systemType: 'warning', lightStep: 500, darkStep: 500 },
  { id: 'bg-warning-subtle', name: 'warning-subtle', category: 'Background', systemType: 'warning', lightStep: 50, darkStep: 800 },
  { id: 'bg-error', name: 'error', category: 'Background', systemType: 'error', lightStep: 500, darkStep: 500 },
  { id: 'bg-error-subtle', name: 'error-subtle', category: 'Background', systemType: 'error', lightStep: 50, darkStep: 800 },
  { id: 'bg-selection', name: 'selection', category: 'Background', systemType: 'brand', lightStep: 100, darkStep: 800 },

  // --- BORDER ---
  { id: 'border-primary', name: 'primary', category: 'Border', systemType: 'neutral', lightStep: 400, darkStep: 600 },
  { id: 'border-secondary', name: 'secondary', category: 'Border', systemType: 'neutral', lightStep: 200, darkStep: 800 },
  { id: 'border-subtle', name: 'subtle', category: 'Border', systemType: 'neutral', lightStep: 100, darkStep: 900 },
  { id: 'border-disabled', name: 'disabled', category: 'Border', systemType: 'neutral', lightStep: 300, darkStep: 700 },
  { id: 'border-interactive', name: 'interactive', category: 'Border', systemType: 'neutral', lightStep: 600, darkStep: 400 },
  { id: 'border-brand', name: 'brand', category: 'Border', systemType: 'brand', lightStep: 500, darkStep: 400 },
  { id: 'border-success', name: 'success', category: 'Border', systemType: 'success', lightStep: 500, darkStep: 400 },
  { id: 'border-warning', name: 'warning', category: 'Border', systemType: 'warning', lightStep: 500, darkStep: 400 },
  { id: 'border-error', name: 'error', category: 'Border', systemType: 'error', lightStep: 500, darkStep: 400 },

  // --- FOREGROUND ---
  { id: 'foreground-primary', name: 'primary', category: 'Foreground', systemType: 'neutral', lightStep: 900, darkStep: 50 },
  { id: 'foreground-secondary', name: 'secondary', category: 'Foreground', systemType: 'neutral', lightStep: 500, darkStep: 400 },
  { id: 'foreground-tertiary', name: 'tertiary', category: 'Foreground', systemType: 'neutral', lightStep: 600, darkStep: 400 },
  { id: 'foreground-quaternary', name: 'quaternary', category: 'Foreground', systemType: 'neutral', lightStep: 500, darkStep: 500 },
  { id: 'foreground-disabled', name: 'disabled', category: 'Foreground', systemType: 'neutral', lightStep: 400, darkStep: 600 },
  { id: 'foreground-on-brand', name: 'on-brand', category: 'Foreground', systemType: 'base', lightStep: 'white', darkStep: 'white' },
  { id: 'foreground-brand', name: 'brand', category: 'Foreground', systemType: 'brand', lightStep: 500, darkStep: 400 },
  { id: 'foreground-success', name: 'success', category: 'Foreground', systemType: 'success', lightStep: 500, darkStep: 400 },
  { id: 'foreground-warning', name: 'warning', category: 'Foreground', systemType: 'warning', lightStep: 500, darkStep: 400 },
  { id: 'foreground-error', name: 'error', category: 'Foreground', systemType: 'error', lightStep: 500, darkStep: 400 },

  // --- SPECIALIZED ---
  { id: 'viz-1', name: 'viz-1', category: 'Specialized', systemType: 'brand', lightStep: 500, darkStep: 400 },
  { id: 'viz-2', name: 'viz-2', category: 'Specialized', systemType: 'neutral', lightStep: 400, darkStep: 500 },
  { id: 'viz-3', name: 'viz-3', category: 'Specialized', systemType: 'success', lightStep: 500, darkStep: 400 },
  { id: 'viz-grid', name: 'viz-grid', category: 'Specialized', systemType: 'neutral', lightStep: 100, darkStep: 800 },
  { id: 'skeleton-base', name: 'skeleton-base', category: 'Specialized', systemType: 'neutral', lightStep: 100, darkStep: 800 },
  { id: 'skeleton-shimmer', name: 'skeleton-shimmer', category: 'Specialized', systemType: 'neutral', lightStep: 50, darkStep: 700 },
  { id: 'focus-ring', name: 'focus-ring', category: 'Specialized', systemType: 'brand', lightStep: 500, darkStep: 400 },
  { id: 'shadow-color', name: 'shadow-color', category: 'Specialized', systemType: 'neutral', lightStep: 950, darkStep: 'black' },
  { id: 'bg-overlay', name: 'bg-overlay', category: 'Specialized', systemType: 'neutral', lightStep: 950, darkStep: 950 },
];

function getStepLabel(type: SystemType, step: number | 'white' | 'black'): string {
  // CRITICAL: If the step is a constant, we ALWAYS force the label to be from the 'base' system.
  if (step === 'white') return 'base-W';
  if (step === 'black') return 'base-B';
  const prefix = type === 'neutral' ? 'gray' : type;
  return `${prefix}-${step}`;
}

function getHexForStep(systems: ColorSystem[], type: SystemType, step: number | 'white' | 'black'): string {
  if (step === 'white') return '#FFFFFF';
  if (step === 'black') return '#000000';
  
  const sys = systems.find(s => s.type === type);
  if (!sys) {
      if (type === 'base' && step === 0) return '#FFFFFF';
      if (type === 'base' && step === 1000) return '#000000';
      return '#888888';
  }
  
  const colorStep = sys.steps.find(s => s.id === step);
  return colorStep ? colorStep.hex : '#888888';
}

export function generateInitialSemantics(systems: ColorSystem[], theme: ThemeMode = 'light'): SemanticToken[] {
  return SEMANTICS.map(def => ({
    ...def,
    hex: getHexForStep(systems, def.systemType, theme === 'light' ? def.lightStep : def.darkStep),
    stepName: getStepLabel(def.systemType, theme === 'light' ? def.lightStep : def.darkStep)
  }));
}

export function refreshSemantics(systems: ColorSystem[], current: SemanticToken[], theme: ThemeMode = 'light'): SemanticToken[] {
  return current.map(token => {
    const step = theme === 'light' ? token.lightStep : token.darkStep;
    return {
      ...token,
      hex: getHexForStep(systems, token.systemType, step),
      stepName: getStepLabel(token.systemType, step)
    };
  });
}