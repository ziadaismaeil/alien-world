// ── Player — 3D Alien Bodies, WASD Movement, Walk Animation ─────────────────

import * as THREE from 'three';

const MOVE_SPEED   = 0.35;
const ROTATE_SPEED = 0.045;

// ── Key State ────────────────────────────────────────────────────────────────
export const keys = {};
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (['w','a','s','d'].includes(k)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// ── Player ───────────────────────────────────────────────────────────────────
export class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 5);
    scene.add(this.group);

    this.currentCharId = null;
    this.model         = null;
    this.walkTime      = 0;
    this.isMoving      = false;
  }

  setCharacter(char) {
    if (this.currentCharId === char.id) return;
    this.currentCharId = char.id;

    if (this.model) {
      this.group.remove(this.model);
      this.model.traverse(o => {
        if (o.isMesh) {
          o.geometry?.dispose();
          (Array.isArray(o.material) ? o.material : [o.material])
            .forEach(m => m?.dispose());
        }
      });
    }
    this.model = (MODEL_BUILDERS[char.id] ?? buildFallback)(char.color);
    this.model.rotation.y = Math.PI; // face forward (movement direction is -Z)
    this.group.add(this.model);
  }

  update(delta, time) {
    const w = keys['w'], s = keys['s'];
    const a = keys['a'], d = keys['d'];
    this.isMoving = !!(w || s || a || d);

    if (a) this.group.rotation.y += ROTATE_SPEED;
    if (d) this.group.rotation.y -= ROTATE_SPEED;

    const ry = this.group.rotation.y;
    if (w) {
      this.group.position.x -= Math.sin(ry) * MOVE_SPEED;
      this.group.position.z -= Math.cos(ry) * MOVE_SPEED;
    }
    if (s) {
      this.group.position.x += Math.sin(ry) * MOVE_SPEED;
      this.group.position.z += Math.cos(ry) * MOVE_SPEED;
    }
    this.group.position.y = 0;

    if (this.isMoving) this.walkTime += delta * 5;
    this.model?.userData?.animate?.(this.walkTime, this.isMoving, time);
  }

  getPosition()  { return this.group.position; }
  getRotationY() { return this.group.rotation.y; }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function stdMat(color, emissive = 0x000000, emissiveInt = 0,
                metalness = 0.3, roughness = 0.7,
                transparent = false, opacity = 1.0) {
  return new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: emissiveInt,
    metalness, roughness, transparent, opacity,
    side: THREE.FrontSide,
  });
}

function buildFallback(color) {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 8, 6),
    stdMat(color ?? 0xffffff, color ?? 0xffffff, 0.6)
  );
  mesh.position.y = 2;
  g.add(mesh);
  g.userData.animate = () => {};
  return g;
}

// ── MODEL_BUILDERS registry ───────────────────────────────────────────────────
const MODEL_BUILDERS = { zyrax: buildZyrax, morra: buildMorra, thrak: buildThrak,
                         lumi: buildLumi,   vex: buildVex,     solen: buildSolen };

