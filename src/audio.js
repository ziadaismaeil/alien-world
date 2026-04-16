// ── Audio — Procedural Soundscapes per Character ─────────────────────────────
// All sound is generated with the Web Audio API — no audio files required.

let _ctx      = null;   // AudioContext
let _master   = null;   // master GainNode
let _stops    = [];     // cleanup fns for the currently playing theme
let _activeId = null;

export function initAudio() {
  if (_ctx) return;
  _ctx    = new (window.AudioContext || window.webkitAudioContext)();
  _master = _ctx.createGain();
  _master.gain.value = 0.38;
  _master.connect(_ctx.destination);
}

function _resume() {
  if (_ctx && _ctx.state === 'suspended') _ctx.resume();
}

// ── Primitives ────────────────────────────────────────────────────────────

function gain(v = 1) {
  const g = _ctx.createGain();
  g.gain.setValueAtTime(v, _ctx.currentTime);
  return g;
}

function osc(type, freq) {
  const o = _ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, _ctx.currentTime);
  return o;
}

function bpf(freq, q = 1) {
  const f = _ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(freq, _ctx.currentTime);
  f.Q.setValueAtTime(q, _ctx.currentTime);
  return f;
}

function lpf(freq, q = 1) {
  const f = _ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(freq, _ctx.currentTime);
  f.Q.setValueAtTime(q, _ctx.currentTime);
  return f;
}

// Connect a → b → c → …  (returns first node for chaining)
function pipe(...nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  return nodes[0];
}

// Shared noise buffer (4 s of white noise, looped by each source)
let _noiseBuf = null;
function noiseSrc() {
  if (!_noiseBuf) {
    const sr  = _ctx.sampleRate;
    _noiseBuf = _ctx.createBuffer(1, sr * 4, sr);
    const d   = _noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = _ctx.createBufferSource();
  s.buffer = _noiseBuf;
  s.loop   = true;
  return s;
}

// ── Mid-level helpers ─────────────────────────────────────────────────────

// Sustained oscillator with linear fade-in; returns stop fn
function drone(type, freq, vol, dest, fadeIn = 1.5) {
  const o = osc(type, freq);
  const g = gain(0);
  pipe(o, g, dest);
  o.start();
  g.gain.linearRampToValueAtTime(vol, _ctx.currentTime + fadeIn);
  return () => {
    const t = _ctx.currentTime;
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(0, t + 0.8);
    try { o.stop(t + 0.9); } catch (_) {}
  };
}

// Continuous filtered noise pad; returns stop fn
function noisePad(filterFreq, filterQ, vol, dest, fadeIn = 1.5) {
  const n = noiseSrc();
  const f = bpf(filterFreq, filterQ);
  const g = gain(0);
  pipe(n, f, g, dest);
  n.start();
  g.gain.linearRampToValueAtTime(vol, _ctx.currentTime + fadeIn);
  return () => {
    const t = _ctx.currentTime;
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(0, t + 0.8);
    try { n.stop(t + 0.9); } catch (_) {}
  };
}

// Repeating note sequence; returns stop fn
function melody(pattern, dest, vol = 0.10) {
  let i = 0, alive = true;
  function next() {
    if (!alive) return;
    const [freq, durSec, type = 'sine', vel = 1] = pattern[i % pattern.length];
    i++;
    if (freq > 0) {
      const o = osc(type, freq);
      const g = gain(0);
      pipe(o, g, dest);
      const t = _ctx.currentTime;
      g.gain.linearRampToValueAtTime(vol * vel, t + 0.02);
      g.gain.setValueAtTime(vol * vel * 0.62, t + durSec * 0.52);
      g.gain.linearRampToValueAtTime(0, t + durSec * 0.92);
      o.start(t);
      o.stop(t + durSec);
    }
    setTimeout(next, durSec * 1000);
  }
  next();
  return () => { alive = false; };
}

// Random sine pings from a frequency list; returns stop fn
function pings(freqList, minMs, maxMs, vol, dest) {
  let alive = true;
  function fire() {
    if (!alive) return;
    const f   = freqList[Math.floor(Math.random() * freqList.length)];
    const o   = osc('sine', f);
    const g   = gain(0);
    pipe(o, g, dest);
    const t   = _ctx.currentTime;
    const dur = 0.6 + Math.random() * 1.4;
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
    setTimeout(fire, minMs + Math.random() * (maxMs - minMs));
  }
  fire();
  return () => { alive = false; };
}

// Filtered noise bursts (fire crackle, glitch); returns stop fn
function noiseBursts(filterFreq, filterQ, minMs, maxMs, vol, dest) {
  let alive = true;
  function fire() {
    if (!alive) return;
    const n   = noiseSrc();
    const f   = bpf(filterFreq + Math.random() * filterFreq * 0.4, filterQ);
    const g   = gain(0);
    pipe(n, f, g, dest);
    const t   = _ctx.currentTime;
    const dur = 0.04 + Math.random() * 0.12;
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.start(t);
    n.stop(t + dur + 0.05);
    setTimeout(fire, minMs + Math.random() * (maxMs - minMs));
  }
  fire();
  return () => { alive = false; };
}

// Periodic sine kick/thump; returns stop fn
function kick(baseFreq, decaySec, vol, intervalMs, dest) {
  let alive = true;
  function fire() {
    if (!alive) return;
    const o = osc('sine', baseFreq);
    const g = gain(0);
    pipe(o, g, dest);
    const t = _ctx.currentTime;
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decaySec);
    o.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, t + decaySec);
    o.start(t);
    o.stop(t + decaySec + 0.05);
    setTimeout(fire, intervalMs + (Math.random() > 0.75 ? intervalMs * 0.5 : 0));
  }
  fire();
  return () => { alive = false; };
}

