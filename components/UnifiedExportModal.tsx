
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Palette, TypographySystem, SystemType, DimensionsData } from '../types';
import { X, Copy, Download, Check, Type, Zap, Ruler, Palette as PaletteIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnifiedExportModalProps {
  palette: Palette;
  typographySystem: TypographySystem;
  dimensionsSystem?: DimensionsData;
  onClose: () => void;
  initialTools?: ('colors' | 'typography' | 'dimensions')[];
}

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const UnifiedExportModal: React.FC<UnifiedExportModalProps> = ({ palette, typographySystem, dimensionsSystem, onClose, initialTools = ['colors', 'typography'] }) => {
  const [selectedTools, setSelectedTools] = useState<('colors' | 'typography' | 'dimensions')[]>(initialTools);
  const [view, setView] = useState<'scripter' | 'tailwind' | 'json'>('scripter');
  const [isDevMode, setIsDevMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const toggleTool = (tool: 'colors' | 'typography' | 'dimensions') => {
    setSelectedTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool) 
        : [...prev, tool]
    );
  };

  const totalColors = palette.systems.reduce((acc, sys) => acc + sys.steps.length, 0);
  const totalTypography = typographySystem.fontSystems.reduce((acc, fs) => acc + fs.steps.length, 0);
  const totalDimensions = dimensionsSystem ? (dimensionsSystem.spacing.scale.length + dimensionsSystem.radius.steps.length) : 0;
  const totalModes = 2; // Fixed for now

  // --- Helpers for script generation ---
  const hexToNormalizedRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b, a: 1 };
  };

  const fontWeightToName = (weight: number): string => {
    const map: Record<number, string> = {
      100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular',
      500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'
    };
    return map[weight] || 'Regular';
  };

  const getStylesData = () => {
    const stylesData: any[] = [];
    typographySystem.fontSystems.forEach(f => {
      const sortedSteps = [...f.steps].sort((a,b) => a.fontSize - b.fontSize);
      f.steps.forEach(step => {
        const stepIndex = sortedSteps.findIndex(s => s.id === step.id);
        const mobileStep = step.fontSize <= 12 
          ? step 
          : (stepIndex > 0 ? sortedSteps[stepIndex - 1] : step);

        stylesData.push({
          id: `${f.id}-${step.id}`,
          name: `${f.name}/${step.name}`,
          family: f.family,
          style: fontWeightToName(step.fontWeight),
          size: step.fontSize,
          mobileSize: mobileStep.fontSize,
          mobileLineHeightPx: Math.round(mobileStep.lineHeight * mobileStep.fontSize), 
          lineHeight: step.lineHeight,
          letterSpacing: step.letterSpacing || 0,
          weight: step.fontWeight,
          fontSystemId: f.id,
          fontSystemName: f.name
        });
      });
    });
    return stylesData;
  };

  const generateCombinedScript = () => {
    // Hoist data objects so they are available to all script parts
    const primitivesData = palette.systems.map(sys => ({
      systemName: sys.name,
      systemType: sys.type,
      steps: sys.steps.map(step => ({
        id: step.id,
        name: `${sys.name}/${step.id}`,
        hex: step.hex,
        rgba: hexToNormalizedRgba(step.hex)
      }))
    }));

    const liveSemantics = palette.semantics.filter(sem => !sem.parent);
    const baseSystem = palette.systems.find(s => s.type === 'base');
    
    const getAliasPath = (type: SystemType, step: number | 'white' | 'black') => {
      if (step === 'white' || step === 'black') {
        return `${baseSystem?.name || 'Base'}/${step === 'white' ? 0 : 1000}`;
      }
      const sys = palette.systems.find(s => s.type === type);
      return `${sys?.name || type}/${step}`;
    };

    const getHexForAlias = (type: SystemType, step: number | 'white' | 'black') => {
      if (step === 'white') return '#FFFFFF';
      if (step === 'black') return '#000000';
      const sys = palette.systems.find(s => s.type === type);
      return sys?.steps.find(s => s.id === step)?.hex || '#000000';
    };

    const categoryOrder = ['Text', 'Border', 'Foreground', 'Background'];
    const semanticsData = palette.semantics.map(sem => ({
      name: `${sem.category}/${sem.name}`,
      lightAliasPath: getAliasPath(sem.systemType, sem.lightStep),
      darkAliasPath: getAliasPath(sem.systemType, sem.lightStep === 'white' ? sem.lightStep : sem.darkStep), // Fallback logic slightly adjusted
      lightHex: getHexForAlias(sem.systemType, sem.lightStep),
      darkHex: getHexForAlias(sem.systemType, sem.darkStep),
      lightLabel: sem.lightStep === 'white' ? 'Base W' : (sem.lightStep === 'black' ? 'Base B' : `${sem.systemType.charAt(0).toUpperCase() + sem.systemType.slice(1)} ${sem.lightStep}`),
      darkLabel: sem.darkStep === 'white' ? 'Base W' : (sem.darkStep === 'black' ? 'Base B' : `${sem.systemType.charAt(0).toUpperCase() + sem.systemType.slice(1)} ${sem.darkStep}`),
      category: sem.category || 'Other'
    }));

    // Sort semantics for documentation
    semanticsData.sort((a, b) => {
      const orderA = categoryOrder.indexOf(a.category);
      const orderB = categoryOrder.indexOf(b.category);
      if (orderA !== -1 && orderB !== -1) return orderA - orderB;
      if (orderA !== -1) return -1;
      if (orderB !== -1) return 1;
      return a.category.localeCompare(b.category);
    });

    let script = `/**
 * SPECTRA DESIGN SYSTEM — FIGMA INTEGRATION PIPELINE
 * 1. Copy this full script.
 * 2. Open Figma & launch the "Design with Spectra" plugin.
 *    Plugin Link: https://www.figma.com/community/plugin/1631384418836907020/design-with-spectra
 * 3. Paste this script inside the plugin and run to automatically sync.
 */

console.clear();
console.log("🚀 Running Design with Spectra Sync Pipeline...");

`;

    // Hoist the system data variables to avoid duplication
    if (selectedTools.includes('colors')) {
      script += `const PRIMITIVES_DATA = ${JSON.stringify(primitivesData, null, 2)};\n`;
      script += `const SEMANTICS_DATA = ${JSON.stringify(semanticsData, null, 2)};\n\n`;
    }
    if (selectedTools.includes('typography')) {
      const typeData = getStylesData();
      script += `const TYPOGRAPHY_DATA = ${JSON.stringify(typeData, null, 2)};\n\n`;
    }

    // Phase 1: Primitives
    if (selectedTools.includes('colors')) {
      script += `async function createColorPrimitives() {
  const variableMap = {};
  console.log("-> Syncing Color Primitives...");

  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = localCollections.find(c => c.name === "Primitives");
  if (!collection) {
    collection = figma.variables.createVariableCollection("Primitives");
  }
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, "Value");

  const localVariables = await figma.variables.getLocalVariablesAsync();

  for (const sys of PRIMITIVES_DATA) {
    for (const step of sys.steps) {
      let v = localVariables.find(x => x.name === step.name && x.variableCollectionId === collection.id);
      if (!v) {
        v = figma.variables.createVariable(step.name, collection, "COLOR");
        localVariables.push(v);
      }
      
      v.setValueForMode(modeId, step.rgba);
      v.scopes = ["ALL_FILLS"];
      variableMap[step.name] = v;
    }
  }
  return { collection, variableMap };
}\n\n`;
    }

    if (selectedTools.includes('typography')) {
      const fontConfig: any = {};
      const familiesList: string[] = [];
      typographySystem.fontSystems.forEach(fs => {
        fontConfig[fs.name] = fs.family;
        familiesList.push(fs.name);
      });

      script += `async function syncTypography() {
  const fontConfig = ${JSON.stringify(fontConfig, null, 2)};
  console.log("-> Syncing Typography Primitives...");

  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const localVariables = await figma.variables.getLocalVariablesAsync();
  const localTextStyles = await figma.getLocalTextStylesAsync();

  // 1. Fonts Collection
  let fontsCollection = localCollections.find(c => c.name === "Fonts");
  if (!fontsCollection) {
    fontsCollection = figma.variables.createVariableCollection("Fonts");
    localCollections.push(fontsCollection);
  }
  const fontsModeId = fontsCollection.modes[0].modeId;

  const families = ${JSON.stringify(familiesList)};
  for (const familyName of families) {
    const path = "Font Family/" + familyName;
    let v = localVariables.find(x => x.name === path && x.variableCollectionId === fontsCollection.id);
    if (!v) {
      v = figma.variables.createVariable(path, fontsCollection, "STRING");
      localVariables.push(v);
    }
    v.setValueForMode(fontsModeId, fontConfig[familyName]);
  }

  // 2. Typography Collection
  let collection = localCollections.find(c => c.name === "Spectra Typography");
  if (!collection) {
    collection = figma.variables.createVariableCollection("Spectra Typography");
    localCollections.push(collection);
  }

  const desktopModeId = collection.modes[0].modeId;
  collection.renameMode(desktopModeId, "Desktop");
  let mobileModeId = collection.modes[1]?.modeId || collection.addMode("Mobile");

  function findVar(path) {
    return localVariables.find(v => v.name === path && v.variableCollectionId === collection.id);
  }

  for (const s of TYPOGRAPHY_DATA) {
    try {
      const sizePath = s.name + "/Size";
      let sizeVar = findVar(sizePath);
      if (!sizeVar) {
        sizeVar = figma.variables.createVariable(sizePath, collection, "FLOAT");
        localVariables.push(sizeVar);
      }
      sizeVar.setValueForMode(desktopModeId, s.size);
      sizeVar.setValueForMode(mobileModeId, s.mobileSize);
      sizeVar.scopes = ['FONT_SIZE'];

      const lhPath = s.name + "/Line Height";
      let lhVar = findVar(lhPath);
      if (!lhVar) {
        lhVar = figma.variables.createVariable(lhPath, collection, "FLOAT");
        localVariables.push(lhVar);
      }
      lhVar.setValueForMode(desktopModeId, Math.round(s.lineHeight * s.size));
      lhVar.setValueForMode(mobileModeId, s.mobileLineHeightPx);
      lhVar.scopes = ['LINE_HEIGHT'];

      const lsPath = s.name + "/Letter Spacing";
      let lsVar = findVar(lsPath);
      if (!lsVar) {
        lsVar = figma.variables.createVariable(lsPath, collection, "FLOAT");
        localVariables.push(lsVar);
      }
      lsVar.setValueForMode(desktopModeId, s.letterSpacing * 100);
      lsVar.setValueForMode(mobileModeId, s.letterSpacing * 100);
      lsVar.scopes = ['LETTER_SPACING'];
    } catch (e) {
      console.warn("Error syncing typography variables for " + s.name + ":", e);
    }
  }

  // 3. Styles
  const weightMap = {
    100: ['Thin', 'Light'], 200: ['ExtraLight', 'Light'], 300: ['Light', 'Regular'],
    400: ['Regular', 'Normal'], 500: ['Medium', 'Regular'], 600: ['SemiBold', 'Bold'],
    700: ['Bold', 'Heavy'], 800: ['ExtraBold', 'Black'], 900: ['Black', 'Heavy']
  };

  for (const s of TYPOGRAPHY_DATA) {
    try {
      let style = localTextStyles.find(x => x.name === s.name);
      if (!style) {
        style = figma.createTextStyle();
        style.name = s.name;
        localTextStyles.push(style);
      }

      const stylesToTry = [...(weightMap[s.weight] || []), s.style, 'Regular'];
      let loaded = false;
      let fontLoadErrors = [];
      for (const fontStyle of stylesToTry) {
        try {
          await figma.loadFontAsync({ family: s.family, style: fontStyle });
          style.fontName = { family: s.family, style: fontStyle };
          loaded = true;
          break;
        } catch (e) {
          fontLoadErrors.push(fontStyle + ": " + e.message);
        }
      }

      if (loaded) {
        style.fontSize = s.size;
        style.lineHeight = { unit: 'PIXELS', value: Math.round(s.lineHeight * s.size) };
        style.letterSpacing = { value: s.letterSpacing * 100, unit: 'PERCENT' };
      } else {
        console.warn("Failed to load any font styles for " + s.name + " (" + s.family + "). Errors: " + fontLoadErrors.join("; "));
      }
    } catch (e) {
      console.warn("Error syncing typography style " + s.name + ":", e);
    }
  }
}\n\n`;
    }

    if (selectedTools.includes('dimensions') && dimensionsSystem) {
      const semanticDimData = dimensionsSystem.semantics.map(s => {
        let val = 0;
        if (s.type === 'spacing') {
          val = (s.value as number) * dimensionsSystem.spacing.baseValue;
        } else {
          const step = dimensionsSystem.radius.steps.find(r => r.id === s.value);
          val = step?.value || 0;
        }
        return { name: `Semantics/${s.category}/${s.name}`, value: val };
      });

      const allDimData = [
        ...dimensionsSystem.spacing.scale.map(s => {
          const name = dimensionsSystem.spacing.scaleNames?.[s] || `${s}`;
          return { name: `Spacing/Scale ${name}`, value: s * dimensionsSystem.spacing.baseValue };
        }),
        ...dimensionsSystem.radius.steps.map(s => ({ name: `Radius/${s.name}`, value: s.value })),
        ...semanticDimData
      ];

      script += `async function createDimensions() {
  const data = ${JSON.stringify(allDimData, null, 2)};
  console.log("-> Syncing Dimensions...");
  
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = localCollections.find(c => c.name === "Dimensions");
  if (!collection) {
    collection = figma.variables.createVariableCollection("Dimensions");
  }

  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, "Value");

  const localVariables = await figma.variables.getLocalVariablesAsync();

  for (const item of data) {
    let v = localVariables.find(x => x.name === item.name && x.variableCollectionId === collection.id);
    if (!v) {
      v = figma.variables.createVariable(item.name, collection, "FLOAT");
      localVariables.push(v);
    }
    v.setValueForMode(modeId, item.value);
  }
}\n\n`;
    }

    // Phase 2: Binding
    if (selectedTools.includes('colors')) {
      script += `async function bindColors(primitivesMap) {
  console.log("-> Syncing Color Modes (Semantics)...");
  const variableMap = {};
  
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = localCollections.find(c => c.name === "Color Modes");
  if (!collection) {
    collection = figma.variables.createVariableCollection("Color Modes");
  }

  const lightModeId = collection.modes[0].modeId;
  collection.renameMode(lightModeId, "Light");
  
  let darkModeId;
  if (collection.modes.length > 1) {
    darkModeId = collection.modes[1].modeId;
    collection.renameMode(darkModeId, "Dark");
  } else {
    darkModeId = collection.addMode("Dark");
  }

  const primitivesColl = localCollections.find(c => c.name === "Primitives");
  const localVariables = await figma.variables.getLocalVariablesAsync();

  for (const item of SEMANTICS_DATA) {
    let v = localVariables.find(x => x.name === item.name && x.variableCollectionId === collection.id);
    if (!v) {
      v = figma.variables.createVariable(item.name, collection, "COLOR");
      localVariables.push(v);
    }

    const lightPrim = (primitivesMap && primitivesMap[item.lightAliasPath]) || 
                     localVariables.find(p => p.name === item.lightAliasPath && p.variableCollectionId === primitivesColl?.id);
    
    const darkPrim = (primitivesMap && primitivesMap[item.darkAliasPath]) || 
                     localVariables.find(p => p.name === item.darkAliasPath && p.variableCollectionId === primitivesColl?.id);

    if (lightPrim) v.setValueForMode(lightModeId, { type: "VARIABLE_ALIAS", id: lightPrim.id });
    if (darkPrim) v.setValueForMode(darkModeId, { type: "VARIABLE_ALIAS", id: darkPrim.id });
    v.scopes = ["ALL_FILLS"];
    variableMap[item.name] = v;
  }
  return { collection, data: SEMANTICS_DATA, variableMap };
}\n\n`;
    }

    if (selectedTools.includes('typography')) {
      script += `async function bindTypography() {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const typoCollection = localCollections.find(c => c.name === "Spectra Typography");
  const fontsCollection = localCollections.find(c => c.name === "Fonts");
  if (!typoCollection || !fontsCollection) return console.warn("❌ Typography collections not found!");

  const variables = await figma.variables.getLocalVariablesAsync();
  const styles = await figma.getLocalTextStylesAsync();

  function findVariable(path, collectionId) {
    return variables.find(v => v.name === path && v.variableCollectionId === collectionId);
  }

  for (const style of styles) {
    const name = style.name;
    const familyName = name.split('/')[0];
    
    const sizeVar = findVariable(\`\${name}/Size\`, typoCollection.id);
    const lineVar = findVariable(\`\${name}/Line Height\`, typoCollection.id);
    const spacingVar = findVariable(\`\${name}/Letter Spacing\`, typoCollection.id);
    const familyVar = findVariable(\`Font Family/\${familyName}\`, fontsCollection.id);
    
    if (sizeVar) style.setBoundVariable("fontSize", sizeVar);
    if (lineVar) style.setBoundVariable("lineHeight", lineVar);
    if (spacingVar) style.setBoundVariable("letterSpacing", spacingVar);
    try {
      if (familyVar) style.setBoundVariable("fontFamily", familyVar);
    } catch(e) {
      console.warn("Could not bind fontFamily for text style " + name + ":", e);
    }
  }
}\n\n`;
    }

    // Phase 4: Layout Generation
    script += `async function generateLayout(colorResults, primitivesMap) {
  console.log("-> Generating Documentation Layouts...");
  
  // Find collections directly from Figma for maximum accuracy
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const colorModesCollection = allCollections.find(c => c.name === "Color Modes") || colorResults?.collection;
  const semanticMap = colorResults?.variableMap || {};
  
  const modes = colorModesCollection?.modes || [];
  const lightModeId = modes.find(m => m.name.toLowerCase().includes("light"))?.modeId || (modes.length > 0 ? modes[0].modeId : null);
  const darkModeId = modes.find(m => m.name.toLowerCase().includes("dark"))?.modeId || (modes.length > 1 ? modes[1].modeId : null);

  console.log("-> Modes detected:", modes.map(m => m.name).join(", "));
  console.log("-> Targeting Light Mode:", lightModeId);
  console.log("-> Targeting Dark Mode:", darkModeId);

  const INTER_REGULAR = { family: "Inter", style: "Regular" };
  const INTER_BOLD = { family: "Inter", style: "Bold" };
  const INTER_BLACK = { family: "Inter", style: "Black" };
  const JETBRAINS = { family: "JetBrains Mono", style: "Medium" };
  
  async function safeLoadFont(font) {
    if (!font) return false;
    try {
      await figma.loadFontAsync(font);
      return true;
    } catch (e) {
      return false;
    }
  }

  await Promise.all([
    safeLoadFont(INTER_REGULAR),
    safeLoadFont(INTER_BOLD),
    safeLoadFont(INTER_BLACK),
    safeLoadFont(JETBRAINS)
  ]);

  async function robustSetFont(node, font) {
    if (!node || !font) return;
    try {
      await figma.loadFontAsync(font);
      node.fontName = font;
    } catch (e) {
      try {
        await figma.loadFontAsync(INTER_REGULAR);
        node.fontName = INTER_REGULAR;
      } catch (e2) {}
    }
  }

  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return { r: 1, g: 1, b: 1 };
    const h = hex.startsWith('#') ? hex.slice(1) : hex;
    if (h.length !== 6) return { r: 1, g: 1, b: 1 };
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255
    };
  }

  const margin = 80;
  let framesToZoom = [];

  function createDocFrame(name, titleText, subtitleText) {
    const frame = figma.createFrame();
    frame.name = name;
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "AUTO"; 
    frame.counterAxisSizingMode = "AUTO";
    frame.paddingTop = 100;
    frame.paddingBottom = 100;
    frame.paddingLeft = margin;
    frame.paddingRight = margin;
    frame.itemSpacing = 40;
    figma.currentPage.appendChild(frame);

    const title = figma.createText();
    robustSetFont(title, INTER_BLACK);
    title.characters = titleText || "";
    title.fontSize = 48;
    frame.appendChild(title);

    const subtitle = figma.createText();
    robustSetFont(subtitle, INTER_BOLD);
    subtitle.characters = subtitleText || "";
    subtitle.fontSize = 32;
    subtitle.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.45 } }];
    subtitle.letterSpacing = { value: 15, unit: 'PERCENT' };
    frame.appendChild(subtitle);

    return frame;
  }

  // --- 01. COLOR SYSTEM FRAME ---
  if (colorResults && colorResults.data) {
    try {
      const colorFrame = createDocFrame("Spectra — Color System", "COLOR SYSTEM", "DESIGN SYSTEM PRIMITIVES & SEMANTIC TOKENS");
      framesToZoom.push(colorFrame);
      
      // PRIMITIVES
      const primSection = figma.createFrame();
      primSection.name = "Section: Primitives";
      primSection.layoutMode = "VERTICAL";
      primSection.itemSpacing = 32;
      primSection.primaryAxisSizingMode = "AUTO";
      primSection.counterAxisSizingMode = "AUTO";
      primSection.fills = [];
      colorFrame.appendChild(primSection);

      const primLabel = figma.createText();
      robustSetFont(primLabel, INTER_BOLD);
      primLabel.characters = "PRIMITIVE SCALES";
      primLabel.fontSize = 24;
      primLabel.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
      primSection.appendChild(primLabel);

      for (const sys of PRIMITIVES_DATA) {
        const sysRow = figma.createFrame();
        sysRow.name = "Scale: " + (sys.systemName || "Unnamed");
        sysRow.layoutMode = "VERTICAL";
        sysRow.itemSpacing = 20;
        sysRow.paddingTop = 32; sysRow.paddingBottom = 32; sysRow.paddingLeft = 32; sysRow.paddingRight = 32;
        sysRow.cornerRadius = 24;
        sysRow.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
        sysRow.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
        sysRow.primaryAxisSizingMode = "AUTO";
        sysRow.counterAxisSizingMode = "AUTO";
        primSection.appendChild(sysRow);

        const sysName = figma.createText();
        robustSetFont(sysName, INTER_BOLD);
        sysName.characters = sys.systemName || "Unnamed Scale";
        sysName.fontSize = 16;
        sysRow.appendChild(sysName);

        const swatchesRow = figma.createFrame();
        swatchesRow.name = "Swatches Group";
        swatchesRow.layoutMode = "HORIZONTAL";
        swatchesRow.itemSpacing = 12;
        swatchesRow.fills = [];
        sysRow.appendChild(swatchesRow);

        const steps = sys.steps || [];
        for (const step of steps) {
          const swatchCol = figma.createFrame();
          swatchCol.name = "Swatch " + (step.id || "");
          swatchCol.layoutMode = "VERTICAL";
          swatchCol.itemSpacing = 4;
          swatchCol.primaryAxisSizingMode = "AUTO";
          swatchCol.counterAxisSizingMode = "AUTO";
          swatchCol.fills = [];
          swatchesRow.appendChild(swatchCol);

          const swatchRect = figma.createRectangle();
          swatchRect.resize(80, 60);
          swatchRect.cornerRadius = 12;
          swatchRect.fills = [{ type: 'SOLID', color: { r: step.rgba.r, g: step.rgba.g, b: step.rgba.b } }];
          
          const pVar = primitivesMap && step.name && primitivesMap[step.name];
          if (pVar) {
            try {
              swatchRect.fills = [figma.variables.setBoundVariableForPaint(swatchRect.fills[0], 'color', pVar)];
            } catch (e) {
              console.warn("Binding primitive paint variable failed for " + step.name, e);
            }
          }
          swatchCol.appendChild(swatchRect);

          const stepId = figma.createText();
          robustSetFont(stepId, JETBRAINS);
          stepId.characters = (step.id || "").toString();
          stepId.fontSize = 12;
          stepId.fills = [{ type: 'SOLID', color: hexToRgb("#373737") }];
          swatchCol.appendChild(stepId);

          const hexText = figma.createText();
          robustSetFont(hexText, JETBRAINS);
          hexText.characters = (step.hex || "").toUpperCase();
          hexText.fontSize = 12;
          hexText.fills = [{ type: 'SOLID', color: hexToRgb("#525252") }];
          swatchCol.appendChild(hexText);
        }
      }

      // SEMANTICS
      const semSection = figma.createFrame();
      semSection.name = "Section: Semantics";
      semSection.layoutMode = "VERTICAL";
      semSection.itemSpacing = 48;
      semSection.primaryAxisSizingMode = "AUTO";
      semSection.counterAxisSizingMode = "AUTO";
      semSection.fills = [];
      colorFrame.appendChild(semSection);

      const semLabel = figma.createText();
      robustSetFont(semLabel, INTER_BOLD);
      semLabel.characters = "SEMANTIC SYSTEM MAPPINGS";
      semLabel.fontSize = 24;
      semLabel.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
      semSection.appendChild(semLabel);

      const allData = colorResults.data || [];
      const categories = [...new Set(allData.map(d => d.category).filter(Boolean))];
      for (const cat of categories) {
        const catGroup = figma.createFrame();
        catGroup.name = "Category: " + cat;
        catGroup.layoutMode = "VERTICAL";
        catGroup.primaryAxisSizingMode = "AUTO";
        catGroup.counterAxisSizingMode = "AUTO";
        catGroup.fills = [];
        semSection.appendChild(catGroup);

        const catTitle = figma.createText();
        robustSetFont(catTitle, INTER_BLACK);
        catTitle.characters = cat.toUpperCase();
        catTitle.fontSize = 20;
        catTitle.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 1 } }];
        catGroup.appendChild(catTitle);

        const spacer = figma.createFrame();
        spacer.name = "Category Spacer";
        spacer.resize(1, 16);
        catGroup.appendChild(spacer);

        const catTokens = allData.filter(d => d.category === cat);
        catTokens.forEach((token, idx) => {
          const semanticVar = semanticMap[token.name];

          const row = figma.createFrame();
          row.name = "Token Row: " + (token.name || "Unnamed");
          row.layoutMode = "HORIZONTAL";
          row.primaryAxisSizingMode = "AUTO";
          row.counterAxisSizingMode = "AUTO";
          row.paddingLeft = 24; row.paddingRight = 24; row.paddingTop = 16; row.paddingBottom = 16;
          row.fills = idx % 2 === 0 ? [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }] : [];
          row.counterAxisAlignItems = "CENTER";
          catGroup.appendChild(row);

          const nameText = figma.createText();
          robustSetFont(nameText, INTER_BOLD);
          nameText.characters = (token.name || "").split('/')[1] || token.name || "Unnamed";
          nameText.fontSize = 13;
          nameText.resize(300, 20);
          row.appendChild(nameText);

          // Light mapping
          const lightCol = figma.createFrame();
          lightCol.name = "Mapping: Light Mode";
          lightCol.layoutMode = "HORIZONTAL";
          lightCol.itemSpacing = 12;
          lightCol.resize(350, 64);
          lightCol.primaryAxisSizingMode = "FIXED";
          lightCol.counterAxisSizingMode = "AUTO";
          lightCol.counterAxisAlignItems = "CENTER";
          lightCol.fills = [];
          
          if (colorModesCollection && lightModeId) {
            lightCol.setExplicitVariableModeForCollection(colorModesCollection, lightModeId);
          }
          row.appendChild(lightCol);
          
          const lSwatch = figma.createRectangle();
          lSwatch.name = "Light Swatch";
          lSwatch.resize(48, 48);
          lSwatch.cornerRadius = 8;
          
          if (semanticVar) {
            try {
              const paint = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };
              lSwatch.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', semanticVar)];
            } catch (e) {
              console.warn("Binding failed for Light: " + token.name, e);
              lSwatch.fills = [{ type: 'SOLID', color: hexToRgb(token.lightHex) }];
            }
          } else {
            lSwatch.fills = [{ type: 'SOLID', color: hexToRgb(token.lightHex) }];
          }
          lightCol.appendChild(lSwatch);

          const lText = figma.createText();
          robustSetFont(lText, INTER_BOLD);
          lText.characters = (token.lightLabel || "") + " — " + (token.lightHex || "");
          lText.fontSize = 11;
          lText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
          lightCol.appendChild(lText);

          // Dark mapping
          const darkCol = figma.createFrame();
          darkCol.name = "Mapping: Dark Mode";
          darkCol.layoutMode = "HORIZONTAL";
          darkCol.itemSpacing = 12;
          darkCol.resize(350, 64);
          darkCol.primaryAxisSizingMode = "FIXED";
          darkCol.counterAxisSizingMode = "AUTO";
          darkCol.counterAxisAlignItems = "CENTER";
          darkCol.fills = [];
          
          if (colorModesCollection && darkModeId) {
            darkCol.setExplicitVariableModeForCollection(colorModesCollection, darkModeId);
          }
          row.appendChild(darkCol);
          
          const dSwatch = figma.createRectangle();
          dSwatch.name = "Dark Swatch";
          dSwatch.resize(48, 48);
          dSwatch.cornerRadius = 8;
          
          if (semanticVar) {
            try {
              const paint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
              dSwatch.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', semanticVar)];
            } catch (e) {
              console.warn("Binding failed for Dark: " + token.name, e);
              dSwatch.fills = [{ type: 'SOLID', color: hexToRgb(token.darkHex) }];
            }
          } else {
            dSwatch.fills = [{ type: 'SOLID', color: hexToRgb(token.darkHex) }];
          }
          darkCol.appendChild(dSwatch);

          const dText = figma.createText();
          robustSetFont(dText, INTER_BOLD);
          dText.characters = (token.darkLabel || "") + " — " + (token.darkHex || "");
          dText.fontSize = 11;
          dText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
          darkCol.appendChild(dText);
        });
      }
    } catch (e) { console.error("Error in color frame generation:", e); }
  }

  // TYPOGRAPHY FRAME (Dynamic snippet using async endpoints)
  ${selectedTools.includes('typography') ? `
  try {
    const typoFrame = createDocFrame("Spectra — Typography System", "TYPOGRAPHY SYSTEM", "VISUAL HIERARCHY & TEXT STYLES");
    if (framesToZoom.length > 0) {
      typoFrame.x = framesToZoom[framesToZoom.length - 1].x + framesToZoom[framesToZoom.length - 1].width + 200;
    }
    framesToZoom.push(typoFrame);

    const styles = await figma.getLocalTextStylesAsync();
    const sortedStyles = [...styles].sort((a, b) => b.fontSize - a.fontSize);
    
    for (const style of sortedStyles) {
      const row = figma.createFrame();
      row.name = "Typography Step: " + style.name;
      row.layoutMode = "VERTICAL";
      row.itemSpacing = 16;
      row.paddingTop = 24; row.paddingBottom = 24;
      row.primaryAxisSizingMode = "AUTO";
      row.counterAxisSizingMode = "AUTO";
      row.fills = [];
      typoFrame.appendChild(row);

      const info = figma.createText();
      robustSetFont(info, JETBRAINS);
      const lhText = style.lineHeight.unit === 'PIXELS' ? Math.round(style.lineHeight.value) + 'px' : style.lineHeight.unit;
      const lsValue = style.letterSpacing.value || 0;
      const lsText = style.letterSpacing.unit === 'PERCENT' ? Math.round(lsValue) + '%' : Math.round(lsValue) + 'px';
      info.characters = style.name.toUpperCase() + "  —  SIZE: " + style.fontSize + "px  |  LH: " + lhText + "  |  LS: " + lsText;
      info.fontSize = 12;
      info.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 1 } }];
      row.appendChild(info);

      const sample = figma.createText();
      await figma.loadFontAsync(style.fontName);
      await sample.setTextStyleIdAsync(style.id);
      sample.characters = "The quick brown fox jumps over the lazy dog";
      sample.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      row.appendChild(sample);
    }
  } catch (e) { console.error("Error in typography frame generation:", e); }
  ` : ''}

  ${selectedTools.includes('dimensions') ? `
  try {
    const dimFrame = createDocFrame("Spectra — Dimensions & Spacing", "GEOMETRIC FOUNDATION", "SPATIAL RHYTHM & CORNER CURVATURE");
    if (framesToZoom.length > 0) {
      dimFrame.x = framesToZoom[framesToZoom.length - 1].x + framesToZoom[framesToZoom.length - 1].width + 200;
    }
    framesToZoom.push(dimFrame);

    const dimCollection = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === "Dimensions");
    if (dimCollection) {
      const vars = (await figma.variables.getLocalVariablesAsync()).filter(v => v.variableCollectionId === dimCollection.id);
      
      for (const v of vars) {
        const row = figma.createFrame();
        row.name = "Dimension: " + v.name;
        row.layoutMode = "HORIZONTAL";
        row.primaryAxisSizingMode = "FIXED";
        row.counterAxisSizingMode = "AUTO";
        row.layoutAlign = "STRETCH";
        row.itemSpacing = 24;
        row.paddingTop = 16; row.paddingBottom = 16;
        row.fills = [];
        dimFrame.appendChild(row);

        const info = figma.createText();
        robustSetFont(info, JETBRAINS);
        const val = v.valuesByMode[Object.keys(v.valuesByMode)[0]];
        info.characters = v.name.toUpperCase() + "  —  " + val + "px";
        info.fontSize = 11;
        info.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        row.appendChild(info);

        if (v.name.includes("Spacing")) {
          const viz = figma.createRectangle();
          viz.resize(Math.min(val, 64), 12);
          viz.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 1 } }];
          viz.opacity = 0.5;
          row.appendChild(viz);
        } else {
          const viz = figma.createFrame();
          viz.resize(32, 32); 
          viz.cornerRadius = Math.min(val, 16); 
          viz.strokes = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 1 } }];
          viz.strokeWeight = 2;
          viz.fills = [];
          row.appendChild(viz);
        }
      }
    }
  } catch (e) { console.error("Error in dimensions frame generation:", e); }
  ` : ''}

  if (framesToZoom.length > 0) figma.viewport.scrollAndZoomIntoView(framesToZoom);
}\n\n`;

    script += `console.log("-> Starting generation...");\n\n`;

    if (selectedTools.includes('colors')) {
      script += `const primResults = await createColorPrimitives();\n`;
      script += `const colorResults = await bindColors(primResults?.variableMap);\n\n`;
    } else {
      script += `const primResults = null;\n`;
      script += `const colorResults = null;\n\n`;
    }

    if (selectedTools.includes('typography')) {
      script += `await syncTypography();\n`;
      script += `await bindTypography();\n\n`;
    }

    if (selectedTools.includes('dimensions') && dimensionsSystem) {
      script += `await createDimensions();\n\n`;
    }

    script += `await generateLayout(colorResults, primResults?.variableMap);\n\n`;
    script += `console.log("-----------------------------------------");\n`;
    script += `console.log("DONE: Spectra Design System Synchronized");\n`;
    script += `console.log("Find the generated Documentation frame on your current page.");\n`;
    script += `console.log("-----------------------------------------");\n`;

    return script;
  };

  const generateTailwind = () => {
    let css = `:root {\n`;
    
    if (selectedTools.includes('colors')) {
      css += `  /* Colors */\n`;
      palette.systems.forEach(sys => {
        sys.steps.forEach(step => css += `  --color-${sys.type.toLowerCase()}-${step.id}: ${step.hex};\n`);
      });
      css += `\n`;
    }

    if (selectedTools.includes('typography')) {
      css += `  /* Typography Foundations */\n`;
      typographySystem.fontSystems.forEach(f => {
        css += `  --font-${f.id}: "${f.family}";\n`;
      });
      css += `\n`;
    }

    if (selectedTools.includes('dimensions') && dimensionsSystem) {
      css += `  /* Spacing Scale */\n`;
      dimensionsSystem.spacing.scale.forEach(s => {
        const name = dimensionsSystem.spacing.scaleNames?.[s] || `${s}`;
        css += `  --space-${name}: ${s * dimensionsSystem.spacing.baseValue}px;\n`;
      });
      
      css += `\n  /* Radius Scale */\n`;
      dimensionsSystem.radius.steps.forEach(s => {
        css += `  --radius-${s.id}: ${s.value}${s.isFull ? '' : 'px'};\n`;
      });

      css += `\n  /* Semantic Tokens */\n`;
      dimensionsSystem.semantics.forEach(s => {
        let val = 0;
        if (s.type === 'spacing') {
          val = (s.value as number) * dimensionsSystem.spacing.baseValue;
        } else {
          val = dimensionsSystem.radius.steps.find(r => r.id === s.value)?.value || 0;
        }
        css += `  --${s.id}: ${val}px; /* ${s.name} */\n`;
      });
    }

    css += `}\n`;
    return css;
  };

  const generateJson = () => JSON.stringify({ 
    colors: selectedTools.includes('colors') ? palette : undefined, 
    typography: selectedTools.includes('typography') ? typographySystem : undefined,
    dimensions: selectedTools.includes('dimensions') ? dimensionsSystem : undefined
  }, null, 2);

  const getCode = () => {
    if (view === 'json') return generateJson();
    if (view === 'tailwind') return generateTailwind();
    return generateCombinedScript();
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(getCode());
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-black/95 backdrop-blur-2xl' : 'bg-black/0 backdrop-blur-0 pointer-events-none'}`}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-zinc-900 w-full max-w-xl h-[640px] rounded-[2.5rem] border border-zinc-800 flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="p-8 pb-3 flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Export Assets</h2>
          </div>
          <button onClick={handleClose} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all border border-zinc-700/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 px-8 py-4 space-y-6 flex flex-col min-h-0">
          {/* Controls Bar: Checkboxes + Dev Mode Switch */}
          <div className="flex items-center justify-between px-1 shrink-0 pb-1 border-b border-zinc-800/20">
            {/* Tool Selector - COMPACT & DIRECT */}
            <div className="flex gap-6">
              <button 
                onClick={() => toggleTool('colors')}
                className={`flex items-center gap-2.5 transition-all ${selectedTools.includes('colors') ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-500'}`}
              >
                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${selectedTools.includes('colors') ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'border-zinc-800'}`}>
                  {selectedTools.includes('colors') && <Check className="w-3 h-3 text-white" strokeWidth={5} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Colors</span>
              </button>
              <button 
                onClick={() => toggleTool('typography')}
                className={`flex items-center gap-2.5 transition-all ${selectedTools.includes('typography') ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-500'}`}
              >
                 <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${selectedTools.includes('typography') ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'border-zinc-800'}`}>
                  {selectedTools.includes('typography') && <Check className="w-3 h-3 text-white" strokeWidth={5} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Typography</span>
              </button>
              <button 
                disabled={true}
                className="flex items-center gap-2.5 opacity-40 cursor-not-allowed select-none"
                title="Coming Soon"
              >
                 <div className="w-4 h-4 rounded-md border-2 border-zinc-800 flex items-center justify-center">
                  {/* Disabled Checkbox */}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-650 flex items-center gap-1.5">
                  Dimensions
                  <span className="text-[7px] font-black tracking-normal px-1 py-0.5 bg-zinc-950 text-zinc-500 rounded border border-zinc-900 leading-none">Soon</span>
                </span>
              </button>
            </div>

            {/* Dev Mode Toggle */}
            <div className="flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Dev Mode</span>
              <button 
                onClick={() => setIsDevMode(!isDevMode)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all flex items-center ${isDevMode ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-zinc-800'}`}
              >
                <motion.div 
                  animate={{ x: isDevMode ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>

          {!isDevMode ? (
            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide pr-2 -mr-2">
              <div className="grid grid-cols-3 gap-3">
                {selectedTools.includes('colors') ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-2xl bg-zinc-800/20 border border-zinc-850 flex items-center gap-2.5 hover:border-zinc-800/80 transition-all cursor-default"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
                      <PaletteIcon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white leading-none truncate">{totalColors}</div>
                      <div className="text-[8px] font-black text-zinc-500 uppercase tracking-wide mt-1">Colors</div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-3 rounded-2xl bg-zinc-900/20 border border-zinc-900/50 flex items-center justify-center text-zinc-700 text-[8px] font-black uppercase tracking-wider">
                    Colors Excluded
                  </div>
                )}
                
                {selectedTools.includes('typography') ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-2xl bg-zinc-800/20 border border-zinc-850 flex items-center gap-2.5 hover:border-zinc-800/80 transition-all cursor-default"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
                      <Type className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white leading-none truncate">{totalTypography}</div>
                      <div className="text-[8px] font-black text-zinc-500 uppercase tracking-wide mt-1">Styles</div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-3 rounded-2xl bg-zinc-900/20 border border-zinc-900/50 flex items-center justify-center text-zinc-700 text-[8px] font-black uppercase tracking-wider">
                    Styles Excluded
                  </div>
                )}

                {selectedTools.includes('dimensions') ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-2xl bg-zinc-800/20 border border-zinc-850 flex items-center gap-2.5 hover:border-zinc-800/80 transition-all cursor-default"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
                      <Ruler className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white leading-none truncate">{totalDimensions}</div>
                      <div className="text-[8px] font-black text-zinc-500 uppercase tracking-wide mt-1">Tokens</div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-3 rounded-2xl bg-zinc-900/20 border border-zinc-900/50 flex items-center justify-center text-zinc-700 text-[8px] font-black uppercase tracking-wider">
                    Tokens Excluded
                  </div>
                )}
              </div>

              {/* Figma Custom Integration Pipeline */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-zinc-800/20 to-zinc-950/40 border border-zinc-800/60 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-[0.25em] text-indigo-400 uppercase">Figma Integration Pipeline</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[8px] font-bold uppercase">v2.0 plugin</div>
                </div>

                <div className="space-y-4 text-left">
                  {/* Step 1 */}
                  <div className="flex gap-3.5 group">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all cursor-default scale-100 group-hover:scale-105">
                        1
                      </div>
                      <div className="w-px h-full bg-gradient-to-b from-indigo-500/30 to-rose-500/30 my-1 min-h-[20px]" />
                    </div>
                    <div className="flex-1 space-y-1 pb-1">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Copy Generation Script</h4>
                      <p className="text-[9.5px] text-zinc-400 leading-relaxed font-medium">
                        Click the primary button below to copy the custom automation blueprint. It generates semantic variables instantly on paste.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3.5 group">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[10px] font-black text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all cursor-default scale-100 group-hover:scale-105">
                        2
                      </div>
                      <div className="w-px h-full bg-gradient-to-b from-rose-500/30 to-emerald-500/30 my-1 min-h-[20px]" />
                    </div>
                    <div className="flex-1 space-y-2 pb-1">
                      <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-wider">
                          Open <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent font-black font-sans">Design with Spectra</span>
                        </h4>
                        <p className="text-[9.5px] text-zinc-400 leading-relaxed font-medium mt-0.5">
                          Launch our customized layout and style pipeline companion directly in figma.
                        </p>
                      </div>

                      <div>
                        <a 
                          href="https://www.figma.com/community/plugin/1631384418836907020/design-with-spectra"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 via-pink-400/10 to-indigo-500/10 border border-pink-500/20 hover:border-pink-500/50 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-pink-300 hover:text-white transition-all duration-300 hover:shadow-[0_8px_20px_rgba(236,72,153,0.15)] group-hover:scale-[1.01]"
                        >
                          {/* Custom Figma Icon */}
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 32 32" fill="currentColor">
                            <path d="M12 2a4 4 0 00-4 4v2a4 4 0 004 4h2V8h-2a2 2 0 110-4h2V2h-2zm4 0h2a4 4 0 014 4v2a4 4 0 01-4 4h-2V8h2a2 2 0 100-4h-2V2zm4 8a4 4 0 014 4v2a4 4 0 11-8 0v-2a4 4 0 014-4zm-8 4v4a4 4 0 11-4-4h4zm4 0h2a4 4 0 11-4 4v-4z" />
                          </svg>
                          <span>Open Figma Plugin page</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" strokeWidth={3} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3.5 group">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all cursor-default scale-100 group-hover:scale-105">
                        3
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Paste & Run</h4>
                      <p className="text-[9.5px] text-zinc-400 leading-relaxed font-medium">
                        Paste the script into the plugin and hit run to automatically synthesize and build your design system models.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-zinc-800">
                  {(['scripter', 'tailwind', 'json'] as const).map(m => (
                    <button 
                      key={m}
                      onClick={() => setView(m)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${view === m ? 'bg-zinc-800 text-indigo-400 shadow-lg border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-400'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group flex-1 min-h-0">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button 
                    onClick={() => handleCopy(`dev-${view}`)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-zinc-700/50 ${copiedId === `dev-${view}` ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                  >
                    {copiedId === `dev-${view}` ? (
                      <>
                        <Check className="w-3 h-3" strokeWidth={4} />
                        Copied to clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-black/60 rounded-2xl p-8 font-mono text-[10px] text-indigo-300/80 border border-zinc-800/80 h-full overflow-auto scrollbar-hide shadow-inner ring-1 ring-white/5">
                  <pre className="whitespace-pre-wrap leading-relaxed">{getCode()}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Only visible in static view */}
        {!isDevMode && (
          <div className="p-8 pt-4 border-t border-zinc-800/50 flex flex-col gap-3">
            {view === 'scripter' ? (
              <Button 
                variant="primary"
                size="lg"
                onClick={() => handleCopy(`footer-${view}`)}
                className={`w-full rounded-xl transition-all border-none py-3 font-black uppercase tracking-widest text-[10px] ${copiedId === `footer-${view}` ? 'bg-white text-black' : 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5'}`}
                leftIcon={copiedId === `footer-${view}` ? <Check className="w-5 h-5" strokeWidth={4} /> : <Zap className="w-5 h-5" />}
              >
                {copiedId === `footer-${view}` ? 'Copied to clipboard' : 'Copy Spectra Plugin Script'}
              </Button>
            ) : (
              <Button 
                variant="primary"
                size="lg"
                onClick={() => handleCopy(`footer-${view}`)}
                className={`w-full rounded-xl transition-all border-none py-3 font-black uppercase tracking-widest text-[10px] ${copiedId === `footer-${view}` ? 'bg-white text-black' : 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)]'}`}
                leftIcon={copiedId === `footer-${view}` ? <Check className="w-5 h-5" strokeWidth={4} /> : <Copy className="w-5 h-5" strokeWidth={2} />}
              >
                {copiedId === `footer-${view}` ? 'Copied to clipboard' : `Copy ${view.toUpperCase()} Data`}
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UnifiedExportModal;