// ── ZYRAX — Floating crystal being ───────────────────────────────────────────
function buildZyrax() {
  const g = new THREE.Group();

  // Main crystal body
  const bodyMat = stdMat(0x5588ff, 0x2244cc, 1.2, 0.95, 0.05, true, 0.85);
  const body = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), bodyMat);
  body.position.y = 2.5;
  body.scale.y = 1.8;
  g.add(body);

  // Inner rotating gem
  const innerMat = stdMat(0xaaccff, 0x88aaff, 2.5, 1, 0, true, 0.65);
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), innerMat);
  inner.position.y = 2.5;
  g.add(inner);

  // 3 crystal-shard legs
  const shardMat = stdMat(0x7799ff, 0x4466cc, 0.9, 0.9, 0.1, true, 0.8);
  const shards = [];
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 4), shardMat);
    shard.position.set(Math.cos(angle) * 0.85, 0.7, Math.sin(angle) * 0.85);
    shard.rotation.z = Math.PI;
    g.add(shard);
    shards.push({ mesh: shard, angle });
  }

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupMat = new THREE.MeshBasicMaterial({ color: 0x2255ff });
  [[-0.35], [0.35]].forEach(([x]) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), eyeMat);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.09, 4, 4), pupMat);
    eye.position.set(x, 2.9, 0.9);
    pup.position.set(x, 2.9, 1.05);
    g.add(eye, pup);
  });

  g.userData.animate = (wt, moving, t) => {
    body.rotation.y  = t * 0.9;
    inner.rotation.y = -t * 2.0;
    inner.rotation.x =  t * 0.8;
    const bob = Math.sin(wt * 2) * 0.14;
    body.position.y  = 2.5 + bob;
    inner.position.y = 2.5 + bob;
    g.position.y = Math.sin(t * 1.4) * 0.2; // hover
    shards.forEach(({ mesh }, i) => {
      const phase = wt + (i / 3) * Math.PI * 2;
      mesh.position.y = 0.7 + Math.abs(Math.sin(phase)) * 0.65;
      mesh.rotation.z = Math.PI + Math.sin(phase) * 0.25;
    });
  };
  return g;
}

// ── MORRA — Bioluminescent jellyfish ─────────────────────────────────────────
function buildMorra() {
  const g = new THREE.Group();

  // Bell dome
  const bellMat = stdMat(0x00ddaa, 0x009977, 1.4, 0.1, 0.7, true, 0.75);
  bellMat.side = THREE.DoubleSide;
  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
    bellMat
  );
  bell.rotation.x = Math.PI;
  bell.position.y = 3.2;
  g.add(bell);

  // Inner glow
  const glowMat = stdMat(0x88ffdd, 0x44ffbb, 2.5, 0, 0.5, true, 0.45);
  glowMat.side = THREE.DoubleSide;
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
    glowMat
  );
  glow.rotation.x = Math.PI;
  glow.position.y = 3.2;
  g.add(glow);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
  [-0.4, 0.4].forEach(x => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 4), eyeMat);
    e.position.set(x, 2.9, 0.95);
    g.add(e);
  });

  // Tentacles
  const tentMat = stdMat(0x00ffaa, 0x00cc77, 1.2, 0, 0.5, true, 0.7);
  const tentacles = [];
  const tCount = 8;
  for (let i = 0; i < tCount; i++) {
    const angle = (i / tCount) * Math.PI * 2;
    const r = 0.9 + (i % 3) * 0.15;
    const len = 2.0 + (i % 3) * 0.6;
    const t = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.015, len, 4),
      tentMat
    );
    const bx = Math.cos(angle) * r, bz = Math.sin(angle) * r;
    t.position.set(bx, 1.6 - len * 0.5, bz);
    g.add(t);
    tentacles.push({ mesh: t, bx, bz, phase: i * 0.85 });
  }

  g.userData.animate = (wt, moving, t) => {
    g.position.y = Math.sin(t * 1.2) * 0.35;
    const pulse = 1 + Math.sin(t * 2) * 0.06;
    bell.scale.set(pulse, 1, pulse);
    glow.scale.set(pulse * 0.92, 1, pulse * 0.92);
    tentacles.forEach(({ mesh, bx, bz, phase }) => {
      const wx = Math.sin(wt * 2 + phase) * 0.4;
      const wz = Math.cos(wt * 1.6 + phase) * 0.3;
      mesh.position.x = bx + wx;
      mesh.position.z = bz + wz;
      mesh.rotation.x = wx * 0.5;
      mesh.rotation.z = wz * 0.5;
    });
  };
  return g;
}