// ── Character Soundscapes ─────────────────────────────────────────────────

const THEMES = {

  // ── ZYRAX — Cold · Analytical · Crystalline
  // Crystalline drones in perfect-5th ratios + icy arpeggio + bell pings
  zyrax(out) {
    return [
      drone('sine', 110,  0.12, out, 2.0),
      drone('sine', 165,  0.07, out, 2.5),   // perfect 5th
      drone('sine', 220,  0.09, out, 3.0),   // octave
      drone('sine', 330,  0.05, out, 3.5),   // perfect 5th
      drone('sine', 440,  0.04, out, 4.0),   // octave
      // Cold mathematical arpeggio — only perfect intervals
      melody([
        [523, 0.55], [784, 0.55], [1047, 0.70],
        [784, 0.55], [523, 0.55], [0,    0.65],
      ], out, 0.055),
      // Crystal bell pings — sparse, high, resonant
      pings([1047, 1319, 1568, 2093, 2637, 3136], 900, 3200, 0.065, out),
    ];
  },

  // ── MORRA — Loyal · Impulsive · Nose-First
  // Humid wind noise + warm low drones + slow descending scent-trail melody
  morra(out) {
    return [
      noisePad(320, 0.35, 0.09, out, 1.5),   // humid outdoor air
      noisePad(80,  0.50, 0.06, out, 2.0),   // low breath
      drone('sine',  55,  0.14, out, 2.0),
      drone('sine',  82,  0.08, out, 2.5),
      drone('sine', 110,  0.05, out, 3.0),
      // Descending melody — nose tracing a scent across cobblestones
      melody([
        [220, 1.20, 'sine', 0.60], [196, 0.90, 'sine', 0.50],
        [175, 1.00, 'sine', 0.70], [165, 1.50, 'sine', 0.40],
        [0,   1.00], [196, 0.80, 'sine', 0.50],
        [220, 1.10, 'sine', 0.60], [0, 2.00],
      ], out, 0.065),
    ];
  },

  // ── THRAK — Aggressive · Authoritarian · Trigger-Happy
  // Distorted sawtooth bass + fire crackle + heavy kick + menacing tritone melody
  thrak(out) {
    const o  = osc('sawtooth', 55);
    const ws = _ctx.createWaveShaper();
    const crv = new Float32Array(256);
    const K   = 50;
    for (let i = 0; i < 256; i++) {
      const x = 2 * i / 255 - 1;
      crv[i] = (Math.PI + K) * x / (Math.PI + K * Math.abs(x));
    }
    ws.curve = crv;
    const lp = lpf(200, 1.5);
    const g  = gain(0);
    pipe(o, ws, lp, g, out);
    o.start();
    g.gain.linearRampToValueAtTime(0.20, _ctx.currentTime + 0.4);
    const bassStop = () => {
      const t = _ctx.currentTime;
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.3);
      try { o.stop(t + 0.4); } catch (_) {}
    };
    return [
      bassStop,
      noiseBursts(3500, 0.5, 50, 220, 0.06, out),   // fire crackle
      kick(80, 0.28, 0.28, 620, out),                 // heavy authoritarian thud
      melody([
        [110, 0.20, 'sawtooth', 1.0], [0,  0.15],
        [155, 0.18, 'sawtooth', 0.9], [0,  0.10],
        [110, 0.30, 'sawtooth', 0.8], [0,  0.55],
        [82,  0.25, 'sawtooth', 1.0], [0,  0.90],
      ], out, 0.085),
    ];
  },

  // ── LUMI — Ethereal · Serene · Omniscient
  // Whole-tone scale drones (no tension, no resolution) + sparse luminous pings
  lumi(out) {
    // Whole-tone scale: C D E F# G# A# — pure light, no gravity
    const wt = [261.6, 293.7, 329.6, 370.0, 415.3, 466.2];
    const vols = [0.04, 0.03, 0.04, 0.02, 0.03, 0.02];
    return [
      ...wt.map((f, i) => drone('sine', f * 2, vols[i], out, 3 + i * 0.8)),
      // Sparse, whisper-quiet pings — light barely touching matter
      pings([523.3, 698.5, 880, 1047, 1318.5, 1760], 2200, 6500, 0.044, out),
    ];
  },

  // ── VEX — Chaotic · Academic · Fungal
  // Wobbling triangle drone + spore pops + overlapping chaotic melodies
  vex(out) {
    // Drone with slow frequency wobble (fungal breathing)
    const o = osc('triangle', 55);
    const g = gain(0);
    pipe(o, g, out);
    o.start();
    g.gain.linearRampToValueAtTime(0.11, _ctx.currentTime + 0.8);
    let wobAlive = true;
    (function wob() {
      if (!wobAlive) return;
      const t = _ctx.currentTime;
      o.frequency.setValueAtTime(55, t);
      o.frequency.linearRampToValueAtTime(63, t + 1.5);
      o.frequency.linearRampToValueAtTime(55, t + 3.0);
      setTimeout(wob, 3000);
    })();
    const wobStop = () => {
      wobAlive = false;
      const t = _ctx.currentTime;
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.5);
      try { o.stop(t + 0.6); } catch (_) {}
    };
    return [
      wobStop,
      pings([280, 380, 480, 560, 720, 900], 100, 520, 0.052, out),   // spore pops
      // Bubbly bassline
      melody([
        [98,  0.40, 'sine', 1.0], [0,   0.10],
        [110, 0.30, 'sine', 0.8], [147, 0.30, 'sine', 0.9], [0, 0.20],
        [131, 0.40, 'sine', 0.7], [0,   0.75],
      ], out, 0.12),
      // Chaotic upper melody — always running late to the lecture
      melody([
        [523, 0.18], [659, 0.14], [0, 0.08], [784, 0.20],
        [698, 0.22], [0,   0.28], [880, 0.14], [831, 0.18], [0, 0.50],
      ], out, 0.065),
    ];
  },

  // ── NIKO — Joyful · Curious · Boundless
  // Bright C-major melody + sparkle bells + warm bass — a playground in sound
  niko(out) {
    return [
      drone('sine', 130.8, 0.11, out, 1.5),   // warm bass C
      drone('sine',  65.4, 0.07, out, 2.0),   // sub octave
      // Happy major-pentatonic melody
      melody([
        [523, 0.30, 'sine', 1.0], [659, 0.28, 'sine', 0.9],
        [784, 0.28, 'sine', 1.0], [880, 0.35, 'sine', 0.8], [0, 0.10],
        [784, 0.20, 'sine', 0.7], [659, 0.28, 'sine', 0.9],
        [523, 0.38, 'sine', 1.0], [0,   0.28],
        [392, 0.22, 'sine', 0.8], [523, 0.48, 'sine', 1.0], [0, 0.45],
      ], out, 0.10),
      // Sparkle bells — toy-box high register
      pings([1047, 1175, 1319, 1568, 1760, 2093, 2349], 180, 750, 0.085, out),
    ];
  },

  // ── SOLEN — Determined · Frustrated · Resilient
  // Warm amber pad + steady heartbeat + slow resolute minor melody
  solen(out) {
    return [
      drone('sine', 110,   0.12, out, 2.0),
      drone('sine', 138.6, 0.08, out, 2.5),
      drone('sine', 165,   0.06, out, 3.0),
      drone('sine', 220,   0.04, out, 3.5),
      kick(80, 0.38, 0.15, 900, out),    // steady stellar heartbeat
      // Slow determined melody — minor, resolute, never quite gives up
      melody([
        [220,   0.85, 'sine', 0.9], [0,     0.20],
        [247,   0.65, 'sine', 0.8], [261.6, 0.75, 'sine', 0.7], [0, 0.45],
        [220,   1.00, 'sine', 1.0], [0,     0.60],
        [196,   0.75, 'sine', 0.8], [220,   1.10, 'sine', 0.9], [0, 1.00],
      ], out, 0.075),
    ];
  },

  // ── CRASH01 (THRAZYR) — Authoritarian · Crystalline · Unstable
  // Pitch-shifting drone that glitches between fire and crystal + crackle + kick
  crash01(out) {
    const o = osc('sawtooth', 110);
    const f = lpf(400, 2);
    const g = gain(0);
    pipe(o, f, g, out);
    o.start();
    g.gain.linearRampToValueAtTime(0.10, _ctx.currentTime + 0.3);
    let glAlive = true;
    (function glitch() {
      if (!glAlive) return;
      const t      = _ctx.currentTime;
      const target = Math.random() > 0.5
        ? 55  + Math.random() * 30    // volcanic low-end
        : 165 + Math.random() * 100;  // crystal mid-range
      o.frequency.linearRampToValueAtTime(target, t + 0.08 + Math.random() * 0.25);
      setTimeout(glitch, 180 + Math.random() * 600);
    })();
    const droneStop = () => {
      glAlive = false;
      const t = _ctx.currentTime;
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.3);
      try { o.stop(t + 0.4); } catch (_) {}
    };
    return [
      droneStop,
      pings([220, 330, 440, 660, 880, 1047], 400, 1400, 0.07, out),  // crystal shards
      noiseBursts(2500, 1, 80, 500, 0.055, out),                       // fire crackle
      kick(70, 0.20, 0.22, 520, out),
    ];
  },

  // ── CRASH02 (LUMORRA) — Chaotic · Luminous · Nose-First Wonder
  // Three overlapping melodies + Lumi's sine + dense smell-wisps + Niko sparkles
  crash02(out) {
    return [
      drone('sine', 440, 0.05, out, 2.5),     // Lumi's pure tone beneath it all
      // Lumi melody
      melody([
        [523, 0.30], [659, 0.28], [784, 0.22],
        [0,   0.20], [880, 0.38], [0,   0.30],
      ], out, 0.07),
      // Morra's descending scent melody (lower)
      melody([
        [220, 0.50, 'sine', 0.6], [247, 0.40, 'sine', 0.5],
        [261.6, 0.60, 'sine', 0.7], [0,  0.50],
      ], out, 0.08),
      // Niko's sparkle melody (upper)
      melody([
        [1047, 0.16], [1175, 0.14], [0, 0.10],
        [1319, 0.18], [1047, 0.14], [0, 0.30],
      ], out, 0.04),
      // Dense smell-wisps (Morra's scent particles)
      pings([200, 310, 420, 580, 760, 980], 60, 300, 0.035, out),
      // Niko's joy sparkles
      pings([1175, 1568, 1760, 2093, 2349], 300, 950, 0.065, out),
    ];
  },
};

// ── Public API ────────────────────────────────────────────────────────────

export function playCharacterTheme(charId) {
  if (!_ctx) return;
  _resume();
  if (_activeId === charId) return;

  // Fade out + stop all current sounds
  _stops.forEach(fn => { try { fn(); } catch (_) {} });
  _stops    = [];
  _activeId = charId;

  const fn = THEMES[charId];
  if (fn) _stops = fn(_master) ?? [];
}

export function stopAudio() {
  _stops.forEach(fn => { try { fn(); } catch (_) {} });
  _stops    = [];
  _activeId = null;
}

export function setVolume(v) {
  if (_master) {
    _master.gain.setValueAtTime(
      Math.max(0, Math.min(1, v)),
      _ctx.currentTime
    );
  }
}
