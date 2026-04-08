// ── Characters ──────────────────────────────────────────────────────────────
// 6 alien beings, each experiencing Weimar as a completely different reality.

export const CHARACTERS = [
  {
    id: 'zyrax',
    name: 'ZYRAX',
    planet: 'Crystalis Prime',
    symbol: '◆',
    personality: 'Cold · Analytical · Mathematical',
    backstory:
      'Born in the geometric void between star clusters, Zyrax evolved on a ' +
      'planet where all matter crystallized into perfect lattices. To them, ' +
      'Weimar\'s chaotic organic architecture is just poorly formed crystal — ' +
      'every building a failed diamond, every tree a misaligned carbon chain. ' +
      'They experience beauty only in angles, refraction, and symmetry.',
    color: '#4488ff',
    theme: {
      skyTop: 0x000012,
      skyBot: 0x0a0030,
      fogColor: 0x080022,
      fogNear: 80,
      fogFar: 280,
      groundColor: 0x050015,
      groundEmissive: 0x110033,
      ambientColor: 0x3311aa,
      ambientIntensity: 0.6,
      sunColor: 0x88aaff,
      sunIntensity: 1.2,
      fillColor: 0x220055,
      fillIntensity: 0.4,
      buildingPalette: [0x224488, 0x3355bb, 0x5577cc, 0x8899dd, 0x112266, 0x6644bb],
      buildingEmissive: 0x001133,
      buildingEmissiveIntensity: 0.4,
      buildingMetalness: 0.95,
      buildingRoughness: 0.05,
      buildingHeightMult: 1.9,
      groundHex: '#050015',
      roadHex: '#060020',
      parkHex: '#0a0030',
      waterHex: '#112266',
      particleColor: 0x88bbff,
      particleCount: 600,
      particleSize: 0.5,
      particleSpeed: 0.008,
      particleSpread: 200,
      roofShape: 'pyramid',
      treeColor: 0x334499,
      treeTrunkColor: 0x1a1a44,
    },
    // SVG figure definition
    figure: `
      <g class="fig-zyrax" style="animation: crystal-spin 6s linear infinite; transform-origin: 50% 50%;">
        <polygon points="22,2 42,20 42,40 22,58 2,40 2,20" fill="rgba(68,136,255,0.15)" stroke="#4488ff" stroke-width="1.5"/>
        <polygon points="22,10 36,22 36,38 22,50 8,38 8,22" fill="rgba(136,170,255,0.1)" stroke="#88aaff" stroke-width="1"/>
        <line x1="22" y1="2" x2="22" y2="58" stroke="#4488ff" stroke-width="0.5" opacity="0.4"/>
        <line x1="2" y1="30" x2="42" y2="30" stroke="#4488ff" stroke-width="0.5" opacity="0.4"/>
        <circle cx="14" cy="26" r="3" fill="#88aaff" opacity="0.9"/>
        <circle cx="30" cy="26" r="3" fill="#88aaff" opacity="0.9"/>
        <circle cx="14" cy="26" r="1.2" fill="white"/>
        <circle cx="30" cy="26" r="1.2" fill="white"/>
        <polygon points="22,35 18,42 26,42" fill="none" stroke="#88aaff" stroke-width="1" opacity="0.6"/>
      </g>`,
  },

  {
    id: 'morra',
    name: 'MORRA',
    planet: 'Abyssal Bloom',
    symbol: '✿',
    personality: 'Warm · Curious · Luminescent',
    backstory:
      'Morra drifted up from the deepest trench of a lightless ocean world, ' +
      'where all life glows with its own bioluminescence and communication ' +
      'happens through color pulses. Weimar\'s stone buildings look to her like ' +
      'vast coral formations sleeping on the sea floor. The streets are currents. ' +
      'She finds the absence of glowing deeply unsettling — and is quietly ' +
      'fixing that wherever she goes.',
    color: '#00ffaa',
    theme: {
      skyTop: 0x000511,
      skyBot: 0x001122,
      fogColor: 0x001525,
      fogNear: 60,
      fogFar: 220,
      groundColor: 0x001a15,
      groundEmissive: 0x003322,
      ambientColor: 0x007755,
      ambientIntensity: 0.5,
      sunColor: 0x00ffbb,
      sunIntensity: 0.8,
      fillColor: 0x003355,
      fillIntensity: 0.4,
      buildingPalette: [0x006655, 0x008877, 0x00aaaa, 0x339988, 0x004433, 0x227766],
      buildingEmissive: 0x003322,
      buildingEmissiveIntensity: 0.6,
      buildingMetalness: 0.1,
      buildingRoughness: 0.85,
      buildingHeightMult: 0.75,
      groundHex: '#001a15',
      roadHex: '#000e0a',
      parkHex: '#002218',
      waterHex: '#005588',
      particleColor: 0x00ffaa,
      particleCount: 900,
      particleSize: 0.4,
      particleSpeed: 0.004,
      particleSpread: 180,
      roofShape: 'dome',
      treeColor: 0x00aa77,
      treeTrunkColor: 0x003322,
    },
    figure: `
      <g class="fig-morra" style="animation: morra-float 3s ease-in-out infinite; transform-origin: 50% 30%;">
        <!-- Bell body -->
        <ellipse cx="22" cy="22" rx="16" ry="12" fill="rgba(0,255,170,0.15)" stroke="#00ffaa" stroke-width="1.5"/>
        <ellipse cx="22" cy="22" rx="10" ry="7" fill="rgba(0,255,170,0.1)" stroke="#00cc88" stroke-width="1"/>
        <!-- Eyes -->
        <circle cx="17" cy="20" r="3" fill="#00ffaa" opacity="0.9"/>
        <circle cx="27" cy="20" r="3" fill="#00ffaa" opacity="0.9"/>
        <circle cx="17" cy="20" r="1.2" fill="white"/>
        <circle cx="27" cy="20" r="1.2" fill="white"/>
        <!-- Tentacles -->
        <path d="M10,32 Q8,42 6,52" stroke="#00ffaa" stroke-width="1.5" fill="none" opacity="0.7" style="animation: wiggle 2s ease-in-out infinite;"/>
        <path d="M15,33 Q13,43 14,54" stroke="#00cc88" stroke-width="1.5" fill="none" opacity="0.6" style="animation: wiggle 2.3s ease-in-out infinite 0.2s;"/>
        <path d="M22,34 Q22,44 22,55" stroke="#00ffaa" stroke-width="1.5" fill="none" opacity="0.7" style="animation: wiggle 1.8s ease-in-out infinite 0.4s;"/>
        <path d="M29,33 Q31,43 30,54" stroke="#00cc88" stroke-width="1.5" fill="none" opacity="0.6" style="animation: wiggle 2.1s ease-in-out infinite 0.1s;"/>
        <path d="M34,32 Q36,42 38,52" stroke="#00ffaa" stroke-width="1.5" fill="none" opacity="0.7" style="animation: wiggle 2.4s ease-in-out infinite 0.3s;"/>
        <!-- Crown -->
        <path d="M8,16 Q22,8 36,16" stroke="#00ffaa" stroke-width="1" fill="none" opacity="0.5"/>
      </g>`,
  },

  {
    id: 'thrak',
    name: 'THRAK',
    planet: 'Ignar Prime',
    symbol: '⚡',
    personality: 'Volatile · Primal · Burning',
    backstory:
      'Thrak emerged from the magma seas of a volcanic hellscape where geological ' +
      'violence is the norm and "calm" means the eruption hasn\'t started yet. ' +
      'Every building in Weimar looks like cooling basalt to them — barely solid, ' +
      'moments from eruption. They find the city\'s placidness deeply suspicious, ' +
      'as if the ground is merely waiting for the right moment. They\'re helping it along.',
    color: '#ff4400',
    theme: {
      skyTop: 0x0a0000,
      skyBot: 0x200500,
      fogColor: 0x180200,
      fogNear: 50,
      fogFar: 180,
      groundColor: 0x110200,
      groundEmissive: 0x330500,
      ambientColor: 0x661100,
      ambientIntensity: 0.6,
      sunColor: 0xff5500,
      sunIntensity: 1.5,
      fillColor: 0x440800,
      fillIntensity: 0.5,
      buildingPalette: [0x1a0500, 0x220800, 0x111111, 0x0d0000, 0x2a0800, 0x180300],
      buildingEmissive: 0x441100,
      buildingEmissiveIntensity: 0.8,
      buildingMetalness: 0.7,
      buildingRoughness: 0.95,
      buildingHeightMult: 1.1,
      groundHex: '#110200',
      roadHex: '#080000',
      parkHex: '#1a0500',
      waterHex: '#cc3300',
      particleColor: 0xff4400,
      particleCount: 700,
      particleSize: 0.6,
      particleSpeed: 0.02,
      particleSpread: 160,
      roofShape: 'jagged',
      treeColor: 0x441100,
      treeTrunkColor: 0x220800,
    },
    figure: `
      <g class="fig-thrak" style="animation: thrak-shake 0.4s ease-in-out infinite; transform-origin: 50% 50%;">
        <!-- Rocky body -->
        <polygon points="22,4 34,14 38,30 32,46 22,52 12,46 6,30 10,14" fill="rgba(255,68,0,0.15)" stroke="#ff4400" stroke-width="2"/>
        <polygon points="22,10 30,18 33,30 28,42 22,46 16,42 11,30 14,18" fill="rgba(255,100,0,0.1)" stroke="#ff6600" stroke-width="1"/>
        <!-- Lava cracks -->
        <line x1="22" y1="10" x2="20" y2="25" stroke="#ff4400" stroke-width="2" opacity="0.8"/>
        <line x1="20" y1="25" x2="24" y2="35" stroke="#ff6600" stroke-width="1.5" opacity="0.7"/>
        <line x1="30" y1="18" x2="28" y2="32" stroke="#ff4400" stroke-width="1.5" opacity="0.6"/>
        <!-- Eyes (fiery) -->
        <circle cx="16" cy="22" r="4" fill="#ff2200" opacity="0.9"/>
        <circle cx="28" cy="22" r="4" fill="#ff2200" opacity="0.9"/>
        <circle cx="16" cy="22" r="2" fill="#ffaa00"/>
        <circle cx="28" cy="22" r="2" fill="#ffaa00"/>
        <circle cx="16" cy="22" r="1" fill="white"/>
        <circle cx="28" cy="22" r="1" fill="white"/>
        <!-- Mouth -->
        <path d="M16,38 Q22,34 28,38" stroke="#ff4400" stroke-width="2" fill="none"/>
        <!-- Heat shimmer lines -->
        <line x1="8" y1="55" x2="6" y2="60" stroke="#ff4400" stroke-width="1" opacity="0.4"/>
        <line x1="16" y1="55" x2="15" y2="61" stroke="#ff6600" stroke-width="1" opacity="0.3"/>
        <line x1="24" y1="55" x2="24" y2="62" stroke="#ff4400" stroke-width="1" opacity="0.4"/>
        <line x1="32" y1="55" x2="33" y2="61" stroke="#ff6600" stroke-width="1" opacity="0.3"/>
      </g>`,
  },

  {
    id: 'lumi',
    name: 'LUMI',
    planet: 'The Spectrum Void',
    symbol: '✦',
    personality: 'Ethereal · Serene · Omniscient',
    backstory:
      'Lumi exists as a self-aware pattern of intersecting light in the Spectrum Void — ' +
      'a dimension where matter never condensed from energy. Visiting a physical space ' +
      'is deeply uncomfortable; everything seems needlessly thick. To Lumi, all of ' +
      'Weimar is a crude wireframe — a kindergarten sketch of reality. They see the ' +
      'mathematical skeleton beneath all form, and find the skeleton much more beautiful ' +
      'than the flesh around it.',
    color: '#ffffff',
    theme: {
      skyTop: 0xffffff,
      skyBot: 0xeeeeff,
      fogColor: 0xddeeff,
      fogNear: 100,
      fogFar: 350,
      groundColor: 0xeeeeff,
      groundEmissive: 0x8888ff,
      ambientColor: 0xffffff,
      ambientIntensity: 1.2,
      sunColor: 0xffffff,
      sunIntensity: 1.0,
      fillColor: 0xaaaaff,
      fillIntensity: 0.6,
      buildingPalette: [0xffffff, 0xeeeeff, 0xddeeff, 0xffeeff, 0xeeffff, 0xfffee0],
      buildingEmissive: 0x4444ff,
      buildingEmissiveIntensity: 0.3,
      buildingMetalness: 0.0,
      buildingRoughness: 0.0,
      buildingHeightMult: 1.0,
      groundHex: '#eeeeff',
      roadHex: '#ddddff',
      parkHex: '#eeffee',
      waterHex: '#aaffff',
      particleColor: 0xffffff,
      particleCount: 1200,
      particleSize: 0.3,
      particleSpeed: 0.006,
      particleSpread: 250,
      roofShape: 'flat',
      treeColor: 0xaaffff,
      treeTrunkColor: 0xccccff,
      wireframe: true,
    },
    figure: `
      <g class="fig-lumi" style="animation: lumi-pulse 2.5s ease-in-out infinite; transform-origin: 50% 30%;">
        <!-- Outer ring -->
        <circle cx="22" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
        <circle cx="22" cy="25" r="15" fill="rgba(255,255,255,0.05)" stroke="white" stroke-width="1"/>
        <circle cx="22" cy="25" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>
        <!-- Rays -->
        <line x1="22" y1="5" x2="22" y2="45" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
        <line x1="2" y1="25" x2="42" y2="25" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
        <line x1="7" y1="10" x2="37" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
        <line x1="37" y1="10" x2="7" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
        <!-- Core -->
        <circle cx="22" cy="25" r="4" fill="white" opacity="0.9"/>
        <!-- Eyes -->
        <circle cx="17" cy="22" r="2.5" fill="rgba(200,200,255,0.8)"/>
        <circle cx="27" cy="22" r="2.5" fill="rgba(200,200,255,0.8)"/>
        <!-- Orbitals -->
        <ellipse cx="22" cy="25" rx="18" ry="6" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" transform="rotate(45 22 25)"/>
        <ellipse cx="22" cy="25" rx="18" ry="6" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" transform="rotate(-45 22 25)"/>
        <!-- Tail of light -->
        <path d="M22,45 Q22,55 20,62" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>`,
  },

  {
    id: 'vex',
    name: 'VEX',
    planet: 'Mycelios-7',
    symbol: '☁',
    personality: 'Chaotic · Gleeful · Decomposing',
    backstory:
      'Vex is a sentient mycelium colony that accidentally formed consciousness on ' +
      'Mycelios-7, a planet choked with fungal mega-organisms ten kilometers tall. ' +
      'Weimar\'s buildings are basically large immobile food sources. The streets are ' +
      'just the spaces between meals. Citizens are slow mushrooms with delusions. ' +
      'Vex finds the whole situation absolutely hilarious and has been quietly ' +
      'inoculating everything with spores since arrival.',
    color: '#88ff00',
    theme: {
      skyTop: 0x050800,
      skyBot: 0x0a1200,
      fogColor: 0x0a1500,
      fogNear: 40,
      fogFar: 160,
      groundColor: 0x060a00,
      groundEmissive: 0x1a2a00,
      ambientColor: 0x336600,
      ambientIntensity: 0.5,
      sunColor: 0xaaff00,
      sunIntensity: 0.9,
      fillColor: 0x442200,
      fillIntensity: 0.4,
      buildingPalette: [0x441166, 0x662299, 0x220044, 0x553300, 0x224400, 0x331155],
      buildingEmissive: 0x220044,
      buildingEmissiveIntensity: 0.5,
      buildingMetalness: 0.0,
      buildingRoughness: 1.0,
      buildingHeightMult: 0.65,
      groundHex: '#060a00',
      roadHex: '#040600',
      parkHex: '#0a1200',
      waterHex: '#113300',
      particleColor: 0x88ff00,
      particleCount: 1000,
      particleSize: 0.35,
      particleSpeed: 0.003,
      particleSpread: 140,
      roofShape: 'mushroom',
      treeColor: 0x446622,
      treeTrunkColor: 0x221100,
    },
    figure: `
      <g class="fig-vex" style="animation: vex-bounce 0.8s ease-in-out infinite; transform-origin: 50% 75%;">
        <!-- Mushroom cap -->
        <ellipse cx="22" cy="18" rx="18" ry="12" fill="rgba(136,255,0,0.2)" stroke="#88ff00" stroke-width="2"/>
        <ellipse cx="22" cy="20" rx="14" ry="8" fill="rgba(68,255,0,0.1)" stroke="#66cc00" stroke-width="1"/>
        <!-- Spots -->
        <circle cx="14" cy="14" r="3" fill="rgba(136,255,0,0.5)" stroke="#88ff00" stroke-width="0.5"/>
        <circle cx="26" cy="12" r="2" fill="rgba(136,255,0,0.5)" stroke="#88ff00" stroke-width="0.5"/>
        <circle cx="30" cy="18" r="2.5" fill="rgba(136,255,0,0.4)" stroke="#88ff00" stroke-width="0.5"/>
        <!-- Stem body -->
        <rect x="16" y="28" width="12" height="22" rx="6" fill="rgba(170,255,0,0.15)" stroke="#88ff00" stroke-width="1.5"/>
        <!-- Eyes (maniacal) -->
        <circle cx="17" cy="34" r="4" fill="rgba(136,255,0,0.8)"/>
        <circle cx="27" cy="34" r="4" fill="rgba(136,255,0,0.8)"/>
        <circle cx="15" cy="33" r="2" fill="black"/>
        <circle cx="25" cy="33" r="2" fill="black"/>
        <circle cx="16" cy="32.5" r="0.8" fill="white"/>
        <circle cx="26" cy="32.5" r="0.8" fill="white"/>
        <!-- Maniacal smile -->
        <path d="M14,42 Q22,48 30,42" stroke="#88ff00" stroke-width="2" fill="none"/>
        <line x1="16" y1="42" x2="14" y2="45" stroke="#88ff00" stroke-width="1.5"/>
        <line x1="28" y1="42" x2="30" y2="45" stroke="#88ff00" stroke-width="1.5"/>
        <!-- Spores -->
        <circle cx="8" cy="20" r="1.5" fill="#88ff00" opacity="0.6"/>
        <circle cx="36" cy="15" r="1" fill="#88ff00" opacity="0.5"/>
        <circle cx="38" cy="25" r="1.5" fill="#66cc00" opacity="0.4"/>
        <circle cx="5" cy="30" r="1" fill="#88ff00" opacity="0.5"/>
      </g>`,
  },

  {
    id: 'solen',
    name: 'SOLEN',
    planet: 'Aurantia (The Dying Star)',
    symbol: '◎',
    personality: 'Melancholic · Ancient · Wistful',
    backstory:
      'Solen\'s civilization lasted 800 million years on a planet orbiting a dying ' +
      'red giant. They have watched their entire world slowly turn to dust — oceans ' +
      'evaporate, mountains crumble, stars fade. Weimar, with its mere thousand-year ' +
      'history, looks to Solen like a hasty cartoon — endearingly fragile ruins that ' +
      'haven\'t realized they\'re ruins yet. Solen finds humans touching in the same ' +
      'way one finds mayflies touching.',
    color: '#ffaa44',
    theme: {
      skyTop: 0x0a0400,
      skyBot: 0x2a1000,
      fogColor: 0x1a0a00,
      fogNear: 70,
      fogFar: 240,
      groundColor: 0x1a0e00,
      groundEmissive: 0x220a00,
      ambientColor: 0xaa5500,
      ambientIntensity: 0.7,
      sunColor: 0xff8800,
      sunIntensity: 1.1,
      fillColor: 0x551100,
      fillIntensity: 0.3,
      buildingPalette: [0xaa7744, 0x886633, 0x997755, 0xbb8855, 0x775533, 0xcc9966],
      buildingEmissive: 0x220a00,
      buildingEmissiveIntensity: 0.2,
      buildingMetalness: 0.1,
      buildingRoughness: 1.0,
      buildingHeightMult: 0.55,
      groundHex: '#1a0e00',
      roadHex: '#0d0600',
      parkHex: '#220e00',
      waterHex: '#883300',
      particleColor: 0xffaa44,
      particleCount: 450,
      particleSize: 0.5,
      particleSpeed: 0.002,
      particleSpread: 220,
      roofShape: 'ruined',
      treeColor: 0x886644,
      treeTrunkColor: 0x442200,
    },
    figure: `
      <g class="fig-solen" style="animation: solen-drift 5s ease-in-out infinite; transform-origin: 50% 50%;">
        <!-- Cloak/robe (ghostly) -->
        <ellipse cx="22" cy="22" rx="14" ry="12" fill="rgba(255,170,68,0.1)" stroke="#ffaa44" stroke-width="1"/>
        <!-- Hood -->
        <ellipse cx="22" cy="14" rx="10" ry="9" fill="rgba(255,170,68,0.15)" stroke="#ffaa44" stroke-width="1.5"/>
        <!-- Inner face glow -->
        <ellipse cx="22" cy="16" rx="6" ry="6" fill="rgba(255,170,68,0.2)" stroke="#ffcc88" stroke-width="1"/>
        <!-- Ancient eyes (tired) -->
        <circle cx="18" cy="15" r="2.5" fill="#ffaa44" opacity="0.7"/>
        <circle cx="26" cy="15" r="2.5" fill="#ffaa44" opacity="0.7"/>
        <line x1="16" y1="15" x2="20" y2="15" stroke="#aa6622" stroke-width="1.5"/> <!-- half-closed -->
        <line x1="24" y1="15" x2="28" y2="15" stroke="#aa6622" stroke-width="1.5"/>
        <!-- Sad mouth -->
        <path d="M18,22 Q22,20 26,22" stroke="#ffaa44" stroke-width="1" fill="none" opacity="0.6"/>
        <!-- Flowing robe bottom -->
        <path d="M8,28 Q6,40 8,55 Q22,60 36,55 Q38,40 36,28" fill="rgba(255,170,68,0.08)" stroke="#ffaa44" stroke-width="1" opacity="0.6"/>
        <!-- Ancient markings -->
        <path d="M14,34 Q16,38 14,42" stroke="#ffaa44" stroke-width="0.8" fill="none" opacity="0.4"/>
        <path d="M30,34 Q28,38 30,42" stroke="#ffaa44" stroke-width="0.8" fill="none" opacity="0.4"/>
        <!-- Dust particles -->
        <circle cx="5" cy="20" r="1" fill="#ffaa44" opacity="0.3"/>
        <circle cx="40" cy="35" r="1.5" fill="#ff8800" opacity="0.25"/>
        <circle cx="2" cy="45" r="1" fill="#ffaa44" opacity="0.2"/>
      </g>`,
  },
];

export const DEFAULT_CHARACTER_ID = 'zyrax';