// ── THRAK — Volcanic rock humanoid ───────────────────────────────────────────
function buildThrak() {
  const g = new THREE.Group();

  const rock = (e = 0.8) => stdMat(0x221100, 0x882200, e, 0.6, 1.0);
  const lava = () => stdMat(0xff4400, 0xff2200, 3.5, 0.8, 0.2);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.0), rock());
  torso.position.y = 2.3;
  g.add(torso);

  // Lava cracks on torso (emissive planes)
  const crackGeos = [
    { w: 0.08, h: 1.2, x:  0.1, y: 2.3, z: 0.51 },
    { w: 0.06, h: 0.8, x: -0.25, y: 2.3, z: 0.51 },
  ];
  const cracks = crackGeos.map(({ w, h, x, y, z }) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lava());
    m.position.set(x, y, z);
    g.add(m);
    return m;
  });

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 0.95), rock(0.6));
  head.position.y = 3.45;
  g.add(head);

  // Fiery eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
  const eyeGlowMat = stdMat(0xff8800, 0xff4400, 4.0, 0, 0);
  const eyes = [];
  [-0.25, 0.25].forEach(x => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.17, 6, 4), eyeMat);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), eyeGlowMat);
    e.position.set(x, 3.5, 0.49);
    gl.position.set(x, 3.5, 0.55);
    g.add(e, gl);
    eyes.push(gl);
  });

  // Arms (pivot from shoulder)
  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.95, 3.05, 0);
    const armGeo = new THREE.BoxGeometry(0.48, 1.4, 0.48);
    armGeo.translate(0, -0.7, 0); // hangs down from pivot
    const arm = new THREE.Mesh(armGeo, rock(0.7));
    pivot.add(arm);
    g.add(pivot);
    return pivot;
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // Legs (pivot from hip)
  function makeLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.42, 1.5, 0);
    const legGeo = new THREE.BoxGeometry(0.55, 1.6, 0.55);
    legGeo.translate(0, -0.8, 0);
    const leg = new THREE.Mesh(legGeo, rock(0.8));
    pivot.add(leg);
    g.add(pivot);
    return pivot;
  }
  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  g.userData.animate = (wt, moving, t) => {
    // Heavy stomp bob
    const bob = Math.abs(Math.sin(wt)) * 0.18;
    [torso, head, armL, armR, ...cracks, ...eyes].forEach(o => {
      if (o === armL) { armL.position.y = 3.05 + bob; return; }
      if (o === armR) { armR.position.y = 3.05 + bob; return; }
    });
    torso.position.y = 2.3 + bob;
    head.position.y  = 3.45 + bob;
    cracks.forEach(c => { c.position.y = 2.3 + bob; });
    eyes.forEach((e, i) => { e.position.y = 3.5 + bob; });
    armL.position.y = 3.05 + bob;
    armR.position.y = 3.05 + bob;

    // Arm swing
    armL.rotation.x = Math.sin(wt + Math.PI) * 0.45;
    armR.rotation.x = Math.sin(wt) * 0.45;

    // Leg step
    legL.rotation.x = Math.sin(wt) * 0.5;
    legR.rotation.x = Math.sin(wt + Math.PI) * 0.5;

    // Lava pulsing
    cracks.forEach((c, i) => {
      c.material.emissiveIntensity = 2.5 + Math.sin(t * 4 + i) * 1.5;
    });
    eyes.forEach((e, i) => {
      e.material.emissiveIntensity = 3.0 + Math.sin(t * 5 + i * 2) * 1.5;
    });
  };
  return g;
}

