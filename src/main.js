// ── WEIMAR MULTIVERSE — Main Entry ──────────────────────────────────────────

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { WeimarWorld, WORLD_SPREAD } from './world.js';
import { CHARACTERS, DEFAULT_CHARACTER_ID } from './characters.js';
import { Player, ParentWatcher, MeatOwner, keys } from './player.js';
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
camera.position.set(0, 180, 220);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 20;
controls.maxDistance = 700;
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
sunLight.shadow.camera.left = -320; sunLight.shadow.camera.right = 320;
sunLight.shadow.camera.top  =  320; sunLight.shadow.camera.bottom = -320;
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

  if (e.code === 'Space' && activeCharacter?.id === 'vex') {
    e.preventDefault();
    if (currentInterior) {
      // ── Exit ──────────────────────────────────────────────────────────
      player.group.position.set(currentInterior.exitX, 0, currentInterior.exitZ);
      player.group.rotation.y = Math.PI;
      world.hideAllInteriors();
      currentInterior = null;
      _pendingDoor = null;
      _updateBuildingHud(null, false);
    } else if (_pendingDoor) {
      // ── Enter ─────────────────────────────────────────────────────────
      currentInterior = _pendingDoor;
      world.showInterior(currentInterior.id);
      player.group.position.set(currentInterior.spawnX, 0, currentInterior.spawnZ);
      player.group.rotation.y = Math.PI;   // face into the room (toward -Z / back wall)
      _pendingDoor = null;
      _updateBuildingHud(currentInterior, true);
      // Snap camera inside the room immediately (avoids far-clip and back-wall occlusion)
      camera.position.set(currentInterior.spawnX, 5, currentInterior.spawnZ + 9);
    }
  }
});

// ── Character State ───────────────────────────────────────────────────────────

let activeCharacter  = null;
let parentWatcher    = null;
let meatOwner        = null;
let currentInterior  = null;   // VEX: interior the player is currently inside
let _pendingDoor     = null;   // VEX: door player is standing near
const charMap = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));
const WS = WORLD_SPREAD;

