// ── Player — 3D Alien Bodies, WASD Movement, Walk Animation ─────────────────

import * as THREE from 'three';

const MOVE_SPEED    = 0.35;
const ROTATE_SPEED  = 0.045;
const PLAYER_RADIUS = 1.5;

function collidesBuilding(px, pz, colliders) {
  for (const c of colliders) {
    if (px + PLAYER_RADIUS > c.minX && px - PLAYER_RADIUS < c.maxX &&
        pz + PLAYER_RADIUS > c.minZ && pz - PLAYER_RADIUS < c.maxZ) {
      return true;
    }
  }
  return false;
}

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
    this._locked         = false;
    this._lockTimer      = 0;
    this._attractTarget  = null; // Vector3 — set for attract-move, null for freeze
    this._colliders      = [];   // AABB building colliders from WeimarWorld
    this._cryTimer       = 0;    // >0 while Thrak is crying
    this._cryCooldown    = 0;    // cooldown so the same graffiti doesn't re-trigger immediately
  }

  lockFor(seconds) {
    this._locked        = true;
    this._lockTimer     = seconds;
    this._attractTarget = null;
  }

  // Auto-runs the player toward (x, z) for `seconds` seconds with no player control
  attractTo(x, z, seconds) {
    this._locked        = true;
    this._lockTimer     = seconds;
    this._attractTarget = new THREE.Vector3(x, 0, z);
  }

  setColliders(colliders) { this._colliders = colliders; }

  setCrying(duration) {
    if (this._cryCooldown > 0) return; // already cooling down
    this._cryTimer    = duration;
    this._cryCooldown = duration + 8;  // 8-second gap before next cry
  }

  get isCrying()       { return this._cryTimer > 0; }
  get cryCooldown()    { return this._cryCooldown; }

  get isLocked()    { return this._locked; }
  getLockTimer()    { return this._lockTimer; }

  setCharacter(char) {
    if (this.currentCharId === char.id) return;
    this.currentCharId = char.id;
    this.charMoveSpeed = char.theme?.charMoveSpeed ?? MOVE_SPEED;

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

  update(delta, time, speedMult = 1.0) {
    if (this._cryTimer    > 0) this._cryTimer    -= delta;
    if (this._cryCooldown > 0) this._cryCooldown -= delta;

    if (this._locked) {
      this._lockTimer -= delta;
      if (this._lockTimer <= 0) {
        this._locked = false;
        this._lockTimer = 0;
        this._attractTarget = null;
      }

      if (this._attractTarget) {
        // ── Attract-move: auto-run toward smell source ───────────────────
        const dx = this._attractTarget.x - this.group.position.x;
        const dz = this._attractTarget.z - this.group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.8) {
          // Smoothly rotate to face the target
          const targetAngle = Math.atan2(-dx, -dz);
          let diff = targetAngle - this.group.rotation.y;
          while (diff >  Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          this.group.rotation.y += diff * 0.15;

          // Run at 1.5× normal speed — excited dash
          const speed = (this.charMoveSpeed ?? MOVE_SPEED) * 1.5;
          const stepX = -Math.sin(this.group.rotation.y) * speed;
          const stepZ = -Math.cos(this.group.rotation.y) * speed;
          const nx = this.group.position.x + stepX;
          const nz = this.group.position.z + stepZ;
          if (!collidesBuilding(nx, this.group.position.z, this._colliders)) this.group.position.x = nx;
          if (!collidesBuilding(this.group.position.x, nz, this._colliders)) this.group.position.z = nz;
          this.isMoving = true;
        } else {
          this.isMoving = false;
        }
        this.group.position.y = 0;
        if (this.isMoving) this.walkTime += delta * 8;
        this.model?.userData?.animate?.(this.walkTime, this.isMoving, time, 1.0, this._cryTimer > 0);
        return;
      }

      // ── Freeze lock (VEX chat, etc.) ─────────────────────────────────
      this.isMoving = false;
      this.model?.userData?.animate?.(this.walkTime, false, time, 1.0, this._cryTimer > 0);
      return;
    }

    const w = keys['w'], s = keys['s'];
    const a = keys['a'], d = keys['d'];
    this.isMoving = !!(w || s || a || d);

    const speed = (this.charMoveSpeed ?? MOVE_SPEED) * speedMult;

    if (a) this.group.rotation.y += ROTATE_SPEED;
    if (d) this.group.rotation.y -= ROTATE_SPEED;

    const ry = this.group.rotation.y;
    if (w || s) {
      const sign = w ? -1 : 1;
      const nx = this.group.position.x + Math.sin(ry) * speed * sign;
      const nz = this.group.position.z + Math.cos(ry) * speed * sign;
      if (!collidesBuilding(nx, this.group.position.z, this._colliders)) this.group.position.x = nx;
      if (!collidesBuilding(this.group.position.x, nz, this._colliders)) this.group.position.z = nz;
    }
    this.group.position.y = 0;

    if (this.isMoving) this.walkTime += delta * 5;
    this.model?.userData?.animate?.(this.walkTime, this.isMoving, time, speedMult, this._cryTimer > 0);
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
                         lumi: buildLumi,   vex: buildVex,     solen: buildSolen,
                         niko: buildNiko };

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

// ── MORRA — Alien dog, quadruped, nose-first ──────────────────────────────────
function buildMorra() {
  const g = new THREE.Group();

  const teal   = 0x00ffaa;
  const tealE  = 0x00cc77;
  const dark   = 0x003322;

  const bodyMat = stdMat(0x00ddaa, tealE, 0.9, 0.05, 0.65, true, 0.9);
  const legMat  = stdMat(0x00cc99, tealE, 0.7, 0.05, 0.7,  true, 0.88);
  const noseMat = stdMat(0x00ffcc, teal,  2.5, 0, 0.4);

  // Body — elongated ellipsoid, low to ground (dog-like)
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.72, 1.6, 8, 10),
    bodyMat
  );
  body.rotation.z = Math.PI / 2; // horizontal
  body.position.set(0, 1.05, 0);
  g.add(body);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.55, 6, 8),
    bodyMat
  );
  neck.position.set(0, 1.35, 1.05);
  neck.rotation.x = -0.5;
  g.add(neck);

  // Head — slightly elongated snout-first
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 10, 8),
    stdMat(0x00ddaa, tealE, 0.8, 0.05, 0.6, true, 0.92)
  );
  head.scale.set(0.9, 0.85, 1.2);
  head.position.set(0, 1.55, 1.65);
  g.add(head);

  // Snout
  const snout = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 0.5, 6, 8),
    stdMat(0x00cc99, tealE, 1.0, 0.05, 0.55, true, 0.9)
  );
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 1.4, 2.22);
  g.add(snout);

  // Nose (big glowing disc — alien wet nose)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), noseMat);
  nose.position.set(0, 1.4, 2.55);
  g.add(nose);

  // Nostril glow rings
  [-0.08, 0.08].forEach(x => {
    const n = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.025, 5, 10),
      stdMat(teal, teal, 3.5, 0, 0.3, true, 0.7)
    );
    n.position.set(x, 1.37, 2.56);
    g.add(n);
  });

  // Eyes
  const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeIris  = stdMat(dark, teal, 1.2, 0, 0.5);
  const eyeGlint = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
  [-0.28, 0.28].forEach(x => {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 5), eyeWhite);
    sclera.position.set(x, 1.72, 2.1);
    g.add(sclera);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.10, 6, 4), eyeIris);
    iris.position.set(x, 1.72, 2.22);
    g.add(iris);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 3), eyeGlint);
    glint.position.set(x - 0.04, 1.76, 2.24);
    g.add(glint);
  });

  // Floppy ears (two flat petal shapes)
  [-0.55, 0.55].forEach(x => {
    const ear = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.5, 5, 6),
      stdMat(0x009977, tealE, 0.6, 0.05, 0.7, true, 0.85)
    );
    ear.position.set(x, 1.85, 1.55);
    ear.rotation.z = x > 0 ? 0.55 : -0.55;
    ear.rotation.x = 0.3;
    g.add(ear);
  });

  // Tail — curved up
  const tailSegs = [];
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.09 - i * 0.012, 0.32, 5, 5),
      stdMat(teal, tealE, 0.8 + i * 0.2, 0, 0.5, true, 0.8)
    );
    const angle = (i / 4) * (Math.PI * 0.65);
    seg.position.set(0, 1.0 + Math.sin(angle) * 0.8, -0.9 - i * 0.32 + Math.sin(angle) * 0.1);
    seg.rotation.x = -angle * 0.5;
    g.add(seg);
    tailSegs.push({ mesh: seg, baseY: seg.position.y, baseZ: seg.position.z, i });
  }

  // 4 Legs — each a pivot group for walk cycle
  function makeLeg(x, zOff) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.0, zOff);
    const upper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.15, 0.55, 5, 6), legMat
    );
    upper.position.y = -0.28;
    pivot.add(upper);
    const lower = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.48, 5, 5), legMat
    );
    lower.position.y = -0.82;
    pivot.add(lower);
    const paw = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 7, 5),
      stdMat(0x00cc99, tealE, 1.2, 0, 0.5)
    );
    paw.position.y = -1.08;
    pivot.add(paw);
    g.add(pivot);
    return pivot;
  }

  const legFL = makeLeg(-0.55,  0.75); // front-left
  const legFR = makeLeg( 0.55,  0.75); // front-right
  const legBL = makeLeg(-0.55, -0.75); // back-left
  const legBR = makeLeg( 0.55, -0.75); // back-right

  g.userData.animate = (wt, moving, t) => {
    // Walk cycle — alternating diagonal pairs (FL+BR, FR+BL)
    const walkAmt = moving ? Math.sin(wt * 6) * 0.45 : 0;
    legFL.rotation.x =  walkAmt;
    legBR.rotation.x =  walkAmt;
    legFR.rotation.x = -walkAmt;
    legBL.rotation.x = -walkAmt;

    // Tail wag — always, faster when excited
    const wagSpeed  = moving ? 8 : 3;
    const wagAmt    = moving ? 0.55 : 0.3;
    tailSegs.forEach(({ mesh, baseY, baseZ, i }) => {
      mesh.position.x = Math.sin(t * wagSpeed + i * 0.6) * wagAmt * (i / 4);
    });

    // Nose sniff bob
    nose.position.y = 1.4 + Math.sin(t * 4.5) * 0.04;

    // Body bounce when trotting
    if (moving) {
      body.position.y = 1.05 + Math.abs(Math.sin(wt * 6)) * 0.12;
      head.position.y = 1.55 + Math.abs(Math.sin(wt * 6)) * 0.08;
    } else {
      body.position.y += (1.05 - body.position.y) * 0.1;
      head.position.y += (1.55 - head.position.y) * 0.1;
    }
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

  // ── Tear drops (visible only when crying) ──────────────────────────────
  const tears = [-0.25, 0.25].map(x => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x88ddff, emissive: new THREE.Color(0x44aaff),
      emissiveIntensity: 4.0, metalness: 0, roughness: 0.1,
      transparent: true, opacity: 0.92,
      side: THREE.DoubleSide,
    });
    const tear = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), mat);
    tear.scale.set(1, 2.2, 1); // tall teardrop
    tear.position.set(x, 3.3, 0.5);
    tear.visible = false;
    g.add(tear);
    return tear;
  });

  g.userData.animate = (wt, moving, t, speedMult = 1.0, crying = false) => {
    // Heavy stomp bob
    const bob = Math.abs(Math.sin(wt)) * 0.18;
    torso.position.y = 2.3 + bob;
    head.position.y  = 3.45 + bob;
    cracks.forEach(c => { c.position.y = 2.3 + bob; });
    eyes.forEach(e  => { e.position.y  = 3.5  + bob; });
    armL.position.y = 3.05 + bob;
    armR.position.y = 3.05 + bob;

    if (crying) {
      // Head shake side-to-side frantically
      head.rotation.z = Math.sin(t * 14) * 0.28;
      head.rotation.x = Math.sin(t * 9)  * 0.12;
      // Arms raised to face — covering eyes / wailing
      armL.rotation.x = -2.2 + Math.sin(t * 8) * 0.3;
      armR.rotation.x = -2.2 + Math.sin(t * 8 + 1) * 0.3;
      // Full body tremble
      g.position.x = Math.sin(t * 22) * 0.06;
      g.position.z = Math.cos(t * 19) * 0.04;
      // Legs still walk but jelly-like
      legL.rotation.x = Math.sin(wt) * 0.5 + Math.sin(t * 18) * 0.08;
      legR.rotation.x = Math.sin(wt + Math.PI) * 0.5 + Math.sin(t * 18) * 0.08;
      // Tears drip down (loop every ~1.4s per tear, offset between the two)
      tears.forEach((tear, i) => {
        tear.visible = true;
        const phase = ((t * 1.2 + i * 0.7) % 1.4);
        tear.position.y = 3.35 + bob - phase * 2.8;
        tear.material.opacity = Math.max(0, 0.95 - phase * 0.55);
      });
      // Lava cracks flicker wildly — emotions too big to contain
      cracks.forEach((c, i) => {
        c.material.emissiveIntensity = 3.5 + Math.sin(t * 20 + i) * 2.5;
      });
      eyes.forEach((e, i) => {
        e.material.emissiveIntensity = 5.0 + Math.sin(t * 18 + i) * 2.5;
      });
    } else {
      // Normal: arm swing + leg step
      armL.rotation.x = Math.sin(wt + Math.PI) * 0.45;
      armR.rotation.x = Math.sin(wt) * 0.45;
      legL.rotation.x = Math.sin(wt) * 0.5;
      legR.rotation.x = Math.sin(wt + Math.PI) * 0.5;
      // Reset cry overrides
      head.rotation.z  = 0;
      head.rotation.x  = 0;
      g.position.x     = 0;
      g.position.z     = 0;
      tears.forEach(tear => { tear.visible = false; });
      // Normal lava pulsing
      cracks.forEach((c, i) => {
        c.material.emissiveIntensity = 2.5 + Math.sin(t * 4 + i) * 1.5;
      });
      eyes.forEach((e, i) => {
        e.material.emissiveIntensity = 3.0 + Math.sin(t * 5 + i * 2) * 1.5;
      });
    }
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

// ── SOLEN — Alien wheelchair user ─────────────────────────────────────────────
function buildSolen() {
  const g = new THREE.Group();

  const amber     = 0xffaa44;
  const amberE    = 0xcc6600;
  const amberDark = 0x884400;
  const frameCol  = 0xff8800;

  // ── Wheelchair frame ──────────────────────────────────────────────────────

  // Main seat frame (two side rails)
  const railMat = stdMat(frameCol, amberE, 1.2, 0.8, 0.2);
  const seatH = 1.35; // seat height from ground

  // Seat platform
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.12, 0.9),
    stdMat(amberDark, amberE, 0.7, 0.6, 0.4)
  );
  seat.position.set(0, seatH, 0);
  g.add(seat);

  // Back rest
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.1),
    stdMat(amberDark, amberE, 0.5, 0.5, 0.5)
  );
  back.position.set(0, seatH + 0.55, -0.4);
  g.add(back);

  // Armrests (left & right)
  [-0.65, 0.65].forEach(x => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.85),
      railMat
    );
    arm.position.set(x, seatH + 0.45, 0);
    g.add(arm);
  });

  // Footrest bar
  const footbar = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.08, 0.08),
    railMat
  );
  footbar.position.set(0, 0.42, 0.62);
  g.add(footbar);

  // Footrest legs (two struts from seat)
  [-0.4, 0.4].forEach(x => {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.95, 5),
      railMat
    );
    strut.position.set(x, 0.88, 0.5);
    strut.rotation.x = 0.55;
    g.add(strut);
  });

  // ── Large rear wheels (torus + spokes) ────────────────────────────────────
  const wheelMat   = stdMat(frameCol, amberE, 1.5, 0.9, 0.15);
  const rimMat     = stdMat(amber, amberE, 2.0, 0.7, 0.2, true, 0.9);
  const spokeMat   = stdMat(amber, amberE, 0.8, 0.6, 0.3);

  const rearWheels = [];
  [-0.72, 0.72].forEach((x, side) => {
    const wg = new THREE.Group();
    wg.position.set(x, 0.78, -0.1);
    g.add(wg);

    // Outer torus rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.09, 8, 24),
      rimMat
    );
    wg.add(rim);

    // Inner hub
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8),
      wheelMat
    );
    hub.rotation.z = Math.PI / 2;
    wg.add(hub);

    // Spokes (6)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.72, 4),
        spokeMat
      );
      spoke.position.set(Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0);
      spoke.rotation.z = a + Math.PI / 2;
      wg.add(spoke);
    }

    // Push ring (slightly larger, more transparent)
    const pushRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.04, 6, 20),
      stdMat(amber, amberE, 0.6, 0.5, 0.3, true, 0.55)
    );
    wg.add(pushRing);

    wg.rotation.y = Math.PI / 2; // align wheel plane to axle
    rearWheels.push(wg);
  });

  // ── Small front caster ────────────────────────────────────────────────────
  const caster = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.07, 6, 14),
    stdMat(frameCol, amberE, 1.0, 0.8, 0.2)
  );
  caster.position.set(0, 0.32, 0.68);
  caster.rotation.y = Math.PI / 2;
  g.add(caster);

  // ── Solen's body (seated alien) ───────────────────────────────────────────

  // Torso (hunched forward slightly)
  const torsoMat = stdMat(0xcc9966, amberE, 0.5, 0.1, 0.8, true, 0.92);
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.52, 0.7, 6, 8),
    torsoMat
  );
  torso.position.set(0, seatH + 0.72, 0);
  torso.rotation.x = 0.18; // slight forward hunch
  g.add(torso);

  // Legs (folded at knee — two thigh segments)
  const legMat = stdMat(0xbb8855, amberE, 0.4, 0.1, 0.9, true, 0.85);
  [-0.3, 0.3].forEach(x => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.65, 5, 6), legMat);
    thigh.position.set(x, seatH + 0.05, 0.22);
    thigh.rotation.x = -Math.PI / 2.2;
    g.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 5, 6), legMat);
    shin.position.set(x, 0.55, 0.55);
    shin.rotation.x = -0.3;
    g.add(shin);
  });

  // Head (alien amber, glowing)
  const headMat = stdMat(0xddaa77, amberE, 0.6, 0.05, 0.7, true, 0.93);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 10, 8), headMat);
  head.position.set(0, seatH + 1.65, 0.06);
  g.add(head);

  // Eyes — determined, half-closed
  const eyeMat = stdMat(amber, amberE, 2.5, 0, 0);
  const lidMat = stdMat(0x774422, 0, 0, 0, 1);
  const eyeData = [];
  [-0.22, 0.22].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 5), eyeMat);
    eye.position.set(x, seatH + 1.72, 0.58);
    g.add(eye);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.09, 0.07), lidMat);
    lid.position.set(x, seatH + 1.78, 0.60);
    g.add(lid);
    eyeData.push({ eye, lid });
  });

  // Tight mouth (grimace)
  const mouthMat = stdMat(0x884422, 0, 0, 0, 1);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.06), mouthMat);
  mouth.position.set(0, seatH + 1.54, 0.63);
  g.add(mouth);

  // ── Stellar energy glow around wheel hubs ─────────────────────────────────
  const glowMat = stdMat(amber, amber, 3.0, 0, 0.3, true, 0.18);
  rearWheels.forEach(wg => {
    const glow = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.18, 6, 22), glowMat);
    wg.add(glow);
  });

  // ── Animate ───────────────────────────────────────────────────────────────
  g.userData.animate = (wt, moving, t, speedMult = 1.0) => {
    // Wheels spin when moving (slower = less spin)
    const wheelSpin = moving ? wt * (speedMult < 0.5 ? 0.6 : 1.0) : t * 0.08;
    rearWheels.forEach(wg => { wg.rotation.x = wheelSpin; });
    caster.rotation.x = moving ? wt * 0.5 : 0;

    // Gentle forward lean when moving
    torso.rotation.x = moving ? 0.32 : 0.18;
    head.position.z  = moving ? 0.14 : 0.06;

    // Eye blink (slow, weary)
    const blink = Math.max(0, Math.sin(t * 0.28)) * 0.10;
    eyeData.forEach(({ lid }) => { lid.position.y = seatH + 1.78 - blink; });

    // Slight body sway side-to-side when rolling
    if (moving) {
      g.rotation.z = Math.sin(wt * 2.2) * 0.025;
    } else {
      g.rotation.z += (-g.rotation.z) * 0.08;
    }

    // Vibration on cobblestone (speedMult < 0.5)
    if (speedMult < 0.5 && moving) {
      g.position.y = Math.sin(t * 28) * 0.04;
    } else {
      g.position.y = 0;
    }
  };

  return g;
}

