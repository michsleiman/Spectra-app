import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Settings2, 
  X, 
  Grid3X3, 
  Layers, 
  LayoutGrid, 
  Ruler, 
  ArrowLeft,
  Maximize2,
  Trash2,
  Check,
  ChevronDown,
  Info,
  ChevronRight,
  User,
  Lock,
  Eye,
  Settings,
  Shield,
  FileText,
  HelpCircle,
  Inbox
} from 'lucide-react';
import { 
  DimensionsData, 
  DimensionSemanticToken,
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';

export const DEFAULT_DIMENSIONS: DimensionsData = {
  spacing: {
    id: 'spacing-default',
    name: 'Spacing System',
    baseValue: 4,
    scale: [0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 60, 80, 120, 160, 192, 240, 256, 300, 320, 360, 400, 480],
    scaleNames: {
      0: '0', 0.5: '0.5', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 8: '8', 10: '10', 
      12: '12', 16: '16', 20: '20', 24: '24', 32: '32', 40: '40', 60: '60', 80: '80', 
      120: '120', 160: '160', 192: '192', 240: '240', 256: '256', 300: '300', 320: '320', 
      360: '360', 400: '400', 480: '480'
    },
    steps: []
  },
  radius: {
    id: 'radius-default',
    name: 'Radius System',
    steps: []
  },
  semantics: [
    // Spacing (Multiplier is based on 4px base value)
    { id: 'sp-0', name: 'spacing-0', value: 0, category: 'Spacing', type: 'spacing' },
    { id: 'sp-2xs', name: 'spacing-2xs', value: 0.5, category: 'Spacing', type: 'spacing' },
    { id: 'sp-xs', name: 'spacing-xs', value: 1, category: 'Spacing', type: 'spacing' },
    { id: 'sp-sm', name: 'spacing-sm', value: 2, category: 'Spacing', type: 'spacing' },
    { id: 'sp-md', name: 'spacing-md', value: 3, category: 'Spacing', type: 'spacing' },
    { id: 'sp-lg', name: 'spacing-lg', value: 4, category: 'Spacing', type: 'spacing' },
    { id: 'sp-xl', name: 'spacing-xl', value: 6, category: 'Spacing', type: 'spacing' },
    { id: 'sp-2xl', name: 'spacing-2xl', value: 8, category: 'Spacing', type: 'spacing' },
    { id: 'sp-3xl', name: 'spacing-3xl', value: 10, category: 'Spacing', type: 'spacing' },
    { id: 'sp-4xl', name: 'spacing-4xl', value: 12, category: 'Spacing', type: 'spacing' },
    { id: 'sp-5xl', name: 'spacing-5xl', value: 16, category: 'Spacing', type: 'spacing' },
    { id: 'sp-6xl', name: 'spacing-6xl', value: 20, category: 'Spacing', type: 'spacing' },
    { id: 'sp-7xl', name: 'spacing-7xl', value: 24, category: 'Spacing', type: 'spacing' },
    { id: 'sp-8xl', name: 'spacing-8xl', value: 32, category: 'Spacing', type: 'spacing' },

    // Radius (Multiplier is based on 4px base value, or specific Full check)
    { id: 'r-none', name: 'radius-none', value: 0, category: 'Radius', type: 'radius' },
    { id: 'r-xs', name: 'radius-xs', value: 0.5, category: 'Radius', type: 'radius' },
    { id: 'r-sm', name: 'radius-sm', value: 1, category: 'Radius', type: 'radius' },
    { id: 'r-md', name: 'radius-md', value: 2, category: 'Radius', type: 'radius' },
    { id: 'r-lg', name: 'radius-lg', value: 3, category: 'Radius', type: 'radius' },
    { id: 'r-xl', name: 'radius-xl', value: 4, category: 'Radius', type: 'radius' },
    { id: 'r-2xl', name: 'radius-2xl', value: 6, category: 'Radius', type: 'radius' },
    { id: 'r-3xl', name: 'radius-3xl', value: 8, category: 'Radius', type: 'radius' },
    { id: 'r-full', name: 'radius-full', value: 9999, category: 'Radius', type: 'radius' },

    // Component Size List
    { id: 'sz-2xs', name: 'size-2xs', value: 3, category: 'Component Size', type: 'spacing' },
    { id: 'sz-xs', name: 'size-xs', value: 4, category: 'Component Size', type: 'spacing' },
    { id: 'sz-sm', name: 'size-sm', value: 5, category: 'Component Size', type: 'spacing' },
    { id: 'sz-md', name: 'size-md', value: 6, category: 'Component Size', type: 'spacing' },
    { id: 'sz-lg', name: 'size-lg', value: 8, category: 'Component Size', type: 'spacing' },
    { id: 'sz-xl', name: 'size-xl', value: 10, category: 'Component Size', type: 'spacing' },
    { id: 'sz-2xl', name: 'size-2xl', value: 12, category: 'Component Size', type: 'spacing' },
    { id: 'sz-3xl', name: 'size-3xl', value: 16, category: 'Component Size', type: 'spacing' },
    { id: 'sz-4xl', name: 'size-4xl', value: 24, category: 'Component Size', type: 'spacing' },
    { id: 'sz-5xl', name: 'size-5xl', value: 32, category: 'Component Size', type: 'spacing' },

    // Surface Size List
    { id: 'sf-xs', name: 'surface-xs', value: 40, category: 'Surface Size', type: 'spacing' },
    { id: 'sf-sm', name: 'surface-sm', value: 60, category: 'Surface Size', type: 'spacing' },
    { id: 'sf-md', name: 'surface-md', value: 80, category: 'Surface Size', type: 'spacing' },
    { id: 'sf-lg', name: 'surface-lg', value: 120, category: 'Surface Size', type: 'spacing' },
    { id: 'sf-xl', name: 'surface-xl', value: 160, category: 'Surface Size', type: 'spacing' },
    { id: 'sf-2xl', name: 'surface-2xl', value: 192, category: 'Surface Size', type: 'spacing' },
    { id: 'sf-3xl', name: 'surface-3xl', value: 240, category: 'Surface Size', type: 'spacing' },
    { id: 'sf-4xl', name: 'surface-4xl', value: 300, category: 'Surface Size', type: 'spacing' },

    // Layout Size List
    { id: 'ly-xs', name: 'layout-xs', value: 120, category: 'Layout Size', type: 'spacing' },
    { id: 'ly-sm', name: 'layout-sm', value: 160, category: 'Layout Size', type: 'spacing' },
    { id: 'ly-md', name: 'layout-md', value: 192, category: 'Layout Size', type: 'spacing' },
    { id: 'ly-lg', name: 'layout-lg', value: 256, category: 'Layout Size', type: 'spacing' },
    { id: 'ly-xl', name: 'layout-xl', value: 320, category: 'Layout Size', type: 'spacing' },
    { id: 'ly-2xl', name: 'layout-2xl', value: 360, category: 'Layout Size', type: 'spacing' },
    { id: 'ly-3xl', name: 'layout-3xl', value: 400, category: 'Layout Size', type: 'spacing' },
    { id: 'ly-4xl', name: 'layout-4xl', value: 480, category: 'Layout Size', type: 'spacing' }
  ]
};

interface DimensionsToolProps {
  system: DimensionsData;
  setSystem: React.Dispatch<React.SetStateAction<DimensionsData>>;
  onBack: () => void;
  palette?: any;
  typographySystem?: any;
}

type PlaygroundScene = 'signin' | 'settings' | 'cards' | 'empty';

export const DimensionsTool: React.FC<DimensionsToolProps> = ({ system, setSystem, onBack }) => {
  const [viewMode, setViewMode] = useState<'scales' | 'live'>('scales');
  const [selectedRailCategory, setSelectedRailCategory] = useState<'Spacing' | 'Radius' | 'Size'>('Spacing');
  const [showUseCases, setShowUseCases] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showGuides, setShowGuides] = useState(true);

  // Modal & form editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSemantic, setEditingSemantic] = useState<DimensionSemanticToken | null>(null);
  const [editingValue, setEditingValue] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempSemanticName, setTempSemanticName] = useState('');
  const [errorStatus, setErrorStatus] = useState<{ name?: string, size?: string } | null>(null);

  // Deletion locks
  const [scaleToDelete, setScaleToDelete] = useState<number | null>(null);
  const [semanticToDelete, setSemanticToDelete] = useState<string | null>(null);

  // New playground architecture
  const [activeScene, setActiveScene] = useState<PlaygroundScene>('signin');
  const [hoveredBindingKey, setHoveredBindingKey] = useState<string | null>(null);
  const [activePropertyDropdown, setActivePropertyDropdown] = useState<string | null>(null);

  // Standard interactive bindings
  const [playgroundBindings, setPlaygroundBindings] = useState<Record<string, string>>({
    // Padding variables
    cardPadding: 'sp-xl',
    buttonPaddingX: 'sp-lg',
    buttonPaddingY: 'sp-sm',
    inputPaddingX: 'sp-md',
    inputPaddingY: 'sp-xs',

    // Gap variables
    cardGap: 'sp-xl',
    formLabelGap: 'sp-xs',
    stackGap: 'sp-md',

    // Radius variables
    cardRadius: 'r-2xl',
    buttonRadius: 'r-md',
    inputRadius: 'r-sm'
  });

  const getPxValue = (tokenId: string): number => {
    const token = system.semantics.find(s => s.id === tokenId);
    if (!token) return 0;
    if (token.type === 'radius' && (token.value === 999 || token.value === 9999)) return 9999;
    return (token.value as number) * system.spacing.baseValue;
  };

  const getTokenPxValue = (token: any): number => {
    if (!token) return 0;
    if (token.type === 'radius' && (token.value === 999 || token.value === 9999)) return 9999;
    return (token.value as number) * system.spacing.baseValue;
  };

  // Click outside listener for binding selectors
  useEffect(() => {
    const clickOutside = () => setActivePropertyDropdown(null);
    window.addEventListener('click', clickOutside);
    return () => window.removeEventListener('click', clickOutside);
  }, []);

  const handleEditScale = (val: number) => {
    setEditingValue(val);
    setTempValue(val.toString());
    setTempName(system.spacing.scaleNames?.[val] || val.toString());
    setActiveCategory(null);
    setEditingSemantic(null);
    setIsModalOpen(true);
  };

  const handleDeleteScale = (val: number) => {
    setScaleToDelete(val);
  };

  const confirmDeleteScale = () => {
    if (scaleToDelete !== null) {
      setSystem(prev => ({
        ...prev,
        spacing: {
          ...prev.spacing,
          scale: prev.spacing.scale.filter(v => v !== scaleToDelete),
          scaleNames: prev.spacing.scaleNames ? Object.fromEntries(
            Object.entries(prev.spacing.scaleNames).filter(([k]) => Number(k) !== scaleToDelete)
          ) : {}
        }
      }));
      setScaleToDelete(null);
    }
  };

  const handleAddScale = () => {
    setEditingValue(null);
    setTempValue('');
    setTempName('');
    setActiveCategory(null);
    setEditingSemantic(null);
    setIsModalOpen(true);
  };

  const handleEditSemantic = (token: DimensionSemanticToken) => {
    setEditingSemantic(token);
    setActiveCategory(token.category);
    setTempSemanticName(token.name);
    setTempValue(token.value.toString());
    setIsModalOpen(true);
  };

  const handleDeleteSemantic = (id: string) => {
    setSemanticToDelete(id);
  };

  const confirmDeleteSemantic = () => {
    if (semanticToDelete) {
      setSystem(prev => ({
        ...prev,
        semantics: prev.semantics.filter(s => s.id !== semanticToDelete)
      }));
      setSemanticToDelete(null);
    }
  };

  const handleAddSemantic = (category: string) => {
    setEditingSemantic(null);
    setActiveCategory(category);
    setTempSemanticName('');
    setTempValue(system.spacing.scale[3].toString()); 
    setIsModalOpen(true);
  };

  const handleSaveScaleOrToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    const val = parseFloat(tempValue);
    if (isNaN(val)) return;

    if (activeCategory) {
      const nameExists = system.semantics.some(s => s.name.toLowerCase() === tempSemanticName.toLowerCase() && s.id !== editingSemantic?.id);
      if (nameExists) {
        setErrorStatus({ name: 'This token name already exists' });
        return;
      }

      if (editingSemantic) {
        setSystem(prev => ({
          ...prev,
          semantics: prev.semantics.map(s => s.id === editingSemantic.id ? {
            ...s,
            name: tempSemanticName,
            value: val,
            type: activeCategory === 'Radius' ? 'radius' : 'spacing'
          } as DimensionSemanticToken : s)
        }));
      } else {
        const newSemantic: DimensionSemanticToken = {
          id: `sem-${Date.now()}`,
          name: tempSemanticName,
          value: val,
          category: activeCategory,
          type: activeCategory === 'Radius' ? 'radius' : 'spacing',
          isCustom: true
        };
        setSystem(prev => ({
          ...prev,
          semantics: [...prev.semantics, newSemantic]
        }));
      }
    } else {
      const sizeExists = system.spacing.scale.some(s => s === val && s !== editingValue);
      if (sizeExists) {
        setErrorStatus({ size: 'This multiplier factor already exists' });
        return;
      }

      setSystem(prev => {
        const newScale = [...prev.spacing.scale];
        if (editingValue !== null) {
          const idx = newScale.indexOf(editingValue);
          newScale[idx] = val;
        } else {
          newScale.push(val);
        }
        return {
          ...prev,
          spacing: {
            ...prev.spacing,
            scale: newScale.sort((a, b) => a - b),
            scaleNames: {
              ...(prev.spacing.scaleNames || {}),
              [val]: tempName || val.toString()
            }
          }
        };
      });
    }

    setIsModalOpen(false);
    setEditingValue(null);
    setEditingSemantic(null);
    setActiveCategory(null);
    setErrorStatus(null);
  };

  const DIM_DESCRIPTIONS: Record<string, string> = {
    // Spacing
    'spacing-0': 'Reset spacing',
    'spacing-2xs': 'Focus offsets · Badge nudges',
    'spacing-xs': 'Icon gap · Tight padding',
    'spacing-sm': 'Button padding · Label gap',
    'spacing-md': 'Compact stacks · Dense cards',
    'spacing-lg': 'Default component spacing',
    'spacing-xl': 'Card padding · Form groups',
    'spacing-2xl': 'Modal padding · Section spacing',
    'spacing-3xl': 'Dashboard groups · Content blocks',
    'spacing-4xl': 'Major section spacing',
    'spacing-5xl': 'Layout regions',
    'spacing-6xl': 'Hero content spacing',
    'spacing-7xl': 'Large marketing sections',
    'spacing-8xl': 'Hero padding · Landing page bands',

    // Radius
    'radius-none': 'Square layouts · Tables · Data-heavy UI',
    'radius-xs': 'Badges · Compact indicators · Utility elements',
    'radius-sm': 'Buttons · Inputs · Chips · Dropdowns',
    'radius-md': 'Cards · Surface containers · Menus',
    'radius-lg': 'Elevated cards · Toasts · Side sheets',
    'radius-xl': 'Dialogs · Modals · Feature surfaces',
    'radius-2xl': 'Marketing cards · Onboarding experiences',
    'radius-3xl': 'Hero panels · Promotional content',
    'radius-full': 'Pills · Avatars · Circular buttons',

    // Component size
    'size-2xs': 'Status dots · Tiny indicators · Inline glyphs',
    'size-xs': 'Small icons · Utility actions',
    'size-sm': 'Menu icons · Dense controls',
    'size-md': 'Default icon size · Compact avatars',
    'size-lg': 'Large icons · Small avatars · Dense buttons',
    'size-xl': 'Default buttons · Inputs · Standard avatars',
    'size-2xl': 'Touch targets · Mobile controls · Hero buttons',
    'size-3xl': 'Large avatars · FABs · Promotional CTAs',
    'size-4xl': 'Profile avatars · Feature illustrations',
    'size-5xl': 'Empty-state graphics · Marketing highlights',

    // Surface size
    'surface-xs': 'Statistic cards · Mini widgets',
    'surface-sm': 'Compact cards · Metrics',
    'surface-md': 'Mobile drawer width',
    'surface-lg': 'Forms · Auth cards',
    'surface-xl': 'Standard modal width',
    'surface-2xl': 'Large dialogs · Detail panels',
    'surface-3xl': 'Side sheets · Dashboard panels',
    'surface-4xl': 'Large workspaces',

    // Layout size
    'layout-xs': 'Narrow reading column',
    'layout-sm': 'Documentation content',
    'layout-md': 'Tablet content area',
    'layout-lg': 'Standard application width',
    'layout-xl': 'Dashboard container',
    'layout-2xl': 'Wide desktop layout',
    'layout-3xl': 'Analytics workspace',
    'layout-4xl': 'Full HD workspace'
  };

  const getTokenHints = (token: DimensionSemanticToken, pxVal: number): string[] => {
    if (DIM_DESCRIPTIONS[token.name]) {
      return [DIM_DESCRIPTIONS[token.name]];
    }
    if (token.type === 'radius') {
      if (pxVal === 0) return ['Strict layouts, hard border structures'];
      if (pxVal <= 4) return ['Tags or tiny badges'];
      if (pxVal <= 12) return ['Standard desktop form buttons'];
      if (pxVal <= 32) return ['Panel wrappers'];
      return ['Floating status pills'];
    } else {
      if (pxVal <= 8) return ['Inline icon spacer'];
      if (pxVal <= 20) return ['Common list block gaps'];
      if (pxVal <= 48) return ['Primary page grid grids'];
      return ['Broad screen gutters'];
    }
  };

  const filteredTokens = useMemo(() => {
    return system.semantics.filter(tok => {
      if (selectedRailCategory === 'Radius') {
        return tok.type === 'radius';
      } else if (selectedRailCategory === 'Spacing') {
        return tok.type === 'spacing' && tok.category === 'Spacing';
      } else {
        return tok.type === 'spacing' && (tok.category === 'Component Size' || tok.category === 'Surface Size' || tok.category === 'Layout Size');
      }
    });
  }, [system.semantics, selectedRailCategory]);

  const bindingsGrouped = [
    {
      group: 'Paddings',
      items: [
        { key: 'cardPadding', label: 'Card Gutter Padding', type: 'spacing' },
        { key: 'buttonPaddingX', label: 'Button Horizontal', type: 'spacing' },
        { key: 'buttonPaddingY', label: 'Button Vertical', type: 'spacing' },
        { key: 'inputPaddingX', label: 'Input Horizontal', type: 'spacing' },
        { key: 'inputPaddingY', label: 'Input Vertical', type: 'spacing' },
      ]
    },
    {
      group: 'Component Gaps',
      items: [
        { key: 'cardGap', label: 'Card Elements Gap', type: 'spacing' },
        { key: 'formLabelGap', label: 'Label to Element Gap', type: 'spacing' },
        { key: 'stackGap', label: 'Stack Layout Gap', type: 'spacing' },
      ]
    },
    {
      group: 'Corner Curves',
      items: [
        { key: 'cardRadius', label: 'Card Corner Smooth', type: 'radius' },
        { key: 'buttonRadius', label: 'Button Rounded Radius', type: 'radius' },
        { key: 'inputRadius', label: 'Input Boundary Radius', type: 'radius' },
      ]
    }
  ];

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar matching standard systems perfectly */}
      <aside className="w-80 h-full border-r border-zinc-800 bg-zinc-950 flex flex-col z-30 shrink-0">
        
        {/* BRANDING SECTION */}
        <div className="px-4 py-5 border-b border-zinc-900 flex flex-col items-center relative shrink-0">
          <div className="w-full flex justify-center px-4">
              <svg width="180" height="45" viewBox="0 0 600 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px] h-auto overflow-visible">
                  <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor: '#FF4D4D', stopOpacity: 1}} /> 
                          <stop offset="100%" style={{stopColor: '#FF9E2C', stopOpacity: 1}} /> 
                      </linearGradient>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor: '#00C853', stopOpacity: 1}} /> 
                          <stop offset="100%" style={{stopColor: '#0091EA', stopOpacity: 1}} /> 
                      </linearGradient>
                      <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor: '#6200EA', stopOpacity: 1}} /> 
                          <stop offset="100%" style={{stopColor: '#AA00FF', stopOpacity: 1}} /> 
                      </linearGradient>
                      <style>
                          {`.logo-text { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 64px; letter-spacing: -1px; fill: #FFFFFF; }`}
                      </style>
                  </defs>
                  <g transform="translate(20, 25) scale(0.8)">
                      <path d="M10,40 C30,10 90,10 110,40 C130,70 10,70 30,40 Z" fill="url(#grad1)" opacity="0.85" style={{mixBlendMode: 'screen'}} />
                      <path d="M40,60 C60,30 120,30 140,60 C160,90 40,90 60,60 Z" fill="url(#grad2)" opacity="0.85" style={{mixBlendMode: 'screen'}}/>
                      <path d="M25,80 C45,50 105,50 125,80 C145,110 25,110 45,80 Z" fill="url(#grad3)" opacity="0.85" style={{mixBlendMode: 'screen'}}/>
                  </g>
                  <text x="180" y="94" className="logo-text">SPECTRA</text>
              </svg>
          </div>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em] leading-tight mt-1 text-center font-sans">Design Systems, Solved</p>
        </div>

        {/* Dynamic Inner Sidebar parameters depending on Modes */}
        <div className="flex-grow overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
          
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 px-1">
            {viewMode === 'scales' ? 'Dimensions System' : 'Semantic Mapping'}
          </h2>

          {viewMode === 'scales' ? (
            <>
              {/* Category Selector inside Sidebar */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 px-1">Category Selector</label>
                <div className="flex flex-col gap-1 p-1 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                  <button
                    onClick={() => setSelectedRailCategory('Spacing')}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center gap-2.5 h-11 ${
                      selectedRailCategory === 'Spacing' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Spacing
                  </button>
                  <button
                    onClick={() => setSelectedRailCategory('Radius')}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center gap-2.5 h-11 ${
                      selectedRailCategory === 'Radius' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    Radius
                  </button>
                  <button
                    onClick={() => setSelectedRailCategory('Size')}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center gap-2.5 h-11 ${
                      selectedRailCategory === 'Size' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Size
                  </button>
                </div>
              </div>

              {/* Base Rem / Size Controller (highly relevant for spacing) */}
              {selectedRailCategory === 'Spacing' && (
                <div className="space-y-2 text-left pt-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase">Base Spacing Unit</span>
                    <span className="text-[11px] font-mono text-indigo-400 font-bold">{system.spacing.baseValue}px</span>
                  </div>
                  <div className="flex items-center bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-inner h-9 justify-between px-2 mt-1">
                    <button 
                      type="button"
                      onClick={() => setSystem(prev => ({ ...prev, spacing: { ...prev.spacing, baseValue: Math.max(1, prev.spacing.baseValue - 1) } }))}
                      className="w-8 h-8 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-sm font-bold inline-flex items-center justify-center animate-none"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-black text-indigo-400">{system.spacing.baseValue}px</span>
                    <button 
                      type="button"
                      onClick={() => setSystem(prev => ({ ...prev, spacing: { ...prev.spacing, baseValue: prev.spacing.baseValue + 1 } }))}
                      className="w-8 h-8 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-sm font-bold inline-flex items-center justify-center animate-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {selectedRailCategory === 'Radius' && (
                <div className="p-4 bg-zinc-900/35 border border-zinc-800 rounded-2xl flex flex-col text-left space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Radius Specs</span>
                  <p className="text-[10.5px] leading-relaxed text-zinc-500 uppercase font-semibold">
                    Controls border corner rounding and pill shapes throughout interface templates.
                  </p>
                </div>
              )}

              {selectedRailCategory === 'Size' && (
                <div className="p-4 bg-zinc-900/35 border border-zinc-800 rounded-2xl flex flex-col text-left space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Size Bounds</span>
                  <p className="text-[10.5px] leading-relaxed text-zinc-500 uppercase font-semibold">
                    Governs content container limits, panel gaps, and active viewport dimensions.
                  </p>
                </div>
              )}

              {/* Use-cases Hints */}
              <div className="flex items-center justify-between py-2 border-t border-b border-zinc-900/50">
                <div className="flex flex-col text-left">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Use-case Hints</label>
                  <span className="text-[9px] text-zinc-500">Show suggested layout use cases</span>
                </div>
                <button 
                  onClick={() => setShowUseCases(!showUseCases)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${showUseCases ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                >
                  <motion.div 
                    animate={{ x: showUseCases ? 20 : 2 }}
                    className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Collapsed power matrix Multiplier parameter editor */}
              <div className="flex flex-col text-left pt-2">
                <button 
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase group hover:text-white transition-colors"
                >
                  <span>Advanced Multipliers</span>
                  <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isAdvancedOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4 pt-4"
                    >
                      <p className="text-[9.5px] text-zinc-500 leading-normal uppercase font-semibold">
                        Scale multipliers multiply against base size. Customize them to fit non-linear typography or system metrics.
                      </p>

                      <div className="flex justify-between items-center bg-zinc-900/30 p-2.5 border border-zinc-800 rounded-xl">
                        <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest">Multipliers</span>
                        <button 
                          onClick={handleAddScale}
                          className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-all flex items-center gap-1 text-indigo-400"
                        >
                          <Plus className="w-3 h-3" /> Add Factor
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {system.spacing.scale.map(scale => (
                          <div 
                            key={scale}
                            className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-between font-mono hover:border-zinc-800 transition-all text-xs"
                          >
                            <span className="text-white font-bold">{scale}x</span>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleEditScale(scale)}
                                className="p-1 hover:bg-zinc-900 w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white"
                              >
                                <Settings2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleDeleteScale(scale)}
                                className="p-1 hover:bg-zinc-900 w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            // Live Preview Sidebar logic
            <>
              {/* Show Guides toggle option */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900/50">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Show Guides</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Render active vectors in canvas</span>
                </div>
                <button 
                  onClick={() => setShowGuides(!showGuides)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${showGuides ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                >
                  <motion.div 
                    animate={{ x: showGuides ? 20 : 2 }}
                    className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Grouped Bindings List Selector */}
              <div className="space-y-5 text-left pt-2">
                {bindingsGrouped.map(group => (
                  <div key={group.group} className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-900">
                      <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider">{group.group}</span>
                      <span className="text-[8px] font-mono text-zinc-650 font-bold">{group.items.length} Props</span>
                    </div>

                    <div className="space-y-3.5">
                      {group.items.map(item => {
                        const activeTokenId = playgroundBindings[item.key];
                        const boundToken = system.semantics.find(s => s.id === activeTokenId);
                        const displayLabel = boundToken ? `${boundToken.name} (${getTokenPxValue(boundToken)}px)` : 'Unbound';
                        const isHoveredInInterface = hoveredBindingKey === item.key;

                        return (
                          <div 
                            key={item.key} 
                            className="space-y-1 relative text-left"
                            onMouseEnter={() => setHoveredBindingKey(item.key)}
                            onMouseLeave={() => setHoveredBindingKey(null)}
                          >
                            <label className={`text-[8.5px] font-black uppercase tracking-widest block transition-colors ${
                              isHoveredInInterface ? 'text-indigo-400' : 'text-zinc-500'
                            }`}>
                              {item.label}
                            </label>

                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePropertyDropdown(activePropertyDropdown === item.key ? null : item.key);
                              }}
                              className={`w-full bg-zinc-900/65 hover:bg-zinc-800 border rounded-xl px-3 py-2 text-[10.5px] font-mono font-semibold text-zinc-200 cursor-pointer flex items-center justify-between group transition-all ${
                                isHoveredInInterface ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_12px_rgba(99,102,241,0.15)]' : 'border-zinc-800'
                              }`}
                            >
                              <span className="text-zinc-100 font-bold truncate max-w-[170px]">{displayLabel}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-650 group-hover:text-indigo-400 transition-colors shrink-0" />
                            </div>

                            {/* Click-to-swap Dropdown popup and trigger options */}
                            <AnimatePresence>
                              {activePropertyDropdown === item.key && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.98, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.98, y: 5 }}
                                  className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[150] max-h-52 overflow-y-auto p-1.5 custom-scrollbar text-left text-xs"
                                  onClick={e => e.stopPropagation()}
                                >
                                  {system.semantics
                                    .filter(t => item.type === 'radius' ? t.type === 'radius' : t.type === 'spacing')
                                    .map(opt => (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                          setPlaygroundBindings(prev => ({
                                            ...prev,
                                            [item.key]: opt.id
                                          }));
                                          setActivePropertyDropdown(null);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-[10.5px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-between"
                                      >
                                        <span className="truncate">{opt.name}</span>
                                        <span className="text-indigo-400 font-black ml-2 shrink-0">
                                          {opt.type === 'radius' && opt.value === 999 ? 'Full' : `${getTokenPxValue(opt)}px`}
                                        </span>
                                      </button>
                                    ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Sidebar Footer matching Color and Typography tools */}
        <div className="py-6 px-4 shrink-0 flex flex-col items-center gap-4 border-t border-zinc-900/60 z-10 bg-zinc-950">
          <Button 
            variant="tertiary"
            fullWidth
            onClick={onBack}
            leftIcon={<LayoutGrid className="w-3 h-3" />}
          >
            View all tools
          </Button>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em] text-center font-sans">
            SPECTRA BY <a href="https://www.michelsleiman.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-indigo-400 transition-colors">Michel Sleiman</a>
          </p>
        </div>

      </aside>

      {/* Primary Content Panel Workspace area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 h-full overflow-hidden">
        
        {/* Header toolbar height-16 perfectly matching the standard design */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex-shrink-0 z-40">
          <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-12">
            <div className="flex items-center gap-12 h-full">
              
              {/* Pill Switch for Scales vs Live Preview */}
              <div className="flex items-center bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50 relative overflow-hidden">
                <motion.div
                  className="absolute bg-zinc-800 border border-zinc-700/50 rounded-full shadow-lg"
                  initial={false}
                  animate={{
                    x: viewMode === 'scales' ? 0 : 120,
                    width: '120px',
                    height: '32px'
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
                
                <button
                  onClick={() => setViewMode('scales')}
                  className={`relative z-10 w-[120px] h-8 flex items-center justify-center gap-2 transition-colors duration-300 ${
                    viewMode === 'scales' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Scales</span>
                </button>
                
                <button
                  onClick={() => setViewMode('live')}
                  className={`relative z-10 w-[120px] h-8 flex items-center justify-center gap-2 transition-colors duration-300 ${
                    viewMode === 'live' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Live Preview</span>
                </button>
              </div>

            </div>

            <div className="flex items-center gap-5 py-2">
              {viewMode === 'scales' && (
                <button 
                  onClick={() => handleAddSemantic(selectedRailCategory === 'Size' ? 'Component Size' : selectedRailCategory)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  + Token
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content canvas viewport area */}
        <div className="flex-1 overflow-y-auto px-12 py-10 scroll-smooth bg-zinc-950">
          
          <AnimatePresence mode="wait">
            {viewMode === 'scales' ? (
              <motion.div 
                key="scales-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-[1600px] mx-auto text-left w-full h-full"
              >
                


                {/* Primary Rows display canvas */}
                <div className="space-y-6 w-full">
                  
                  {/* Category Header Banner */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-5 mb-1 shrink-0">
                    <div className="flex flex-col text-left">
                      <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        {selectedRailCategory} Scales
                      </h2>
                      <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1 font-sans">
                        Design parameters matching outcome ratios
                      </span>
                    </div>
                  </div>

                  {/* Empty warning fallback */}
                  {filteredTokens.length === 0 ? (
                    <div className="p-12 text-center bg-zinc-900/20 border border-zinc-900 rounded-2rem flex flex-col items-center justify-center space-y-4">
                      <Ruler className="w-8 h-8 text-zinc-700" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-400">No active tokens</h4>
                        <p className="text-xs text-zinc-650 mt-1 uppercase font-semibold">Click + Token above to map customizable spacing attributes</p>
                      </div>
                    </div>
                  ) : selectedRailCategory === 'Size' ? (
                    /* Segmented Display for Size view */
                    <div className="space-y-10 text-left">
                      {(['Component Size', 'Surface Size', 'Layout Size'] as const).map(sect => {
                        const sectTokens = filteredTokens.filter(t => t.category === sect);
                        if (sectTokens.length === 0) return null;
                        return (
                          <div key={sect} className="space-y-3.5">
                            <div className="flex items-center gap-2 px-1 border-b border-zinc-900/40 pb-2">
                              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400 font-sans">
                                {sect}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900/40 px-2 py-0.5 rounded">
                                {sectTokens.length} tokens
                              </span>
                            </div>
                            <div className="space-y-3">
                              {sectTokens.map(token => {
                                const pxValue = getTokenPxValue(token);
                                return (
                                  <div 
                                    key={token.id}
                                    className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center hover:border-zinc-800 hover:bg-zinc-900/70 transition-all select-none group/row text-left"
                                  >
                                    {/* Left Meta specs */}
                                    <div className="w-[180px] shrink-0 text-left flex flex-col gap-1 min-w-0 pr-4">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-[11px] font-black text-white uppercase truncate tracking-wider">
                                          {token.name}
                                        </span>
                                        {token.isCustom && (
                                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[7px] font-black uppercase tracking-widest text-amber-500 shrink-0">
                                            Custom
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] font-mono text-zinc-500 uppercase leading-none truncate font-sans">
                                        dim-{system.spacing.scaleNames?.[token.value as number] || token.value}
                                      </span>
                                    </div>

                                    {/* Center Visual swatch */}
                                    <div className="flex-1 flex items-center justify-center px-4">
                                      <div className="relative h-7 w-44 bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-start shrink-0">
                                        <div 
                                          style={{ 
                                            width: `${Math.min(100, (pxValue / 320) * 100)}%`
                                          }}
                                          className="h-full bg-gradient-to-r from-indigo-500/10 to-indigo-500/25 border-r border-indigo-500/40"
                                        />
                                        <span className="absolute left-2.5 text-[9px] font-mono font-bold text-zinc-500 uppercase font-sans">
                                          {pxValue}px swatch Max-Truncated
                                        </span>
                                      </div>
                                    </div>

                                    {/* numeric outcome sizes */}
                                    <div className="w-[110px] shrink-0 text-right flex flex-col pr-4">
                                      <span className="text-sm font-mono font-black text-indigo-400">
                                        {pxValue === 999 ? 'Full' : `${pxValue}px`}
                                      </span>
                                      <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest mt-0.5 font-sans">
                                        Outcome Size
                                      </span>
                                    </div>

                                    {/* use cases */}
                                    {showUseCases && (
                                      <div className="w-[200px] text-xs text-zinc-400 border-l border-zinc-800 pl-4 py-1 text-left line-clamp-2 shrink-0 max-h-12 overflow-hidden select-text text-[10.5px] leading-relaxed font-sans">
                                        {getTokenHints(token, pxValue).map((hint, idx) => (
                                          <div key={idx} className="flex items-start gap-1 pb-0.5">
                                            <span className="text-[9px] text-indigo-500/60">•</span>
                                            {hint}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* hovering actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity pl-2 shrink-0">
                                      <button 
                                        onClick={() => handleEditSemantic(token)}
                                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                      >
                                        <Settings2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSemantic(token.id)}
                                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Token rows list (Spacing, Radius) */
                    <div className="space-y-3">
                      {filteredTokens.map(token => {
                        const pxValue = getTokenPxValue(token);

                        return (
                          <div 
                            key={token.id}
                            className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center hover:border-zinc-800 hover:bg-zinc-900/70 transition-all select-none group/row text-left"
                          >
                            {/* Left Meta specs */}
                            <div className="w-[180px] shrink-0 text-left flex flex-col gap-1 min-w-0 pr-4">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[11px] font-black text-white uppercase truncate tracking-wider">
                                  {token.name}
                                </span>
                                {token.isCustom && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[7px] font-black uppercase tracking-widest text-amber-500 shrink-0">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase leading-none truncate font-sans">
                                dim-{system.spacing.scaleNames?.[token.value as number] || token.value}
                              </span>
                            </div>

                            {/* Center Visual swatch */}
                            <div className="flex-1 flex items-center justify-center px-4">
                              {selectedRailCategory === 'Spacing' && (
                                <div className="flex flex-col items-center justify-center shrink-0">
                                  <div style={{ gap: `${pxValue}px` }} className="flex flex-col justify-center items-center shrink-0">
                                    <div className="h-2 w-16 bg-zinc-800 border border-zinc-700/60 rounded-sm" />
                                    <div className="h-2 w-16 bg-zinc-800 border border-zinc-700/60 rounded-sm" />
                                  </div>
                                </div>
                              )}

                              {selectedRailCategory === 'Radius' && (
                                <div className="flex justify-center items-center shrink-0">
                                  <div 
                                    style={{ 
                                      borderRadius: pxValue === 9999 ? '999px' : `${pxValue}px` 
                                    }}
                                    className="w-12 h-12 bg-indigo-500/5 hover:bg-indigo-500/10 border-2 border-indigo-500/30 shrink-0 shadow-inner flex items-center justify-center transition-all"
                                    title={`Radius: ${pxValue}px`}
                                  />
                                </div>
                              )}
                            </div>

                            {/* numeric outcome sizes */}
                            <div className="w-[110px] shrink-0 text-right flex flex-col pr-4">
                              <span className="text-sm font-mono font-black text-indigo-400">
                                {pxValue === 9999 ? 'Full' : `${pxValue}px`}
                              </span>
                              <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest mt-0.5 font-sans">
                                Outcome Size
                              </span>
                            </div>

                            {/* use cases */}
                            {showUseCases && (
                              <div className="w-[200px] text-xs text-zinc-400 border-l border-zinc-800 pl-4 py-1 text-left line-clamp-2 shrink-0 max-h-12 overflow-hidden select-text text-[10.5px] leading-relaxed">
                                {getTokenHints(token, pxValue).map((hint, idx) => (
                                  <div key={idx} className="flex items-start gap-1 pb-0.5">
                                    <span className="text-[9px] text-indigo-500/60">•</span>
                                    {hint}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* hovering actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity pl-2 shrink-0">
                              <button 
                                onClick={() => handleEditSemantic(token)}
                                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
                              >
                                <Settings2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSemantic(token.id)}
                                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

              </motion.div>
            ) : (
              /* Live Preview main content area */
              <motion.div 
                key="live-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-[1600px] mx-auto space-y-6 text-left"
              >
                
                {/* Scene Picker menu bar */}
                <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-4 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mr-2.5">Workspace Scene:</span>
                  
                  <button 
                    onClick={() => {
                      setActiveScene('signin');
                      setActivePropertyDropdown(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      activeScene === 'signin' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    Sign In Form
                  </button>

                  <button 
                    onClick={() => {
                      setActiveScene('settings');
                      setActivePropertyDropdown(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      activeScene === 'settings' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    <Settings className="w-3 h-3" />
                    Settings Panel
                  </button>

                  <button 
                    onClick={() => {
                      setActiveScene('cards');
                      setActivePropertyDropdown(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      activeScene === 'cards' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" />
                    Card List
                  </button>

                  <button 
                    onClick={() => {
                      setActiveScene('empty');
                      setActivePropertyDropdown(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      activeScene === 'empty' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    <Inbox className="w-3 h-3" />
                    Empty State
                  </button>
                </div>

                {/* Single central canvas full size */}
                <div className="bg-zinc-950/30 border border-zinc-900 rounded-[2.5rem] p-10 flex min-h-[500px] flex-col items-center justify-center relative shadow-2xl overflow-hidden mt-6">
                  
                  {/* Absolute subtle background grid indicators */}
                  <div className="absolute inset-0 bg-grid-zinc-900/10 pointer-events-none" />

                  <div className="z-10 w-full flex justify-center items-center">
                    <AnimatePresence mode="wait">
                      
                      {/* 1. Sign In form scenario */}
                      {activeScene === 'signin' && (
                        <motion.div 
                          key="signin-scene"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          style={{
                            padding: `${getPxValue(playgroundBindings.cardPadding)}px`,
                            borderRadius: getPxValue(playgroundBindings.cardRadius) >= 999 ? '32px' : `${getPxValue(playgroundBindings.cardRadius)}px`,
                            gap: `${getPxValue(playgroundBindings.cardGap)}px`
                          }}
                          className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 flex flex-col p-8 shadow-2xl relative transition-all duration-300 ${
                            hoveredBindingKey === 'cardPadding' || hoveredBindingKey === 'cardRadius' || hoveredBindingKey === 'cardGap'
                              ? 'border-indigo-500 bg-zinc-900/80 shadow-[0_0_35px_rgba(99,102,241,0.15)] ring-2 ring-indigo-500/10'
                              : ''
                          }`}
                        >
                          {/* Inner Visual Blueprint Guides indicator tags */}
                          {showGuides && (
                            <>
                              {/* Outer Padding guide */}
                              <div 
                                style={{
                                  inset: `${getPxValue(playgroundBindings.cardPadding)}px`
                                }}
                                className={`absolute border border-dashed rounded-lg pointer-events-none transition-all ${
                                  hoveredBindingKey === 'cardPadding' ? 'border-indigo-400 bg-indigo-500/5' : 'border-zinc-800/20'
                                }`}
                              >
                                {hoveredBindingKey === 'cardPadding' && (
                                  <span className="absolute -top-4 -left-1 text-[7.5px] font-mono font-black text-indigo-400 bg-zinc-950 px-1 border border-indigo-500/20 rounded">
                                    padding: {getPxValue(playgroundBindings.cardPadding)}px
                                  </span>
                                )}
                              </div>

                              {/* Corner Radius Guide */}
                              {hoveredBindingKey === 'cardRadius' && (
                                <div 
                                  style={{
                                    borderRadius: getPxValue(playgroundBindings.cardRadius) >= 999 ? '32px' : `${getPxValue(playgroundBindings.cardRadius)}px`
                                  }}
                                  className="absolute inset-0 border border-amber-400/80 pointer-events-none bg-amber-500/[0.02]"
                                >
                                  <span className="absolute top-2 left-2 text-[7.5px] font-mono font-black text-amber-400 bg-zinc-950 px-1 border border-amber-500/20 rounded">
                                    radius: {getPxValue(playgroundBindings.cardRadius) >= 999 ? 'Full' : `${getPxValue(playgroundBindings.cardRadius)}px`}
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                          {/* Header section */}
                          <div className="flex flex-col gap-1 items-start">
                            <h3 className="text-base font-black text-white uppercase tracking-wider">Welcome back</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Provide security details</p>
                          </div>

                          {/* Credentials inputs with responsive gaps */}
                          <div 
                            style={{ gap: `${getPxValue(playgroundBindings.cardGap)}px` }} 
                            className="flex flex-col text-left"
                          >
                            <div className="flex flex-col relative">
                              {showGuides && hoveredBindingKey === 'formLabelGap' && (
                                <div className="absolute top-4 left-0 right-0 h-1 border-t border-b border-rose-500/70 bg-rose-500/20 pointer-events-none">
                                  <span className="absolute -top-4 left-1 text-[7.5px] font-mono font-black text-rose-400 bg-zinc-950 px-1 border border-rose-500/20 rounded">
                                    labelGap: {getPxValue(playgroundBindings.formLabelGap)}px
                                  </span>
                                </div>
                              )}
                              
                              <label 
                                style={{ marginBottom: `${getPxValue(playgroundBindings.formLabelGap)}px` }}
                                className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest ml-1"
                              >
                                Registry Email Address
                              </label>
                              <div className="relative">
                                <input 
                                  type="text" 
                                  readOnly
                                  defaultValue="security@spectra.io"
                                  style={{
                                    padding: `${getPxValue(playgroundBindings.inputPaddingY)}px ${getPxValue(playgroundBindings.inputPaddingX)}px`,
                                    borderRadius: getPxValue(playgroundBindings.inputRadius) >= 999 ? '99px' : `${getPxValue(playgroundBindings.inputRadius)}px`
                                  }}
                                  className={`w-full bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none transition-all ${
                                    hoveredBindingKey === 'inputPaddingX' || hoveredBindingKey === 'inputPaddingY' || hoveredBindingKey === 'inputRadius'
                                      ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                                      : ''
                                  }`}
                                />
                                <User className="w-3.5 h-3.5 text-zinc-700 absolute right-3.5 top-1/2 -translate-y-1/2" />
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <label 
                                style={{ marginBottom: `${getPxValue(playgroundBindings.formLabelGap)}px` }}
                                className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest ml-1"
                              >
                                Encrypted Access Key
                              </label>
                              <div className="relative">
                                <input 
                                  type="password" 
                                  readOnly
                                  defaultValue="••••••••••••••"
                                  style={{
                                    padding: `${getPxValue(playgroundBindings.inputPaddingY)}px ${getPxValue(playgroundBindings.inputPaddingX)}px`,
                                    borderRadius: getPxValue(playgroundBindings.inputRadius) >= 999 ? '99px' : `${getPxValue(playgroundBindings.inputRadius)}px`
                                  }}
                                  className={`w-full bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none transition-all ${
                                    hoveredBindingKey === 'inputPaddingX' || hoveredBindingKey === 'inputPaddingY' || hoveredBindingKey === 'inputRadius'
                                      ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                                      : ''
                                  }`}
                                />
                                <Lock className="w-3.5 h-3.5 text-zinc-700 absolute right-3.5 top-1/2 -translate-y-1/2" />
                              </div>
                            </div>
                          </div>

                          {/* Submit controls */}
                          <button
                            onClick={e => e.preventDefault()}
                            style={{
                              padding: `${getPxValue(playgroundBindings.buttonPaddingY)}px ${getPxValue(playgroundBindings.buttonPaddingX)}px`,
                              borderRadius: getPxValue(playgroundBindings.buttonRadius) >= 999 ? '999px' : `${getPxValue(playgroundBindings.buttonRadius)}px`,
                              marginTop: `${getPxValue(playgroundBindings.cardGap)}px`
                            }}
                            className={`bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase font-black tracking-widest transition-all py-3 shadow-xl hover:shadow-indigo-500/10 flex items-center justify-center ${
                              hoveredBindingKey === 'buttonPaddingX' || hoveredBindingKey === 'buttonPaddingY' || hoveredBindingKey === 'buttonRadius'
                                ? 'bg-indigo-500 ring-4 ring-indigo-500/20'
                                : ''
                            }`}
                          >
                            Authenticate Identity
                          </button>
                        </motion.div>
                      )}

                      {/* 2. Settings Panel scenario */}
                      {activeScene === 'settings' && (
                        <motion.div 
                          key="settings-scene"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          style={{
                            padding: `${getPxValue(playgroundBindings.cardPadding)}px`,
                            borderRadius: getPxValue(playgroundBindings.cardRadius) >= 999 ? '32px' : `${getPxValue(playgroundBindings.cardRadius)}px`,
                            gap: `${getPxValue(playgroundBindings.cardGap)}px`
                          }}
                          className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 flex flex-col p-8 shadow-2xl transition-all ${
                            hoveredBindingKey === 'cardPadding' || hoveredBindingKey === 'cardRadius' || hoveredBindingKey === 'cardGap'
                              ? 'border-indigo-500 bg-zinc-900/80 shadow-[0_0_35px_rgba(99,102,241,0.15)] ring-2 ring-indigo-500/10'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                              <h3 className="text-sm font-black text-white uppercase tracking-wider">Access Node</h3>
                              <span className="text-[8.5px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">Status: Secured Live</span>
                            </div>
                          </div>

                          {/* List stack with Stack Layout Gaps */}
                          <div 
                            style={{ gap: `${getPxValue(playgroundBindings.stackGap)}px` }}
                            className="flex flex-col relative text-left"
                          >
                            {showGuides && hoveredBindingKey === 'stackGap' && (
                              <div className="absolute top-12 left-0 right-0 h-1.5 border-t border-b border-amber-500/80 bg-amber-500/20 pointer-events-none">
                                <span className="absolute -top-4 left-1 text-[7.5px] font-mono font-black text-amber-400 bg-zinc-950 px-1 border border-amber-500/20 rounded">
                                  stackGap: {getPxValue(playgroundBindings.stackGap)}px
                                </span>
                              </div>
                            )}

                            {[
                              { label: 'Cloud Synchronisation', desc: 'Secure state replication', icon: <Eye className="w-4 h-4 text-emerald-400" /> },
                              { label: 'Variable Mapping Export', desc: 'Auto-compile design metrics', icon: <FileText className="w-4 h-4 text-zinc-500" /> }
                            ].map((opt, idx) => (
                              <div 
                                key={idx}
                                className={`p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between transition-all ${
                                  hoveredBindingKey === 'stackGap' ? 'border-amber-500/40' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {opt.icon}
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{opt.label}</span>
                                    <span className="text-[8.5px] text-zinc-500 font-bold uppercase mt-0.5">{opt.desc}</span>
                                  </div>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2.5 mt-2">
                            <button
                              style={{
                                borderRadius: getPxValue(playgroundBindings.buttonRadius) === 999 ? '999px' : `${getPxValue(playgroundBindings.buttonRadius)}px`
                              }}
                              className="flex-1 bg-zinc-950 border border-zinc-800 text-[9.5px] uppercase font-black tracking-widest py-2.5 px-4 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
                            >
                              Sync Logs
                            </button>
                            <button
                              style={{
                                padding: `${getPxValue(playgroundBindings.buttonPaddingY)}px ${getPxValue(playgroundBindings.buttonPaddingX)}px`,
                                borderRadius: getPxValue(playgroundBindings.buttonRadius) === 999 ? '999px' : `${getPxValue(playgroundBindings.buttonRadius)}px`
                              }}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9.5px] uppercase font-black tracking-widest transition-colors py-2.5"
                            >
                              Apply Specs
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* 3. Card List scenario */}
                      {activeScene === 'cards' && (
                        <motion.div 
                          key="cards-scene"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          style={{ gap: `${getPxValue(playgroundBindings.stackGap)}px` }}
                          className={`w-full max-w-sm flex flex-col transition-all`}
                        >
                          {showGuides && hoveredBindingKey === 'stackGap' && (
                            <div className="w-full h-1.5 border-t border-b border-rose-500 bg-rose-500/20 pointer-events-none relative mb-1">
                              <span className="absolute -top-4 left-1 text-[7.5px] font-mono font-black text-rose-400 bg-zinc-950 px-1 border border-rose-500/20 rounded">
                                stackGap: {getPxValue(playgroundBindings.stackGap)}px
                              </span>
                            </div>
                          )}

                          {[1, 2].map(idx => (
                            <div 
                              key={idx}
                              style={{
                                padding: `${getPxValue(playgroundBindings.cardPadding)}px`,
                                borderRadius: getPxValue(playgroundBindings.cardRadius) >= 999 ? '24px' : `${getPxValue(playgroundBindings.cardRadius)}px`,
                                gap: `${getPxValue(playgroundBindings.cardGap)}px`
                              }}
                              className={`bg-zinc-900 border border-zinc-800 p-6 shadow-xl flex flex-col text-left transition-all ${
                                hoveredBindingKey === 'cardPadding' || hoveredBindingKey === 'cardRadius' || hoveredBindingKey === 'cardGap'
                                  ? 'border-indigo-400'
                                  : 'border-zinc-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 text-[10px] font-bold font-mono">
                                    C0{idx}
                                  </div>
                                  <span className="text-[10px] uppercase font-black tracking-widest text-white">System Component {idx}</span>
                                </div>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                                Dynamic variables map padding and curves to layout metrics instantly.
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {/* 4. Empty State scenario */}
                      {activeScene === 'empty' && (
                        <motion.div 
                          key="empty-scene"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          style={{
                            padding: `${getPxValue(playgroundBindings.cardPadding)}px`,
                            borderRadius: getPxValue(playgroundBindings.cardRadius) >= 999 ? '32px' : `${getPxValue(playgroundBindings.cardRadius)}px`,
                            gap: `${getPxValue(playgroundBindings.cardGap)}px`
                          }}
                          className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center p-8 shadow-2xl transition-all ${
                            hoveredBindingKey === 'cardPadding' || hoveredBindingKey === 'cardRadius' || hoveredBindingKey === 'cardGap'
                              ? 'border-indigo-400 bg-zinc-900/80 shadow-[0_0_35px_rgba(99,102,241,0.15)] ring-2 ring-indigo-500/10'
                              : ''
                          }`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <HelpCircle className="w-6 h-6 text-indigo-400" />
                          </div>

                          <div className="flex flex-col gap-1 items-center">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">No variables generated</h3>
                            <p className="text-[9.5px] text-zinc-500 uppercase font-black leading-relaxed max-w-[200px] font-sans">
                              Add customizable tokens in the Scales editor window
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setViewMode('scales');
                            }}
                            style={{
                              padding: `${getPxValue(playgroundBindings.buttonPaddingY)}px ${getPxValue(playgroundBindings.buttonPaddingX)}px`,
                              borderRadius: getPxValue(playgroundBindings.buttonRadius) >= 999 ? '99px' : `${getPxValue(playgroundBindings.buttonRadius)}px`
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] uppercase font-black tracking-widest transition-colors py-2 px-4 shadow-xl"
                          >
                            Open Scales collection
                          </button>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  <span className="text-[9.5px] text-zinc-500 select-none uppercase font-black tracking-wider mt-5 pr-1 font-sans">
                    Hover over sidebar binding parameters to visualize spatial blueprints inside the scene
                  </span>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </main>

      {/* Save Scale Or Token Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setActiveCategory(null);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl text-left"
            >
              <div className="px-6 py-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex flex-col text-left">
                  <h3 className="text-lg font-black text-white">
                    {activeCategory ? (
                      editingSemantic ? `Edit ${activeCategory} Token` : `Add ${activeCategory} Token`
                    ) : (
                      editingValue !== null ? 'Edit Scale Factor' : 'Add Scale'
                    )}
                  </h3>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                    System Geometric Modulation
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setActiveCategory(null);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveScaleOrToken} className="p-6 space-y-5">
                {activeCategory && (
                  <div className="space-y-2 text-left">
                    <label className="text-[9.5px] font-black text-zinc-500 uppercase tracking-widest ml-1">Token Identifier</label>
                    <input 
                      type="text"
                      autoFocus
                      required
                      value={tempSemanticName}
                      onChange={e => {
                        setTempSemanticName(e.target.value);
                        setErrorStatus(null);
                      }}
                      className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                        errorStatus?.name ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800'
                      }`}
                      placeholder={`${activeCategory.toLowerCase()}-custom-spec`}
                    />
                    {errorStatus?.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errorStatus.name}</p>}
                  </div>
                )}

                {activeCategory && (activeCategory === 'Component Size' || activeCategory === 'Surface Size' || activeCategory === 'Layout Size') && (
                  <div className="space-y-2 text-left">
                    <label className="text-[9.5px] font-black text-zinc-500 uppercase tracking-widest ml-1">Size Segment</label>
                    <select
                      value={activeCategory}
                      onChange={e => setActiveCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Component Size" className="bg-zinc-950 text-white">Component Size</option>
                      <option value="Surface Size" className="bg-zinc-950 text-white">Surface Size</option>
                      <option value="Layout Size" className="bg-zinc-950 text-white">Layout Size</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left col-span-2">
                    <label className="text-[9.5px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                      {activeCategory ? 'Maps directly to Factor' : 'Multiplier Value (X)'}
                    </label>
                    
                    {activeCategory ? (
                      <select
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        {system.spacing.scale.map(scale => (
                          <option key={scale} value={scale} className="bg-zinc-950 text-white">
                            dim-{system.spacing.scaleNames?.[scale] || scale} ({scale * system.spacing.baseValue}px)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <input 
                          type="number"
                          step="0.01"
                          autoFocus
                          required
                          value={tempValue}
                          onChange={e => {
                            setTempValue(e.target.value);
                            setErrorStatus(null);
                          }}
                          className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                            errorStatus?.size ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800'
                          }`}
                          placeholder="2.5"
                        />
                        {errorStatus?.size && <p className="text-[10px] text-red-500 font-bold ml-1">{errorStatus.size}</p>}
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center justify-between text-left shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Calculated Dimension</span>
                    <span className="text-xl font-mono font-black text-indigo-400 mt-1">
                      {isNaN(parseFloat(tempValue)) ? '0' : (parseFloat(tempValue) * system.spacing.baseValue).toFixed(0)}px
                    </span>
                  </div>
                  <div className="text-right text-[9px] font-semibold text-zinc-500 uppercase">
                    Base: {system.spacing.baseValue}px
                  </div>
                </div>

                <Button 
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  className="rounded-xl mt-1"
                >
                  {activeCategory ? (
                    editingSemantic ? 'Apply Updates' : 'Add to Collection'
                  ) : (
                    editingValue !== null ? 'Update Factor' : 'Add scale factor'
                  )}
                </Button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm actions */}
      {scaleToDelete !== null && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setScaleToDelete(null)} />
          <div className="relative w-full max-w-xs bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Delete Multiplier?</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
              Are you sure you want to delete {scaleToDelete}x factor? Bound tokens might lose their mathematical representation.
            </p>
            <div className="flex gap-2.5 mt-5">
              <Button size="sm" variant="secondary" fullWidth onClick={() => setScaleToDelete(null)}>Cancel</Button>
              <Button size="sm" variant="primary" className="bg-red-650 hover:bg-red-500 text-white" fullWidth onClick={confirmDeleteScale}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {semanticToDelete !== null && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setSemanticToDelete(null)} />
          <div className="relative w-full max-w-xs bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Delete Token?</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
              Are you sure you want to permanently delete this customizable dimension variable?
            </p>
            <div className="flex gap-2.5 mt-5">
              <Button size="sm" variant="secondary" fullWidth onClick={() => setSemanticToDelete(null)}>Cancel</Button>
              <Button size="sm" variant="primary" className="bg-red-650 hover:bg-red-500 text-white" fullWidth onClick={confirmDeleteSemantic}>Delete</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DimensionsTool;