function selectCharacter(id) {
  const char = charMap[id];
  if (!char || activeCharacter?.id === id) return;

  const wasNiko  = activeCharacter?.id === 'niko';
  const isNiko   = id === 'niko';
  const wasVex   = activeCharacter?.id === 'vex';
  const isVex    = id === 'vex';
  const wasMorra = activeCharacter?.id === 'morra';
  const isMorra  = id === 'morra';
  const wasSolen = activeCharacter?.id === 'solen';
  const isSolen  = id === 'solen';

  activeCharacter = char;
  setActiveCard(id);
  updateInfoPanel(char);
  updateLabelColors(char.color);
  player.setCharacter(char);

  // Playgrounds: only visible when Niko is active
  if (isNiko && !wasNiko) {
    world.setPlaygroundsVisible(true);
    parentWatcher = new ParentWatcher(scene);
  } else if (!isNiko && wasNiko) {
    world.setPlaygroundsVisible(false);
    parentWatcher?.dispose();
    parentWatcher = null;
  }

  // Student groups: only visible when Vex is active
  if (isVex  && !wasVex)  world.setStudentGroupsVisible(true);
  if (!isVex && wasVex)   world.setStudentGroupsVisible(false);

  // Meat smells + owner: only when Morra is active
  if (isMorra && !wasMorra) {
    world.setMeatSmellsVisible(true);
    meatOwner = new MeatOwner(scene);
  } else if (!isMorra && wasMorra) {
    world.setMeatSmellsVisible(false);
    meatOwner?.dispose();
    meatOwner = null;
  }

  // Accessibility features (cobblestone, curbs, steps, sidewalks): only when Solen is active
  if (isSolen && !wasSolen) {
    world.setAccessibilityVisible(true);
  } else if (!isSolen && wasSolen) {
    world.setAccessibilityVisible(false);
  }

  // VEX educational buildings + interiors
  if (isVex && !wasVex) {
    world.setVexEducationalVisible(true);
  } else if (!isVex && wasVex) {
    world.setVexEducationalVisible(false);
    // Exit building if inside one
    if (currentInterior) {
      player.group.position.set(currentInterior.exitX, 0, currentInterior.exitZ);
      world.hideAllInteriors();
      currentInterior = null;
      _pendingDoor = null;
      _updateBuildingHud(null, false);
    }
  }

  const t = char.theme;
  sunLight.color.set(t.sunColor);       sunLight.intensity  = t.sunIntensity;
  fillLight.color.set(t.fillColor);     fillLight.intensity = t.fillIntensity;
  ambientLight.color.set(t.ambientColor); ambientLight.intensity = t.ambientIntensity;
  skyTopTarget.setHex(t.skyTop);        skyBottomTarget.setHex(t.skyBot);
  fogColorTarget.setHex(t.fogColor);
  fogNearTarget = t.fogNear * WS;
  fogFarTarget  = t.fogFar  * WS;
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

  // Accessibility speed multiplier for Solen
  let solenSpeedMult = 1.0;
  const isSolen = activeCharacter?.id === 'solen';
  if (isSolen) {
    const { factor, label } = world.getAccessibilityFactor(
      player.getPosition().x, player.getPosition().z
    );
    solenSpeedMult = factor;
    const hud = window._a11yHud;
    if (hud) {
      hud.style.display = 'block';
      if (factor > 1.0) {
        hud.textContent = '✓  ' + label;
        hud.className = '';
      } else if (label) {
        hud.textContent = '⚠  ' + label;
        hud.className = factor < 0.25 ? 'blocked' : 'slowed';
      } else {
        hud.textContent = '◎  CLEAR PATH';
        hud.className = '';
      }
    }
  } else {
    if (window._a11yHud) window._a11yHud.style.display = 'none';
  }

  // Player update
  player.update(delta, time, isSolen ? solenSpeedMult : 1.0);

  // Parent watcher follows Niko
  if (parentWatcher) parentWatcher.update(player.getPosition(), delta);

  // Playground proximity glow (only meaningful when Niko, but updates fade-out too)
  if (activeCharacter) {
    const isNiko = activeCharacter.id === 'niko';
    world.updatePlaygroundProximity(
      player.getPosition().x,
      player.getPosition().z,
      isNiko,
      activeCharacter.theme.playgroundEmissive,
      activeCharacter.theme.playgroundEmissiveIntensity,
      time
    );
  }

  // ── Vex student group mechanics ───────────────────────────────────────────
  const isVex = activeCharacter?.id === 'vex';
  if (isVex) {
    const px = player.getPosition().x;
    const pz = player.getPosition().z;

    // Glow nearby groups
    world.updateStudentGroupGlow(px, pz);

    // Proximity chat lock
    if (!player.isLocked) {
      for (const sg of world.studentGroups) {
        const dist = Math.sqrt((px - sg.cx)**2 + (pz - sg.cz)**2);
        if (dist < 10 && time - sg.lastChat > 30) {
          player.lockFor(5);
          sg.lastChat = time;
          break;
        }
      }
    }

    // Chat HUD
    const chatHud = window._chatHud;
    if (player.isLocked) {
      chatHud.style.display = 'block';
      const secs = Math.ceil(player.getLockTimer());
      chatHud.textContent = `☁  SPORE EXCHANGE  —  ${secs}s`;
    } else {
      chatHud.style.display = 'none';
    }

    // Building door detection (only when not already inside)
    if (!currentInterior) {
      const px = player.getPosition().x;
      const pz = player.getPosition().z;
      _pendingDoor = world.getNearbyInteriorDoor(px, pz);
      _updateBuildingHud(_pendingDoor, false);
    }
  } else {
    if (window._chatHud) window._chatHud.style.display = 'none';
    if (!isVex && _pendingDoor) { _pendingDoor = null; _updateBuildingHud(null, false); }
  }

  // ── Morra dog mechanics ───────────────────────────────────────────────────
  const isMorra = activeCharacter?.id === 'morra';
  if (isMorra) {
    const px = player.getPosition().x;
    const pz = player.getPosition().z;

    // Animate smell threads across the city
    world.updateMeatSmells(time, delta);

    // Trigger attract-run when dog picks up a meat smell nearby
    if (!player.isLocked) {
      const zone = world.getMeatSmellAttraction(px, pz);
      if (zone && time - zone.lastSniff > 18) {
        player.attractTo(zone.cx, zone.cz, 5);
        zone.lastSniff = time;
        if (meatOwner) meatOwner.setReleased(true);
      }
    }

    // Owner grabs leash again once the run ends
    if (!player.isLocked && meatOwner?._released) {
      meatOwner.setReleased(false);
    }

    // Smell HUD
    const smellHud = window._smellHud;
    if (player.isLocked) {
      smellHud.style.display = 'block';
      const secs = Math.ceil(player.getLockTimer());
      smellHud.textContent = `✿  FOLLOWING SMELL  ·  ${secs}s`;
    } else {
      smellHud.style.display = 'none';
    }

    // Owner follows
    if (meatOwner) {
      const pos = player.getPosition().clone();
      pos._ry = player.getRotationY();
      meatOwner.update(pos, delta);
    }
  } else {
    if (window._smellHud) window._smellHud.style.display = 'none';
  }

  // 3rd-person camera follow
  if (thirdPerson) {
    const ry = player.getRotationY();
    // Use tighter offset inside buildings so camera stays within the room
    const behind = currentInterior ? 7 : 18;
    const above  = currentInterior ? 3 : 9;
    tpCamOffset.set(
      Math.sin(ry) * behind,
      above,
      Math.cos(ry) * behind
    );
    const targetPos = player.getPosition().clone().add(tpCamOffset);
    camera.position.lerp(targetPos, currentInterior ? 0.2 : 0.1);

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

function _updateBuildingHud(data, isInside) {
  const hud = window._buildingHud;
  if (!hud) return;
  if (!data && !isInside) { hud.style.display = 'none'; return; }
  hud.style.display = 'block';
  hud.textContent = isInside
    ? `[ SPACE ]  EXIT  —  ${data?.label ?? ''}`
    : `[ SPACE ]  ENTER  —  ${data.label}`;
  hud.className = isInside ? 'inside' : '';
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

  // Chat lock HUD (shown when Vex gets pulled into a student group)
  const chatHud = document.createElement('div');
  chatHud.id = 'chat-hud';
  chatHud.style.display = 'none';
  document.body.appendChild(chatHud);
  window._chatHud = chatHud; // accessed in animate

  // Accessibility HUD (shown when Solen is active)
  const a11yHud = document.createElement('div');
  a11yHud.id = 'a11y-hud';
  a11yHud.style.display = 'none';
  document.body.appendChild(a11yHud);
  window._a11yHud = a11yHud;

  // Smell HUD (shown when Morra chases meat smell)
  const smellHud = document.createElement('div');
  smellHud.id = 'smell-hud';
  smellHud.style.display = 'none';
  document.body.appendChild(smellHud);
  window._smellHud = smellHud;

  // Building entry HUD (shown when Vex is near a door or inside)
  const buildingHud = document.createElement('div');
  buildingHud.id = 'building-hud';
  buildingHud.style.display = 'none';
  document.body.appendChild(buildingHud);
  window._buildingHud = buildingHud;

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
  scene.fog.near = t.fogNear * WS; scene.fog.far = t.fogFar * WS;
  fogColorTarget.setHex(t.fogColor);
  fogNearTarget = t.fogNear * WS;  fogFarTarget = t.fogFar * WS;
  world.applyTheme(t, true);
  updateSkyColors();

  animate();
  setTimeout(hideLoading, 800);
}

init();
