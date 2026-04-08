// ── WEIMAR MULTIVERSE — Main Entry ──────────────────────────────────────────

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { WeimarWorld } from './world.js';
import { CHARACTERS, DEFAULT_CHARACTER_ID } from './characters.js';
import { buildUI, setActiveCard, updateInfoPanel, setupLoreToggle, hideLoading } from './ui.js';
import { createLabels, updateLabelColors } from './labels.js';

// ── Scene Setup ──────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

// ── CSS2D Label Renderer ──────────────────────────────────────────────────────

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.inset = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '5';
document.body.appendChild(labelRenderer.domElement);

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

const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
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
const fillLight = new THREE.DirectionalLight(0x8899ff, 1.0);
fillLight.position.set(-40, 30, -60);
scene.add(fillLight);

// ── Sky Gradient Mesh ─────────────────────────────────────────────────────────

const skyGeo = new THREE.SphereGeometry(500, 16, 8);
skyGeo.scale(-1, 1, 1);

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
createLabels(scene);

// ── Character State ───────────────────────────────────────────────────────────

let activeCharacter = null;
const charMap = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));

function selectCharacter(id) {
  const char = charMap[id];
  if (!char || activeCharacter?.id === id) return;

  activeCharacter = char;
  setActiveCard(id);
  updateInfoPanel(char);
  updateLabelColors(char.color);

  const t = char.theme;
  sunLight.color.set(t.sunColor);
  sunLight.intensity = t.sunIntensity;
  fillLight.color.set(t.fillColor);
  fillLight.intensity = t.fillIntensity;
  ambientLight.color.set(t.ambientColor);
  ambientLight.intensity = t.ambientIntensity;

  skyTopTarget.setHex(t.skyTop);
  skyBottomTarget.setHex(t.skyBot);
  fogColorTarget.setHex(t.fogColor);
  fogNearTarget = t.fogNear;
  fogFarTarget  = t.fogFar;
}

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Animation Loop ────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  controls.update();

  if (activeCharacter) {
    const theme = activeCharacter.theme;
    const speed = 0.05;

    currentTop.lerp(skyTopTarget, speed);
    currentBottom.lerp(skyBottomTarget, speed);
    updateSkyColors();

    scene.fog.color.lerp(fogColorTarget, speed);
    scene.fog.near += (fogNearTarget - scene.fog.near) * speed;
    scene.fog.far  += (fogFarTarget  - scene.fog.far ) * speed;

    world.applyTheme(theme, false);
    world.updateParticles(time, theme);
  }

  skyMesh.rotation.y = time * 0.005;

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

function init() {
  buildUI(selectCharacter);
  setupLoreToggle();

  const defaultChar = charMap[DEFAULT_CHARACTER_ID];
  activeCharacter = defaultChar;
  setActiveCard(DEFAULT_CHARACTER_ID);
  updateInfoPanel(defaultChar);
  updateLabelColors(defaultChar.color);

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
  setTimeout(hideLoading, 800);
}

init();
