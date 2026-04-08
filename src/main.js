// ── WEIMAR MULTIVERSE — Main Entry ──────────────────────────────────────────

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { WeimarWorld } from './world.js';
import { CHARACTERS, DEFAULT_CHARACTER_ID } from './characters.js';
import { Player, keys } from './player.js';
import { buildUI, setActiveCard, updateInfoPanel, setupLoreToggle, hideLoading } from './ui.js';
import { createLabels, updateLabelColors } from './labels.js';

// ── Renderer ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

// CSS2D label renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.inset = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '5';
document.body.appendChild(labelRenderer.domElement);

// ── Scene ─────────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 600);
camera.position.set(0, 120, 140);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 20;
controls.maxDistance = 320;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 0, 0);

// ── Lights ────────────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
sunLight.position.set(60, 100, 40);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width  = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1; sunLight.shadow.camera.far  = 400;
sunLight.shadow.camera.left = -150; sunLight.shadow.camera.right = 150;
sunLight.shadow.camera.top  =  150; sunLight.shadow.camera.bottom = -150;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x8899ff, 1.0);
fillLight.position.set(-40, 30, -60);
scene.add(fillLight);

// ── Sky ───────────────────────────────────────────────────────────────────────

const skyGeo = new THREE.SphereGeometry(500, 16, 8);
skyGeo.scale(-1, 1, 1);
const skyColorArr = new Float32Array(skyGeo.attributes.position.count * 3);
const skyTopColor    = new THREE.Color(0x000012);
const skyBottomColor = new THREE.Color(0x0a0030);

for (let i = 0; i < skyGeo.attributes.position.count; i++) {
  const y = skyGeo.attributes.position.getY(i);
  const t = THREE.MathUtils.clamp((y + 500) / 1000, 0, 1);
  const c = skyBottomColor.clone().lerp(skyTopColor, t);
  skyColorArr[i*3] = c.r; skyColorArr[i*3+1] = c.g; skyColorArr[i*3+2] = c.b;
}
skyGeo.setAttribute('color', new THREE.BufferAttribute(skyColorArr, 3));
const skyMesh = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
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
let fogNearTarget = 80, fogFarTarget = 280;

// ── World & Labels ────────────────────────────────────────────────────────────

const world  = new WeimarWorld(scene);
const player = new Player(scene);
createLabels(scene);

// ── Camera Mode ───────────────────────────────────────────────────────────────

let thirdPerson = false;
const tpCamOffset = new THREE.Vector3(); // reused each frame
const tpLookTarget = new THREE.Vector3();
// Store overview camera state for restoring on toggle-back
let overviewPos = camera.position.clone();
let overviewTarget = controls.target.clone();

function toggleCamera() {
  thirdPerson = !thirdPerson;
  controls.enabled = !thirdPerson;

  if (!thirdPerson) {
    // Restore overview
    camera.position.copy(overviewPos);
    controls.target.copy(overviewTarget);
    controls.update();
  } else {
    // Save current overview state
    overviewPos.copy(camera.position);
    overviewTarget.copy(controls.target);
  }

  // Update HUD
  const hint = document.getElementById('cam-mode-hint');
  if (hint) {
    hint.textContent = thirdPerson
      ? '3RD PERSON — WASD to move  ·  C to exit'
      : 'OVERVIEW — C for 3rd person';
    hint.classList.toggle('active', thirdPerson);
  }
  const ctrlHint = document.getElementById('controls-hint');
  if (ctrlHint) ctrlHint.style.opacity = thirdPerson ? '0' : '';
}

// ── Key handler for C ─────────────────────────────────────────────────────────

window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'c') toggleCamera();
});

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
  player.setCharacter(char);

  const t = char.theme;
  sunLight.color.set(t.sunColor);       sunLight.intensity  = t.sunIntensity;
  fillLight.color.set(t.fillColor);     fillLight.intensity = t.fillIntensity;
  ambientLight.color.set(t.ambientColor); ambientLight.intensity = t.ambientIntensity;
  skyTopTarget.setHex(t.skyTop);        skyBottomTarget.setHex(t.skyBot);
  fogColorTarget.setHex(t.fogColor);
  fogNearTarget = t.fogNear;            fogFarTarget = t.fogFar;
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
  const delta = clock.getDelta();
  const time  = clock.getElapsedTime();

  controls.update();

  // Player update
  player.update(delta, time);

  // 3rd-person camera follow
  if (thirdPerson) {
    const ry = player.getRotationY();
    const behind = 18, above = 9;
    tpCamOffset.set(
      Math.sin(ry) * behind,
      above,
      Math.cos(ry) * behind
    );
    const targetPos = player.getPosition().clone().add(tpCamOffset);
    camera.position.lerp(targetPos, 0.1);

    tpLookTarget.copy(player.getPosition()).add(new THREE.Vector3(0, 3.5, 0));
    camera.lookAt(tpLookTarget);
  }

  if (activeCharacter) {
    const theme = activeCharacter.theme;
    const spd = 0.05;
    currentTop.lerp(skyTopTarget, spd);
    currentBottom.lerp(skyBottomTarget, spd);
    updateSkyColors();
    scene.fog.color.lerp(fogColorTarget, spd);
    scene.fog.near += (fogNearTarget - scene.fog.near) * spd;
    scene.fog.far  += (fogFarTarget  - scene.fog.far)  * spd;
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

  // Inject camera mode HUD
  const hud = document.createElement('div');
  hud.id = 'cam-mode-hint';
  hud.textContent = 'OVERVIEW — C for 3rd person';
  document.body.appendChild(hud);

  const defaultChar = charMap[DEFAULT_CHARACTER_ID];
  activeCharacter = defaultChar;
  setActiveCard(DEFAULT_CHARACTER_ID);
  updateInfoPanel(defaultChar);
  updateLabelColors(defaultChar.color);
  player.setCharacter(defaultChar);

  const t = defaultChar.theme;
  sunLight.color.set(t.sunColor);         sunLight.intensity   = t.sunIntensity;
  fillLight.color.set(t.fillColor);       fillLight.intensity  = t.fillIntensity;
  ambientLight.color.set(t.ambientColor); ambientLight.intensity = t.ambientIntensity;
  skyTopTarget.setHex(t.skyTop);   skyBottomTarget.setHex(t.skyBot);
  currentTop.setHex(t.skyTop);     currentBottom.setHex(t.skyBot);
  scene.fog.color.setHex(t.fogColor);
  scene.fog.near = t.fogNear; scene.fog.far = t.fogFar;
  fogColorTarget.setHex(t.fogColor);
  fogNearTarget = t.fogNear;  fogFarTarget = t.fogFar;
  world.applyTheme(t, true);
  updateSkyColors();

  animate();
  setTimeout(hideLoading, 800);
}

init();
