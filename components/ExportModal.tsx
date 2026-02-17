
import React, { useState, useEffect } from 'react';
import { Palette, ColorSystem, SemanticToken } from '../types';

interface ExportModalProps {
  palette: Palette;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ palette, onClose }) => {
  // 1. Set default view to 'primitives'
  const [figmaView, setFigmaView] = useState<'semantics' | 'primitives'>('primitives');
  const [isOpen, setIsOpen] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  // Helper to convert hex to the 0-1 RGBA format Figma variables expect
  const hexToNormalizedRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b, a: 1 };
  };

  /**
   * Deterministic ID for Primitive variables.
   */
  const getPrimitiveId = (type: string, step: number | 'white' | 'black') => {
    const normalizedType = type.toLowerCase();
    let stepId = step;
    let finalType = normalizedType;

    if (step === 'white') {
        finalType = 'base';
        stepId = 0;
    } else if (step === 'black') {
        finalType = 'base';
        stepId = 1000;
    }

    return `VariableID:Primitive:${finalType}:${stepId}`;
  };

  const getHexForStep = (systemType: string, stepId: number | 'white' | 'black') => {
    if (stepId === 'white') return '#FFFFFF';
    if (stepId === 'black') return '#000000';
    const sys = palette.systems.find(s => s.type === systemType);
    const step = sys?.steps.find(st => st.id === stepId);
    return step?.hex || '#888888';
  };

  const generateFigmaPrimitives = () => {
    const collectionId = "VariableCollectionId:SpectraPrimitives";
    const modeId = "mode-default";
    const variables: any[] = [];
    const variableIds: string[] = [];

    palette.systems.forEach(sys => {
      sys.steps.forEach(step => {
        const varId = getPrimitiveId(sys.type, step.id);
        variableIds.push(varId);
        const rgba = hexToNormalizedRgba(step.hex);
        variables.push({
          id: varId,
          name: `${sys.name}/${step.id}`,
          description: `Primitive ${sys.name} color - Step ${step.id}`,
          type: "COLOR",
          valuesByMode: { [modeId]: rgba },
          resolvedValuesByMode: {
            [modeId]: { resolvedValue: rgba, alias: null }
          },
          scopes: ["ALL_FILLS"],
          hiddenFromPublishing: false,
          codeSyntax: {}
        });
      });
    });

    return JSON.stringify({
      id: collectionId,
      name: "Primitives (Spectra)",
      modes: { [modeId]: "Value" },
      variableIds: variableIds,
      variables: variables
    }, null, 2);
  };

  const generateFigmaSemantics = () => {
    const collectionId = "VariableCollectionId:SpectraColorMode";
    const lightModeId = "mode-light";
    const darkModeId = "mode-dark";
    
    const variables: any[] = [];
    const variableIds: string[] = [];

    const liveSemantics = palette.semantics.filter(sem => !sem.parent);

    liveSemantics.forEach(sem => {
      const varId = `VariableID:Semantic:${sem.category}:${sem.name}`;
      variableIds.push(varId);
      
      const lightHex = getHexForStep(sem.systemType, sem.lightStep);
      const darkHex = getHexForStep(sem.systemType, sem.darkStep);
      
      const lightRgba = hexToNormalizedRgba(lightHex);
      const darkRgba = hexToNormalizedRgba(darkHex);

      const lightAliasId = getPrimitiveId(sem.systemType, sem.lightStep);
      const darkAliasId = getPrimitiveId(sem.systemType, sem.darkStep);

      variables.push({
        id: varId,
        name: `${sem.category}/${sem.name}`,
        description: `Semantic ${sem.name} token`,
        type: "COLOR",
        valuesByMode: {
          [lightModeId]: {
            type: "VARIABLE_ALIAS",
            id: lightAliasId
          },
          [darkModeId]: {
            type: "VARIABLE_ALIAS",
            id: darkAliasId
          }
        },
        resolvedValuesByMode: {
          [lightModeId]: { 
            resolvedValue: lightRgba, 
            alias: lightAliasId,
            aliasName: `${sem.systemType}/${sem.lightStep}`
          },
          [darkModeId]: { 
            resolvedValue: darkRgba, 
            alias: darkAliasId,
            aliasName: `${sem.systemType}/${sem.darkStep}`
          }
        },
        scopes: ["ALL_FILLS"],
        hiddenFromPublishing: false,
        codeSyntax: {}
      });
    });

    return JSON.stringify({
      id: collectionId,
      name: "Color Mode (Spectra)",
      modes: { 
        [lightModeId]: "Light", 
        [darkModeId]: "Dark" 
      },
      variableIds: variableIds,
      variables: variables
    }, null, 2);
  };

  const getCode = () => {
    return figmaView === 'semantics' ? generateFigmaSemantics() : generateFigmaPrimitives();
  };

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    triggerDownload(generateFigmaPrimitives(), `spectra-primitives.json`);
    setTimeout(() => {
      triggerDownload(generateFigmaSemantics(), `spectra-color-mode.json`);
    }, 300);
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-black/95 backdrop-blur-2xl' : 'bg-black/0 backdrop-blur-0 pointer-events-none'}`}>
      <div className={`bg-zinc-900 w-full max-w-6xl max-h-[90vh] rounded-[1.5rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
        
        {/* Simplified Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-end items-center bg-zinc-900/50">
          <button onClick={handleClose} className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Controls & Instructions */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-800 p-8 space-y-10 bg-zinc-900/20 shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Collection Preview</p>
              <div className="flex flex-col gap-2 p-1.5 bg-black/40 rounded-2xl border border-zinc-800">
                <button 
                  onClick={() => setFigmaView('primitives')}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left ${figmaView === 'primitives' ? 'bg-zinc-800 text-indigo-400 border border-zinc-700 shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                >
                  Primitives
                </button>
                <button 
                  onClick={() => setFigmaView('semantics')}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left ${figmaView === 'semantics' ? 'bg-zinc-800 text-indigo-400 border border-zinc-700 shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                >
                  Color Mode
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">How to Import</p>
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 text-[9px] font-black flex items-center justify-center text-zinc-400 flex-shrink-0 mt-0.5">1</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Download the variables using the button below. You will receive two JSON files.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 text-[9px] font-black flex items-center justify-center text-zinc-400 flex-shrink-0 mt-0.5">2</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Use the <span className="text-zinc-200">Variables Import/Export</span> plugin in Figma.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-[9px] font-black flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">3</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">First, import <span className="text-indigo-400 font-bold">spectra-primitives.json</span> to create the core palette.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-[9px] font-black flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">4</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Finally, import <span className="text-indigo-400 font-bold">spectra-color-mode.json</span>. The plugin will automatically link semantic tokens to the primitives.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code View */}
          <div className="flex-1 bg-black p-4 lg:p-8 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Figma Variable Manifest</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(getCode());
                }}
                className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
              >
                Copy Content
              </button>
            </div>
            <div className="flex-1 bg-zinc-900/30 rounded-[2rem] p-8 overflow-auto font-mono text-[11px] text-indigo-300/80 border border-zinc-800/50 scrollbar-hide">
              <pre className="leading-relaxed whitespace-pre-wrap">
                {getCode()}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row justify-end gap-4">
          <button 
            onClick={handleClose}
            className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Close
          </button>
          <button 
            onClick={handleDownload}
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all"
          >
            Download Figma Variables
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
