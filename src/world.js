// ── Weimar World Builder ─────────────────────────────────────────────────────
// Generates a simplified 3D representation of Weimar's 2x2km city center.
// 1 Three.js unit ≈ 10 meters.  World extent: ~200×200 units.

import * as THREE from 'three';

// ── Layout Data ──────────────────────────────────────────────────────────────

const STREETS = [
  // [cx, cz, width, length, rotation]
  // Main E-W axes
  [0,    0,  3, 200, 0],
  [0,   20,  2, 180, 0],
  [0,  -20,  2, 180, 0],
  [0,   45,  2, 160, 0],
  [0,  -45,  2, 160, 0],
  [0,   70,  2, 140, 0],
  [0,  -70,  2, 140, 0],
  // Main N-S axes
  [0,    0,  3, 200, Math.PI / 2],
  [20,   0,  2, 180, Math.PI / 2],
  [-20,  0,  2, 180, Math.PI / 2],
  [45,   0,  2, 160, Math.PI / 2],
  [-45,  0,  2, 160, Math.PI / 2],
  [70,   0,  2, 140, Math.PI / 2],
  [-70,  0,  2, 140, Math.PI / 2],
  // Diagonal (Schillerstraße feel)
  [-18, -22, 2,  70, Math.PI / 6],
  [18,   22, 2,  60, Math.PI / 5],
];

// Buildings: [cx, cz, width, depth, baseHeight, type]
// Types: 'old_town', 'residential', 'bauhaus', 'landmark', 'university'
const BUILDINGS = [
  // ── Core old town blocks (around Markt) ──
  [ 28,   8,  14, 10, 22, 'old_town'],
  [ 28,  -8,  14, 10, 18, 'old_town'],
  [-28,   8,  12, 10, 24, 'old_town'],
  [-28,  -8,  12, 10, 20, 'old_town'],
  [  8,  28,  10, 12, 16, 'old_town'],
  [ -8,  28,  10, 12, 19, 'old_town'],
  [  8, -28,  10, 12, 21, 'old_town'],
  [ -8, -28,  10, 12, 17, 'old_town'],

  // ── NE quadrant ──
  [ 55,  28,  20, 15, 14, 'residential'],
  [ 75,  18,  16, 12, 12, 'residential'],
  [ 65, -18,  18, 14, 13, 'residential'],
  [ 85, -28,  14, 10, 11, 'residential'],
  [ 55,  55,  22, 18, 10, 'residential'],
  [ 80,  55,  18, 14, 12, 'residential'],
  [ 90,  28,  14, 12, 11, 'residential'],
  [ 58,  -5,  12, 10, 15, 'residential'],

  // ── NW quadrant ──
  [-55,  28,  20, 15, 15, 'residential'],
  [-75,  18,  16, 12, 12, 'residential'],
  [-60,  55,  25, 18, 10, 'residential'],
  [-80,  45,  18, 14, 13, 'residential'],
  [-62, -18,  18, 14, 17, 'old_town'],
  [-55,   5,  12, 10, 13, 'residential'],
  [-85,  18,  14, 12,  9, 'residential'],

  // ── SW quadrant ──
  [-52, -32,  22, 16, 14, 'old_town'],
  [-72, -42,  18, 15, 11, 'residential'],
  [-48, -62,  20, 16, 12, 'residential'],
  [-68, -68,  16, 14, 10, 'residential'],
  [-30, -58,  14, 12, 13, 'residential'],
  [-85, -55,  16, 14,  9, 'residential'],

  // ── SE quadrant (park edge) ──
  [ 52, -32,  20, 15, 13, 'residential'],
  [ 35, -62,  22, 16, 10, 'residential'],
  [ 18, -72,  16, 14,  9, 'residential'],

  // ── Landmarks ──
  [-38, -33,  38, 26,  9, 'bauhaus'],     // Bauhaus Museum
  [-16, -47,  16, 13, 15, 'landmark'],    // Goethehaus
  [ 12, -22,  28, 22, 22, 'landmark'],    // Nationaltheater
  [ -5,  35,  42, 32,  7, 'landmark'],    // Weimarhalle (flat congress hall)
  [ 28, -52,  32, 26, 11, 'university'],  // Bauhaus University
  [ -2, -65,  20, 16, 14, 'landmark'],    // Herzogin Anna Amalia Bibliothek
];

// Park zones: [cx, cz, rx, rz] (ellipse approximation)
const PARKS = [
  [ 75, -72,  42, 36],  // Park an der Ilm
  [-10,  80,  28, 22],  // Goethepark north
];

// River Ilm path (line strip, each [x, z])
const RIVER_PATH = [
  [110, -15],
  [ 98, -30],
  [ 88, -48],
  [ 80, -60],
  [ 74, -75],
  [ 68, -90],
  [ 58,-105],
  [ 45,-115],
  [ 30,-120],
];

