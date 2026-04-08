// ── Weimar World — Accurate City Layout ─────────────────────────────────────
// Origin = Markt center (OSM 50.9794°N, 11.3298°E)
// Scale: 1 unit = 10 meters  |  X = East  |  Z = South
// 2 km radius ≈ ±100 units from Markt

import * as THREE from 'three';

// ── Streets ───────────────────────────────────────────────────────────────────
// [centerX, centerZ, width, length, rotationY]

const STREETS = [
  // ── Core inner ring ──────────────────────────────────────────────────
  // Schillerstraße (E-W, just S of Markt — links Nationaltheater→Markt)
  [-17,  2,   3.5, 60,  0],
  [ 18,  2,   3.0, 52,  0],
  // Herderstraße / Kaufstraße (N-S through Markt, toward Herderkirche)
  [  0, -8,   3.5, 45,  Math.PI / 2],
  // Burgstraße / Ritterstraße (NE diagonal to Stadtschloss)
  [ 11, -8,   2.5, 48, -0.55],
  // Frauenplan spur (S toward Goethehaus)
  [ -7, 14,   2.0, 24,  Math.PI / 2],
  // Connection to Anna Amalia (E toward Platz der Demokratie)
  [ 10, 10,   2.0, 28,  0],
  // Schloßgasse (connects Schillerstr to Stadtschloss via W side of Markt)
  [ -2, -5,   2.5, 30,  0.2],

  // ── Theaterplatz area (west) ──────────────────────────────────────────
  [-18, -3,   2.5, 38,  0],      // W approach to Theaterplatz
  [-38,  0,   2.5, 28,  Math.PI / 2], // N-S past Nationaltheater
  [-26, -15,  2.5, 30,  0],      // Karl-Liebknecht-Str fragment W
  [ -8, -15,  2.5, 32,  0],      // Karl-Liebknecht-Str fragment E

  // ── North (Herderplatz → Bauhaus Museum direction) ───────────────────
  [ -4, -30,  2.5, 30,  Math.PI / 2],  // to Herderkirche
  [-24, -28,  2.0, 28,  Math.PI / 2],  // Stéphane-Hessel-Platz approach
  [-24, -55,  2.0, 60,  Math.PI / 2],  // Schopenhauerstraße → Hauptbahnhof
  [-36, -40,  2.0, 30,  0],            // W E-W near Bauhaus Museum
  [ -8, -45,  2.0, 25,  0],

  // ── South (Geschwister-Scholl-Str, toward Bauhaus-Uni) ───────────────
  [  2,  25,  2.5, 40,  Math.PI / 2],  // Geschwister-Scholl-Str N
  [  2,  45,  2.5, 35,  Math.PI / 2],  // continuation S

  // ── East (Carl-August-Allee, along park) ─────────────────────────────
  [ 35,  10,  3.0, 130, Math.PI / 2],  // Carl-August-Allee N-S

  // ── Outer ring / arterials ────────────────────────────────────────────
  [  0,  35,  2.5,  90, 0],            // Friedensstraße E-W
  [ 50,  30,  2.0,  70, Math.PI / 2],  // Ilmpark-Allee (along park edge)
  [  0, -50,  2.5,  85, 0],            // northern E-W arterial
  [-50, -12,  2.0,  45, Math.PI / 2],  // far W N-S
];

