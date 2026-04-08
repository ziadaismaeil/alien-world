// ── WEIMAR MULTIVERSE — Main Entry ──────────────────────────────────────────

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WeimarWorld } from './world.js';
import { CHARACTERS, DEFAULT_CHARACTER_ID } from './characters.js';
import { buildUI, setActiveCard, updateInfoPanel, setupLoreToggle, hideLoading } from './ui.js';

// ── Scene Setup ──────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();

// Camera — elevated angled view over the city
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 600);
camera.position.set(0, 120, 140);
camera.lookAt(0, 0, 0);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 20;
controls.maxDistance = 320;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 0, 0);

// ── Lights ───────────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(60, 100, 40);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width  = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near   = 1;
sunLight.shadow.camera.far    = 400;
sunLight.shadow.camera.left   = -150;
sunLight.shadow.camera.right  =  150;
sunLight.shadow.camera.top    =  150;
sunLight.shadow.camera.bottom = -150;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

// Fill light (from below/opposite)
const fillLight = new THREE.DirectionalLight(0x3344aa, 0.4);
fillLight.position.set(-40, 30, -60);
scene.add(fillLight);

// ── Sky Gradient Mesh ─────────────────────────────────────────────────────────
// Simple skydome with vertex colors top/bottom

const skyGeo = new THREE.SphereGeometry(500, 16, 8);
skyGeo.scale(-1, 1, 1);  // invert

const skyColors = new Float32Array(skyGeo.attributes.position.count * 3);
const skyTopColor    = new THREE.Color(0x000012);
const skyBottomColor = new THREE.Color(0x0a0030);

for (let i = 0; i < skyGeo.attributes.position.count; i++) {
  const y = skyGeo.attributes.position.getY(i);
  const t = THREE.MathUtils.clamp((y + 500) / 1000, 0, 1);
  const c = skyBottomColor.clone().lerp(skyTopColor, t);
  skyColors[i * 3    ] = c.r;
  skyColors[i * 3 + 1] = c.g;
  skyColors[i * 3 + 2] = c.b;
}
skyGeo.setAttribute('color', new THREE.BufferAttribute(skyColors, 3));

const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
const skyMesh = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyMesh);

// Target sky colors for lerping
let skyTopTarget    = skyTopColor.clone();
let skyBottomTarget = skyBottomColor.clone();
const currentTop    = skyTopColor.clone();
const currentBottom = skyBottomColor.clone();

function updateSkyColors() {
  const colors = skyGeo.attributes.color;
  for (let i = 0; i < skyGeo.attributes.position.count; i++) {
    const y = skyGeo.attributes.position.getY(i);
    const t = THREE.MathUtils.clamp((y + 500) / 1000, 0, 1);
    const c = currentBottom.clone().lerp(currentTop, t);
    colors.setXYZ(i, c.r, c.g, c.b);
  }
  colors.needsUpdate = true;
}

// ── Fog ───────────────────────────────────────────────────────────────────────

scene.fog = new THREE.Fog(0x080022, 80, 280);
let fogColorTarget = new THREE.Color(0x080022);
let fogNearTarget = 80;
let fogFarTarget = 280;

// ── World ─────────────────────────────────────────────────────────────────────

const world = new WeimarWorld(scene);

// ── Character State ───────────────────────────────────────────────────────────

let activeCharacter = null;
let transitionProgress = 0;
let transitioning = false;

const charMap = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));

function selectCharacter(id) {
  const char = charMap[id];
  if (!char) return;
  if (activeCharacter?.id === id) return;

  activeCharacter = char;
  transitioning = true;
  transitionProgress = 0;

  // Update UI
  setActiveCard(id);
  updateInfoPanel(char);

  // Set light targets
  const t = char.theme;
  sunLight.color.set(t.sunColor);
  sunLight.intensity = t.sunIntensity;
  fillLight.color.set(t.fillColor);
  fillLight.intensity = t.fillIntensity;
  ambientLight.color.set(t.ambientColor);
  ambientLight.intensity = t.ambientIntensity;

  // Sky targets
  skyTopTarget.setHex(t.skyTop);
  skyBottomTarget.setHex(t.skyBot);

  // Fog targets
  fogColorTarget.setHex(t.fogColor);
  fogNearTarget = t.fogNear;
  fogFarTarget  = t.fogFar;
}

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Animation Loop ────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time  = clock.getElapsedTime();
  const delta = clock.getDelta?.() ?? 0.016;

  controls.update();

  if (activeCharacter) {
    const theme = activeCharacter.theme;
    const speed = 0.05;

    // Lerp sky
    currentTop.lerp(skyTopTarget, speed);
    currentBottom.lerp(skyBottomTarget, speed);
    updateSkyColors();

    // Lerp fog
    scene.fog.color.lerp(fogColorTarget, speed);
    scene.fog.near += (fogNearTarget - scene.fog.near) * speed;
    scene.fog.far  += (fogFarTarget  - scene.fog.far ) * speed;

    // World theme lerp
    world.applyTheme(theme, false);

    // Particles
    world.updateParticles(time, theme);
  }

  // Subtle sky mesh bob
  skyMesh.rotation.y = time * 0.005;

  renderer.render(scene, camera);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

function init() {
  // Build character selection UI
  buildUI(selectCharacter);
  setupLoreToggle();

  // Start with default character (instant, no lerp)
  const defaultChar = charMap[DEFAULT_CHARACTER_ID];
  activeCharacter = defaultChar;
  setActiveCard(DEFAULT_CHARACTER_ID);
  updateInfoPanel(defaultChar);

  // Apply initial theme instantly
  const t = defaultChar.theme;
  sunLight.color.set(t.sunColor);
  sunLight.intensity = t.sunIntensity;
  fillLight.color.set(t.fillColor);
  fillLight.intensity = t.fillIntensity;
  ambientLight.color.set(t.ambientColor);
  ambientLight.intensity = t.ambientIntensity;
  skyTopTarget.setHex(t.skyTop);
  skyBottomTarget.setHex(t.skyBot);
  currentTop.setHex(t.skyTop);
  currentBottom.setHex(t.skyBot);
  scene.fog.color.setHex(t.fogColor);
  scene.fog.near = t.fogNear;
  scene.fog.far  = t.fogFar;
  fogColorTarget.setHex(t.fogColor);
  fogNearTarget = t.fogNear;
  fogFarTarget  = t.fogFar;
  world.applyTheme(t, true);
  updateSkyColors();

  animate();

  // Hide loading after brief delay
  setTimeout(hideLoading, 800);
}

init();