// ── LUMI — Self-aware light being (spinning rings) ────────────────────────────
function buildLumi() {
  const g = new THREE.Group();

  // Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  core.position.y = 2.5;
  g.add(core);

  // 3 orbital rings at different axes
  const ringColors = [0xaaaaff, 0xffaaff, 0xaaffff];
  const ringInits  = [
    new THREE.Euler(0, 0, 0),
    new THREE.Euler(Math.PI / 2, 0, 0),
    new THREE.Euler(0, 0, Math.PI / 2),
  ];
  const rings = ringInits.map((euler, i) => {
    const rGeo = new THREE.TorusGeometry(1.6, 0.065, 6, 32);
    const rMat = new THREE.MeshStandardMaterial({
      color: ringColors[i], emissive: ringColors[i], emissiveIntensity: 2.0,
      transparent: true, opacity: 0.8,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.y = 2.5;
    ring.rotation.copy(euler);
    g.add(ring);
    return ring;
  });

  // Light-ray spikes
  const rayMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
  const dirs = [
    [1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],
    [0.7,0.7,0],[-0.7,0.7,0],[0.7,-0.7,0],[-0.7,-0.7,0],
  ];
  dirs.forEach(([dx, dy, dz]) => {
    const rGeo = new THREE.CylinderGeometry(0.04, 0.01, 1.8, 4);
    const ray = new THREE.Mesh(rGeo, rayMat);
    ray.position.set(2.5 + dx * 0.6, 2.5 + dy * 0.6, dz * 0.6);
    if (Math.abs(dx) > 0.5) ray.rotation.z = Math.PI / 2;
    if (Math.abs(dz) > 0.5) ray.rotation.x = Math.PI / 2;
    if (Math.abs(dx) > 0 && Math.abs(dy) > 0) {
      ray.rotation.z = Math.atan2(dy, dx);
    }
    // Simple approach: just place rays around core
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.01, 1.5, 4), rayMat);
    r.position.set(dx * 1.4, 2.5 + dy * 1.4, dz * 1.4);
    r.lookAt(0, 2.5, 0);
    r.rotateX(Math.PI / 2);
    g.add(r);
  });

  // Eyes (pure light dots)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xccccff });
  [-0.3, 0.3].forEach(x => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 4), eyeMat);
    e.position.set(x, 2.6, 0.52);
    g.add(e);
  });

  g.userData.animate = (wt, moving, t) => {
    // Float
    g.position.y = Math.sin(t * 1.5) * 0.4;

    const spd = moving ? 2.5 : 1.0;
    rings[0].rotation.y += 0.018 * spd;
    rings[1].rotation.y += 0.013 * spd;
    rings[1].rotation.z += 0.022 * spd;
    rings[2].rotation.x += 0.016 * spd;
    rings[2].rotation.y -= 0.011 * spd;

    // Core pulse
    const p = 0.85 + Math.sin(t * 3.5) * 0.2;
    core.scale.setScalar(p);
  };
  return g;
}

// ── VEX — Chaotic mushroom being ─────────────────────────────────────────────
function buildVex() {
  const g = new THREE.Group();

  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.55, 2.0, 8),
    stdMat(0xddddcc, 0x334400, 0.2, 0, 0.9)
  );
  stem.position.y = 1.3;
  g.add(stem);

  // Cap
  const capGeo = new THREE.SphereGeometry(1.55, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const cap = new THREE.Mesh(capGeo, stdMat(0x8833cc, 0x441188, 1.0, 0, 0.9));
  cap.material.side = THREE.DoubleSide;
  cap.rotation.x = Math.PI;
  cap.position.y = 2.85;
  g.add(cap);

  // Spots
  const spotMat = new THREE.MeshBasicMaterial({ color: 0xccff00 });
  [[-.55, 3.25, 1.1], [.6, 3.4, .9], [-.2, 3.55, .75], [.75, 2.95, 1.05]].forEach(([x,y,z]) => {
    const sp = new THREE.Mesh(new THREE.CircleGeometry(0.2, 6), spotMat);
    sp.position.set(x, y, z);
    sp.lookAt(x * 3, y, z * 3);
    g.add(sp);
  });

  // Googly eyes
  const eyeW = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupM = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const pupils = [];
  [[-0.3], [0.3]].forEach(([x]) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), eyeW);
    eye.position.set(x, 1.6, 0.6);
    g.add(eye);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), pupM);
    pup.position.set(x, 1.6, 0.82);
    g.add(pup);
    pupils.push({ mesh: pup, bx: x, by: 1.6 });
  });

  // Smile
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.055, 4, 10, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0x88ff00 })
  );
  smile.position.set(0, 1.12, 0.6);
  smile.rotation.z = Math.PI;
  g.add(smile);

  // Feet
  const footMat = stdMat(0x552288, 0x220044, 0.3, 0, 1);
  const feet = [-0.38, 0.38].map(x => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), footMat);
    f.position.set(x, 0.25, 0.1);
    g.add(f);
    return f;
  });

  g.userData.animate = (wt, moving, t) => {
    // Bouncy
    const bounce = Math.abs(Math.sin(wt * 2)) * 0.28;
    stem.position.y = 1.3 + bounce;
    cap.position.y  = 2.85 + bounce;
    smile.position.y = 1.12 + bounce;

    // Cap wobble (chaotic)
    cap.rotation.z  = Math.sin(wt * 2.5) * 0.1;
    cap.rotation.x  = Math.PI + Math.cos(wt * 1.8) * 0.07;

    // Googly eyes rolling
    pupils.forEach(({ mesh, bx, by }, i) => {
      mesh.position.x = bx + Math.sin(t * 5 + i * 2.3) * 0.09;
      mesh.position.y = (by + bounce) + Math.cos(t * 4.2 + i) * 0.07;
    });

    // Feet hop
    feet[0].position.y = 0.25 + Math.max(0, Math.sin(wt * 2)) * 0.5;
    feet[1].position.y = 0.25 + Math.max(0, Math.sin(wt * 2 + Math.PI)) * 0.5;
  };
  return g;
}