// ── Buildings ─────────────────────────────────────────────────────────────────
// [cx, cz, width(E-W), depth(N-S), baseHeight, type, rotY=0]
// Positions based on GPS-derived coordinates (1 unit = 10m, origin = Markt)
//
// LANDMARKS ─────────────────────────────────────────────────────
const BUILDINGS = [
  // Nationaltheater (Theaterplatz) – wide neoclassical, 107m×73m
  [-35, -3,  11, 7, 10, 'theater', 0],

  // Stadtschloss / City Palace – large complex, runs N-S along Ilm
  [ 21,-14,  10,12, 18, 'palace', 0],

  // Herderkirche (St. Peter & Paul) – Gothic nave + tower
  [ -4,-20,   5, 3, 15, 'church', 0],

  // Anna Amalia Bibliothek – narrow building + rotunda tower
  [ 17, 10,  2.5, 6, 14, 'library', 0],

  // Goethehaus (Frauenplan) – tall narrow townhouse
  [ -7, 21,   2, 3, 17, 'goethehaus', 0],

  // Schillerhaus – small narrow townhouse
  [-14,  5,  1.8, 1.5, 15, 'schillerhaus', 0],

  // Wittumspalais – modest baroque palace
  [-20,-10,   6, 5, 12, 'palace', 0],

  // New Bauhaus Museum (2019, Stéphane-Hessel-Platz) – long E-W slab
  [-38,-60,   9, 2, 8, 'bauhaus_slab', 0],

  // Bauhaus-Universität (main building, Geschwister-Scholl-Str)
  [  2, 41,   6.5, 3, 13, 'university', 0],

  // Hauptbahnhof (compressed slightly N) – long station building
  [-24,-85,  14, 3.5, 10, 'station', 0],

  // ── OLD TOWN AROUND MARKT ─────────────────────────────────────
  // N of Markt (between Markt and Herderplatz)
  [ -6, -8,   8, 5, 18, 'old_town', 0],
  [  5, -8,   6, 5, 20, 'old_town', 0],
  [ 12, -8,   7, 5, 16, 'old_town', 0],
  [-14, -8,   5, 4, 22, 'old_town', 0],

  // E of Markt (toward Platz der Demokratie / river direction)
  [ 14,  2,   6, 7, 19, 'old_town', 0],
  [ 22, -2,   7, 6, 17, 'old_town', 0],
  [ 22,  6,   7, 6, 15, 'old_town', 0],
  [ 28,  2,   5, 5, 14, 'old_town', 0],

  // S of Markt (toward Frauenplan)
  [ -1,  8,   8, 5, 19, 'old_town', 0],
  [  7, 10,   6, 6, 17, 'old_town', 0],
  [-10,  8,   6, 5, 16, 'old_town', 0],
  [  1, 15,   7, 5, 18, 'old_town', 0],

  // W of Markt (toward Nationaltheater)
  [ -9, -2,   7, 6, 21, 'old_town', 0],
  [ -9,  5,   7, 6, 17, 'old_town', 0],
  [-20, -8,  10, 7, 14, 'old_town', 0],
  [-25,  4,   8, 6, 16, 'old_town', 0],
  [-28, -8,   7, 5, 12, 'old_town', 0],

  // ── NE: Herderkirche → Stadtschloss ────────────────────────────
  [  8,-17,   9, 6, 14, 'old_town', 0],
  [ 15,-17,   8, 7, 16, 'old_town', 0],
  [  8,-26,  10, 8, 13, 'residential', 0],
  [ 18,-26,   9, 7, 11, 'residential', 0],

  // ── NW: around Theaterplatz ─────────────────────────────────────
  [-44, -8,   8, 6, 12, 'old_town', 0],
  [-44,  4,   8, 6, 14, 'old_town', 0],
  [-35,-12,  12, 7, 11, 'residential', 0],
  [-28,-25,  10, 8, 10, 'residential', 0],
  [-46,-22,   9, 7,  9, 'residential', 0],

  // N: between Theaterplatz and Bauhaus Museum
  [-38,-35,  12, 8, 10, 'residential', 0],
  [-25,-42,  10, 8, 11, 'residential', 0],
  [-50,-45,   9, 7,  9, 'residential', 0],
  [-15,-52,  11, 8, 10, 'residential', 0],

  // ── SE: Anna Amalia + Goethehaus neighbourhood ──────────────────
  [  0, 15,   7, 5, 18, 'old_town', 0],
  [  7, 17,   8, 6, 16, 'old_town', 0],
  [ 22,  8,   9, 7, 13, 'residential', 0],
  [ 22, 17,   8, 6, 12, 'residential', 0],
  [ 28, 12,   7, 6, 11, 'residential', 0],

  // S: toward Bauhaus-Uni
  [ -5, 28,  10, 7, 12, 'residential', 0],
  [ 12, 28,   9, 8, 11, 'residential', 0],
  [-15, 28,   8, 7, 10, 'residential', 0],
  [ 12, 35,   8, 7, 10, 'residential', 0],
  [-12, 35,   9, 7,  9, 'residential', 0],
  [-22, 35,  10, 7,  9, 'residential', 0],
  [-22, 48,   9, 7,  8, 'residential', 0],
  [ 20, 45,  10, 8,  9, 'residential', 0],

  // ── E: park-edge residential ────────────────────────────────────
  [ 32, -5,  10, 8, 12, 'residential', 0],
  [ 32,  8,  10, 8, 11, 'residential', 0],
  [ 44, -5,  10, 8, 10, 'residential', 0],
  [ 44,  8,  10, 8, 10, 'residential', 0],
  [ 32,-18,  10, 8, 11, 'residential', 0],
  [ 44,-18,   9, 7,  9, 'residential', 0],

  // ── N of Herderkirche ────────────────────────────────────────────
  [-10,-30,  10, 7, 12, 'residential', 0],
  [  5,-35,  10, 8, 11, 'residential', 0],
  [ 20,-35,  10, 8, 10, 'residential', 0],
  [ -2,-42,   9, 7, 10, 'residential', 0],
  [ 12,-45,   8, 7,  9, 'residential', 0],

  // ── Goethe Gartenhaus (in park) ──────────────────────────────────
  [ 48,-40,  10, 8,  9, 'residential', 0.3],
  // Römisches Haus
  [ 42,-30,  14,10, 10, 'residential', 0.2],
];