// ── NIKO — Alien kid, huge head, tiny body, arms always up ───────────────────
function buildNiko() {
  const g = new THREE.Group();

  const pink   = 0xff77cc;
  const pinkE  = 0xcc2288;
  const lilac  = 0xffaaee;

  // ── Body (small, kid proportions) ──────────────────────────────────────
  const bodyMat = stdMat(pink, pinkE, 0.6, 0.1, 0.7, true, 0.88);
  const body    = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), bodyMat);
  body.scale.set(1, 1.15, 0.9);
  body.position.y = 1.85;
  g.add(body);

  // ── Huge head ──────────────────────────────────────────────────────────
  const headMat = stdMat(pink, pinkE, 0.55, 0.05, 0.6, true, 0.9);
  const head    = new THREE.Mesh(new THREE.SphereGeometry(1.35, 12, 10), headMat);
  head.position.y = 3.55;
  g.add(head);

  // ── Eyes (big, wonder-struck) ───────────────────────────────────────────
  const eyeObjs = [];
  [[-0.45], [0.45]].forEach(([x]) => {
    const scl = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisM = stdMat(0xcc44aa, 0xaa00aa, 2.5, 0, 0);
    const pupM  = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const glintM = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), scl);
    sclera.position.set(x, 3.65, 1.1);

    const iris  = new THREE.Mesh(new THREE.SphereGeometry(0.3, 7, 5), irisM);
    iris.position.set(x, 3.65, 1.42);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), pupM);
    pupil.position.set(x, 3.65, 1.58);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 4, 3), glintM);
    glint.position.set(x + 0.12, 3.76, 1.64);

    g.add(sclera, iris, pupil, glint);
    eyeObjs.push({ iris });
  });

  // ── Cheeks (rosy alien) ──────────────────────────────────────────────
  const cheekMat = stdMat(0xff4499, 0xcc2266, 1.2, 0, 0.5, true, 0.35);
  [-0.85, 0.85].forEach(x => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 4), cheekMat);
    c.position.set(x, 3.42, 1.15);
    c.scale.set(1, 0.55, 0.7);
    g.add(c);
  });

  // ── Mouth (amazed O) ──────────────────────────────────────────────────
  const mouthMat = stdMat(0xff77cc, 0xff44aa, 1.5, 0, 0.5);
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.08, 5, 12),
    mouthMat
  );
  mouth.position.set(0, 3.2, 1.3);
  mouth.rotation.x = -0.15;
  g.add(mouth);

  // ── Arms (raised up, excited!) ────────────────────────────────────────
  const armMat = stdMat(pink, pinkE, 0.4, 0.1, 0.7, true, 0.85);
  const armGeo = new THREE.CapsuleGeometry(0.22, 1.1, 4, 8);
  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.95, 2.55, 0);
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(side * 0.4, 0.55, 0);
    arm.rotation.z = side * -0.9; // angled outward-up
    pivot.add(arm);
    g.add(pivot);
    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 5), armMat);
    hand.position.set(side * 1.55, 3.25, 0);
    g.add(hand);
    return { pivot, hand };
  }
  const armL = makeArm(-1);
  const armR = makeArm( 1);

  // ── Legs ─────────────────────────────────────────────────────────────
  const legMat = stdMat(pink, pinkE, 0.3, 0.1, 0.75, true, 0.82);
  const legGeo = new THREE.CapsuleGeometry(0.26, 0.9, 4, 8);
  function makeLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.42, 1.15, 0);
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.y = -0.6;
    pivot.add(leg);
    g.add(pivot);
    // Foot (little ellipsoid)
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), legMat);
    foot.scale.set(1.1, 0.55, 1.35);
    foot.position.set(side * 0.42, 0.22, 0.15);
    g.add(foot);
    return { pivot, foot };
  }
  const legL = makeLeg(-1);
  const legR = makeLeg( 1);

  // ── Orbiting star sparkle ─────────────────────────────────────────────
  const starMat = stdMat(0xffdd00, 0xffdd00, 4.5, 0, 0.2);
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), starMat);
  star.position.set(2.0, 3.5, 0);
  g.add(star);

  // Second smaller sparkle
  const star2Mat = stdMat(0x88ffdd, 0x44ffcc, 3.5, 0, 0);
  const star2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), star2Mat);
  star2.position.set(-1.8, 2.8, 0);
  g.add(star2);

  g.userData.animate = (wt, moving, t) => {
    // Gentle base bob
    const bob = Math.sin(t * 2.5) * 0.12;
    g.position.y = bob;

    // Head slight tilt
    head.rotation.z = Math.sin(t * 1.8) * 0.08;

    // Walk animation
    if (moving) {
      legL.pivot.rotation.x =  Math.sin(wt * 2) * 0.55;
      legR.pivot.rotation.x = -Math.sin(wt * 2) * 0.55;
      legL.foot.position.y  = 0.22 + Math.max(0, Math.sin(wt * 2)) * 0.35;
      legR.foot.position.y  = 0.22 + Math.max(0, -Math.sin(wt * 2)) * 0.35;
      // Arms pump (alternating)
      armL.pivot.rotation.x =  Math.sin(wt * 2) * 0.3;
      armR.pivot.rotation.x = -Math.sin(wt * 2) * 0.3;
      body.rotation.z = Math.sin(wt * 2) * 0.06;
    } else {
      // Idle: arms sway gently
      armL.pivot.rotation.x = Math.sin(t * 1.5) * 0.12;
      armR.pivot.rotation.x = Math.sin(t * 1.5 + 0.9) * 0.12;
      legL.pivot.rotation.x *= 0.9;
      legR.pivot.rotation.x *= 0.9;
      body.rotation.z *= 0.92;
    }

    // Eyes blink occasionally
    const blink = Math.max(0, Math.sin(t * 0.4) - 0.94) * 18;
    eyeObjs.forEach(({ iris }) => {
      iris.scale.y = Math.max(0.15, 1 - blink);
    });

    // Star orbit
    const sa = t * 1.6;
    star.position.set(Math.cos(sa) * 2.1, 3.2 + Math.sin(sa * 0.7) * 0.5, Math.sin(sa) * 2.1);
    star.rotation.y = t * 4;
    star.rotation.x = t * 2.5;

    const sa2 = t * 1.1 + Math.PI;
    star2.position.set(Math.cos(sa2) * 1.75, 2.6 + Math.sin(sa2 * 0.8) * 0.4, Math.sin(sa2) * 1.75);
    star2.rotation.y = -t * 3;
  };

  return g;
}

