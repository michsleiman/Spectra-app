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
  { id: 'text-primary-on-color', name: 'primary-on-color', category: 'Text', systemType: 'base', lightStep: 'white', darkStep: 'white', parent: 'text-primary' },
  { id: 'text-secondary', name: 'secondary', category: 'Text', systemType: 'neutral', lightStep: 700, darkStep: 300 },
  { id: 'text-secondary-hover', name: 'secondary-hover', category: 'Text', systemType: 'neutral', lightStep: 800, darkStep: 200, parent: 'text-secondary' },
  { id: 'text-tertiary', name: 'tertiary', category: 'Text', systemType: 'neutral', lightStep: 600, darkStep: 400 },
  { id: 'text-tertiary-hover', name: 'text-tertiary-hover', category: 'Text', systemType: 'neutral', lightStep: 700, darkStep: 300, parent: 'text-tertiary' },
  { id: 'text-inverse', name: 'inverse', category: 'Text', systemType: 'neutral', lightStep: 950, darkStep: 'white' },
  { id: 'text-white', name: 'white', category: 'Text', systemType: 'base', lightStep: 'white', darkStep: 'white' },
  { id: 'text-disabled', name: 'disabled', category: 'Text', systemType: 'neutral', lightStep: 500, darkStep: 500 },
  { id: 'text-placeholder', name: 'placeholder', category: 'Text', systemType: 'neutral', lightStep: 500, darkStep: 400 },
  { id: 'text-placeholder-subtle', name: 'placeholder-subtle', category: 'Text', systemType: 'neutral', lightStep: 300, darkStep: 700, parent: 'text-placeholder' },
  { id: 'text-brand', name: 'brand', category: 'Text', systemType: 'brand', lightStep: 500, darkStep: 400 },
  { id: 'text-success', name: 'success', category: 'Text', systemType: 'success', lightStep: 600, darkStep: 400 },
  { id: 'text-warning', name: 'warning', category: 'Text', systemType: 'warning', lightStep: 600, darkStep: 400 },
  { id: 'text-error', name: 'error', category: 'Text', systemType: 'error', lightStep: 600, darkStep: 400 },

  // --- BORDER ---
  { id: 'border-primary', name: 'primary', category: 'Border', systemType: 'neutral', lightStep: 300, darkStep: 700 },
  { id: 'border-secondary', name: 'secondary', category: 'Border', systemType: 'neutral', lightStep: 200, darkStep: 800 },
  { id: 'border-tertiary', name: 'tertiary', category: 'Border', systemType: 'neutral', lightStep: 100, darkStep: 800 },
  { id: 'border-solid', name: 'solid', category: 'Border', systemType: 'neutral', lightStep: 900, darkStep: 50 },
  { id: 'border-disabled', name: 'disabled', category: 'Border', systemType: 'neutral', lightStep: 300, darkStep: 700 },
  { id: 'border-brand', name: 'brand', category: 'Border', systemType: 'brand', lightStep: 500, darkStep: 400 },
  { id: 'border-success', name: 'success', category: 'Border', systemType: 'success', lightStep: 500, darkStep: 400 },
  { id: 'border-warning', name: 'warning', category: 'Border', systemType: 'warning', lightStep: 500, darkStep: 400 },
  { id: 'border-error', name: 'error', category: 'Border', systemType: 'error', lightStep: 500, darkStep: 400 },

  // --- FOREGROUND ---
  { id: 'fg-primary', name: 'primary', category: 'Foreground', systemType: 'neutral', lightStep: 900, darkStep: 50 },
  { id: 'fg-secondary', name: 'secondary', category: 'Foreground', systemType: 'neutral', lightStep: 700, darkStep: 300 },
  { id: 'fg-tertiary', name: 'tertiary', category: 'Foreground', systemType: 'neutral', lightStep: 600, darkStep: 400 },
  { id: 'fg-quaternary', name: 'quaternary', category: 'Foreground', systemType: 'neutral', lightStep: 500, darkStep: 500 },
  { id: 'fg-white', name: 'white', category: 'Foreground', systemType: 'base', lightStep: 'white', darkStep: 'white' },
  { id: 'fg-inverse', name: 'inverse', category: 'Foreground', systemType: 'neutral', lightStep: 950, darkStep: 'white' },
  { id: 'fg-inverse-dark', name: 'inverse-alt', category: 'Foreground', systemType: 'neutral', lightStep: 900, darkStep: 900, parent: 'fg-inverse' },
  { id: 'fg-disabled', name: 'disabled', category: 'Foreground', systemType: 'neutral', lightStep: 400, darkStep: 600 },
  { id: 'fg-brand', name: 'brand', category: 'Foreground', systemType: 'brand', lightStep: 500, darkStep: 500 },
  { id: 'fg-success', name: 'success', category: 'Foreground', systemType: 'success', lightStep: 600, darkStep: 400 },
  { id: 'fg-warning', name: 'warning', category: 'Foreground', systemType: 'warning', lightStep: 600, darkStep: 400 },
  { id: 'fg-error', name: 'error', category: 'Foreground', systemType: 'error', lightStep: 600, darkStep: 400 },

  // --- BACKGROUND ---
  { id: 'bg-primary', name: 'primary', category: 'Background', systemType: 'neutral', lightStep: 'white', darkStep: 950 },
  { id: 'bg-primary-alternative', name: 'primary alternative', category: 'Background', systemType: 'neutral', lightStep: 50, darkStep: 900, parent: 'bg-primary' },
  { id: 'bg-primary-hover', name: 'primary hover', category: 'Background', systemType: 'neutral', lightStep: 100, darkStep: 800, parent: 'bg-primary' },
  { id: 'bg-secondary', name: 'secondary', category: 'Background', systemType: 'neutral', lightStep: 50, darkStep: 900 },
  { id: 'bg-secondary-alternative', name: 'secondary alternative', category: 'Background', systemType: 'neutral', lightStep: 'white', darkStep: 950, parent: 'bg-secondary' },
  { id: 'bg-secondary-hover', name: 'secondary hover', category: 'Background', systemType: 'neutral', lightStep: 100, darkStep: 800, parent: 'bg-secondary' },
  { id: 'bg-tertiary', name: 'tertiary', category: 'Background', systemType: 'neutral', lightStep: 100, darkStep: 800 },
  { id: 'bg-quaternary', name: 'quaternary', category: 'Background', systemType: 'neutral', lightStep: 200, darkStep: 700 },
  { id: 'bg-disabled', name: 'disabled', category: 'Background', systemType: 'neutral', lightStep: 100, darkStep: 800 },
  { id: 'bg-brand', name: 'brand', category: 'Background', systemType: 'brand', lightStep: 500, darkStep: 500 },
  { id: 'bg-brand-light', name: 'brand light', category: 'Background', systemType: 'brand', lightStep: 50, darkStep: 900 },
  { id: 'bg-success', name: 'success', category: 'Background', systemType: 'success', lightStep: 600, darkStep: 600 },
  { id: 'bg-success-light', name: 'success light', category: 'Background', systemType: 'success', lightStep: 50, darkStep: 900 },
  { id: 'bg-warning', name: 'warning', category: 'Background', systemType: 'warning', lightStep: 600, darkStep: 600 },
  { id: 'bg-warning-light', name: 'warning light', category: 'Background', systemType: 'warning', lightStep: 50, darkStep: 900 },
  { id: 'bg-error', name: 'error', category: 'Background', systemType: 'error', lightStep: 600, darkStep: 600 },
  { id: 'bg-error-light', name: 'error light', category: 'Background', systemType: 'error', lightStep: 50, darkStep: 900 },
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