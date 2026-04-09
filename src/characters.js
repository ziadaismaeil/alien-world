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
      skyTop: 0x05003a,
      skyBot: 0x180060,
      fogColor: 0x100040,
      fogNear: 80,
      fogFar: 300,
      groundColor: 0x0a0030,
      groundEmissive: 0x220055,
      ambientColor: 0xbbaaff,
      ambientIntensity: 2.5,
      sunColor: 0xddeeff,
      sunIntensity: 3.5,
      fillColor: 0x8866ff,
      fillIntensity: 1.5,
      buildingPalette: [0x5588ee, 0x6699ff, 0x88bbff, 0xaaccff, 0x4466cc, 0xaa88ff],
      buildingEmissive: 0x2233aa,
      buildingEmissiveIntensity: 1.4,
      buildingMetalness: 0.95,
      buildingRoughness: 0.05,
      buildingHeightMult: 1.9,
      groundHex: '#0a0030',
      roadHex: '#080025',
      parkHex: '#0d0045',
      waterHex: '#1133aa',
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
    planet: 'Veldan IV (The Wet World)',
    symbol: '✿',
    personality: 'Loyal · Impulsive · Nose-First',
    backstory:
      'On Veldan IV, Morra\'s kind evolved as pack hunters who navigate entirely by ' +
      'scent. Vision is secondary. Memory is smell. Love is smell. Danger is smell. ' +
      'Weimar is, to Morra, an overwhelming cathedral of odor — every building has a ' +
      'century of scent soaked into its stone, every street corner a library of who ' +
      'passed and when. Morra experiences none of the architecture. Only its ghost-smell. ' +
      'And somewhere — always somewhere — the intoxicating trail of cooked meat drifting ' +
      'from a vendor or restaurant. When that hits, all reason evaporates. The leash goes ' +
      'taut. The owner sighs. They have been here before.',
    color: '#00ffaa',
    theme: {
      // Sky: near-black — the world is perceived through smell, not light
      skyTop: 0x010301,
      skyBot: 0x020502,
      // Fog very close and smell-tinted — shapes dissolve fast into smell-haze
      fogColor: 0x050f05,
      fogNear: 18,
      fogFar: 90,
      groundColor: 0x010201,
      groundEmissive: 0x010301,
      // Lights — muted but city is navigable
      ambientColor: 0x335533,
      ambientIntensity: 1.8,
      sunColor: 0x446644,
      sunIntensity: 2.0,
      fillColor: 0x223322,
      fillIntensity: 0.9,
      // Buildings: dark green-grey, visible but desaturated
      buildingPalette: [0x1a2e1a, 0x1e331e, 0x182818, 0x223822, 0x1b2f1b, 0x1f341f],
      buildingEmissive: 0x061006,
      buildingEmissiveIntensity: 0.3,
      buildingMetalness: 0.0,
      buildingRoughness: 1.0,
      buildingHeightMult: 0.35,
      groundHex: '#0a120a',
      roadHex: '#080e08',
      parkHex: '#0c160c',
      waterHex: '#071408',
      // Particles: smell-colored, dense, small — the air itself feels thick
      particleColor: 0x00ff88,
      particleCount: 2200,
      particleSize: 0.18,
      particleSpeed: 0.002,
      particleSpread: 140,
      roofShape: 'dome',
      treeColor: 0x030803,
      treeTrunkColor: 0x020402,
    },
    figure: `
      <g class="fig-morra" style="animation: morra-trot 0.6s ease-in-out infinite; transform-origin: 50% 60%;">
        <!-- Body -->
        <ellipse cx="22" cy="36" rx="14" ry="9" fill="rgba(0,255,170,0.18)" stroke="#00ffaa" stroke-width="1.5"/>
        <!-- Head -->
        <ellipse cx="34" cy="26" rx="9" ry="7" fill="rgba(0,255,170,0.2)" stroke="#00ffaa" stroke-width="1.5"/>
        <!-- Snout -->
        <ellipse cx="40" cy="29" rx="5" ry="3.5" fill="rgba(0,200,130,0.3)" stroke="#00cc88" stroke-width="1"/>
        <circle cx="42" cy="29" r="1.5" fill="#00ffaa" opacity="0.8"/>
        <!-- Eye -->
        <circle cx="35" cy="23" r="2.5" fill="#00ffaa" opacity="0.9"/>
        <circle cx="35" cy="23" r="1.2" fill="#003322"/>
        <circle cx="34.3" cy="22.3" r="0.7" fill="white"/>
        <!-- Ear (floppy) -->
        <path d="M29,20 Q26,14 28,10" stroke="#00ffaa" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Tail (up and curved) -->
        <path d="M8,32 Q2,24 6,18" stroke="#00ffaa" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- 4 Legs -->
        <line x1="14" y1="44" x2="12" y2="56" stroke="#00cc88" stroke-width="2" stroke-linecap="round"/>
        <line x1="20" y1="45" x2="19" y2="57" stroke="#00cc88" stroke-width="2" stroke-linecap="round"/>
        <line x1="26" y1="45" x2="27" y2="57" stroke="#00cc88" stroke-width="2" stroke-linecap="round"/>
        <line x1="32" y1="44" x2="34" y2="56" stroke="#00cc88" stroke-width="2" stroke-linecap="round"/>
        <!-- Smell wisps -->
        <path d="M41,26 Q46,20 44,14" stroke="#00ffaa" stroke-width="0.8" fill="none" opacity="0.5" stroke-dasharray="2,2"/>
        <path d="M40,24 Q47,18 46,10" stroke="#00cc88" stroke-width="0.8" fill="none" opacity="0.4" stroke-dasharray="2,2"/>
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
      skyTop: 0x1a0200,
      skyBot: 0x3d0800,
      fogColor: 0x2a0400,
      fogNear: 50,
      fogFar: 220,
      groundColor: 0x220500,
      groundEmissive: 0x550a00,
      ambientColor: 0xff9966,
      ambientIntensity: 2.5,
      sunColor: 0xffcc88,
      sunIntensity: 4.0,
      fillColor: 0xff5500,
      fillIntensity: 1.8,
      buildingPalette: [0x441100, 0x552200, 0x333333, 0x221100, 0x4d1800, 0x331000],
      buildingEmissive: 0xcc3300,
      buildingEmissiveIntensity: 2.5,
      buildingMetalness: 0.7,
      buildingRoughness: 0.95,
      buildingHeightMult: 1.1,
      groundHex: '#220500',
      roadHex: '#110200',
      parkHex: '#2a0800',
      waterHex: '#ff3300',
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
    personality: 'Chaotic · Academic · Decomposing',
    backstory:
      'Vex enrolled in Bauhaus-Universität\'s Mycelial Architecture programme three ' +
      'semesters ago and has not submitted a single assignment on time since. Their ' +
      'thesis — "Decomposition as Design Methodology: A Post-Structural Spore ' +
      'Framework" — has been cited zero times but referenced in seven conspiracy ' +
      'forums. Weimar is Vex\'s campus. Every building a classroom, every street a ' +
      'corridor between lectures, every open square a study group waiting to happen. ' +
      'Vex knows every student hangout within the 2km radius and cannot physically ' +
      'pass one without stopping for a "quick five minutes" that always runs over.',
    color: '#88ff00',
    theme: {
      skyTop: 0x0d1500,
      skyBot: 0x1a2800,
      fogColor: 0x152000,
      fogNear: 50,
      fogFar: 220,
      groundColor: 0x111800,
      groundEmissive: 0x2a4000,
      ambientColor: 0xccff66,
      ambientIntensity: 2.2,
      sunColor: 0xeeff88,
      sunIntensity: 3.5,
      fillColor: 0xaacc00,
      fillIntensity: 1.5,
      buildingPalette: [0x9933ee, 0xbb44ff, 0x6611aa, 0xaa6600, 0x448800, 0x7733cc],
      buildingEmissive: 0x6600bb,
      buildingEmissiveIntensity: 1.5,
      buildingMetalness: 0.0,
      buildingRoughness: 1.0,
      buildingHeightMult: 0.65,
      groundHex: '#111800',
      roadHex: '#080d00',
      parkHex: '#182200',
      waterHex: '#225500',
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
    id: 'niko',
    name: 'NIKO',
    planet: 'Minima (a speck of cosmic dust)',
    symbol: '★',
    personality: 'Joyful · Curious · Boundless',
    backstory:
      'Niko hatched from a luminous crystal on Minima — a particle of stardust so ' +
      'small you could swallow it whole. On Minima, a pebble is a mountain. Here, ' +
      'real mountains must exist somewhere impossibly far beyond the sky. Weimar ' +
      'arrived like a hallucination: buildings stretching up forever, streets like ' +
      'endless canyons, trees tall as Minima\'s entire atmosphere. The puddles are ' +
      'oceans. Every doorway is a cave. But the playgrounds — those sacred clearings ' +
      'full of swinging, sliding, sand-magic metal — are the most wondrous things in ' +
      'any universe. Niko has visited every single one. Twice. Arms always wide open.',
    color: '#ff77cc',
    theme: {
      skyTop: 0x0d0520,
      skyBot: 0x2a0a50,
      fogColor: 0x180630,
      fogNear: 30,
      fogFar: 160,
      groundColor: 0x0a0518,
      groundEmissive: 0x2a0845,
      ambientColor: 0xffccff,
      ambientIntensity: 3.2,
      sunColor: 0xffeeff,
      sunIntensity: 4.5,
      fillColor: 0xff88ff,
      fillIntensity: 2.0,
      buildingPalette: [0xff8899, 0xffbb44, 0x88ddff, 0xbbff99, 0xffaacc, 0xaabbff],
      buildingEmissive: 0x440022,
      buildingEmissiveIntensity: 0.9,
      buildingMetalness: 0.1,
      buildingRoughness: 0.75,
      buildingHeightMult: 2.8,
      groundHex: '#0a0518',
      roadHex: '#080312',
      parkHex: '#071810',
      waterHex: '#2255cc',
      particleColor: 0xffaaee,
      particleCount: 1400,
      particleSize: 0.3,
      particleSpeed: 0.012,
      particleSpread: 190,
      roofShape: 'bubble',
      treeColor: 0x44ff99,
      treeTrunkColor: 0x441100,
      playgroundGlow: true,
      playgroundEmissive: 0xffdd00,
      playgroundEmissiveIntensity: 3.5,
    },
    figure: `
      <g class="fig-niko" style="animation: niko-wonder 1.2s ease-in-out infinite; transform-origin: 50% 58%;">
        <!-- Aura glow -->
        <circle cx="22" cy="17" r="19" fill="rgba(255,119,204,0.06)" stroke="rgba(255,119,204,0.18)" stroke-width="0.5"/>
        <!-- Big round head -->
        <circle cx="22" cy="17" r="13" fill="rgba(255,119,204,0.2)" stroke="#ff77cc" stroke-width="2"/>
        <circle cx="22" cy="17" r="9" fill="rgba(255,170,220,0.1)" stroke="#ffaadd" stroke-width="0.8"/>
        <!-- Huge wonder eyes -->
        <circle cx="14.5" cy="14" r="5.5" fill="white" opacity="0.95"/>
        <circle cx="29.5" cy="14" r="5.5" fill="white" opacity="0.95"/>
        <circle cx="14.5" cy="14" r="3.5" fill="#cc44aa"/>
        <circle cx="29.5" cy="14" r="3.5" fill="#cc44aa"/>
        <circle cx="13.5" cy="13" r="2" fill="#111"/>
        <circle cx="28.5" cy="13" r="2" fill="#111"/>
        <!-- Sparkle highlights in eyes -->
        <circle cx="15" cy="12" r="1.1" fill="white"/>
        <circle cx="30" cy="12" r="1.1" fill="white"/>
        <circle cx="13" cy="14.5" r="0.6" fill="rgba(255,255,255,0.55)"/>
        <circle cx="28" cy="14.5" r="0.6" fill="rgba(255,255,255,0.55)"/>
        <!-- Amazed O-mouth -->
        <ellipse cx="22" cy="23.5" rx="2.8" ry="2.2" fill="none" stroke="#ff77cc" stroke-width="1.5"/>
        <!-- Rosy alien cheeks -->
        <circle cx="9" cy="18" r="3.5" fill="rgba(255,88,160,0.22)"/>
        <circle cx="35" cy="18" r="3.5" fill="rgba(255,88,160,0.22)"/>
        <!-- Small body (kid proportions) -->
        <ellipse cx="22" cy="40" rx="6.5" ry="9" fill="rgba(255,119,204,0.15)" stroke="#ff77cc" stroke-width="1.5"/>
        <!-- Arms raised up — excited! -->
        <path d="M15.5,36 Q8,29 6,22" stroke="#ff77cc" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M28.5,36 Q36,29 38,22" stroke="#ff77cc" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="6" cy="21" r="2.8" fill="#ff77cc" opacity="0.88"/>
        <circle cx="38" cy="21" r="2.8" fill="#ff77cc" opacity="0.88"/>
        <!-- Short legs -->
        <path d="M19,49 Q17,54 15.5,59" stroke="#ff77cc" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M25,49 Q27,54 28.5,59" stroke="#ff77cc" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="15" cy="59.5" rx="2.8" ry="1.5" fill="#ffaade" opacity="0.7"/>
        <ellipse cx="29" cy="59.5" rx="2.8" ry="1.5" fill="#ffaade" opacity="0.7"/>
        <!-- Floating sparkles (small diamonds) -->
        <polygon points="4,6 5.3,8 4,10 2.7,8" fill="#ffdd00" opacity="0.8"/>
        <polygon points="39,4 40.3,6 39,8 37.7,6" fill="#88ffdd" opacity="0.7"/>
        <polygon points="2,35 3.3,37 2,39 0.7,37" fill="#ff77cc" opacity="0.6"/>
        <polygon points="40,31 41.3,33 40,35 38.7,33" fill="#ffddaa" opacity="0.65"/>
      </g>`,
  },

  {
    id: 'solen',
    name: 'SOLEN',
    planet: 'Aurantia (The Dying Star)',
    symbol: '◎',
    personality: 'Determined · Frustrated · Resilient',
    backstory:
      'On Aurantia, Solen lost mobility in a volcanic collapse that reshaped half the ' +
      'continent. Eight hundred million years of civilization and they never designed a ' +
      'single ramp. Weimar is little different. Every cobblestone is a small war. Every ' +
      'curb without a cut is a wall. Every "historic" stepped entrance a door that says ' +
      '"not you." Solen navigates Weimar in an amber-lattice transit chair that hums ' +
      'with residual stellar energy — slower than everyone, stopped by things no one ' +
      'else notices. The city is not inaccessible by accident. That is what makes it ' +
      'so exhausting.',
    color: '#ffaa44',
    theme: {
      skyTop: 0x1e0a00,
      skyBot: 0x4a1e00,
      fogColor: 0x2d1200,
      fogNear: 70,
      fogFar: 300,
      groundColor: 0x2e1800,
      groundEmissive: 0x441a00,
      ambientColor: 0xffdd99,
      ambientIntensity: 2.5,
      sunColor: 0xffeeaa,
      sunIntensity: 3.8,
      fillColor: 0xff9944,
      fillIntensity: 1.5,
      buildingPalette: [0xddaa77, 0xccbb88, 0xeebb99, 0xffddaa, 0xbb9966, 0xffcc88],
      buildingEmissive: 0x663300,
      buildingEmissiveIntensity: 0.9,
      buildingMetalness: 0.1,
      buildingRoughness: 1.0,
      buildingHeightMult: 0.55,
      groundHex: '#2e1800',
      roadHex: '#1a0d00',
      parkHex: '#3a2000',
      waterHex: '#aa5500',
      particleColor: 0xffaa44,
      particleCount: 450,
      particleSize: 0.5,
      particleSpeed: 0.002,
      particleSpread: 220,
      roofShape: 'ruined',
      treeColor: 0x886644,
      treeTrunkColor: 0x442200,
      charMoveSpeed: 0.14,
    },
    figure: `
      <g class="fig-solen" style="animation: solen-roll 3s ease-in-out infinite; transform-origin: 50% 65%;">
        <!-- Head -->
        <circle cx="22" cy="10" r="7" fill="rgba(255,170,68,0.2)" stroke="#ffaa44" stroke-width="1.5"/>
        <circle cx="19" cy="9" r="1.8" fill="#ffaa44" opacity="0.8"/>
        <circle cx="25" cy="9" r="1.8" fill="#ffaa44" opacity="0.8"/>
        <line x1="17.5" y1="9" x2="20.5" y2="9" stroke="#aa5500" stroke-width="1.2"/>
        <line x1="23.5" y1="9" x2="26.5" y2="9" stroke="#aa5500" stroke-width="1.2"/>
        <!-- Torso (seated) -->
        <rect x="14" y="18" width="14" height="12" rx="3" fill="rgba(255,170,68,0.15)" stroke="#ffaa44" stroke-width="1.2"/>
        <!-- Armrests -->
        <line x1="14" y1="21" x2="8" y2="21" stroke="#ff8800" stroke-width="1.5"/>
        <line x1="28" y1="21" x2="34" y2="21" stroke="#ff8800" stroke-width="1.5"/>
        <!-- Wheelchair frame -->
        <line x1="28" y1="30" x2="32" y2="44" stroke="#ffaa44" stroke-width="1.5"/>
        <line x1="14" y1="30" x2="10" y2="44" stroke="#ffaa44" stroke-width="1.2"/>
        <!-- Big rear wheel (right) -->
        <circle cx="32" cy="46" r="9" fill="none" stroke="#ff8800" stroke-width="1.5"/>
        <circle cx="32" cy="46" r="5" fill="none" stroke="#ffaa44" stroke-width="0.8" opacity="0.5"/>
        <line x1="32" y1="37" x2="32" y2="55" stroke="#ffaa44" stroke-width="0.7" opacity="0.6"/>
        <line x1="23" y1="46" x2="41" y2="46" stroke="#ffaa44" stroke-width="0.7" opacity="0.6"/>
        <!-- Small front caster (left) -->
        <circle cx="10" cy="47" r="4.5" fill="none" stroke="#ff8800" stroke-width="1.2"/>
        <!-- Footrest -->
        <line x1="14" y1="30" x2="8" y2="36" stroke="#ffaa44" stroke-width="1.2"/>
        <line x1="6" y1="36" x2="14" y2="36" stroke="#ffaa44" stroke-width="1.5"/>
        <!-- Energy glow -->
        <circle cx="32" cy="46" r="11" fill="none" stroke="#ff8800" stroke-width="0.5" opacity="0.3"/>
      </g>`,
  },
];

export const DEFAULT_CHARACTER_ID = 'zyrax';
