import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, 
  Layers,
  Settings2, 
  Eye, 
  ChevronRight, 
  LayoutGrid,
  MoveHorizontal, 
  MoveVertical,
  AlignLeft, 
  Bold,
  ChevronDown, 
  ChevronUp,
  Download,
  Copy,
  Zap,
  Info,
  Trash2,
  AlertTriangle,
  Check,
  RotateCcw,
  Plus
} from 'lucide-react';
import { TypographyStep, TypographySystem, FontSystem, TypographySemanticToken, Palette } from '../types';
import { Button } from './Button';

import UnifiedExportModal from './UnifiedExportModal';

export const DEFAULT_STEPS: TypographyStep[] = [
  { id: 'xs', name: 'text-xs', fontSize: 12, lineHeight: 1.3333, letterSpacing: 0, fontWeight: 400 },
  { id: 'sm', name: 'text-sm', fontSize: 14, lineHeight: 1.4285, letterSpacing: 0, fontWeight: 400 },
  { id: 'base', name: 'text-base', fontSize: 16, lineHeight: 1.5, letterSpacing: 0, fontWeight: 400 },
  { id: 'lg', name: 'text-lg', fontSize: 18, lineHeight: 1.5555, letterSpacing: 0, fontWeight: 400 },
  { id: 'xl', name: 'text-xl', fontSize: 20, lineHeight: 1.4, letterSpacing: -0.01, fontWeight: 600 },
  { id: '2xl', name: 'text-2xl', fontSize: 24, lineHeight: 1.3333, letterSpacing: -0.015, fontWeight: 600 },
  { id: '3xl', name: 'text-3xl', fontSize: 30, lineHeight: 1.2, letterSpacing: -0.02, fontWeight: 700 },
  { id: '4xl', name: 'text-4xl', fontSize: 36, lineHeight: 1.1111, letterSpacing: -0.02, fontWeight: 700 },
  { id: '5xl', name: 'text-5xl', fontSize: 48, lineHeight: 1, letterSpacing: -0.025, fontWeight: 800 },
  { id: '6xl', name: 'text-6xl', fontSize: 60, lineHeight: 1, letterSpacing: -0.025, fontWeight: 800 },
  { id: '7xl', name: 'text-7xl', fontSize: 72, lineHeight: 1, letterSpacing: -0.03, fontWeight: 900 },
  { id: '8xl', name: 'text-8xl', fontSize: 96, lineHeight: 1, letterSpacing: -0.03, fontWeight: 900 },
  { id: '9xl', name: 'text-9xl', fontSize: 128, lineHeight: 1, letterSpacing: -0.04, fontWeight: 900 },
];

export const DEFAULT_SEMANTICS: TypographySemanticToken[] = [
  { id: 'h1', name: 'Page Title', category: 'Content', fontSystemId: 'default', stepId: '6xl' },
  { id: 'h2', name: 'Section Heading', category: 'Content', fontSystemId: 'default', stepId: '2xl' },
  { id: 'h3', name: 'Sub-heading', category: 'Content', fontSystemId: 'default', stepId: 'xl' },
  { id: 'body', name: 'Body Text', category: 'Content', fontSystemId: 'default', stepId: 'base' },
  { id: 'body-sm', name: 'Small Body', category: 'Content', fontSystemId: 'default', stepId: 'sm' },
  { id: 'quote', name: 'Blockquote', category: 'Content', fontSystemId: 'default', stepId: '2xl' },
  { id: 'tag', name: 'Article Tag', category: 'Content', fontSystemId: 'default', stepId: 'xs' },
  
  { id: 'nav-link', name: 'Navigation Link', category: 'Navigation', fontSystemId: 'default', stepId: 'sm' },
  { id: 'breadcrumb', name: 'Breadcrumb', category: 'Navigation', fontSystemId: 'default', stepId: 'xs' },
  { id: 'sidebar-title', name: 'Sidebar Title', category: 'Navigation', fontSystemId: 'default', stepId: 'xs' },
  
  { id: 'stat-label', name: 'Stat Label', category: 'UI', fontSystemId: 'default', stepId: 'xs' },
  { id: 'stat-value', name: 'Stat Value', category: 'UI', fontSystemId: 'default', stepId: '4xl' },
  { id: 'button', name: 'Button Text', category: 'UI', fontSystemId: 'default', stepId: 'base' },
  { id: 'status', name: 'Status Tag', category: 'UI', fontSystemId: 'default', stepId: 'xs' },
  { id: 'label', name: 'Field Label', category: 'UI', fontSystemId: 'default', stepId: 'xs' },
  { id: 'input', name: 'Input Value', category: 'UI', fontSystemId: 'default', stepId: 'sm' },
  
  { id: 'table-header', name: 'Table Header', category: 'Data', fontSystemId: 'default', stepId: 'xs' },
  { id: 'table-title', name: 'Item Title', category: 'Data', fontSystemId: 'default', stepId: 'xs' },
  { id: 'table-meta', name: 'Item Meta', category: 'Data', fontSystemId: 'default', stepId: 'xs' },
  { id: 'table-amount', name: 'Amount', category: 'Data', fontSystemId: 'default', stepId: 'xs' },

  { id: 'code-inline', name: 'Inline Code', category: 'Code', fontSystemId: 'default', stepId: 'xs' },
  { id: 'code-block', name: 'Code Block', category: 'Code', fontSystemId: 'default', stepId: 'xs' },
];

export const DEFAULT_SYSTEM: TypographySystem = {
  fontSystems: [
    {
      id: 'default',
      name: 'Primary Font',
      family: 'Inter',
      steps: [...DEFAULT_STEPS]
    }
  ],
  baseGrid: 4,
  isGridSnapped: false,
  baseRem: 16,
  scaleFactor: 1.25,
  isScaleSynced: false,
  responsiveScale: 0.85,
  isResponsiveEnabled: true,
  semantics: [...DEFAULT_SEMANTICS],
};

const syncScale = (steps: TypographyStep[], factor: number) => {
  const baseIndex = steps.findIndex(s => s.id === 'base');
  if (baseIndex === -1) return steps;
  const baseFontSize = steps[baseIndex].fontSize;
  
  return steps.map((step, index) => {
    const power = index - baseIndex;
    const newSize = Math.round(baseFontSize * Math.pow(factor, power));
    return { ...step, fontSize: newSize };
  });
};

const snapStepsToGrid = (steps: TypographyStep[], grid: number) => {
  return steps.map(step => {
    const rawHeight = step.fontSize * step.lineHeight;
    const snappedHeight = Math.max(grid, Math.round(rawHeight / grid) * grid);
    const newMultiplier = snappedHeight / step.fontSize;
    return { ...step, lineHeight: newMultiplier };
  });
};

const GOOGLE_FONTS_SANS = [
  'Inter', 'Geist', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Raleway', 'Ubuntu', 
  'Nunito', 'Work Sans', 'Quicksand', 'Mulish', 'Rubik', 'Outfit', 'Space Grotesk', 'Kanit', 'Heebo', 'Assistant'
];

const GOOGLE_FONTS_SERIF = [
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Crimson Text', 'Roboto Slab', 'Spectral', 'Newsreader', 
  'Baskervville', 'Fraunces', 'DM Serif Display', 'Cormorant Garamond', 'Libre Baskerville', 'EB Garamond'
];

const GOOGLE_FONTS_MONO = [
  'JetBrains Mono', 'Roboto Mono', 'Fira Code', 'Source Code Pro', 'Space Mono', 'IBM Plex Mono', 'Inconsolata',
  'Ubuntu Mono', 'Courier Prime', 'Anonymous Pro', 'Cousine', 'Overpass Mono'
];

