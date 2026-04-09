// ── Weimar Labels — accurate positions matching revised world.js ─────────────
// Origin = Markt (OSM), 1 unit = 10m, X=East, Z=South

import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { WORLD_SPREAD } from './world.js';

// Landmark labels — floated above buildings
const LANDMARK_LABELS = [
  { text: 'MARKT',                    x:   0, y:  3,  z:   0 },
  { text: 'NATIONALTHEATER',          x: -35, y: 15,  z:  -3 },
  { text: 'STADTSCHLOSS',             x:  21, y: 26,  z: -14 },
  { text: 'HERDERKIRCHE',             x:  -4, y: 40,  z: -20 },
  { text: 'ANNA AMALIA BIBLIOTHEK',   x:  17, y: 20,  z:  10 },
  { text: 'GOETHEHAUS',               x:  -7, y: 22,  z:  21 },
  { text: 'SCHILLERHAUS',             x: -14, y: 20,  z:   5 },
  { text: 'WITTUMSPALAIS',            x: -20, y: 18,  z: -10 },
  { text: 'BAUHAUS MUSEUM',           x: -38, y: 14,  z: -60 },
  { text: 'BAUHAUS UNIVERSITÄT',      x:   2, y: 20,  z:  41 },
  { text: 'HAUPTBAHNHOF',             x: -24, y: 18,  z: -85 },
  { text: 'PARK AN DER ILM',          x:  55, y:  3,  z:  25 },
  { text: 'ILM',                      x:  35, y:  4,  z:   5 },
];

// Plaza labels — at ground level
const PLAZA_LABELS = [
  { text: 'Theaterplatz',             x: -35, y:  2,  z:   5 },
  { text: 'Herderplatz',              x:  -4, y:  2,  z: -13 },
  { text: 'Burgplatz',                x:  21, y:  2,  z:  -6 },
  { text: 'Platz der Demokratie',     x:  17, y:  2,  z:  17 },
  { text: 'Frauenplan',               x:  -7, y:  2,  z:  14 },
];

// Street labels — at near-ground level
const STREET_LABELS = [
  { text: 'Schillerstraße',           x: -17, y:  1,  z:   5 },
  { text: 'Kaufstraße',               x:  22, y:  1,  z:   5 },
  { text: 'Herderstraße',             x:   4, y:  1,  z: -14 },
  { text: 'Burgstraße',               x:  12, y:  1,  z:  -4 },
  { text: 'Karl-Liebknecht-Str.',     x: -20, y:  1,  z: -20 },
  { text: 'Carl-August-Allee',        x:  38, y:  1,  z:  15 },
  { text: 'Geschwister-Scholl-Str.',  x:   5, y:  1,  z:  32 },
  { text: 'Schopenhauerstraße',       x: -28, y:  1,  z: -60 },
  { text: 'Friedensstraße',           x:  10, y:  1,  z:  38 },
  { text: 'Ilmpark-Allee',            x:  54, y:  1,  z:  42 },
];

const allLabels = [];

export function createLabels(scene) {
  const S = WORLD_SPREAD;
  LANDMARK_LABELS.forEach(({ text, x, y, z }) => {
    const el = document.createElement('div');
    el.className = 'world-label landmark-label';
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x * S, y, z * S);
    scene.add(obj);
    allLabels.push({ el, type: 'landmark' });
  });

  PLAZA_LABELS.forEach(({ text, x, y, z }) => {
    const el = document.createElement('div');
    el.className = 'world-label plaza-label';
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x * S, y, z * S);
    scene.add(obj);
    allLabels.push({ el, type: 'plaza' });
  });

  STREET_LABELS.forEach(({ text, x, y, z }) => {
    const el = document.createElement('div');
    el.className = 'world-label street-label';
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x * S, y, z * S);
    scene.add(obj);
    allLabels.push({ el, type: 'street' });
  });
}

export function updateLabelColors(color) {
  allLabels.forEach(({ el, type }) => {
    el.style.color = color;
    if (type === 'landmark') el.style.borderColor = color;
    if (type === 'street')   el.style.opacity = '0.5';
    if (type === 'plaza')    el.style.opacity = '0.65';
  });
}