// ── Parks ─────────────────────────────────────────────────────────────────────
// [cx, cz, rx (E-W half), rz (N-S half)]
const PARKS = [
  // Park an der Ilm — large SE park along the Ilm valley
  [ 50, 15,  30, 45],
  // Goethepark (north, near river source area)
  [ 10,-60,  18, 15],
  // Small green near Theaterplatz
  [-35,-10,   8,  6],
];

// ── River Ilm ─────────────────────────────────────────────────────────────────
// Flows N→S: enters from NE (past Stadtschloss east side), through park, exits S
const RIVER_PATH = [
  [32, -55],
  [30, -42],
  [28, -30],
  [27, -18],
  [28,  -5],
  [30,   5],
  [34,  18],
  [40,  32],
  [46,  48],
  [52,  65],
  [57,  82],
];

// ── World ─────────────────────────────────────────────────────────────────────

export class WeimarWorld {
  constructor(scene) {
    this.scene = scene;
    this.worldGroup = new THREE.Group();
    scene.add(this.worldGroup);

    this.ground        = null;
    this.buildingMeshes = [];  // { group, mesh, mat, roofMeshes, activeRoof, baseH, w, d }
    this.streetMeshes  = [];
    this.parkMeshes    = [];
    this.riverMesh     = null;
    this.treeMeshes    = [];
    this.particles     = null;

    this._build();
  }

  _build() {
    this._buildGround();
    this._buildStreets();
    this._buildParks();
    this._buildRiver();
    this._buildBuildings();
    this._buildPlazas();
    this._buildTrees();
    this._buildParticles();
  }

  // ── Ground ────────────────────────────────────────────────────────────────
  _buildGround() {
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1, metalness: 0 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.worldGroup.add(this.ground);
  }

  // ── Streets ───────────────────────────────────────────────────────────────
  _buildStreets() {
    STREETS.forEach(([cx, cz, w, len, rot]) => {
      const geo = new THREE.PlaneGeometry(len, w);
      const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rot;
      mesh.position.set(cx, 0.02, cz);
      mesh.receiveShadow = true;
      this.worldGroup.add(mesh);
      this.streetMeshes.push(mesh);
    });
  }

  // ── Parks ─────────────────────────────────────────────────────────────────
  _buildParks() {
    PARKS.forEach(([cx, cz, rx, rz]) => {
      const geo = new THREE.CircleGeometry(1, 32);
      geo.scale(rx, 1, rz);
      const mat = new THREE.MeshStandardMaterial({ color: 0x112200, roughness: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(cx, 0.01, cz);
      mesh.receiveShadow = true;
      this.worldGroup.add(mesh);
      this.parkMeshes.push(mesh);
    });
  }

  // ── River Ilm ─────────────────────────────────────────────────────────────
  _buildRiver() {
    const curve = new THREE.CatmullRomCurve3(
      RIVER_PATH.map(([x, z]) => new THREE.Vector3(x, 0.03, z))
    );
    const geo = new THREE.TubeGeometry(curve, 40, 2.2, 6, false);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x113366, roughness: 0.2, metalness: 0.6,
      emissive: 0x001133, emissiveIntensity: 0.3,
    });
    this.riverMesh = new THREE.Mesh(geo, mat);
    this.riverMesh.receiveShadow = true;
    this.worldGroup.add(this.riverMesh);
  }

