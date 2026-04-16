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