// ── PARENT WATCHER — Ghost adult that orbits Niko, always watching ────────────
export class ParentWatcher {
  constructor(scene) {
    this.scene      = scene;
    this.group      = new THREE.Group();
    this.orbitAngle = Math.PI; // start behind
    this._build();
    scene.add(this.group);
  }

  _build() {
    const g = this.group;

    // Robe / body
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0xccddff, emissive: 0x2244aa, emissiveIntensity: 0.8,
      transparent: true, opacity: 0.45, roughness: 0.5, metalness: 0,
    });
    const robe = new THREE.Mesh(new THREE.ConeGeometry(1.05, 4.5, 10), robeMat);
    robe.position.y = 2.25;
    g.add(robe);

    // Hood / head
    const hoodMat = new THREE.MeshStandardMaterial({
      color: 0xddeeff, emissive: 0x3355cc, emissiveIntensity: 0.9,
      transparent: true, opacity: 0.5, roughness: 0.4, metalness: 0,
    });
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 7), hoodMat);
    hood.position.y = 5.0;
    g.add(hood);

    // Eyes — always the most visible part
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xaaccff });
    const eyeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xaaeeff, emissiveIntensity: 6.0,
      transparent: true, opacity: 0.9,
    });
    this._eyes = [];
    [-0.28, 0.28].forEach(x => {
      const e  = new THREE.Mesh(new THREE.SphereGeometry(0.2, 7, 5), eyeMat);
      const eg = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 4), eyeGlowMat);
      e.position.set(x, 5.08, 0.65);
      eg.position.set(x, 5.08, 0.72);
      g.add(e, eg);
      this._eyes.push(eg);
    });

    // Arms — long, slightly reaching
    const armMat = new THREE.MeshStandardMaterial({
      color: 0xbbccff, emissive: 0x2233aa, emissiveIntensity: 0.5,
      transparent: true, opacity: 0.35,
    });
    [-1, 1].forEach(side => {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.1, 2.2, 6),
        armMat
      );
      arm.position.set(side * 1.2, 3.2, 0);
      arm.rotation.z = side * 0.55;
      g.add(arm);
    });

    // Floating dust particles around the watcher
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0x88aaff, transparent: true, opacity: 0.4,
    });
    this._dust = Array.from({ length: 8 }, (_, i) => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 4, 3), dustMat.clone());
      g.add(d);
      return { mesh: d, phase: (i / 8) * Math.PI * 2, r: 1.4 + (i % 3) * 0.35 };
    });

    this._robe = robe;
    this._hood = hood;
    this._t    = 0;
  }

  update(playerPos, delta) {
    this._t += delta;
    const t = this._t;

    // Slow orbit around player (one full loop every ~28 seconds)
    this.orbitAngle += delta * 0.224;
    const R = 7.5;
    const H = 4.2 + Math.sin(t * 0.6) * 0.8; // slight vertical drift

    const tx = playerPos.x + Math.cos(this.orbitAngle) * R;
    const tz = playerPos.z + Math.sin(this.orbitAngle) * R;

    this.group.position.lerp(new THREE.Vector3(tx, H, tz), 0.06);

    // Always look toward player (the eyes face Niko)
    this.group.lookAt(
      playerPos.x,
      playerPos.y + 2.8,
      playerPos.z
    );

    // Eye pulse (intensity varies — feels alive)
    const pulse = 4.5 + Math.sin(t * 2.3) * 1.8;
    this._eyes.forEach(e => { e.material.emissiveIntensity = pulse; });

    // Robe sway
    this._robe.rotation.z = Math.sin(t * 0.8) * 0.05;
    this._hood.rotation.z = Math.sin(t * 0.8) * 0.03;

    // Dust orbit
    this._dust.forEach(({ mesh, phase, r }) => {
      const a = t * 0.7 + phase;
      mesh.position.set(
        Math.cos(a) * r,
        1.5 + Math.sin(t * 0.5 + phase) * 1.0,
        Math.sin(a) * r
      );
      mesh.material.opacity = 0.2 + Math.sin(t + phase) * 0.18;
    });
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(o => {
      if (o.isMesh) {
        o.geometry?.dispose();
        (Array.isArray(o.material) ? o.material : [o.material])
          .forEach(m => m?.dispose());
      }
    });
  }
}