// Combine all for searchability
const ALL_FONTS = Array.from(new Set([...GOOGLE_FONTS_SANS, ...GOOGLE_FONTS_SERIF, ...GOOGLE_FONTS_MONO, 'Abel', 'Abhaya Libre', 'Abril Fatface', 'Aclonica', 'Acme', 'Actor', 'Adamina', 'Advent Pro', 'Aguafina Script', 'Akaya Kanadaka', 'Akaya Telivigala', 'Akronim', 'Aladin', 'Alata', 'Alatsi', 'Aldrich', 'Alef', 'Alegreya', 'Alegreya Sans', 'Alegreya Sans SC', 'Alegreya SC', 'Aleo', 'Alex Brush', 'Alfa Slab One', 'Alice', 'Alike', 'Alike Angular', 'Allan', 'Allerta', 'Allerta Stencil', 'Allura', 'Almarai', 'Almendra', 'Almendra Display', 'Almendra SC', 'Amarante', 'Amaranth', 'Amatic SC', 'Amethysta', 'Amiko', 'Amiri', 'Amita', 'Anaheim', 'Andada Pro', 'Andika', 'Andika New Basic', 'Annie Use Your Telescope', 'Anonymous Pro', 'Antic', 'Antic Didone', 'Antic Slab', 'Anton', 'Antonio', 'Arapey', 'Arbutus', 'Arbutus Slab', 'Architects Daughter', 'Archivo', 'Archivo Black', 'Archivo Narrow', 'Are You Serious', 'Aref Ruqaa', 'Arima Madurai', 'Arimo', 'Arizonia', 'Armata', 'Arsenal', 'Artifika', 'Arvo', 'Arya', 'Asap', 'Asap Condensed', 'Asar', 'Asset', 'Assistant', 'Astloch', 'Asul', 'Athiti', 'Atma', 'Atomic Age', 'Aubrey', 'Audiowide', 'Autour One', 'Average', 'Average Sans', 'Averia Gruesa Libre', 'Averia Libre', 'Averia Sans Libre', 'Averia Serif Libre', 'Azeret Mono', 'B612', 'B612 Mono', 'Bad Script', 'Bahiana', 'Bahianita', 'Bai Jamjuree', 'Bakbak One', 'Ballet', 'Baloo 2', 'Baloo Bhai 2', 'Baloo Bhaijaan 2', 'Baloo Bhaina 2', 'Baloo Chettan 2', 'Baloo Da 2', 'Baloo Paaji 2', 'Baloo Tamma 2', 'Baloo Tammudu 2', 'Baloo Thambi 2', 'Balsamiq Sans', 'Balthazar', 'Bangers', 'Barlow', 'Barlow Condensed', 'Barlow Semi Condensed', 'Barriecito', 'Barrio', 'Basic', 'Baskervville', 'Battambang', 'Baumans', 'Bayon', 'Be Vietnam Pro', 'Bebas Neue', 'Belgrano', 'Bellefair', 'Belleza', 'Bellota', 'Bellota Text', 'BenchNine', 'Benne', 'Bentham', 'Berkshire Swash', 'Besley', 'Beth Ellen', 'Bevan', 'Big Shoulders Display', 'Big Shoulders Inline Display', 'Big Shoulders Inline Text', 'Big Shoulders Stencil Display', 'Big Shoulders Stencil Text', 'Big Shoulders Text', 'Bigelow Rules', 'Bigshot One', 'Bilbo', 'Bilbo Swash Caps', 'BioRhyme', 'BioRhyme Expanded', 'Birthstone', 'Birthstone Bounce', 'Biryani', 'Bitter', 'Black And White Picture', 'Black Han Sans', 'Black Ops One', 'Blinker', 'Bodoni Moda', 'Bokor', 'Bona Nova', 'Bonbon', 'Bonheur Royale', 'Boogaloo', 'Bowlby One', 'Bowlby One SC', 'Brawler', 'Bree Serif', 'Brygada 1918', 'Bubblegum Sans', 'Bubbler One', 'Buda', 'Buenard', 'Bungee', 'Bungee Hairline', 'Bungee Inline', 'Bungee Outline', 'Bungee Shade', 'Butcherman', 'Butterfly Kids', 'Cabin', 'Cabin Condensed', 'Cabin Sketch', 'Caesar Dressing', 'Cagliostro', 'Cairo', 'Caladea', 'Calistoga', 'Calligraffitti', 'Cambay', 'Cambo', 'Candal', 'Cantarell', 'Cantata One', 'Cantora One', 'Capriola', 'Caramel', 'Carrois Gothic', 'Carrois Gothic SC', 'Carter One', 'Castoro', 'Catamaran', 'Caudex', 'Caveat', 'Caveat Brush', 'Cedarville Cursive', 'Ceviche One', 'Chakra Petch', 'Chango', 'Charm', 'Charmonman', 'Chathura', 'Chau Philomene One', 'Chela One', 'Chelsea Market', 'Chenla', 'Cherish', 'Cherry Cream Soda', 'Cherry Swash', 'Chewy', 'Chicle', 'Chilanka', 'Chivo', 'Chonburi', 'Cinzel', 'Cinzel Decorative', 'Clicker Script', 'Coda', 'Coda Caption', 'Codystar', 'Coiny', 'Combo', 'Comfortaa', 'Comforter', 'Comforter Brush', 'Comic Neue', 'Coming Soon', 'Commissioner', 'Concert One', 'Condiment', 'Content', 'Contrail One', 'Convergence', 'Cookie', 'Copse', 'Corben', 'Corinthia', 'Cormorant', 'Cormorant Garamond', 'Cormorant Infant', 'Cormorant SC', 'Cormorant Unicase', 'Cormorant Upright', 'Courgette', 'Courier Prime', 'Cousine', 'Coustard', 'Covered By Your Grace', 'Crafty Girls', 'Creepster', 'Crete Round', 'Crimson Pro', 'Crimson Text', 'Croissant One', 'Crushed', 'Cuprum', 'Cute Font', 'Cutive', 'Cutive Mono', 'Damion', 'Dancing Script', 'Dangrek', 'Darker Grotesque', 'David Libre', 'Dawning of a New Day', 'Days One', 'Dekko', 'Delius', 'Delius Swash Caps', 'Delius Unicase', 'Della Respira', 'Denk One', 'Devonshire', 'Dhurjati', 'Didact Gothic', 'Diplomata', 'Diplomata SC', 'Do Hyeon', 'Dokdo', 'Domine', 'Donegal One', 'Doppio One', 'Dorsa', 'Dosis', 'DotGothic16', 'Dr Sugiyama', 'Duru Sans', 'Dynalight', 'EB Garamond', 'Eagle Lake', 'East Sea Dokdo', 'Eater', 'Economica', 'Eczar', 'El Messiri', 'Electrolize', 'Elsie', 'Elsie Swash Caps', 'Emblema One', 'Emilys Candy', 'Encode Sans', 'Encode Sans Condensed', 'Encode Sans Expanded', 'Encode Sans Semi Condensed', 'Encode Sans Semi Expanded', 'Engagement', 'Englebert', 'Enriqueta', 'Ephesis', 'Epilogue', 'Erica One', 'Esteban', 'Estonia', 'Euphoria Script', 'Ewert', 'Exo', 'Exo 2', 'Expletus Sans', 'Explora', 'Fahkwang', 'Fanwood Text', 'Farro', 'Farsan', 'Fascinate', 'Fascinate Inline', 'Faster One', 'Fasthand', 'Fauna One', 'Faustina', 'Federant', 'Federo', 'Felipa', 'Ffenick', 'Fiery', 'Fira Code', 'Fira Mono', 'Fira Sans', 'Fira Sans Condensed', 'Fira Sans Extra Condensed', 'Fjalla One', 'Fjord One', 'Flamenco', 'Flavors', 'Fleur De Leah', 'Flynn', 'Fondamento', 'Fontdiner Swanky', 'Forum', 'Francois One', 'Frank Ruhl Libre', 'Fraunces', 'Freckle Face', 'Fredericka the Great', 'Fredoka One', 'Freehand', 'Fresca', 'Frijole', 'Fruktur', 'Fugaz One', 'Fuggles', 'Fuzzy Bubbles', 'Gafata', 'Galada', 'Galdeano', 'Galindo', 'Gamja Flower', 'Gayathri', 'Gelasio', 'Gemunu Libre', 'Genos', 'Gentium Basic', 'Gentium Book Basic', 'Geo', 'Georama', 'Geostar', 'Geostar Fill', 'Germania One', 'Gidugu', 'Gilda Display', 'Girassol', 'Give You Glory', 'Glass Antiqua', 'Glegoo', 'Gloria Hallelujah', 'Glory', 'Gluten', 'Goblin One', 'Gochi Hand', 'Goldman', 'Gorditas', 'Gothic A1', 'Goudy Bookletter 1911', 'Gowun Batang', 'Gowun Dodum', 'Graduate', 'Grand Hotel', 'Grandstander', 'Grape Nuts', 'Gravitas One', 'Great Vibes', 'Grechen Fuemen', 'Grenze', 'Grenze Gotisch', 'Grey Qo', 'Griffy', 'Gruppo', 'Gudea', 'Gugi', 'Gulzar', 'Gupter', 'Gurajada', 'Gwendolyn', 'Habibi', 'Hachi Maru Pop', 'Hahmlet', 'Halant', 'Hammersmith One', 'Hanalei', 'Hanalei Fill', 'Handlee', 'Hanuman', 'Happy Monkey', 'Harmattan', 'Headland One', 'Heebo', 'Henny Penny', 'Hepta Slab', 'Herr Von Muellerhoff', 'Hi Melody', 'Hina Mincho', 'Hind', 'Hind Guntur', 'Hind Madurai', 'Hind Siliguri', 'Hind Vadodara', 'Holtwood One SC', 'Homemade Apple', 'Homenaje', 'Hubballi', 'Hurricane', 'IBM Plex Mono', 'IBM Plex Sans', 'IBM Plex Sans Arabic', 'IBM Plex Sans Condensed', 'IBM Plex Sans Devanagari', 'IBM Plex Sans Ethiopic', 'IBM Plex Sans Hebrew', 'IBM Plex Sans JP', 'IBM Plex Sans KR', 'IBM Plex Sans Thai', 'IBM Plex Sans Thai Looped', 'IBM Plex Serif', 'IM Fell Double Pica', 'IM Fell Double Pica SC', 'IM Fell English', 'IM Fell English SC', 'IM Fell French Canon', 'IM Fell French Canon SC', 'IM Fell Great Primer', 'IM Fell Great Primer SC', 'Ibarra Real Nova', 'Iceberg', 'Iceland', 'Imcrement', 'Imprima', 'Inconsolata', 'Inder', 'Indie Flower', 'Indie Flower', 'Inika', 'Inknut Antiqua', 'Inria Sans', 'Inria Serif', 'Inter', 'Inter Tight', 'Island Moments', 'Istok Web', 'Italiana', 'Italianno', 'Itim', 'Jacques Francois', 'Jacques Francois Shadow', 'Jaldi', 'JetBrains Mono', 'Jim Nightshade', 'Joan', 'Jockey One', 'Jolly Lodger', 'Jomhuria', 'Jomolhari', 'Josefin Sans', 'Josefin Slab', 'Jost', 'Joti One', 'Jua', 'Judson', 'Julee', 'Julius Sans One', 'Junge', 'Jura', 'Just Another Hand', 'Just Me Again Down Under', 'Kalam', 'Kameron', 'Kanit', 'Kantumruy', 'Karantina', 'Karla', 'Karma', 'Katibeh', 'Kaushan Script', 'Kavivanar', 'Kavoon', 'Kdam Thmor', 'Keania One', 'Kelly Slab', 'Kenia', 'Khand', 'Khmer', 'Khula', 'Kings', 'Kirang Haerang', 'Kite One', 'Kiwi Maru', 'Klee One', 'Knewave', 'KoHo', 'Kodchasan', 'Koh Santepheap', 'Kolker Brush', 'Kosugi', 'Kosugi Maru', 'Kotta One', 'Koulen', 'Kranky', 'Kreon', 'Kristi', 'Krona One', 'Krub', 'Kufam', 'Kulim Park', 'Kumar One', 'Kumar One Outline', 'Kumbh Sans', 'Kurale', 'La Belle Aurore', 'Lacquer', 'Laila', 'Lakki Reddy', 'Lalezar', 'Lancelot', 'Lante', 'Lanzarote', 'Lateef', 'Lato', 'Lavishly Yours', 'League Gothic', 'League Script', 'League Spartan', 'Leckerli One', 'Ledger', 'Lekton', 'Lemon', 'Lemonada', 'Lexend', 'Lexend Deca', 'Lexend Exa', 'Lexend Giga', 'Lexend Mega', 'Lexend Peta', 'Lexend Tera', 'Lexend Zetta', 'Libre Barcode 128', 'Libre Barcode 128 Text', 'Libre Barcode 39', 'Libre Barcode 39 Extended', 'Libre Barcode 39 Extended Text', 'Libre Barcode 39 Text', 'Libre Baskerville', 'Libre Caslon Display', 'Libre Caslon Text', 'Libre Franklin', 'Licorice', 'Life Savers', 'Lilita One', 'Lily Script One', 'Limelight', 'Linden Hill', 'Literata', 'Liu Jian Mao Cao', 'Livvic', 'Lobster', 'Lobster Two', 'Londrina Outline', 'Londrina Shadow', 'Londrina Sketch', 'Londrina Solid', 'Lora', 'Love Light', 'Love Ya Like A Sister', 'Loved by the King', 'Lovers Quarrel', 'Luckiest Guy', 'Lusitana', 'Lustria', 'Luxurious Roman', 'Luxurious Script', 'M PLUS 1', 'M PLUS 1 Code', 'M PLUS 1p', 'M PLUS 2', 'M PLUS Rounded 1c', 'Ma Shan Zheng', 'Macondo', 'Macondo Swash Caps', 'Mada', 'Madora', 'Madrone', 'Mafi', 'Magra', 'Maiden Orange', 'Maitree', 'Major Mono Display', 'Mako', 'Mali', 'Mallanna', 'Mandali', 'Manjari', 'Manrope', 'Mansalva', 'Manuale', 'Marcellus', 'Marcellus SC', 'Marck Script', 'Margarine', 'Meie Script', 'Meow Script', 'Merienda', 'Merienda One', 'Merriweather', 'Merriweather Sans', 'Metal', 'Metal Mania', 'Metamorphous', 'Metrophobic', 'Michroma', 'Milonga', 'Miltonian', 'Miltonian Tattoo', 'Mina', 'Miniver', 'Miriam Libre', 'Mirza', 'Miss Fajardose', 'Mitr', 'Mochiy Pop One', 'Mochiy Pop P One', 'Modak', 'Modern Antiqua', 'Mogra', 'Molengo', 'Molle', 'Monda', 'Monofett', 'Monoton', 'Monsieur La Doulaise', 'Montaga', 'Montez', 'Montserrat', 'Montserrat Alternates', 'Montserrat Subrayada', 'Moul', 'Moulpali', 'Mountains of Christmas', 'Mouse Memoirs', 'Mr Bedfort', 'Mr Dafoe', 'Mr De Haviland', 'Mr Giotto', 'Mr Megola', 'Mr Saint Delafield', 'Mrs Sheppards', 'Ms Madi', 'Mukta', 'Mukta Mahee', 'Mukta Malar', 'Mukta Vaani', 'Muli', 'Mulish', 'Murecho', 'MuseoModerno', 'My Soul', 'Mystery Quest', 'NTR', 'Nanum Brush Script', 'Nanum Gothic', 'Nanum Gothic Coding', 'Nanum Myeongjo', 'Nanum Pen Script', 'Navua', 'Neucha', 'Neuropol', 'News Cycle', 'Newsreader', 'Niconne', 'Niramit', 'Nobile', 'Nokora', 'Norican', 'Nosifer', 'Notable', 'Nothing You Could Do', 'Noticia Text', 'Noto Sans', 'Noto Sans Display', 'Noto Sans Mono', 'Noto Sans SC', 'Noto Serif', 'Noto Serif Display', 'Nova Cut', 'Nova Flat', 'Nova Mono', 'Nova Oval', 'Nova Round', 'Nova Script', 'Nova Slim', 'Nova Square', 'Numans', 'Nunito', 'Nunito Sans', 'Odibee Sans', 'Odor Mean Chey', 'Offside', 'Oi', 'Old Standard TT', 'Oldenburg', 'Ole', 'Oleo Script', 'Oleo Script Swash Caps', 'Open Sans', 'Open Sans Condensed', 'Oranienbaum', 'Orbitron', 'Oregano', 'Oregano', 'Oswald', 'Outfit', 'Over the Rainbow', 'Overlock', 'Overlock SC', 'Overpass', 'Overpass Mono', 'Ovo', 'Oxanium', 'Oxygen', 'Oxygen Mono', 'PT Mono', 'PT Sans', 'PT Sans Caption', 'PT Sans Narrow', 'PT Serif', 'PT Serif Caption', 'Pacifico', 'Padauk', 'Palanquin', 'Palanquin Dark', 'Pangolin', 'Papas', 'Paprika', 'Parisienne', 'Passero One', 'Passion One', 'Passions Conflict', 'Pathway Gothic One', 'Patrick Hand', 'Patrick Hand SC', 'Pattaya', 'Patua One', 'Pavanam', 'Paytone One', 'Peddana', 'Peralta', 'Permanent Marker', 'Petemoss', 'Petit Formal Script', 'Petrona', 'Philosopher', 'Piazzolla', 'Piedra', 'Pinyon Script', 'Pirata One', 'Plaster', 'Play', 'Playball', 'Playfair Display', 'Playfair Display SC', 'Plus Jakarta Sans', 'Podkova', 'Poiret One', 'Poller One', 'Poly', 'Pompiere', 'Pontano Sans', 'Poor Story', 'Poppins', 'Port Lligat Sans', 'Port Lligat Slab', 'Potta One', 'Prata', 'Preahvihear', 'Press Start 2P', 'Pridi', 'Princess Sofia', 'Prociono', 'Prompt', 'Prosto One', 'Proza Libre', 'Public Sans', 'Puppert', 'Puritan', 'Purple Purse', 'Qahiri', 'Quattrocento', 'Quattrocento Sans', 'Questrial', 'Quicksand', 'Quintessential', 'Qwigley', 'Racing Sans One', 'Radley', 'Rajdhani', 'Rakkas', 'Raleway', 'Raleway Dots', 'Ramabhadra', 'Ramaraja', 'Rambla', 'Ramneek', 'Ranchers', 'Rancho', 'Ranga', 'Rasa', 'Rationale', 'Ravi Prakash', 'Readex Pro', 'Recursive', 'Red Hat Display', 'Red Hat Mono', 'Red Hat Text', 'Red Rose', 'Redressed', 'Reem Kufi', 'Reenie Beanie', 'Revalia', 'Rhodium Libre', 'Ribeye', 'Ribeye Marrow', 'Righteous', 'Risque', 'Road Rage', 'Roboto', 'Roboto Condensed', 'Roboto Mono', 'Roboto Slab', 'Rochester', 'Rock Salt', 'Rokkitt', 'Romanesco', 'Ropa Sans', 'Rosario', 'Rosarivo', 'Rouge Script', 'Rowdies', 'Rozha One', 'Rubik', 'Rubik Beastly', 'Rubik Mono One', 'Ruda', 'Rufina', 'Ruge Boogie', 'Ruluko', 'Rum Raisin', 'Ruslan Display', 'Russo One', 'Ruthie', 'Rye', 'Sacramento', 'Sahitya', 'Sail', 'Saira', 'Saira Condensed', 'Saira Extra Condensed', 'Saira Semi Condensed', 'Saira Stencil One', 'Sajak', 'Salsa', 'Sanchez', 'Sancreek', 'Sansita', 'Sansita Swashed', 'Sarabun', 'Sarala', 'Sarina', 'Sarpanch', 'Satis', 'Satisfy', 'Savage', 'Sawarabi Gothic', 'Sawarabi Mincho', 'Scada', 'Scheherazade', 'Scheherazade New', 'Schoolbell', 'Scope One', 'Seaweed Script', 'Secular One', 'Sedgwick Ave', 'Sedgwick Ave Display', 'Sen', 'Sevillana', 'Seymour One', 'Shadows Into Light', 'Shadows Into Light Two', 'Shalimar', 'Shanti', 'Share', 'Share Tech', 'Share Tech Mono', 'Shojumaru', 'Short Stack', 'Shrikhand', 'Siemreap', 'Sigmar One', 'Signika', 'Signika Negative', 'Simonetta', 'Sintony', 'Sirin Stencil', 'Six Caps', 'Skranji', 'Slabo 13px', 'Slabo 27px', 'Slackey', 'Smokum', 'Smooch', 'Smooch Sans', 'Smythe', 'Sniglet', 'Snippet', 'Snowburst One', 'Sofadi One', 'Sofia', 'Solway', 'Song Myung', 'Sonsie One', 'Sora', 'Sorts Mill Goudy', 'Source Code Pro', 'Source Sans 3', 'Source Sans Pro', 'Source Serif 4', 'Source Serif Pro', 'Space Grotesk', 'Space Mono', 'Special Elite', 'Spectral', 'Spectral SC', 'Spicy Rice', 'Spinnaker', 'Spirax', 'Squada One', 'Sree Krushnadevaraya', 'Sriracha', 'Srisakdi', 'Staatliches', 'Stalemate', 'Stalinist One', 'Stardos Stencil', 'Statitorio', 'Stay Classy', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Stoke', 'Strait', 'Style Script', 'Stylogic', 'Sue Ellen Francisco', 'Suez One', 'Sulphur Point', 'Sumana', 'Sunflower', 'Sunshiney', 'Supermercado One', 'Sura', 'Suranna', 'Suravaram', 'Suwannaphum', 'Swanky and Moo Moo', 'Syncopate', 'Syne', 'Syne Tactile', 'Tai Heritage Pro', 'Tajawal', 'Tangerine', 'Taprom', 'Tauri', 'Taviraj', 'Teko', 'Telex', 'Tenali Ramakrishna', 'Tenor Sans', 'Text Me One', 'Texturina', 'Thasadith', 'The Girl Next Door', 'The Nautigal', 'Tienne', 'Tilla', 'Tillana', 'Timmana', 'Tinos', 'Tira', 'Titan One', 'Titillium Web', 'Tomorrow', 'Tourney', 'Trade Winds', 'Trirong', 'Trispace', 'Trocchi', 'Trochut', 'Trykker', 'Tulpen One', 'Turret Road', 'Ubuntu', 'Ubuntu Condensed', 'Ubuntu Mono', 'Uchen', 'Ultra', 'Uncial Antiqua', 'Underlock', 'UnifrakturCook', 'UnifrakturMaguntia', 'Unkempt', 'Unlock', 'Unna', 'Updock', 'Urbanist', 'VT323', 'Vampiro One', 'Varela', 'Varela Round', 'Varta', 'Vast Shadow', 'Vesper Libre', 'Viaoda Libre', 'Vibur', 'Vidaloka', 'Viga', 'Voces', 'Volkhov', 'Vollkorn', 'Vollkorn SC', 'Voltaire', 'Voudou', 'Waiting for the Sunrise', 'Wallpoet', 'Walter Turncoat', 'Warnes', 'Water Brush', 'Waterfall', 'Wellfleet', 'Wendy One', 'Whisper', 'WindSong', 'Wire One', 'Work Sans', 'Xanh Mono', 'Yaldevi', 'Yanone Kaffeesatz', 'Yantramanav', 'Yatra One', 'Yellowtail', 'Yeon Sung', 'Yeseva One', 'Yesteryear', 'Yomogi', 'Young Serif', 'Yusei Magic', 'ZCOOL KuaiLe', 'ZCOOL QingKe HuangYou', 'ZCOOL XiaoWei', 'Zen Antique', 'Zen Antique Soft', 'Zen Dots', 'Zen Kaku Gothic Antique', 'Zen Kaku Gothic New', 'Zen Loop', 'Zen Maru Gothic', 'Zen Old Mincho', 'Zen Tokyo Zoo', 'Zeyada', 'Zhi Mang Xing', 'Zilla Slab', 'Zilla Slab Highlight'])).sort();

const SearchableFontPicker: React.FC<{
  label: string;
  value: string;
  suggestions: string[];
  onChange: (val: string) => void;
}> = ({ label, value, suggestions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = ALL_FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()) && !suggestions.includes(f));
  const displaySuggestions = suggestions.filter(f => f.toLowerCase().includes(search.toLowerCase()));

  // On-demand font loading for previews
  useEffect(() => {
    if (!isOpen) return;
    const fontsToLoad = [...displaySuggestions, ...filtered.slice(0, 100)];
    const linkId = 'google-fonts-previews';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const fontStr = fontsToLoad.map(f => f.replace(/ /g, '+')).join('&family=');
    link.href = `https://fonts.googleapis.com/css2?family=${fontStr}&display=swap`;
  }, [isOpen, search]);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">{label}</label>}
      <div 
        className={`w-full bg-zinc-900 border ${isOpen ? 'border-indigo-500' : 'border-zinc-800'} rounded-xl px-4 py-2.5 text-sm transition-all font-medium text-zinc-200 cursor-text flex items-center justify-between group`}
        onClick={() => setIsOpen(true)}
      >
        <input 
          type="text"
          value={isOpen ? search : value}
          placeholder={isOpen ? "Search fonts..." : value}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-zinc-500"
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 flex flex-col"
          >
            <div className="overflow-y-auto flex-1 p-2">
              {displaySuggestions.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-500">Suggested</div>
                  {displaySuggestions.map(font => (
                    <button
                      key={font}
                      onClick={() => {
                        onChange(font);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-between group"
                    >
                      <span style={{ fontFamily: font }}>{font}</span>
                      {value === font && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                    </button>
                  ))}
                </div>
              )}
              
              <div>
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-500">Other Google Fonts</div>
                {filtered.length > 0 ? (
                  filtered.slice(0, 1000).map(font => (
                    <button
                      key={font}
                      onClick={() => {
                        onChange(font);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span style={{ fontFamily: font }}>{font}</span>
                      {value === font && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                    </button>
                  ))
                ) : search && displaySuggestions.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <p className="text-xs text-zinc-500 italic">No fonts found</p>
                    <button 
                      onClick={() => {
                        onChange(search);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300"
                    >
                      Add Custom: {search}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TypographyToolProps {
  onBack: () => void;
  system: TypographySystem;
  setSystem: React.Dispatch<React.SetStateAction<TypographySystem>>;
  palette: Palette;
}

interface TypeSpecContextType {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  baseRem: number;
}

const TypeSpecContext = React.createContext<TypeSpecContextType | null>(null);

const TypeSpecWrapper: React.FC<{ 
  children: React.ReactNode; 
  step: TypographyStep | undefined; 
  family: string;
  font: string;
  className?: string;
  position?: 'top' | 'bottom';
}> = ({ children, step, family, font, className = "", position = 'top' }) => {
  const context = React.useContext(TypeSpecContext);
  const id = React.useId();
  if (!context || !step || !children) return <>{children}</>;

  const { hoveredId, setHoveredId, baseRem } = context;
  const isHovered = hoveredId === id;

  return (
    <div 
      className={`relative group/type-spec ${className}`}
      onMouseEnter={() => setHoveredId(id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            className={`absolute left-1/2 -translate-x-1/2 z-[9999] pointer-events-none ${position === 'top' ? '-top-3 -translate-y-full' : '-bottom-3 translate-y-full'}`}
          >
            <div className="flex flex-col gap-2 p-3 rounded-2xl shadow-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md min-w-[200px]">
              <div className="flex items-center justify-between gap-4 border-b border-zinc-800/50 pb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-400">{family} • {font}</span>
                <span className="text-[9px] font-mono text-zinc-500">{step.name}</span>
              </div>
              
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center gap-8">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Font Size</span>
                  <span className="text-[10px] font-mono text-zinc-200">{step.fontSize}px <span className="text-zinc-600">/</span> {(step.fontSize / baseRem).toFixed(3)}rem</span>
                </div>
                <div className="flex justify-between items-center gap-8">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Line Height</span>
                  <span className="text-[10px] font-mono text-zinc-200">{(step.fontSize * step.lineHeight).toFixed(0)}px <span className="text-zinc-600">/</span> {step.lineHeight.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center gap-8">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Tracking</span>
                  <span className="text-[10px] font-mono text-zinc-200">{step.letterSpacing}em</span>
                </div>
                <div className="flex justify-between items-center gap-8">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Weight</span>
                  <span className="text-[10px] font-mono text-zinc-200">{step.fontWeight}</span>
                </div>
              </div>
            </div>
            <div className={`w-2.5 h-2.5 rotate-45 absolute left-1/2 -translate-x-1/2 border-r border-b border-zinc-800 bg-zinc-950/95 ${position === 'top' ? '-bottom-1.5' : '-top-1.5 rotate-[225deg]'}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FigmaLogo = () => (
  <svg 
    className="w-4 h-4 flex-shrink-0 style={{ overflow: 'visible' }}" 
    viewBox="0 0 38 67" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 0C8.5 0 0 8.5 0 19C0 24.5 2.5 29.5 6.5 32.5C2.5 35.5 0 40.5 0 46C0 56.5 8.5 65 19 65C29.5 65 38 56.5 38 46V19C38 8.5 29.5 0 19 0Z" fill="white" fillOpacity="0.01"/>
    <path d="M9.5 28.5C14.7467 28.5 19 24.2467 19 19C19 13.7533 14.7467 9.5 9.5 9.5C4.25329 9.5 0 13.7533 0 19C0 24.2467 4.25329 28.5 9.5 28.5Z" fill="#F24E1E"/>
    <path d="M28.5 28.5C33.7467 28.5 38 24.2467 38 19C38 13.7533 33.7467 9.5 28.5 9.5C23.2533 9.5 19 13.7533 19 19C19 24.2467 23.2533 28.5 28.5 28.5Z" fill="#FF7262"/>
    <path d="M9.5 47.5C14.7467 47.5 19 43.2467 19 38C19 32.7533 14.7467 28.5 9.5 28.5C4.25329 28.5 0 32.7533 0 38C0 43.2467 4.25329 47.5 9.5 47.5Z" fill="#1ABCFE"/>
    <path d="M9.5 66.5C14.7467 66.5 19 62.2533 19 57V47.5H9.5C4.25329 47.5 0 51.7467 0 57C0 62.2533 4.25329 66.5 9.5 66.5Z" fill="#0ACF83"/>
    <path d="M28.5 47.5C33.7467 47.5 38 43.2467 38 38C38 32.7533 33.7467 28.5 28.5 28.5C23.2533 28.5 19 32.7533 19 38C19 43.2467 23.2533 47.5 28.5 47.5Z" fill="#A259FF"/>
  </svg>
);

const SemanticTypographyRow: React.FC<{
  token: TypographySemanticToken;
  fontSystems: FontSystem[];
  onUpdate: (id: string, updates: Partial<TypographySemanticToken>) => void;
}> = ({ token, fontSystems, onUpdate }) => {
  const currentFS = fontSystems.find(fs => fs.id === token.fontSystemId) || fontSystems[0];
  
  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200">{token.name}</span>
        <span className="text-[9px] font-mono text-zinc-600 uppercase">{token.id}</span>
      </div>
      
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <select 
            value={token.fontSystemId}
            onChange={(e) => onUpdate(token.id, { fontSystemId: e.target.value })}
            className="w-full h-8 bg-zinc-950 border border-zinc-800 text-[9px] font-bold uppercase tracking-widest px-2 pr-6 rounded-lg outline-none appearance-none cursor-pointer text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            {fontSystems.map(fs => (
              <option key={fs.id} value={fs.id}>{fs.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-zinc-600 pointer-events-none" />
        </div>
        
        <div className="relative w-20">
          <select 
            value={token.stepId}
            onChange={(e) => onUpdate(token.id, { stepId: e.target.value })}
            className="w-full h-8 bg-zinc-950 border border-zinc-800 text-[9px] font-mono px-2 pr-6 rounded-lg outline-none appearance-none cursor-pointer text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-center"
          >
            {currentFS.steps.map(step => (
              <option key={step.id} value={step.id}>{step.id}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-zinc-600 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

const TypographyTool: React.FC<TypographyToolProps> = ({ onBack, system, setSystem, palette }) => {
  const [viewMode, setViewMode] = useState<'scales' | 'live'>('scales');
  const [activeFontSystemId, setActiveFontSystemId] = useState<string>(system.fontSystems[0]?.id || 'default');
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [hoveredTypeId, setHoveredTypeId] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [dontAskAgainChecked, setDontAskAgainChecked] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Add Step State
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepData, setNewStepData] = useState<Partial<TypographyStep>>({
    name: '',
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 400
  });

  useEffect(() => {
    const currentExists = system.fontSystems.some(s => s.id === activeFontSystemId);
    if (!currentExists && system.fontSystems.length > 0) {
      setActiveFontSystemId(system.fontSystems[0].id);
    }
  }, [system.fontSystems, activeFontSystemId]);

  const currentFontSystem = system.fontSystems.find(s => s.id === activeFontSystemId) || system.fontSystems[0];
  const currentSteps = currentFontSystem?.steps || [];

  const resolveSemantic = (tokenId: string) => {
    const semantic = system.semantics.find(s => s.id === tokenId);
    if (!semantic) return { fontSystem: system.fontSystems[0], step: system.fontSystems[0].steps[0] };
    const fontSystem = system.fontSystems.find(fs => fs.id === semantic.fontSystemId) || system.fontSystems[0];
    const step = fontSystem.steps.find(st => st.id === semantic.stepId) || fontSystem.steps[0];
    return { fontSystem, step };
  };

  const getStep = (fsId: string, stepId: string) => {
    const fs = system.fontSystems.find(s => s.id === fsId) || system.fontSystems[0];
    return fs.steps.find(s => s.id === stepId) || fs.steps[0];
  };

  const primaryFS = system.fontSystems[0] || { id: 'default', name: 'Primary', family: 'Inter', steps: DEFAULT_STEPS };
  const secondaryFS = system.fontSystems[1] || primaryFS;
  const monoFS = system.fontSystems.find(fs => fs.family.toLowerCase().includes('mono')) || system.fontSystems[2] || primaryFS;
  
  const setSteps = (fontSystemId: string, newSteps: TypographyStep[]) => {
    setSystem(prev => ({
      ...prev,
      fontSystems: prev.fontSystems.map(s => s.id === fontSystemId ? { ...s, steps: newSteps } : s)
    }));
  };

  // Dynamic Font Loading
  React.useEffect(() => {
    const fonts = system.fontSystems.map(s => s.family).filter(Boolean);
    if (fonts.length === 0) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.replace(/ /g, '+')).join('&family=')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [system.fontSystems]);

  // Handle Scale Syncing
  React.useEffect(() => {
    if (system.isScaleSynced) {
      setSystem(prev => {
        const nextFontSystems = prev.fontSystems.map(fs => ({
          ...fs,
          steps: syncScale(fs.steps, prev.scaleFactor)
        }));
        
        // Prevent infinite loop by checking if values actually changed
        if (JSON.stringify(nextFontSystems) === JSON.stringify(prev.fontSystems)) {
          return prev;
        }

        return {
          ...prev,
          fontSystems: nextFontSystems
        };
      });
    }
  }, [system.isScaleSynced, system.scaleFactor]);

  // Handle Grid Snapping
  React.useEffect(() => {
    if (system.isGridSnapped) {
      setSystem(prev => {
        const nextFontSystems = prev.fontSystems.map(fs => ({
          ...fs,
          steps: snapStepsToGrid(fs.steps, prev.baseGrid)
        }));

        if (JSON.stringify(nextFontSystems) === JSON.stringify(prev.fontSystems)) {
          return prev;
        }

        return {
          ...prev,
          fontSystems: nextFontSystems
        };
      });
    }
  }, [system.baseGrid, system.isGridSnapped]);

  const resetScale = () => {
    setSystem(prev => {
      const fsIndex = prev.fontSystems.findIndex(fs => fs.id === activeFontSystemId);
      if (fsIndex === -1) return prev;

      const fs = prev.fontSystems[fsIndex];
      const newSteps = fs.steps.map(step => {
        const defaultStep = DEFAULT_STEPS.find(d => d.id === step.id);
        return defaultStep ? { ...step, fontSize: defaultStep.fontSize } : step;
      });

      const defaultName = activeFontSystemId === 'default' 
        ? 'Primary Font' 
        : `Font System ${fsIndex + 1}`;

      return {
        ...prev,
        fontSystems: prev.fontSystems.map(s => 
          s.id === activeFontSystemId 
            ? { ...s, steps: newSteps, name: defaultName } 
            : s
        ),
        isScaleSynced: false
      };
    });
  };

  const resetGrid = () => {
    const newSteps = currentSteps.map(step => {
      const defaultStep = DEFAULT_STEPS.find(d => d.id === step.id);
      return defaultStep ? { ...step, lineHeight: defaultStep.lineHeight } : step;
    });
    setSteps(activeFontSystemId, newSteps);
    setSystem(prev => ({ ...prev, isGridSnapped: false }));
  };

  const resetFullScale = () => {
    setIsResetConfirmOpen(false);
    
    setSystem(prev => {
      const fsIndex = prev.fontSystems.findIndex(fs => fs.id === activeFontSystemId);
      const defaultName = activeFontSystemId === 'default' 
        ? 'Primary Font' 
        : `Font System ${fsIndex + 1}`;

      return { 
        ...prev, 
        fontSystems: prev.fontSystems.map(fs => 
          fs.id === activeFontSystemId 
            ? { ...fs, steps: JSON.parse(JSON.stringify(DEFAULT_STEPS)), name: defaultName } 
            : fs
        ),
        isScaleSynced: false,
        isGridSnapped: false
      };
    });
  };

  const syncAllFamilies = () => {
    setSystem(prev => {
      const sourceSystem = prev.fontSystems.find(s => s.id === activeFontSystemId) || prev.fontSystems[0];
      const sourceSteps = sourceSystem.steps;
      return {
        ...prev,
        fontSystems: prev.fontSystems.map(fs => ({
          ...fs,
          steps: JSON.parse(JSON.stringify(sourceSteps))
        }))
      };
    });
  };

  const [copyState, setCopyState] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [exportState, setExportState] = React.useState<'idle' | 'success'>('idle');

  const handleCopyToFigma = async () => {
    setCopyState('idle');
    
    // Generate SVG for Figma
    const width = 1200;
    const headerHeight = 160;
    const padding = 60;
    const rowHeight = 80;
    const families = system.fontSystems.map(fs => ({
      name: fs.name,
      font: fs.family,
      steps: fs.steps
    }));

    let totalHeight = headerHeight + padding;
    families.forEach(f => {
      totalHeight += 60; // Family header
      totalHeight += f.steps.length * rowHeight;
      totalHeight += 40; // Spacer
    });

    let svg = `<?xml version="1.0" encoding="UTF-8"?>`;
    svg += `<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${width}" height="${totalHeight}" fill="#FFFFFF" />`;
    
    // Header
    svg += `<text x="60" y="80" fill="#09090B" font-family="Inter, sans-serif" font-size="32" font-weight="900">TYPOGRAPHY SYSTEM</text>`;
    svg += `<text x="60" y="110" fill="#71717A" font-family="Inter, sans-serif" font-size="12" font-weight="700" letter-spacing="0.1em">SPECTRA CORE • DESIGN TOKENS</text>`;
    svg += `<rect x="60" y="130" width="${width - 120}" height="1" fill="#E4E4E7" />`;

    let currentY = headerHeight + 20;

    families.forEach(family => {
      svg += `<text x="60" y="${currentY}" fill="#6366F1" font-family="Inter, sans-serif" font-size="11" font-weight="900" letter-spacing="0.25em" text-transform="uppercase">${family.name.toUpperCase()} — ${family.font}</text>`;
      svg += `<rect x="60" y="${currentY + 15}" width="${width - 120}" height="1" fill="#F4F4F5" />`;
      currentY += 60;

      family.steps.forEach(step => {
        const capName = step.name.toUpperCase();
        svg += `<g id="${family.name}_${step.id}">`;
        svg += `<text x="60" y="${currentY + 30}" fill="#A1A1AA" font-family="JetBrains Mono, monospace" font-size="10" font-weight="500">${step.id}</text>`;
        svg += `<text x="120" y="${currentY + 30}" fill="#71717A" font-family="Inter, sans-serif" font-size="10" font-weight="800" letter-spacing="0.05em">${capName}</text>`;
        svg += `<text x="320" y="${currentY + 35}" fill="#09090B" font-family="${family.font}, sans-serif" font-size="${step.fontSize}" font-weight="${step.fontWeight}" style="line-height: ${step.lineHeight}; letter-spacing: ${step.letterSpacing}em;">The quick brown fox jumps over the lazy dog</text>`;
        
        // Metadata
        const meta = `${step.fontSize}px / ${Math.round(step.fontSize * step.lineHeight)}px — ${step.fontWeight}`;
        svg += `<text x="${width - 60}" y="${currentY + 30}" fill="#A1A1AA" font-family="JetBrains Mono, monospace" font-size="10" font-weight="500" text-anchor="end">${meta}</text>`;
        svg += `</g>`;
        currentY += rowHeight;
      });
      currentY += 40;
    });

    svg += `</svg>`;

    try {
      await navigator.clipboard.writeText(svg);
      setCopyState('success');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      console.error("Failed to copy SVG:", err);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(system, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spectra-typography-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExportState('success');
    setTimeout(() => setExportState('idle'), 2000);
  };

  const [editorUnits, setEditorUnits] = useState({
    fontSize: 'px',
    lineHeight: 'px',
    letterSpacing: 'px'
  });

  const updateStep = (id: string, updates: Partial<TypographyStep>) => {
    let finalUpdates = { ...updates };
    
    // Applying Snap logic if enabled
    if (system.isGridSnapped && (updates.lineHeight !== undefined || updates.fontSize !== undefined)) {
       const step = currentSteps.find(s => s.id === id);
       if (step) {
          const fontSize = updates.fontSize !== undefined ? updates.fontSize : step.fontSize;
          const lineHeight = updates.lineHeight !== undefined ? updates.lineHeight : step.lineHeight;
          const rawHeight = fontSize * lineHeight;
          const snappedHeight = Math.max(system.baseGrid, Math.round(rawHeight / system.baseGrid) * system.baseGrid);
          finalUpdates.lineHeight = snappedHeight / fontSize;
       }
    }

    const newSteps = currentSteps.map(s => s.id === id ? { ...s, ...finalUpdates } : s);
    setSteps(activeFontSystemId, newSteps);
    
    // Auto-disable sync if user manually overrides a size
    if (updates.fontSize && system.isScaleSynced) {
      setSystem(prev => ({ ...prev, isScaleSynced: false }));
    }
  };

  const addStep = () => {
    const lastStep = currentSteps[currentSteps.length - 1];
    const suggestedSize = Math.round((lastStep?.fontSize || 16) * system.scaleFactor);
    setNewStepData({
      name: `text-${suggestedSize}`,
      fontSize: suggestedSize,
      lineHeight: lastStep?.lineHeight || 1.5,
      letterSpacing: lastStep?.letterSpacing || 0,
      fontWeight: lastStep?.fontWeight || 400
    });
    setIsAddingStep(true);
  };

  const confirmAddStep = () => {
    const stepId = newStepData.name?.replace('text-', '') || Math.random().toString(36).substr(2, 4);
    let fontSize = newStepData.fontSize || 16;
    let lineHeight = newStepData.lineHeight || 1.5;

    if (system.isGridSnapped) {
      const rawHeight = fontSize * lineHeight;
      const snappedHeight = Math.max(system.baseGrid, Math.round(rawHeight / system.baseGrid) * system.baseGrid);
      lineHeight = snappedHeight / fontSize;
    }

    const newStep: TypographyStep = {
      id: stepId,
      name: newStepData.name || `text-${fontSize}`,
      fontSize: fontSize,
      lineHeight: lineHeight,
      letterSpacing: newStepData.letterSpacing || 0,
      fontWeight: newStepData.fontWeight || 400
    };

    setSystem(prev => ({
      ...prev,
      fontSystems: prev.fontSystems.map(fs => ({
        ...fs,
        steps: [...fs.steps, newStep].sort((a, b) => a.fontSize - b.fontSize)
      }))
    }));
    
    setIsAddingStep(false);
  };

  const addFontSystem = () => {
    const id = `fs-${Date.now()}`;
    const newSystem: FontSystem = {
      id,
      name: `Font System ${system.fontSystems.length + 1}`,
      family: 'Inter',
      steps: [...DEFAULT_STEPS]
    };
    setSystem(prev => ({
      ...prev,
      fontSystems: [...prev.fontSystems, newSystem]
    }));
    setActiveFontSystemId(id);
  };

  const deleteFontSystem = (id: string) => {
    if (system.fontSystems.length <= 1) return;
    setSystem(prev => ({
      ...prev,
      fontSystems: prev.fontSystems.filter(s => s.id !== id)
    }));
  };

  const updateFontSystem = (id: string, updates: Partial<FontSystem>) => {
    setSystem(prev => ({
      ...prev,
      fontSystems: prev.fontSystems.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const updateSemantic = (tokenId: string, updates: Partial<TypographySemanticToken>) => {
    setSystem(prev => ({
      ...prev,
      semantics: prev.semantics.map(s => s.id === tokenId ? { ...s, ...updates } : s)
    }));
  };

  const removeStep = (id: string) => {
    if (skipDeleteConfirm) {
      setSteps(activeFontSystemId, currentSteps.filter(s => s.id !== id));
      return;
    }
    setStepToDelete(id);
  };

  const confirmDelete = () => {
    if (stepToDelete) {
      setSteps(activeFontSystemId, currentSteps.filter(s => s.id !== stepToDelete));
      if (dontAskAgainChecked) {
        setSkipDeleteConfirm(true);
      }
      setStepToDelete(null);
    }
  };

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-80 h-full border-r border-zinc-800 bg-zinc-950 flex flex-col z-30">
        {/* BRANDING SECTION */}
        <div className="px-4 py-5 border-b border-zinc-900 flex flex-col items-center relative">
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
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em] leading-tight mt-1 text-center">Design Systems, Solved</p>
        </div>

        <div className="p-4 flex items-center justify-between mt-2 px-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {viewMode === 'scales' ? 'Typography System' : 'Semantic Mapping'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-8">
          {viewMode === 'scales' ? (
            <>
              <section className="space-y-6">
                <div className="space-y-6">
                  {/* Active System Settings */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase px-1">System Name</label>
                      <input 
                        type="text"
                        value={currentFontSystem?.name || ''}
                        onChange={(e) => updateFontSystem(activeFontSystemId, { name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. Primary Sans"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Font Family</label>
                      </div>
                      <SearchableFontPicker 
                        label=""
                        value={currentFontSystem?.family || ''}
                        suggestions={[...GOOGLE_FONTS_SANS, ...GOOGLE_FONTS_SERIF, ...GOOGLE_FONTS_MONO]}
                        onChange={(val) => updateFontSystem(activeFontSystemId, { family: val })}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Engine Parameters */}
              <section>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 px-1 flex items-center gap-2">
                  Typescale Controls
                </h2>
                <div className="space-y-8">
                  {/* 1. Base Rem */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Base Rem</label>
                      <span className="text-[11px] font-mono text-indigo-400">{system.baseRem}px</span>
                    </div>
                    <input 
                      type="range" min="8" max="24" step="1"
                      value={system.baseRem}
                      onChange={(e) => setSystem(prev => ({ ...prev, baseRem: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-950 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-950 [&::-moz-range-thumb]:shadow-lg"
                    />
                  </div>

                  {/* 2. Snap to Grid Toggle + Grid Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Snap to Grid</label>
                        <div className="relative group">
                          <Info className="w-4 h-4 text-zinc-600 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl uppercase font-bold tracking-tighter leading-tight">
                            Automatically snaps line-heights to the nearest multiple of the Base Grid.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={resetGrid}
                          className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-600 hover:text-zinc-400"
                          title="Reset line heights to default"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSystem(prev => ({ ...prev, isGridSnapped: !prev.isGridSnapped }))}
                          className={`w-10 h-5 rounded-full transition-colors relative ${system.isGridSnapped ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                        >
                          <motion.div 
                            animate={{ x: system.isGridSnapped ? 24 : 4 }}
                            className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                    </div>

                    {system.isGridSnapped && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[11px] font-bold text-zinc-500 uppercase">Vertical Grid</label>
                          <span className="text-[11px] font-mono text-indigo-400">{system.baseGrid}px</span>
                        </div>
                        <input 
                          type="range" min="2" max="16" step="2"
                          value={system.baseGrid}
                          onChange={(e) => setSystem(prev => ({ ...prev, baseGrid: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-950 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-950 [&::-moz-range-thumb]:shadow-lg"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* 3. Sync Scale Toggle + Scale Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Sync Scale</label>
                        <div className="relative group">
                          <Info className="w-4 h-4 text-zinc-600 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl uppercase font-bold tracking-tighter leading-tight">
                            Mathematical ratio relative to text-base (16px).
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={resetScale}
                          className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-600 hover:text-zinc-400"
                          title="Reset font sizes to default"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSystem(prev => ({ ...prev, isScaleSynced: !prev.isScaleSynced }))}
                          className={`w-10 h-5 rounded-full transition-colors relative ${system.isScaleSynced ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                        >
                          <motion.div 
                            animate={{ x: system.isScaleSynced ? 24 : 4 }}
                            className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                    </div>

                    {system.isScaleSynced && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[11px] font-bold text-zinc-500 uppercase">Ratio Factor</label>
                          <span className="text-[11px] font-mono text-indigo-400">{system.scaleFactor.toFixed(3)}</span>
                        </div>
                        <input 
                          type="range" min="1.05" max="1.618" step="0.001"
                          value={system.scaleFactor}
                          onChange={(e) => setSystem(prev => ({ ...prev, scaleFactor: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-950 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-950 [&::-moz-range-thumb]:shadow-lg"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* 4. Responsive Scaling */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Responsive Scale</label>
                        <div className="relative group">
                          <Info className="w-4 h-4 text-zinc-600 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl uppercase font-bold tracking-tighter leading-tight">
                            Scales typography down for mobile viewports. Common Tailwind practice for fluid-like behavior.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSystem(prev => ({ ...prev, isResponsiveEnabled: !prev.isResponsiveEnabled }))}
                          className={`w-10 h-5 rounded-full transition-colors relative ${system.isResponsiveEnabled ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                        >
                          <motion.div 
                            animate={{ x: system.isResponsiveEnabled ? 24 : 4 }}
                            className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                    </div>

                    {system.isResponsiveEnabled && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[11px] font-bold text-zinc-500 uppercase">Mobile Factor</label>
                          <span className="text-[11px] font-mono text-indigo-400">{(system.responsiveScale || 1).toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="1" step="0.01"
                          value={system.responsiveScale || 1}
                          onChange={(e) => setSystem(prev => ({ ...prev, responsiveScale: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-950 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-950 [&::-moz-range-thumb]:shadow-lg"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="space-y-8 pt-2">
              {['Navigation', 'Content', 'UI', 'Data', 'Code'].map(category => {
                const tokens = system.semantics.filter(s => s.category === category);
                if (tokens.length === 0) return null;
                
                return (
                  <section key={category} className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 px-1">
                      {category}
                    </h3>
                    <div className="space-y-2">
                       {tokens.map(token => (
                         <SemanticTypographyRow 
                           key={token.id} 
                           token={token} 
                           fontSystems={system.fontSystems}
                           onUpdate={updateSemantic}
                         />
                       ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <div className="py-6 px-4 shrink-0 flex flex-col items-center gap-4">
          <Button 
            variant="tertiary"
            fullWidth
            onClick={onBack}
            leftIcon={<LayoutGrid className="w-3 h-3" />}
          >
            View all tools
          </Button>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em] text-center">
            SPECTRA BY <a href="https://www.michelsleiman.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-indigo-400 transition-colors">Michel Sleiman</a>
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Toolbar / View Toggle */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex-shrink-0 z-40">
          <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-12">
            <div className="flex items-center gap-12 h-full">
              {/* View Toggle Switch */}
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
               <div className="flex items-center gap-3 h-full">
                  <Button 
                    variant="secondary" 
                    leftIcon={copyState === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <FigmaLogo />}
                    onClick={handleCopyToFigma}
                  >
                    {copyState === 'success' ? 'Copied' : 'Figma layout'}
                  </Button>
                  <Button 
                    variant="primary"
                    leftIcon={exportState === 'success' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    onClick={() => {
                      setIsExportModalOpen(true);
                      setExportState('success');
                      setTimeout(() => setExportState('idle'), 2000);
                    }}
                  >
                    {exportState === 'success' ? 'Exported' : 'Export'}
                  </Button>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 scroll-smooth bg-zinc-950">
          <AnimatePresence mode="wait">
            {viewMode === 'scales' ? (
              <motion.div 
                key="scales"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-[1600px] mx-auto space-y-12"
              >
                {/* Scale Header with Tabs and Actions */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-end justify-between border-b border-zinc-800/50 pb-0 w-full relative">
                    <div className="flex items-center gap-10">
                      {system.fontSystems.map((fs) => {
                        const isActive = activeFontSystemId === fs.id;
                        
                        return (
                          <div
                            key={fs.id}
                            onClick={() => setActiveFontSystemId(fs.id)}
                            className="pb-5 relative group flex flex-col items-start gap-1 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-[0.25em] transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                {fs.name}
                              </span>
                              {isActive && system.fontSystems.length > 1 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFontSystem(fs.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all"
                                >
                                  <Trash2 className="w-2.5 h-2.5 text-zinc-600 hover:text-red-400" />
                                </button>
                              )}
                            </div>
                            
                            {isActive && (
                              <motion.div 
                                layoutId="activeFamilyTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                              />
                            )}
                          </div>
                        );
                      })}
                      
                      <button 
                        onClick={addFontSystem}
                        className="pb-5 relative group flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-zinc-600 hover:text-indigo-400"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pb-4 flex items-center gap-3">
                      <Button 
                        variant="tertiary" 
                        onClick={() => setIsResetConfirmOpen(true)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5 text-zinc-500" />}
                        size="sm"
                      >
                        Reset Scale
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={addStep}
                        leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-400" />}
                        size="sm"
                      >
                        Add Step
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Scale List */}
                <div className="space-y-4">
                  {currentSteps.map((step) => (
                    <motion.div 
                      key={step.id}
                      layout
                      className={`group relative bg-zinc-900/40 border transition-all duration-300 rounded-3xl overflow-hidden ${activeStepId === step.id ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 bg-zinc-900/60' : 'border-zinc-900 hover:border-zinc-800'}`}
                    >
                      <div className="p-6">
                        {/* Header View */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            {activeStepId === step.id ? (
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/60 ml-0.5">Type Name</label>
                                <input 
                                  type="text"
                                  value={step.name}
                                  onChange={(e) => updateStep(step.id, { name: e.target.value })}
                                  placeholder="Step Name (e.g. Header 1)"
                                  className="w-full bg-transparent border-none p-0 text-xl font-black tracking-tight text-white focus:outline-none focus:ring-0 uppercase placeholder:text-zinc-700"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-base font-black tracking-tight text-zinc-200 uppercase">{step.name}</h3>
                                <p className="text-xs font-mono text-zinc-500 mt-1">
                                  {step.fontSize}px • {(step.fontSize / system.baseRem).toFixed(3)}rem / {(step.fontSize * step.lineHeight).toFixed(0)}px / {step.letterSpacing}em
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 pt-1">
                             <button 
                               onClick={() => removeStep(step.id)}
                               className="w-10 h-10 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => setActiveStepId(activeStepId === step.id ? null : step.id)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeStepId === step.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-500'}`}
                             >
                               {activeStepId === step.id ? <Check className="w-4 h-4" strokeWidth={3} /> : <Settings2 className="w-4 h-4" />}
                             </button>
                          </div>
                        </div>

                        {/* Controls Drawer */}
                        {activeStepId === step.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-6 pt-6 border-t border-zinc-800/50 flex flex-col lg:flex-row gap-12"
                          >
                            {/* Group 1: Geometry */}
                            <div className="flex-1 space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Font Size */}
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-1.5">
                                      <Type className="w-3 h-3 text-zinc-600" />
                                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Font Size</label>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500">
                                      {editorUnits.fontSize === 'rem' ? `${step.fontSize}px` : `${(step.fontSize / 16).toFixed(3)}rem`}
                                    </span>
                                  </div>
                                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all focus-within:border-indigo-500/50 group shrink-0">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        value={editorUnits.fontSize === 'rem' ? Number((step.fontSize / 16).toFixed(3)) : step.fontSize}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          const pxVal = editorUnits.fontSize === 'rem' ? val * 16 : val;
                                          updateStep(step.id, { fontSize: Math.round(pxVal) });
                                        }}
                                        className="flex-1 bg-transparent border-none p-0 text-xl font-mono text-white focus:outline-none focus:ring-0 min-w-0"
                                      />
                                      <div className="relative shrink-0">
                                        <select 
                                          value={editorUnits.fontSize}
                                          onChange={(e) => setEditorUnits(prev => ({ ...prev, fontSize: e.target.value }))}
                                          className="bg-zinc-900 border border-zinc-800 rounded-lg pl-2 pr-6 py-1 text-[10px] font-black text-zinc-400 uppercase appearance-none focus:outline-none focus:border-zinc-700 cursor-pointer"
                                        >
                                          <option value="px">px</option>
                                          <option value="rem">rem</option>
                                        </select>
                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Line Height */}
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-1.5">
                                      <MoveVertical className="w-3 h-3 text-zinc-600" />
                                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Line Height</label>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500">{step.lineHeight.toFixed(2)}x</span>
                                  </div>
                                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all focus-within:border-indigo-500/50 shrink-0">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        value={
                                          editorUnits.lineHeight === 'px' ? Math.round(step.fontSize * step.lineHeight) :
                                          editorUnits.lineHeight === 'rem' ? Number(((step.fontSize * step.lineHeight) / 16).toFixed(3)) :
                                          Math.round(step.lineHeight * 100)
                                        }
                                        step={editorUnits.lineHeight === 'rem' ? "0.01" : "1"}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          let newMultiplier = step.lineHeight;
                                          if (editorUnits.lineHeight === 'px') newMultiplier = val / step.fontSize;
                                          else if (editorUnits.lineHeight === 'rem') newMultiplier = (val * 16) / step.fontSize;
                                          else if (editorUnits.lineHeight === '%') newMultiplier = val / 100;
                                          updateStep(step.id, { lineHeight: newMultiplier });
                                        }}
                                        className="flex-1 bg-transparent border-none p-0 text-xl font-mono text-white focus:outline-none focus:ring-0 min-w-0"
                                      />
                                      <div className="relative shrink-0">
                                        <select 
                                          value={editorUnits.lineHeight}
                                          onChange={(e) => setEditorUnits(prev => ({ ...prev, lineHeight: e.target.value }))}
                                          className="bg-zinc-900 border border-zinc-800 rounded-lg pl-2 pr-6 py-1 text-[10px] font-black text-zinc-400 uppercase appearance-none focus:outline-none focus:border-zinc-700 cursor-pointer"
                                        >
                                          <option value="px">px</option>
                                          <option value="rem">rem</option>
                                          <option value="%">%</option>
                                        </select>
                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Group 2: Style */}
                            <div className="flex-1 space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Weight */}
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-1.5">
                                      <Bold className="w-3 h-3 text-zinc-600" />
                                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Weight</label>
                                    </div>
                                  </div>
                                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center h-[62px] focus-within:border-indigo-500/50">
                                    <div className="relative w-full">
                                      <select 
                                        value={step.fontWeight}
                                        onChange={(e) => updateStep(step.id, { fontWeight: parseInt(e.target.value) })}
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-white focus:outline-none focus:ring-0 appearance-none"
                                      >
                                        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(w => (
                                          <option key={w} value={w} className="bg-zinc-900">{w} — {
                                            w === 100 ? 'Thin' : 
                                            w === 200 ? 'Extra-Light' : 
                                            w === 300 ? 'Light' : 
                                            w === 400 ? 'Regular' : 
                                            w === 500 ? 'Medium' : 
                                            w === 600 ? 'Semi-Bold' : 
                                            w === 700 ? 'Bold' : 
                                            w === 800 ? 'Extra-Bold' : 
                                            w === 900 ? 'Black' : 'Weight'
                                          }</option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>

                                {/* Letter Spacing */}
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-1.5">
                                      <MoveHorizontal className="w-3 h-3 text-zinc-600" />
                                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Letter Spacing</label>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500">{step.letterSpacing}em</span>
                                  </div>
                                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all focus-within:border-indigo-500/50 shrink-0">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        value={
                                          editorUnits.letterSpacing === 'px' ? Number((step.letterSpacing * step.fontSize).toFixed(2)) :
                                          editorUnits.letterSpacing === 'rem' ? Number(((step.letterSpacing * step.fontSize) / 16).toFixed(3)) :
                                          Number((step.letterSpacing * 100).toFixed(1))
                                        }
                                        step={editorUnits.letterSpacing === '%' ? "0.1" : "0.01"}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          let newEm = step.letterSpacing;
                                          if (editorUnits.letterSpacing === 'px') newEm = val / step.fontSize;
                                          else if (editorUnits.letterSpacing === 'rem') newEm = (val * 16) / step.fontSize;
                                          else if (editorUnits.letterSpacing === '%') newEm = val / 100;
                                          updateStep(step.id, { letterSpacing: newEm });
                                        }}
                                        className="flex-1 bg-transparent border-none p-0 text-xl font-mono text-white focus:outline-none focus:ring-0 min-w-0"
                                      />
                                      <div className="relative shrink-0">
                                        <select 
                                          value={editorUnits.letterSpacing}
                                          onChange={(e) => setEditorUnits(prev => ({ ...prev, letterSpacing: e.target.value }))}
                                          className="bg-zinc-900 border border-zinc-800 rounded-lg pl-2 pr-6 py-1 text-[10px] font-black text-zinc-400 uppercase appearance-none focus:outline-none focus:border-zinc-700 cursor-pointer"
                                        >
                                          <option value="px">px</option>
                                          <option value="rem">rem</option>
                                          <option value="%">%</option>
                                        </select>
                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Preview Wall */}
                        <div className="py-6 overflow-hidden">
                           <p 
                            style={{ 
                                fontSize: `${step.fontSize}px`, 
                                lineHeight: step.lineHeight, 
                                letterSpacing: `${step.letterSpacing}em`,
                                fontWeight: step.fontWeight,
                                fontFamily: currentFontSystem?.family
                            }}
                            className="text-zinc-100 truncate"
                           >
                             The quick brown fox jumps over the lazy dog
                           </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-[1600px] mx-auto pb-20"
              >
                <TypeSpecContext.Provider value={{ hoveredId: hoveredTypeId, setHoveredId: setHoveredTypeId, baseRem: system.baseRem }}>
                  {/* Real World Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1400px] mx-auto relative">
                      
                      {/* Main Blog Content */}
                      <div className="lg:col-span-8 flex flex-col gap-10">
                          <article className="flex flex-col gap-8">
                              {/* Hero Header */}
                              <div className="flex flex-col gap-4">
                                {(() => {
                                  const { fontSystem, step } = resolveSemantic('tag');
                                  return (
                                    <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="bottom" className="block">
                                      <span 
                                        className="text-indigo-500 font-black uppercase tracking-[0.4em] inline-block mb-2"
                                        style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                      >
                                        Product Design Strategy
                                      </span>
                                    </TypeSpecWrapper>
                                  );
                                })()}

                                {(() => {
                                  const { fontSystem, step } = resolveSemantic('h1');
                                  return (
                                    <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="bottom" className="w-full">
                                      <h1 
                                        className="text-white leading-[1.05] tracking-tight text-balance"
                                        style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                      >
                                        The Art of Utility: How Product Design Solves Real Human Problems
                                      </h1>
                                    </TypeSpecWrapper>
                                  );
                                })()}

                                <div className="flex items-center gap-6 pt-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0" />
                                    <div className="flex flex-col">
                                      {(() => {
                                        const { fontSystem, step } = resolveSemantic('body-sm');
                                        return (
                                          <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                            <p className="text-zinc-200 font-bold" style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}>Michel Sleiman</p>
                                          </TypeSpecWrapper>
                                        );
                                      })()}
                                      {(() => {
                                        const { fontSystem, step } = resolveSemantic('body-sm');
                                        return (
                                          <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                            <p className="text-[11px] text-zinc-500 font-medium" style={{ fontFamily: fontSystem.family }}>Product Designer</p>
                                          </TypeSpecWrapper>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  <div className="h-8 w-px bg-zinc-800" />
                                  <div className="flex flex-col">
                                    {(() => {
                                      const { fontSystem, step } = resolveSemantic('label');
                                      return (
                                        <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-black" style={{ fontFamily: fontSystem.family }}>Published</p>
                                        </TypeSpecWrapper>
                                      );
                                    })()}
                                    {(() => {
                                      const { fontSystem, step } = resolveSemantic('body-sm');
                                      return (
                                        <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                          <p className="text-xs text-zinc-300 font-medium" style={{ fontFamily: fontSystem.family }}>April 24, 2026</p>
                                        </TypeSpecWrapper>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* Article Body */}
                              <div className="flex flex-col gap-8 max-w-[720px]">
                                {(() => {
                                  const { fontSystem, step } = resolveSemantic('body');
                                  return (
                                    <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                      <p
                                        className="text-zinc-300 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:text-indigo-500 first-letter:mr-3 first-letter:float-left"
                                        style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                      >
                                        At its core, product design is the process of identifying a user need and creating a functional, cohesive solution. It's often misunderstood as the simple act of making things look "nice," but the reality is far more complex. Great product design exists at the intersection of business goals, technical feasibility, and human psychology.
                                      </p>
                                    </TypeSpecWrapper>
                                  );
                                })()}

                                {(() => {
                                  const { fontSystem, step } = resolveSemantic('h2');
                                  return (
                                    <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block pt-6">
                                      <h2 
                                        className="text-white font-black tracking-tight"
                                        style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                      >
                                        Empathy as a Blueprint
                                      </h2>
                                    </TypeSpecWrapper>
                                  );
                                })()}

                                {(() => {
                                  const { fontSystem, step } = resolveSemantic('body');
                                  return (
                                    <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                      <p
                                        className="text-zinc-400 leading-relaxed"
                                        style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                      >
                                        Before a single pixel is placed, a designer must understand the environment in which the product lives. This means observing frustrations, mapping workflows, and identifying the "friction points" that prevent a user from reaching their goal. When we design with empathy, the resulting product feels intuitive—not because it's simple, but because it matches the user's mental model.
                                      </p>
                                    </TypeSpecWrapper>
                                  );
                                })()}

                                {(() => {
                                  const { fontSystem, step } = resolveSemantic('body');
                                  return (
                                    <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                      <p
                                        className="text-zinc-400 leading-relaxed"
                                        style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                      >
                                        The most successful products are those that solve a genuine problem in a way that feels invisible. If a user has to stop and think about how to use an interface, the design has failed its primary mission. We should aim for a state where technology is an extension of human intent, facilitating action without introducing cognitive overhead.
                                      </p>
                                    </TypeSpecWrapper>
                                  );
                                })()}

                                <div className="py-8">
                                  {(() => {
                                    const { fontSystem, step } = resolveSemantic('quote');
                                    return (
                                      <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                        <blockquote 
                                          className="border-l-4 border-indigo-500 pl-8 py-4 italic font-medium text-white text-3xl text-balance leading-snug"
                                          style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                        >
                                          "Design is a formal response to a strategic question. It is the synthesis of business goals (viability), technical reality (feasibility), and human behavior (desirability). When we design products, we are not just creating visual artifacts; we are engineering trust, facilitating motion, and defining the boundaries of human potential in the digital age."
                                        </blockquote>
                                      </TypeSpecWrapper>
                                    );
                                  })()}
                                  {(() => {
                                    const { fontSystem, step } = resolveSemantic('label');
                                    return (
                                      <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block mt-4">
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black" style={{ fontFamily: fontSystem.family }}>— Design Strategy Manifesto</p>
                                      </TypeSpecWrapper>
                                    );
                                  })()}
                                </div>

                                {(() => {
                                  const { fontSystem, step } = resolveSemantic('body');
                                  return (
                                    <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                      <p
                                        className="text-zinc-400 leading-relaxed"
                                        style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                      >
                                        As we move into a future dominated by AI and ambient computing, the role of the designer is shifting from that of a visual architect to a systems strategist. We are no longer just designing screens; we are designing the rules of engagement between humans and machines. This requires a deeper understanding of ethical implications, accessibility, and the long-term impact of the systems we build.
                                      </p>
                                    </TypeSpecWrapper>
                                  );
                                })()}
                              </div>
                          </article>

                          {/* Post Navigation */}
                          <div className="pt-12 border-t border-zinc-900 grid grid-cols-2 gap-8">
                                {[{ title: 'The Evolution of Design Systems', type: 'Previous Article', align: 'left' }, { title: 'User Research in the Age of AI', type: 'Next Article', align: 'right' }].map((nav) => (
                                  <div key={nav.type} className={`flex flex-col gap-1 group cursor-pointer ${nav.align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                                    {(() => {
                                      const { fontSystem, step } = resolveSemantic('label');
                                      return (
                                        <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block w-full">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 group-hover:text-indigo-400 transition-colors" style={{ fontFamily: fontSystem.family }}>{nav.type}</p>
                                        </TypeSpecWrapper>
                                      );
                                    })()}
                                    {(() => {
                                      const { fontSystem, step } = resolveSemantic('table-title');
                                      return (
                                        <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block w-full">
                                          <p className="text-zinc-400 font-bold leading-tight group-hover:text-white transition-colors" style={{ fontSize: `${(step?.fontSize || 18) * 1.3}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}>
                                            {nav.title}
                                          </p>
                                        </TypeSpecWrapper>
                                      );
                                    })()}
                                  </div>
                                ))}
                          </div>
                      </div>

                      {/* Sidebar */}
                          <aside className="lg:col-span-4 flex flex-col gap-10">
                          {/* Author Widget */}
                          <div className="bg-zinc-900/20 border border-zinc-900 rounded-[3rem] p-6 flex flex-col gap-4">
                             <div className="flex flex-col gap-4 items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-indigo-600 flex-shrink-0" />
                                <div className="flex flex-col gap-1">
                                   {(() => {
                                     const { fontSystem, step } = resolveSemantic('h3');
                                     return (
                                       <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                         <h4 className="text-white font-black" style={{ fontSize: `${(step?.fontSize || 20) * 1.5}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}>Michel Sleiman</h4>
                                       </TypeSpecWrapper>
                                     );
                                   })()}
                                   {(() => {
                                     const { fontSystem, step } = resolveSemantic('body-sm');
                                     return (
                                       <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                         <p className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest" style={{ fontFamily: fontSystem.family }}>Product Designer</p>
                                       </TypeSpecWrapper>
                                     );
                                   })()}
                                </div>
                             </div>
                             {(() => {
                               const { fontSystem, step } = resolveSemantic('body-sm');
                               return (
                                 <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block text-center">
                                   <p className="text-zinc-400 text-xs leading-relaxed" style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}>Passionate about building intuitive digital products that bridge the gap between complex technology and human interaction.</p>
                                 </TypeSpecWrapper>
                               );
                             })()}
                             {(() => {
                               const { fontSystem, step } = resolveSemantic('button');
                               return (
                                 <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="w-full">
                                   <Button variant="secondary" fullWidth size="md">Follow Author</Button>
                                 </TypeSpecWrapper>
                               );
                             })()}
                          </div>

                          {/* Related Content */}
                          <div className="flex flex-col gap-8 px-4">
                             {(() => {
                               const { fontSystem, step } = resolveSemantic('sidebar-title');
                               return (
                                 <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                   <h4 className="uppercase tracking-[0.3em] text-indigo-500/80 font-black" style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}>Related Reading</h4>
                                 </TypeSpecWrapper>
                               );
                             })()}
                             <div className="flex flex-col gap-3">
                                {[
                                  { title: 'The Psychology of Spacing', tag: 'UI Design' },
                                  { title: 'Variable Fonts in Production', tag: 'Technology' },
                                  { title: 'Optical Sizing Explained', tag: 'Precision' }
                                ].map((item, i) => (
                                   <div key={i} className="flex flex-col gap-1 group cursor-pointer">
                                     {(() => {
                                       const { fontSystem, step } = resolveSemantic('label');
                                       return (
                                         <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 block group-hover:text-indigo-400 transition-colors" style={{ fontFamily: fontSystem.family }}>{item.tag}</span>
                                         </TypeSpecWrapper>
                                       );
                                     })()}
                                     {(() => {
                                       const { fontSystem, step } = resolveSemantic('table-title');
                                       return (
                                         <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="block">
                                           <p className="text-zinc-300 font-bold group-hover:text-white transition-colors leading-snug" style={{ fontSize: `${(step?.fontSize || 16) * 1.3}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}>
                                             {item.title}
                                           </p>
                                         </TypeSpecWrapper>
                                       );
                                     })()}
                                  </div>
                                ))}
                             </div>
                          </div>

                          {/* Newsletter */}
                          <div className="bg-indigo-600 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
                             <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap className="w-32 h-32 stroke-[4]" />
                             </div>
                             {(() => {
                               const { fontSystem, step } = resolveSemantic('stat-label');
                               return (
                                 <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top">
                                   <p 
                                    className="text-indigo-200 font-black uppercase tracking-widest mb-2"
                                    style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                   >Intelligence</p>
                                 </TypeSpecWrapper>
                               );
                             })()}
                             {(() => {
                               const { fontSystem, step } = resolveSemantic('stat-value');
                               return (
                                 <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top">
                                   <p 
                                    className="text-white tracking-tighter mb-8 text-balance"
                                    style={{ fontSize: `${(step?.fontSize || 32) * 0.75}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}
                                   >Join 12,000 architectural designers.</p>
                                 </TypeSpecWrapper>
                               );
                             })()}
                             {(() => {
                               const { fontSystem, step } = resolveSemantic('input');
                               return (
                                 <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top">
                                   <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-4 text-white/50 italic" style={{ fontSize: `${step?.fontSize}px`, fontFamily: fontSystem.family, fontWeight: step?.fontWeight }}>
                                     email@architect.com
                                   </div>
                                 </TypeSpecWrapper>
                               );
                             })()}
                             {(() => {
                               const { fontSystem, step } = resolveSemantic('button');
                               return (
                                 <TypeSpecWrapper step={step} family={fontSystem.name} font={fontSystem.family} position="top" className="w-full">
                                   <Button variant="primary" fullWidth className="!bg-white !text-indigo-600 border-none shadow-xl">Subscribe Now</Button>
                                 </TypeSpecWrapper>
                               );
                             })()}
                          </div>
                      </aside>
                  </div>
                </TypeSpecContext.Provider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {stepToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStepToDelete(null)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                   <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Delete Step?</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                  Are you sure you want to remove <span className="text-zinc-300 font-bold">{currentSteps.find(s => s.id === stepToDelete)?.name}</span> from the scale? This action cannot be undone.
                </p>

                <div 
                  className="flex items-center gap-3 mb-8 cursor-pointer select-none group"
                  onClick={() => setDontAskAgainChecked(!dontAskAgainChecked)}
                >
                  <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${dontAskAgainChecked ? 'bg-indigo-500 border-indigo-500' : 'bg-zinc-950 border-zinc-800 group-hover:border-zinc-700'}`}>
                    {dontAskAgainChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">Don't ask me this again</span>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                   <Button variant="secondary" fullWidth onClick={() => setStepToDelete(null)}>
                     Cancel
                   </Button>
                   <Button variant="primary" fullWidth onClick={confirmDelete} className="!bg-red-500 hover:!bg-red-600 border-none shadow-none">
                     Delete
                   </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Add Step Modal */}
      <AnimatePresence>
        {isAddingStep && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingStep(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Add New Step</h3>
                    <p className="text-zinc-500 text-xs">Define a new typography step for your {currentFontSystem.name} scale.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Token Name</label>
                      <input 
                        type="text" 
                        value={newStepData.name}
                        onChange={(e) => setNewStepData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        placeholder="text-base"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Font Size (px / {( (newStepData.fontSize || 0) / system.baseRem).toFixed(3)}rem)</label>
                      <input 
                        type="number" 
                        value={newStepData.fontSize}
                        onChange={(e) => setNewStepData(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Line Height</label>
                      <input 
                        type="number" step="0.001"
                        value={newStepData.lineHeight}
                        onChange={(e) => setNewStepData(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tracking (em)</label>
                      <input 
                         type="number" step="0.001"
                         value={newStepData.letterSpacing}
                         onChange={(e) => setNewStepData(prev => ({ ...prev, letterSpacing: parseFloat(e.target.value) || 0 }))}
                         className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <Button variant="secondary" fullWidth onClick={() => setIsAddingStep(false)}>
                     Cancel
                   </Button>
                   <Button variant="primary" fullWidth onClick={confirmAddStep}>
                     Create Step
                   </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <ResetConfirmModal 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetFullScale}
        family={currentFontSystem.name}
      />

      <AnimatePresence>
        {isExportModalOpen && (
          <UnifiedExportModal 
            palette={palette}
            typographySystem={system}
            onClose={() => setIsExportModalOpen(false)}
            initialTools={['typography']}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ResetConfirmModal = ({ isOpen, onClose, onConfirm, family }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, family: string }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <RotateCcw className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Reset {family} Scale?</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              This will restore the <span className="text-zinc-300 font-bold">{family}</span> scale to its factory default values. All your custom steps and adjustments for this family will be lost.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
               <Button variant="secondary" fullWidth onClick={onClose}>
                 Cancel
               </Button>
               <Button variant="primary" fullWidth onClick={onConfirm} className="!bg-indigo-500 hover:!bg-indigo-600 border-none shadow-none">
                 Reset Scale
               </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default TypographyTool;
