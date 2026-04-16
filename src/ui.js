// ── UI — Character Selection Panel ──────────────────────────────────────────

import { CHARACTERS } from './characters.js';

const SVG_VIEWBOX = '0 0 44 62';

export function buildUI(onSelect) {
  const grid = document.getElementById('character-grid');

  CHARACTERS.forEach(char => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.dataset.id = char.id;
    card.style.setProperty('--char-color', char.color);

    card.innerHTML = `
      <div class="card-glow"></div>
      <div class="char-figure">
        <svg viewBox="${SVG_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">
          ${char.figure}
        </svg>
      </div>
      <div class="char-meta">
        <div class="char-card-name" style="color: ${char.color}">${char.name}</div>
        <div class="char-card-planet">${char.planet}</div>
        <div class="char-card-personality">${char.personality.split(' · ')[0]}</div>
      </div>
    `;

    card.addEventListener('click', () => onSelect(char.id));
    grid.appendChild(card);
  });
}

export function setActiveCard(id) {
  document.querySelectorAll('.char-card').forEach(c => {
    c.classList.toggle('active', c.dataset.id === id);
  });
}

export function updateInfoPanel(char) {
  const info = document.getElementById('character-info');
  document.getElementById('char-symbol').textContent = char.symbol;
  document.getElementById('char-name').textContent = char.name;
  document.getElementById('char-planet').textContent = char.planet.toUpperCase();
  document.getElementById('char-personality').textContent = char.personality;
  document.getElementById('char-backstory').textContent = char.backstory;

  // Apply character color to info text
  info.style.color = char.color;
  info.classList.remove('hidden');

  // Show lore toggle
  const loreBtn = document.getElementById('lore-toggle');
  loreBtn.classList.remove('hidden');
  loreBtn.style.borderColor = char.color;
  loreBtn.style.color = char.color;
}

export function setupLoreToggle() {
  const btn = document.getElementById('lore-toggle');
  const info = document.getElementById('character-info');
  btn.addEventListener('click', () => {
    info.classList.toggle('lore-hidden');
    btn.textContent = info.classList.contains('lore-hidden') ? '?' : '×';
  });
}

export function hideLoading() {
  const screen = document.getElementById('loading-screen');
  screen.classList.add('fade-out');
  setTimeout(() => screen.remove(), 900);
}

export function buildLandingCharacters() {
  const container = document.getElementById('landing-characters');
  if (!container) return;
  CHARACTERS.forEach((char, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'landing-char';
    wrapper.style.setProperty('--char-color', char.color);
    wrapper.style.animationDelay = `${i * 0.22}s`;
    wrapper.innerHTML = `
      <div class="landing-char-glow"></div>
      <svg viewBox="${SVG_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" class="landing-char-svg">
        ${char.figure}
      </svg>
      <div class="landing-char-name">${char.name}</div>
    `;
    container.appendChild(wrapper);
  });
}

export function hideLandingScreen() {
  const screen = document.getElementById('landing-screen');
  if (!screen) return;
  screen.classList.add('fade-out');
  setTimeout(() => screen.remove(), 900);
}

// ── Spinning Wheel Character Picker ──────────────────────────────────────────

const WHEEL_R    = 110;   // orbit radius (px)
const SLOT_W     = 60;    // slot width  (px)
const SLOT_H     = 76;    // slot height (px)
const SCENE_SIZE = 280;   // scene square size (px)
const CX         = SCENE_SIZE / 2;  // 140
const CY         = SCENE_SIZE / 2;  // 140

let _wAngle    = 0;       // current wheel rotation (degrees)
let _wVel      = 0;       // angular velocity (deg / frame)
let _wRaf      = null;    // running requestAnimationFrame id
let _wSlots    = [];      // [{ slot, char, idx }]
let _wN        = 0;       // total character count
let _wOnSelect = null;    // (id) => void callback
let _wActiveId = null;    // id of the currently active character

// Return the character index currently at the top of the wheel
function _topIdx() {
  const step = 360 / _wN;
  return (((Math.round(-_wAngle / step) % _wN) + _wN) % _wN);
}