// ── MEAT OWNER — Follows Morra on a leash, lets go when she bolts ────────────
export class MeatOwner {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this._t    = 0;
    this._released = false;      // true while Morra is chasing smell
    this._reactionTimer = 0;     // pause before owner starts chasing
    this._build();
    scene.add(this.group);

    // Leash line
    const leashGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const leashMat = new THREE.LineBasicMaterial({
      color: 0x00cc88, transparent: true, opacity: 0.6,
    });
    this.leash = new THREE.Line(leashGeo, leashMat);
    scene.add(this.leash);
  }

  _build() {
    const g = this.group;

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x005533, emissive: 0x002211, emissiveIntensity: 0.4,
      transparent: true, opacity: 0.75, roughness: 0.8,
    });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 1.4, 6, 8), bodyMat);
    body.position.y = 2.2;
    g.add(body);

    // Head
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x006644, emissive: 0x003322, emissiveIntensity: 0.5,
      transparent: true, opacity: 0.78,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 8, 7), headMat);
    head.position.y = 3.42;
    g.add(head);

    // Eyes (small, watching the dog)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
    [-0.17, 0.17].forEach(x => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), eyeMat);
      e.position.set(x, 3.5, 0.38);
      g.add(e);
    });

    // Arms — one arm holding leash
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x004422, transparent: true, opacity: 0.65, roughness: 0.9,
    });
    // Right arm (leash arm) extended forward a bit
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 1.3, 6), armMat);
    armR.position.set(0.55, 2.65, 0.3);
    armR.rotation.x = -0.5;
    armR.rotation.z = -0.3;
    g.add(armR);
    // Left arm swinging
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 1.3, 6), armMat);
    armL.position.set(-0.55, 2.65, 0);
    armL.rotation.z = 0.3;
    g.add(armL);

    // Legs
    [-0.3, 0.3].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 1.5, 6), armMat);
      leg.position.set(x, 0.75, 0);
      g.add(leg);
    });

    this._head = head;
    this._armL = armL;
    this._armR = armR;
  }

  // released=true → owner lets go of leash (Morra chasing smell)
  setReleased(released) {
    this._released = released;
    this._reactionTimer = released ? 0.75 : 0; // brief freeze before chasing
    this.leash.material.opacity = released ? 0.2 : 0.65;
  }

  update(playerPos, delta) {
    this._t += delta;
    const t = this._t;

    const ry = playerPos._ry ?? 0;
    if (!this._released) {
      // Walk behind the dog at a comfortable leash length
      const followDist = 5.5;
      const targetX = playerPos.x + Math.sin(ry) * followDist + Math.cos(ry) * 1.2;
      const targetZ = playerPos.z + Math.cos(ry) * followDist - Math.sin(ry) * 1.2;
      this.group.position.lerp(new THREE.Vector3(targetX, 0, targetZ), 0.16);
    } else {
      // Brief reaction pause — owner freezes, then runs
      if (this._reactionTimer > 0) {
        this._reactionTimer -= delta;
      } else {
        // Chase the dog but keep a minimum distance — don't run ON the dog
        const dx = playerPos.x - this.group.position.x;
        const dz = playerPos.z - this.group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const MIN_DIST = 3.2;
        if (dist > MIN_DIST + 0.05) {
          const nx = dx / dist, nz = dz / dist;
          const targetX = playerPos.x - nx * MIN_DIST;
          const targetZ = playerPos.z - nz * MIN_DIST;
          // Speed up lerp the further away owner is
          const lerpAmt = Math.min(0.18, 0.05 + (dist - MIN_DIST) * 0.018);
          this.group.position.lerp(new THREE.Vector3(targetX, 0, targetZ), lerpAmt);
        }
      }
    }

    // Always look at dog
    this.group.lookAt(playerPos.x, playerPos.y + 1.5, playerPos.z);

    // Walk/run animation
    const isMoving = this._released && this._reactionTimer <= 0;
    const walkFreq = isMoving ? 9 : 4;
    const walkAmt  = isMoving ? 0.55 : 0.35;
    this._armL.rotation.x =  Math.sin(t * walkFreq) * walkAmt;
    this._armR.rotation.x = -Math.sin(t * walkFreq) * walkAmt * 0.7;

    // Leash: smooth catenary sag between hand and dog collar
    const handPos = new THREE.Vector3(0.55, 2.65, 0.3).applyMatrix4(this.group.matrixWorld);
    const dogPos  = new THREE.Vector3(playerPos.x, playerPos.y + 1.0, playerPos.z);
    const leashDist = handPos.distanceTo(dogPos);
    const sag = this._released ? leashDist * 0.08 : leashDist * 0.35; // tight when chasing, saggy when walking
    const mid = handPos.clone().lerp(dogPos, 0.5);
    mid.y -= sag;
    this.leash.geometry.setFromPoints([handPos, mid, dogPos]);
  }

  dispose() {
    this.scene.remove(this.group);
    this.scene.remove(this.leash);
    [this.group, this.leash].forEach(obj =>
      obj.traverse(o => {
        if (o.isMesh || o.isLine) {
          o.geometry?.dispose();
          (Array.isArray(o.material) ? o.material : [o.material])
            .forEach(m => m?.dispose());
        }
      })
    );
  }
}