// ── Geometry Helpers ─────────────────────────────────────────────────────────

function makePlane(w, h, color, emissive = 0x000000, emissiveInt = 0) {
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissiveInt,
    roughness: 1,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

function makeRoofPyramid(w, d, h) {
  const geo = new THREE.ConeGeometry(Math.max(w, d) * 0.65, h * 0.6, 4);
  geo.rotateY(Math.PI / 4);
  return geo;
}

function makeRoofDome(w, d) {
  return new THREE.SphereGeometry(Math.max(w, d) * 0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
}

function makeRoofMushroom(w, d) {
  return new THREE.SphereGeometry(Math.max(w, d) * 0.75, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.65);
}

function makeRoofJagged(w, d) {
  // Multiple small cones scattered on top
  const group = new THREE.Group();
  const positions = [
    [0, 0], [-w * 0.25, -d * 0.2], [w * 0.25, d * 0.2],
    [w * 0.1, -d * 0.3], [-w * 0.15, d * 0.15],
  ];
  positions.forEach(([ox, oz]) => {
    const height = 3 + Math.random() * 4;
    const coneGeo = new THREE.ConeGeometry(1.5 + Math.random(), height, 4);
    const mesh = new THREE.Mesh(coneGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    mesh.position.set(ox, 0, oz);
    group.add(mesh);
  });
  return group;
}

function makeRuinedTop(w, d) {
  // Irregular box top that looks eroded
  const geo = new THREE.BoxGeometry(w * 0.9, 2, d * 0.9);
  return geo;
}

// ── World Class ──────────────────────────────────────────────────────────────

export class WeimarWorld {
  constructor(scene) {
    this.scene = scene;
    this.worldGroup = new THREE.Group();
    scene.add(this.worldGroup);

    this.ground = null;
    this.buildingMeshes = [];  // { mesh, roofMeshes:{}, activRoof, data }
    this.streetMeshes = [];
    this.parkMeshes = [];
    this.riverMesh = null;
    this.treeMeshes = [];
    this.particles = null;

    this._buildWorld();
  }

  // ── Build everything ──────────────────────────────────────────────────────

  _buildWorld() {
    this._buildGround();
    this._buildStreets();
    this._buildParks();
    this._buildRiver();
    this._buildBuildings();
    this._buildTrees();
    this._buildParticles();
    this._buildPlaza();
  }

  _buildGround() {
    this.ground = makePlane(250, 250, 0x111111);
    this.ground.receiveShadow = true;
    this.worldGroup.add(this.ground);
  }

  _buildStreets() {
    STREETS.forEach(([cx, cz, w, len, rot]) => {
      const geo = new THREE.PlaneGeometry(len, w);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a, roughness: 0.9, metalness: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rot;
      mesh.position.set(cx, 0.02, cz);
      mesh.receiveShadow = true;
      this.worldGroup.add(mesh);
      this.streetMeshes.push(mesh);
    });
  }

  _buildParks() {
    PARKS.forEach(([cx, cz, rx, rz]) => {
      // Elliptical park — approximate with a plane
      const geo = new THREE.CircleGeometry(1, 32);
      geo.scale(rx, 1, rz);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x112200, roughness: 1, metalness: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(cx, 0.01, cz);
      mesh.receiveShadow = true;
      this.worldGroup.add(mesh);
      this.parkMeshes.push(mesh);
    });
  }

  _buildRiver() {
    const curve = new THREE.CatmullRomCurve3(
      RIVER_PATH.map(([x, z]) => new THREE.Vector3(x, 0.03, z))
    );
    const geo = new THREE.TubeGeometry(curve, 30, 2.5, 6, false);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x113366, roughness: 0.2, metalness: 0.6,
      emissive: 0x001133, emissiveIntensity: 0.3,
    });
    this.riverMesh = new THREE.Mesh(geo, mat);
    this.riverMesh.receiveShadow = true;
    this.worldGroup.add(this.riverMesh);
  }

  _buildBuildings() {
    BUILDINGS.forEach(([cx, cz, w, d, baseH, type]) => {
      const group = new THREE.Group();
      group.position.set(cx, 0, cz);

      // Base box
      const geo = new THREE.BoxGeometry(w, baseH, d);
      geo.translate(0, baseH / 2, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.7,
        metalness: 0.3,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Pre-build roof decorations for each style (hidden by default)
      const roofMeshes = {};

      // PYRAMID (Zyrax)
      {
        const rGeo = makeRoofPyramid(w, d, baseH);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0x3366cc, metalness: 0.95, roughness: 0.05,
          emissive: 0x001144, emissiveIntensity: 0.5,
          transparent: true, opacity: 0.95,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.position.y = baseH;
        rMesh.visible = false;
        group.add(rMesh);
        roofMeshes.pyramid = rMesh;
      }

      // DOME (Morra)
      {
        const rGeo = makeRoofDome(w, d);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0x00aa88, metalness: 0.1, roughness: 0.7,
          emissive: 0x003322, emissiveIntensity: 0.6,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.position.y = baseH;
        rMesh.visible = false;
        group.add(rMesh);
        roofMeshes.dome = rMesh;
      }

      // MUSHROOM (Vex)
      {
        const rGeo = makeRoofMushroom(w, d);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0x662299, metalness: 0, roughness: 1,
          emissive: 0x220044, emissiveIntensity: 0.5,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.position.y = baseH;
        rMesh.visible = false;
        group.add(rMesh);
        roofMeshes.mushroom = rMesh;
      }

      // FLAT / Wireframe (Lumi) — just a flat cap
      {
        const rGeo = new THREE.BoxGeometry(w + 1, 0.5, d + 1);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0xffffff, emissive: 0x8888ff, emissiveIntensity: 0.8,
          wireframe: false, transparent: true, opacity: 0.7,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.position.y = baseH + 0.25;
        rMesh.visible = false;
        group.add(rMesh);
        roofMeshes.flat = rMesh;
      }

      // RUINED top (Solen)
      {
        const rGeo = makeRuinedTop(w, d);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0xaa7744, roughness: 1, metalness: 0.1,
          emissive: 0x220a00, emissiveIntensity: 0.2,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.position.y = baseH + 0.5;
        rMesh.visible = false;
        group.add(rMesh);
        roofMeshes.ruined = rMesh;
      }

      // JAGGED tops (Thrak) — small cone on top
      {
        const rGeo = new THREE.ConeGeometry(w * 0.15, baseH * 0.4, 4);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0x111111, roughness: 0.95, metalness: 0.8,
          emissive: 0x441100, emissiveIntensity: 0.9,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.position.y = baseH + baseH * 0.2;
        rMesh.visible = false;
        group.add(rMesh);
        roofMeshes.jagged = rMesh;
      }

      this.worldGroup.add(group);
      this.buildingMeshes.push({
        group,
        mesh,   // the main box
        mat,    // main material
        roofMeshes,
        activeRoof: null,
        baseH,
        w, d,
        type,
        // Original scale for transitions
        origY: baseH,
      });
    });
  }

  _buildTrees() {
    // Park trees
    PARKS.forEach(([cx, cz, rx, rz]) => {
      const count = Math.floor(rx * rz * 0.12);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random();
        const x = cx + Math.cos(angle) * rx * r * 0.9;
        const z = cz + Math.sin(angle) * rz * r * 0.9;
        this._addTree(x, z, 0.7 + Math.random() * 0.8, 'park');
      }
    });

    // Street trees along main axes
    for (let i = -8; i <= 8; i++) {
      if (Math.abs(i) < 2) continue;
      this._addTree(i * 11, 6,  0.5 + Math.random() * 0.4, 'street');
      this._addTree(i * 11, -6, 0.5 + Math.random() * 0.4, 'street');
      this._addTree(6, i * 11,  0.5 + Math.random() * 0.4, 'street');
      this._addTree(-6, i * 11, 0.5 + Math.random() * 0.4, 'street');
    }

    // Scattered
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 190;
      const z = (Math.random() - 0.5) * 190;
      // Skip if near center
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
      this._addTree(x, z, 0.4 + Math.random() * 0.6, 'scattered');
    }
  }

  _addTree(x, z, scale, treeType) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const trunkH = 3 * scale;
    const crownR = 2.5 * scale;

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, trunkH, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 1 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Crown (sphere)
    const crownGeo = new THREE.SphereGeometry(crownR, 7, 5);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x226600, roughness: 1 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = trunkH + crownR * 0.6;
    crown.castShadow = true;
    group.add(crown);

    this.worldGroup.add(group);
    this.treeMeshes.push({ group, trunk, trunkMat, crown, crownMat, treeType });
  }

  _buildPlaza() {
    // Markt central square — lighter cobblestone
    const plazaGeo = new THREE.PlaneGeometry(22, 22);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0x222020, roughness: 0.95 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.03, 0);
    this.worldGroup.add(plaza);

    // Theaterplatz
    const tp = plaza.clone();
    tp.position.set(-20, 0.03, -20);
    tp.scale.set(1.3, 1.3, 1);
    this.worldGroup.add(tp);
  }

  _buildParticles() {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const spread = 200;
    for (let i = 0; i < count; i++) {
      positions[i * 3    ] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.4,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.particles = new THREE.Points(geo, mat);
    this.particles.userData.basePositions = positions.slice();
    this.worldGroup.add(this.particles);
  }

  // ── Apply Character Theme ─────────────────────────────────────────────────

  applyTheme(theme, instant = false) {
    const lerp = instant ? 1 : null;

    // Ground
    if (this.ground) {
      const col = new THREE.Color(theme.groundHex);
      if (instant) {
        this.ground.material.color.set(col);
        this.ground.material.emissive.setHex(theme.groundEmissive);
      } else {
        this.ground.material.color.lerp(col, 0.05);
        this.ground.material.emissive.lerp(new THREE.Color(theme.groundEmissive), 0.05);
      }
    }

    // Streets
    this.streetMeshes.forEach(m => {
      const col = new THREE.Color(theme.roadHex);
      if (instant) m.material.color.set(col);
      else m.material.color.lerp(col, 0.04);
    });

    // Parks
    this.parkMeshes.forEach(m => {
      const col = new THREE.Color(theme.parkHex);
      if (instant) m.material.color.set(col);
      else m.material.color.lerp(col, 0.04);
    });

    // River
    if (this.riverMesh) {
      const col = new THREE.Color(theme.waterHex);
      if (instant) {
        this.riverMesh.material.color.set(col);
        this.riverMesh.material.emissive.set(col).multiplyScalar(0.3);
      } else {
        this.riverMesh.material.color.lerp(col, 0.05);
        this.riverMesh.material.emissive.lerp(new THREE.Color(theme.waterHex).multiplyScalar(0.3), 0.05);
      }
    }

    // Buildings
    const palette = theme.buildingPalette;
    this.buildingMeshes.forEach((b, i) => {
      const targetCol = new THREE.Color(palette[i % palette.length]);
      const targetEmissive = new THREE.Color(theme.buildingEmissive);

      if (instant) {
        b.mat.color.set(targetCol);
        b.mat.emissive.set(targetEmissive);
        b.mat.emissiveIntensity = theme.buildingEmissiveIntensity;
        b.mat.metalness = theme.buildingMetalness;
        b.mat.roughness = theme.buildingRoughness;
        b.mat.wireframe = theme.wireframe || false;
      } else {
        b.mat.color.lerp(targetCol, 0.06);
        b.mat.emissive.lerp(targetEmissive, 0.06);
        b.mat.emissiveIntensity += (theme.buildingEmissiveIntensity - b.mat.emissiveIntensity) * 0.06;
        b.mat.metalness    += (theme.buildingMetalness - b.mat.metalness) * 0.06;
        b.mat.roughness    += (theme.buildingRoughness - b.mat.roughness) * 0.06;
        b.mat.wireframe = theme.wireframe || false;
      }
      b.mat.needsUpdate = true;

      // Height scaling
      const targetScaleY = theme.buildingHeightMult;
      if (instant) {
        b.group.scale.y = targetScaleY;
      } else {
        b.group.scale.y += (targetScaleY - b.group.scale.y) * 0.04;
      }

      // Roof switching
      const roofShape = theme.roofShape;
      if (b.activeRoof !== roofShape) {
        Object.keys(b.roofMeshes).forEach(k => {
          b.roofMeshes[k].visible = (k === roofShape);
        });
        b.activeRoof = roofShape;

        // Update roof material color when shown
        const roofMesh = b.roofMeshes[roofShape];
        if (roofMesh) {
          const rc = new THREE.Color(palette[i % palette.length]);
          if (roofMesh.material) {
            roofMesh.material.color.set(rc);
          }
        }
      }
    });

    // Trees
    this.treeMeshes.forEach(t => {
      const targetCrown = new THREE.Color(theme.treeColor);
      const targetTrunk = new THREE.Color(theme.treeTrunkColor);
      if (instant) {
        t.crownMat.color.set(targetCrown);
        t.trunkMat.color.set(targetTrunk);
      } else {
        t.crownMat.color.lerp(targetCrown, 0.05);
        t.trunkMat.color.lerp(targetTrunk, 0.05);
      }
    });

    // Particles
    if (this.particles) {
      const pCol = new THREE.Color(theme.particleColor);
      if (instant) {
        this.particles.material.color.set(pCol);
        this.particles.material.size = theme.particleSize;
      } else {
        this.particles.material.color.lerp(pCol, 0.06);
        this.particles.material.size += (theme.particleSize - this.particles.material.size) * 0.05;
      }
    }
  }

  // ── Animate Particles ─────────────────────────────────────────────────────

  updateParticles(time, theme) {
    if (!this.particles) return;
    const pos = this.particles.geometry.attributes.position;
    const base = this.particles.userData.basePositions;
    const speed = theme?.particleSpeed ?? 0.005;
    const spread = theme?.particleSpread ?? 200;

    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];

      pos.setXYZ(
        i,
        bx + Math.sin(time * speed * 10 + i * 0.1) * 2,
        (by + time * speed * 20) % 80,
        bz + Math.cos(time * speed * 8  + i * 0.13) * 2
      );
    }
    pos.needsUpdate = true;
  }
}