// Reposition all slots from current _wAngle
function _draw() {
  const step = 360 / _wN;
  _wSlots.forEach(({ slot, idx }) => {
    const deg = idx * step + _wAngle;
    const rad = deg * Math.PI / 180;
    const x   = CX + WHEEL_R * Math.sin(rad);
    const y   = CY - WHEEL_R * Math.cos(rad);
    const t   = Math.cos(rad);                            // 1 = top, -1 = bottom
    const s   = Math.max(0.32, 0.38 + 0.70 * ((t + 1) / 2));
    const o   = Math.max(0.10, 0.14 + 0.86 * ((t + 1) / 2));
    slot.style.left      = (x - SLOT_W / 2).toFixed(1) + 'px';
    slot.style.top       = (y - SLOT_H / 2).toFixed(1) + 'px';
    slot.style.transform = `scale(${s.toFixed(3)})`;
    slot.style.opacity   = o.toFixed(3);
    slot.style.zIndex    = Math.round((t + 1) * 5 + 1);
  });
}

// Update the info panel + highlight ring to reflect character at top
function _updateInfo(idx) {
  const char = CHARACTERS[idx];
  if (!char) return;
  const sym  = document.getElementById('wheel-sel-symbol');
  const name = document.getElementById('wheel-sel-name');
  const pln  = document.getElementById('wheel-sel-planet');
  const info = document.getElementById('wheel-selected-info');
  const hl   = document.getElementById('wheel-active-highlight');
  if (sym)  sym.textContent  = char.symbol;
  if (name) name.textContent = char.name;
  if (pln)  pln.textContent  = char.planet.toUpperCase();
  if (info) info.style.color = char.color;
  if (hl) {
    hl.style.borderColor = char.color;
    hl.style.boxShadow   = `0 0 18px ${char.color}55, inset 0 0 18px ${char.color}0e`;
  }
}

// Smoothly animate the wheel to a target angle, then fire callback
function _animateTo(target, onDone) {
  if (_wRaf) { cancelAnimationFrame(_wRaf); _wRaf = null; }
  const from = _wAngle;
  const diff = target - from;
  const t0   = performance.now();
  const DUR  = 420;
  const ease = p => 1 - Math.pow(1 - p, 3);   // cubic ease-out
  const loop = (now) => {
    const p = Math.min(1, (now - t0) / DUR);
    _wAngle = from + diff * ease(p);
    _draw();
    _updateInfo(_topIdx());
    if (p < 1) { _wRaf = requestAnimationFrame(loop); }
    else        { _wAngle = target; _draw(); onDone?.(); _wRaf = null; }
  };
  _wRaf = requestAnimationFrame(loop);
}

// Spin wheel to bring character index i to the top (shortest arc)
function _spinToIdx(i) {
  const step = 360 / _wN;
  let target = -(i * step);
  while (target - _wAngle >  180) target -= 360;
  while (target - _wAngle < -180) target += 360;
  _animateTo(target, () => {
    const idx = _topIdx();
    _updateInfo(idx);
    _wOnSelect?.(CHARACTERS[idx].id);
  });
}

// Momentum loop after drag release
function _runMomentum() {
  if (_wRaf) { cancelAnimationFrame(_wRaf); _wRaf = null; }
  const step = 360 / _wN;
  const loop = () => {
    _wAngle += _wVel;
    _wVel   *= 0.93;           // friction
    _draw();
    if (Math.abs(_wVel) < 0.10) {
      // Snap to nearest slot
      const snapped = -Math.round(-_wAngle / step) * step;
      _animateTo(snapped, () => {
        const idx = _topIdx();
        _updateInfo(idx);
        _wOnSelect?.(CHARACTERS[idx].id);
      });
      return;
    }
    _updateInfo(_topIdx());
    _wRaf = requestAnimationFrame(loop);
  };
  _wRaf = requestAnimationFrame(loop);
}