// ── SOLEN — Ancient hooded ghost ─────────────────────────────────────────────
function buildSolen() {
  const g = new THREE.Group();

  // Robe
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(1.25, 3.6, 9),
    stdMat(0xbb8855, 0x441500, 0.6, 0.1, 1.0, true, 0.88)
  );
  robe.position.y = 1.8;
  g.add(robe);

  // Hood
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.88, 8, 6),
    stdMat(0xcc9966, 0x441500, 0.5, 0.1, 1.0)
  );
  hood.position.y = 3.75;
  g.add(hood);

  // Face glow inside hood
  const face = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 6),
    stdMat(0xffddaa, 0xcc7700, 1.0, 0, 0.4, true, 0.4)
  );
  face.position.set(0, 3.78, 0.22);
  g.add(face);

  // Tired drooping eyes
  const eyeMat = stdMat(0xffaa44, 0xcc6600, 2.0, 0, 0);
  const eyelidMat = stdMat(0x885533, 0x000000, 0, 0, 1);
  const eyeData = [];
  [-0.23, 0.23].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17, 6, 4), eyeMat);
    eye.position.set(x, 3.82, 0.65);
    g.add(eye);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.06), eyelidMat);
    lid.position.set(x, 3.9, 0.67);
    g.add(lid);
    eyeData.push({ eye, lid });
  });

  // Orbiting dust particles
  const dustMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.5 });
  const dustParticles = Array.from({ length: 7 }, (_, i) => {
    const dp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 4, 4), dustMat.clone());
    const baseAngle = (i / 7) * Math.PI * 2;
    g.add(dp);
    return { mesh: dp, baseAngle, radius: 1.3 + (i % 3) * 0.3, hy: 1.0 + i * 0.4 };
  });

  g.userData.animate = (wt, moving, t) => {
    // Slow hover float (Solen never truly walks — she drifts)
    g.position.y = Math.sin(t * 0.7) * 0.3;

    // Sway
    robe.rotation.z = Math.sin(t * 0.5) * 0.06;
    hood.rotation.z = robe.rotation.z * 0.7;
    face.rotation.z = robe.rotation.z * 0.5;

    // Slow blink
    const blink = Math.max(0, Math.sin(t * 0.35)) * 0.12;
    eyeData.forEach(({ eye, lid }) => {
      lid.position.y = 3.9 - blink;
    });

    // Dust orbiting
    dustParticles.forEach(({ mesh, baseAngle, radius, hy }, i) => {
      const a = baseAngle + t * 0.28 * (i % 2 === 0 ? 1 : -1);
      mesh.position.set(
        Math.cos(a) * radius,
        hy + Math.sin(t * 0.6 + i) * 0.25,
        Math.sin(a) * radius
      );
      mesh.material.opacity = 0.25 + Math.sin(t + i * 1.3) * 0.2;
    });

    // Forward lean when moving
    if (moving) {
      robe.rotation.x = -0.08;
      hood.rotation.x = -0.06;
    } else {
      robe.rotation.x += (-robe.rotation.x) * 0.05;
      hood.rotation.x += (-hood.rotation.x) * 0.05;
    }
  };
  return g;
}
