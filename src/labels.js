// ── Weimar Labels — Streets & Landmarks ─────────────────────────────────────
// Uses CSS2DRenderer so labels always face the camera and render as HTML.

import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Real Weimar landmark positions (matching BUILDINGS in world.js)
const LANDMARK_LABELS = [
  { text: 'MARKT',                   x:   0, y:  3,  z:   0 },
  { text: 'NATIONALTHEATER',         x:  12, y: 30,  z: -22 },
  { text: 'BAUHAUS MUSEUM',          x: -38, y: 16,  z: -33 },
  { text: 'GOETHEHAUS',              x: -16, y: 22,  z: -47 },
  { text: 'WEIMARHALLE',             x:  -5, y: 13,  z:  35 },
  { text: 'BAUHAUS UNIVERSITÄT',     x:  28, y: 18,  z: -52 },
  { text: 'ANNA AMALIA BIBLIOTHEK',  x:  -2, y: 22,  z: -65 },
  { text: 'PARK AN DER ILM',         x:  75, y:  3,  z: -72 },
  { text: 'THEATERPLATZ',            x: -20, y:  2,  z: -20 },
  { text: 'HERDERPLATZ',             x:  -5, y:  2,  z:  22 },
  { text: 'ILM',                     x:  90, y:  5,  z: -48 },
];

// Real Weimar street names (positioned along the corresponding STREETS)
const STREET_LABELS = [
  { text: 'Erfurter Str.',            x:  78, y: 1,  z:   2 },
  { text: 'Wielandstraße',            x:   2, y: 1,  z: -85 },
  { text: 'Schillerstraße',           x: -42, y: 1,  z: -44 },
  { text: 'Goethestraße',             x: -18, y: 1,  z: -62 },
  { text: 'Frauenplan',               x:   2, y: 1,  z:  62 },
  { text: 'Karl-Liebknecht-Str.',     x: -85, y: 1,  z:   2 },
  { text: 'Schloßstraße',             x:  -2, y: 1,  z: -42 },
  { text: 'Ilmpark-Allee',            x:  55, y: 1,  z: -38 },
  { text: 'Marktstraße',              x:  50, y: 1,  z:   2 },
];

// All created label elements (for color updates)
const allLabels = [];

export function createLabels(scene) {
  LANDMARK_LABELS.forEach(({ text, x, y, z }) => {
    const el = document.createElement('div');
    el.className = 'world-label landmark-label';
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    scene.add(obj);
    allLabels.push({ el, type: 'landmark' });
  });

  STREET_LABELS.forEach(({ text, x, y, z }) => {
    const el = document.createElement('div');
    el.className = 'world-label street-label';
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    scene.add(obj);
    allLabels.push({ el, type: 'street' });
  });
}

export function updateLabelColors(color) {
  allLabels.forEach(({ el, type }) => {
    el.style.color = color;
    el.style.borderColor = color;
    if (type === 'street') {
      el.style.opacity = '0.55';
    }
  });
}