// Attach drag / touch events to the scene element
function _attachEvents(scene) {
  let dragging = false;
  let lastX    = 0;
  const hist   = [];            // [{x, t}] — last 80 ms of moves
  const SENS   = 0.75;          // degrees per px of drag

  const onStart = (x) => {
    dragging = true;
    lastX    = x;
    hist.length = 0;
    hist.push({ x, t: performance.now() });
    _wVel = 0;
    if (_wRaf) { cancelAnimationFrame(_wRaf); _wRaf = null; }
  };
  const onMove = (x) => {
    if (!dragging) return;
    _wAngle += (x - lastX) * SENS;
    lastX    = x;
    const now = performance.now();
    hist.push({ x, t: now });
    while (hist.length > 1 && now - hist[0].t > 80) hist.shift();
    _draw();
    _updateInfo(_topIdx());
  };
  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    if (hist.length >= 2) {
      const f = hist[0], l = hist[hist.length - 1];
      const dt = l.t - f.t;
      if (dt > 4) _wVel = (l.x - f.x) * SENS / (dt / 16);
    }
    _wVel = Math.max(-32, Math.min(32, _wVel));
    _runMomentum();
  };

  scene.addEventListener('touchstart',  e => { e.preventDefault(); onStart(e.touches[0].clientX); }, { passive: false });
  scene.addEventListener('touchmove',   e => { e.preventDefault(); onMove(e.touches[0].clientX); },  { passive: false });
  scene.addEventListener('touchend',    e => { e.preventDefault(); onEnd(); }, { passive: false });
  scene.addEventListener('touchcancel', e => { e.preventDefault(); onEnd(); }, { passive: false });
  scene.addEventListener('mousedown',   e => onStart(e.clientX));
  window.addEventListener('mousemove',  e => onMove(e.clientX));
  window.addEventListener('mouseup',    ()  => onEnd());
}

export function buildCharPicker(onSelect, activeId) {
  _wOnSelect = onSelect;
  _wActiveId = activeId ?? null;
  _wN        = CHARACTERS.length;

  const track = document.getElementById('wheel-track');
  const scene = document.getElementById('wheel-scene');
  if (!track || !scene) return;

  track.innerHTML = '';
  _wSlots = [];

  CHARACTERS.forEach((char, i) => {
    const slot = document.createElement('div');
    slot.className = 'wheel-slot';
    slot.dataset.id = char.id;
    slot.style.setProperty('--char-color', char.color);
    slot.innerHTML = `
      <div class="wheel-slot-inner">
        <svg viewBox="${SVG_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" class="wheel-slot-svg">
          ${char.figure}
        </svg>
        <div class="wheel-slot-name">${char.name}</div>
      </div>`;

    // Tap active slot → confirm + close; tap other → spin to it
    slot.addEventListener('click', () => {
      if (i === _topIdx()) { onSelect(char.id); hideCharPicker(); }
      else                 { _spinToIdx(i); }
    });

    track.appendChild(slot);
    _wSlots.push({ slot, char, idx: i });
  });

  // Initial angle: show active character at top
  const startIdx = CHARACTERS.findIndex(c => c.id === _wActiveId);
  _wAngle = startIdx >= 0 ? -(startIdx * (360 / _wN)) : 0;
  _draw();
  _updateInfo(_topIdx());

  _attachEvents(scene);

  // Wire close & open buttons
  document.getElementById('char-picker-close')
    ?.addEventListener('click', hideCharPicker);
  document.getElementById('char-picker-btn')
    ?.addEventListener('click', showCharPicker);
}

export function showCharPicker() {
  const modal = document.getElementById('char-picker-modal');
  if (!modal) return;
  modal.classList.add('open');
  // Snap wheel to current active char on open
  if (_wActiveId && _wN > 0) {
    const i = CHARACTERS.findIndex(c => c.id === _wActiveId);
    if (i >= 0) {
      const step   = 360 / _wN;
      let target   = -(i * step);
      while (target - _wAngle >  180) target -= 360;
      while (target - _wAngle < -180) target += 360;
      _wAngle = target;
      _draw();
      _updateInfo(i);
    }
  }
}

export function hideCharPicker() {
  const modal = document.getElementById('char-picker-modal');
  if (modal) modal.classList.remove('open');
}

export function updateCharPickerBtn(char) {
  _wActiveId = char.id;   // keep wheel in sync

  const btn = document.getElementById('char-picker-btn');
  if (!btn) return;
  btn.style.setProperty('--picker-color', char.color);
  btn.style.borderColor = char.color + '55';
  btn.style.boxShadow   = `0 0 16px ${char.color}33`;
  document.getElementById('picker-btn-symbol').textContent = char.symbol;
  document.getElementById('picker-btn-name').textContent   = char.name;
}