  // ── Buildings ─────────────────────────────────────────────────────────────
  _buildBuildings() {
    BUILDINGS.forEach(([cx, cz, w, d, baseH, type, rotY = 0]) => {
      const group = new THREE.Group();
      group.position.set(cx, 0, cz);
      if (rotY) group.rotation.y = rotY;

      // ── Main body ──────────────────────────────────────────────────────
      const geo = new THREE.BoxGeometry(w, baseH, d);
      geo.translate(0, baseH / 2, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x222222, roughness: 0.7, metalness: 0.3,
        emissive: 0x000000, emissiveIntensity: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // ── Type-specific extra geometry ──────────────────────────────────
      this._addLandmarkDetails(group, type, w, d, baseH, mat);

      // ── Roof variations (one per character, hidden until activated) ──
      const roofMeshes = this._buildRoofs(group, w, d, baseH);

      this.worldGroup.add(group);
      this.buildingMeshes.push({ group, mesh, mat, roofMeshes, activeRoof: null, baseH, w, d, type });
    });
  }

  _addLandmarkDetails(group, type, w, d, baseH, mainMat) {
    const sharedMat = () => new THREE.MeshStandardMaterial({
      color: mainMat.color.clone(), roughness: mainMat.roughness,
      metalness: mainMat.metalness, emissive: new THREE.Color(0),
    });

    switch (type) {
      case 'church': {
        // West tower — twice as tall as nave
        const towerH = baseH * 2.2;
        const tGeo = new THREE.BoxGeometry(1.6, towerH, 1.6);
        tGeo.translate(-(w / 2) + 0.8, towerH / 2, 0);
        const tower = new THREE.Mesh(tGeo, sharedMat());
        tower.castShadow = true;
        group.add(tower);
        // Spire on tower
        const spireGeo = new THREE.ConeGeometry(1.1, towerH * 0.5, 4);
        spireGeo.translate(-(w / 2) + 0.8, towerH + towerH * 0.25, 0);
        group.add(new THREE.Mesh(spireGeo, sharedMat()));
        break;
      }

      case 'palace': {
        // Side wing (E side, shorter)
        const wingH = baseH * 0.75;
        const wGeo = new THREE.BoxGeometry(w * 0.4, wingH, d * 1.5);
        wGeo.translate(w / 2 + w * 0.2, wingH / 2, d * 0.25);
        const wing = new THREE.Mesh(wGeo, sharedMat());
        wing.castShadow = true;
        group.add(wing);
        // Corner tower
        const ctH = baseH * 1.3;
        const ctGeo = new THREE.CylinderGeometry(0.9, 0.9, ctH, 8);
        ctGeo.translate(w / 2, ctH / 2, -d / 2);
        group.add(new THREE.Mesh(ctGeo, sharedMat()));
        break;
      }

      case 'theater': {
        // Portico / columns in front (south face)
        const porticoH = baseH * 0.88;
        const pGeo = new THREE.BoxGeometry(w * 0.55, porticoH, d * 0.22);
        pGeo.translate(0, porticoH / 2, d / 2 + d * 0.11);
        const portico = new THREE.Mesh(pGeo, sharedMat());
        portico.castShadow = true;
        group.add(portico);
        // Triangular pediment on top of portico
        const pedGeo = new THREE.ConeGeometry(w * 0.32, baseH * 0.22, 3);
        pedGeo.rotateY(Math.PI / 6);
        pedGeo.translate(0, baseH + baseH * 0.11, d / 2);
        group.add(new THREE.Mesh(pedGeo, sharedMat()));
        break;
      }

      case 'library': {
        // Anna Amalia — distinctive round rotunda tower on one end
        const rH = baseH;
        const rotunda = new THREE.Mesh(
          new THREE.CylinderGeometry(1.6, 1.6, rH, 14),
          sharedMat()
        );
        rotunda.position.set(0, rH / 2, -d / 2 - 1.4);
        rotunda.castShadow = true;
        group.add(rotunda);
        // Dome on rotunda
        const domeGeo = new THREE.SphereGeometry(1.7, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const dome = new THREE.Mesh(domeGeo, sharedMat());
        dome.position.set(0, rH, -d / 2 - 1.4);
        group.add(dome);
        break;
      }

      case 'goethehaus':
      case 'schillerhaus': {
        // Tall narrow mansard-style roof
        const roofGeo = new THREE.BoxGeometry(w * 0.9, baseH * 0.15, d * 0.9);
        roofGeo.translate(0, baseH + baseH * 0.075, 0);
        group.add(new THREE.Mesh(roofGeo, sharedMat()));
        // Chimney
        const chimneyGeo = new THREE.BoxGeometry(0.4, 2.5, 0.4);
        chimneyGeo.translate(w * 0.2, baseH + 1.5, d * 0.15);
        group.add(new THREE.Mesh(chimneyGeo, sharedMat()));
        break;
      }

      case 'bauhaus_slab': {
        // Long low modernist — glass-stripe facade lines
        // Horizontal stripe lines along the long facade
        for (let i = 0; i < 3; i++) {
          const stripeGeo = new THREE.BoxGeometry(w, 0.3, 0.15);
          stripeGeo.translate(0, 2 + i * 2.5, d / 2 + 0.08);
          const stripeMat = new THREE.MeshStandardMaterial({
            color: 0x88aacc, emissive: 0x224466, emissiveIntensity: 0.4,
            metalness: 0.8, roughness: 0.2,
          });
          group.add(new THREE.Mesh(stripeGeo, stripeMat));
        }
        break;
      }

      case 'university': {
        // Bauhaus Uni — Art Nouveau style, central pavilion slightly higher
        const pvGeo = new THREE.BoxGeometry(w * 0.3, baseH * 0.25, d);
        pvGeo.translate(0, baseH + baseH * 0.125, 0);
        group.add(new THREE.Mesh(pvGeo, sharedMat()));
        break;
      }

      case 'station': {
        // Hauptbahnhof — clock tower in center
        const ctH = baseH * 2.0;
        const ctGeo = new THREE.BoxGeometry(2.5, ctH, 2.5);
        ctGeo.translate(0, ctH / 2, 0);
        const ct = new THREE.Mesh(ctGeo, sharedMat());
        ct.castShadow = true;
        group.add(ct);
        // Roof gable over main entrance
        const gableGeo = new THREE.CylinderGeometry(0, w * 0.18, baseH * 0.3, 3);
        gableGeo.translate(0, baseH + baseH * 0.15, d * 0.4);
        gableGeo.rotateY(Math.PI / 6);
        group.add(new THREE.Mesh(gableGeo, sharedMat()));
        break;
      }
    }
  }

  // ── Roof varieties (per character theme) ─────────────────────────────────
  _buildRoofs(group, w, d, baseH) {
    const roofMeshes = {};
    const topY = baseH;

    // Pyramid (Zyrax) — crystal spire
    {
      const geo = new THREE.ConeGeometry(Math.max(w, d) * 0.65, baseH * 0.55, 4);
      geo.rotateY(Math.PI / 4);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3366cc, metalness: 0.95, roughness: 0.05, emissive: 0x001144, emissiveIntensity: 0.5 });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = topY + baseH * 0.275;
      m.visible = false;
      group.add(m);
      roofMeshes.pyramid = m;
    }
    // Dome (Morra)
    {
      const geo = new THREE.SphereGeometry(Math.max(w, d) * 0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({ color: 0x00aa88, metalness: 0.1, roughness: 0.7, emissive: 0x003322, emissiveIntensity: 0.6 });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = topY;
      m.visible = false;
      group.add(m);
      roofMeshes.dome = m;
    }
    // Mushroom cap (Vex)
    {
      const geo = new THREE.SphereGeometry(Math.max(w, d) * 0.72, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.65);
      const mat = new THREE.MeshStandardMaterial({ color: 0x662299, metalness: 0, roughness: 1, emissive: 0x220044, emissiveIntensity: 0.5 });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = topY;
      m.visible = false;
      group.add(m);
      roofMeshes.mushroom = m;
    }
    // Flat glowing cap (Lumi)
    {
      const geo = new THREE.BoxGeometry(w + 0.8, 0.4, d + 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x8888ff, emissiveIntensity: 0.9, transparent: true, opacity: 0.7 });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = topY + 0.2;
      m.visible = false;
      group.add(m);
      roofMeshes.flat = m;
    }
    // Ruined top (Solen)
    {
      const geo = new THREE.BoxGeometry(w * 0.88, 1.8, d * 0.88);
      const mat = new THREE.MeshStandardMaterial({ color: 0xaa7744, roughness: 1, metalness: 0.1, emissive: 0x220a00, emissiveIntensity: 0.2 });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = topY + 0.5;
      m.visible = false;
      group.add(m);
      roofMeshes.ruined = m;
    }
    // Jagged cone (Thrak)
    {
      const geo = new THREE.ConeGeometry(w * 0.14, baseH * 0.4, 4);
      const mat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95, metalness: 0.8, emissive: 0x441100, emissiveIntensity: 1.0 });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = topY + baseH * 0.2;
      m.visible = false;
      group.add(m);
      roofMeshes.jagged = m;
    }

    return roofMeshes;
  }

  // ── Plazas ────────────────────────────────────────────────────────────────
  _buildPlazas() {
    const plazas = [
      [0,    0,    8, 7.5],  // Markt
      [-35, -3,   18, 14],   // Theaterplatz (open area in front of theater)
      [-4,  -20,   8, 6],    // Herderplatz
      [ 21, -14,  12, 8],    // Burgplatz (in front of Stadtschloss)
      [ 17,  10,   6, 5],    // Platz der Demokratie
    ];
    plazas.forEach(([cx, cz, w, d]) => {
      const geo = new THREE.PlaneGeometry(w, d);
      const mat = new THREE.MeshStandardMaterial({ color: 0x222020, roughness: 0.95 });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(cx, 0.03, cz);
      this.worldGroup.add(m);
    });

    // Goethe & Schiller statue pedestal on Theaterplatz
    const pedestalGeo = new THREE.BoxGeometry(1, 2.5, 1);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(-35, 1.25, 1);
    pedestal.castShadow = true;
    this.worldGroup.add(pedestal);
  }

  // ── Trees ────────────────────────────────────────────────────────────────
  _buildTrees() {
    // Park an der Ilm — dense woodland
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rx = 30, rz = 45;
      const r = Math.sqrt(Math.random());
      this._addTree(50 + Math.cos(angle) * rx * r, 15 + Math.sin(angle) * rz * r, 0.6 + Math.random() * 1.0);
    }
    // Goethepark
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      this._addTree(10 + Math.cos(angle) * 18 * r, -60 + Math.sin(angle) * 15 * r, 0.5 + Math.random() * 0.8);
    }
    // Street trees along main axes
    for (let i = -6; i <= 6; i++) {
      if (Math.abs(i) < 1) continue;
      this._addTree(i * 10, 5,  0.5 + Math.random() * 0.35);
      this._addTree(i * 10, -5, 0.5 + Math.random() * 0.35);
      this._addTree(5, i * 10, 0.5 + Math.random() * 0.35);
      this._addTree(-5, i * 10, 0.5 + Math.random() * 0.35);
    }
    // Scattered city trees
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
      this._addTree(x, z, 0.4 + Math.random() * 0.6);
    }
  }

  _addTree(x, z, scale) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const trunkH = 3 * scale;
    const crownR = 2.5 * scale;

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 1 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.38 * scale, trunkH, 6), trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    const crownMat = new THREE.MeshStandardMaterial({ color: 0x226600, roughness: 1 });
    const crown = new THREE.Mesh(new THREE.SphereGeometry(crownR, 7, 5), crownMat);
    crown.position.y = trunkH + crownR * 0.6;
    crown.castShadow = true;
    group.add(crown);

    this.worldGroup.add(group);
    this.treeMeshes.push({ group, trunk, trunkMat, crown, crownMat });
  }

  // ── Particles ─────────────────────────────────────────────────────────────
  _buildParticles() {
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3    ] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, transparent: true, opacity: 0.6, depthWrite: false, sizeAttenuation: true });
    this.particles = new THREE.Points(geo, mat);
    this.particles.userData.basePositions = positions.slice();
    this.worldGroup.add(this.particles);
  }

  // ── Apply Character Theme ─────────────────────────────────────────────────
  applyTheme(theme, instant = false) {
    const t = instant ? 1 : 0.055;

    // Ground
    if (this.ground) {
      this.ground.material.color.lerp(new THREE.Color(theme.groundHex), instant ? 1 : 0.04);
      this.ground.material.emissive.lerp(new THREE.Color(theme.groundEmissive), t);
    }

    // Streets
    this.streetMeshes.forEach(m =>
      m.material.color.lerp(new THREE.Color(theme.roadHex), t)
    );

    // Parks
    this.parkMeshes.forEach(m =>
      m.material.color.lerp(new THREE.Color(theme.parkHex), t)
    );

    // River
    if (this.riverMesh) {
      this.riverMesh.material.color.lerp(new THREE.Color(theme.waterHex), t);
      this.riverMesh.material.emissive.lerp(new THREE.Color(theme.waterHex).multiplyScalar(0.3), t);
    }

    // Buildings
    const palette = theme.buildingPalette;
    this.buildingMeshes.forEach((b, i) => {
      const tc = new THREE.Color(palette[i % palette.length]);
      const te = new THREE.Color(theme.buildingEmissive);
      if (instant) {
        b.mat.color.set(tc);
        b.mat.emissive.set(te);
        b.mat.emissiveIntensity = theme.buildingEmissiveIntensity;
        b.mat.metalness  = theme.buildingMetalness;
        b.mat.roughness  = theme.buildingRoughness;
        b.mat.wireframe  = theme.wireframe || false;
        b.group.scale.y  = theme.buildingHeightMult;
      } else {
        b.mat.color.lerp(tc, t);
        b.mat.emissive.lerp(te, t);
        b.mat.emissiveIntensity += (theme.buildingEmissiveIntensity - b.mat.emissiveIntensity) * t;
        b.mat.metalness += (theme.buildingMetalness - b.mat.metalness) * t;
        b.mat.roughness += (theme.buildingRoughness - b.mat.roughness) * t;
        b.mat.wireframe = theme.wireframe || false;
        b.group.scale.y += (theme.buildingHeightMult - b.group.scale.y) * 0.04;
      }
      b.mat.needsUpdate = true;

      // Roof switch
      const rs = theme.roofShape;
      if (b.activeRoof !== rs) {
        Object.keys(b.roofMeshes).forEach(k => { b.roofMeshes[k].visible = (k === rs); });
        b.activeRoof = rs;
        const rm = b.roofMeshes[rs];
        if (rm?.material) rm.material.color.set(new THREE.Color(palette[i % palette.length]));
      }

      // Also update all landmark-detail child meshes' colors
      b.group.children.forEach(child => {
        if (child !== b.mesh && child.isMesh && child.material && child.material !== b.mat) {
          // Only update if it's a landmark detail (not a roof)
          const isRoof = Object.values(b.roofMeshes).includes(child);
          if (!isRoof) {
            child.material.color.lerp(new THREE.Color(palette[i % palette.length]), t);
            child.material.emissive?.lerp(te, t);
          }
        }
      });
    });

    // Trees
    this.treeMeshes.forEach(tr => {
      tr.crownMat.color.lerp(new THREE.Color(theme.treeColor), t);
      tr.trunkMat.color.lerp(new THREE.Color(theme.treeTrunkColor), t);
    });

    // Particles
    if (this.particles) {
      this.particles.material.color.lerp(new THREE.Color(theme.particleColor), t);
      this.particles.material.size += (theme.particleSize - this.particles.material.size) * t;
    }
  }

  // ── Particle Animation ────────────────────────────────────────────────────
  updateParticles(time, theme) {
    if (!this.particles) return;
    const pos = this.particles.geometry.attributes.position;
    const base = this.particles.userData.basePositions;
    const speed = theme?.particleSpeed ?? 0.005;

    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        base[i * 3    ] + Math.sin(time * speed * 10 + i * 0.1) * 2,
        (base[i * 3 + 1] + time * speed * 20) % 80,
        base[i * 3 + 2] + Math.cos(time * speed * 8  + i * 0.13) * 2
      );
    }
    pos.needsUpdate = true;
  }
}
