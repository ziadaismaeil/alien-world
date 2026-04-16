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
// Positions from OSM (Overpass API) + GPS formula: 1 unit ≈ 10m, origin = Markt
// cx = (lon − 11.3298) × 7007   |   cz = (50.9794 − lat) × 11132
//
const BUILDINGS = [

  // ── LANDMARKS (GPS-verified against OSM) ─────────────────────────────────
  // DNT Nationaltheater – ~75m × 55m neoclassical
  [-35, -3,   7, 5, 12, 'theater', 0],
  // Stadtschloss – palace complex ~100m × 80m
  [ 21,-14,  10, 8, 18, 'palace', 0],
  // Herderkirche – nave 20m wide, 50m long (N-S)
  [ -4,-20,   2, 5, 15, 'church', 0],
  // Anna Amalia Bibliothek – ~25m × 45m + rotunda
  [ 17, 10, 2.5, 4, 14, 'library', 0],
  // Goethehaus – narrow townhouse ~15m × 20m
  [ -7, 21,   1.5, 2, 17, 'goethehaus', 0],
  // Schillerhaus – narrow townhouse ~12m × 14m
  [-14,  5,  1.5,1.4, 15, 'schillerhaus', 0],
  // Wittumspalais – baroque palace ~40m × 35m
  [-20,-10,   4, 3.5, 12, 'palace', 0],
  // Neues Bauhaus Museum – long slab ~90m × 20m
  [-38,-60,   9, 2,   9, 'bauhaus_slab', 0],
  // Bauhaus-Universität main building ~60m × 30m
  [  2, 41,   6, 3,  14, 'university', 0],
  // Hauptbahnhof – ~130m × 25m
  [-24,-85,  13, 2.5, 12, 'station', 0],

  // ── OSM INNER-CITY BUILDINGS ──────────────────────────────────────────────
  // Rathaus am Markt – OSM 27244393 ~25m × 15m, 3 fl
  [ -4,  0,   2.5,1.5, 10, 'old_town', 0],
  // Goethekaufhaus – OSM 41897796 ~45m × 25m, 4 fl
  [-32, -9,   4.5,2.5, 14, 'old_town', 0],
  // Haus der Erholung – OSM 28743728 ~30m × 20m, 2 fl
  [-27,-23,   3, 2,    8, 'old_town', 0],
  // Sparkasse – OSM 28743606 ~25m × 18m
  [-13,-28,   2.5,1.8,  8, 'old_town', 0],
  // Lesemuseum – OSM 43933506 ~20m × 15m
  [-29,-18,   2, 1.5,   9, 'old_town', 0],
  // Apartments near Nationaltheater – OSM 41950597 ~35m × 20m
  [-18,  7,   3.5, 2,  10, 'old_town', 0],
  // Reithaus – OSM 83974700 ~30m × 20m
  [ 25,  3,   3, 2,     8, 'old_town', 0],
  // Hotel near Frauenplan – ~30m × 20m
  [ -2, 35,   3, 2,    10, 'old_town', 0],
  // Langer Jakob dormitory – OSM 28382668, 11 floors ~50m × 30m
  [ -7,-53,   5, 3,    35, 'residential', 0],
  // Thüringer Landesverwaltungsamt – OSM 27533513 ~60m × 40m
  [-18,-59,   6, 4,    10, 'old_town', 0],
  // Musikschule J.N. Hummel – OSM 89178904 ~40m × 25m
  [-33,-53,   4, 2.5,   8, 'university', 0],
  // Hauptpostamt – OSM 89178911 ~45m × 30m
  [-34,-31,   4.5, 3,   8, 'old_town', 0],
  // Stadtverwaltung NE – OSM 28743530 ~45m × 30m
  [ 38,-31,   4.5, 3,   8, 'old_town', 0],
  // Cluster NE – OSM 28743540 ~20m × 15m
  [ 41,-27,   2, 1.5,   8, 'old_town', 0],
  // Goethes Gartenhaus (park SE) – OSM 29463016
  [ 49, 38,   2, 1.5,   8, 'old_town', 0.3],
  // Römisches Haus (park SE)
  [ 44, 32,   3.5,2.5,  8, 'old_town', 0.2],

  // ── OSM UNIVERSITY / INSTITUTION DISTRICT (NW) ───────────────────────────
  // Gemeinschaftsschule – OSM 54149052 ~50m × 30m
  [-43, 11,   5, 3,    10, 'university', 0],
  // Centrum Intelligentes Bauen – OSM 55995387 ~45m × 30m
  [-45,-14,   4.5, 3,  10, 'university', 0],
  // Friedrich-August-Finger-Bau – OSM 89166164 ~55m × 30m
  [-51,-24,   5.5, 3,  10, 'university', 0],
  // Bauhaus b.is Technikum – OSM 89166138 ~45m × 30m
  [-48,-30,   4.5, 3,  10, 'university', 0],
  // Bauhaus-Uni cluster NW1 – OSM 89166150
  [-54,-20,   4.5, 3,   8, 'university', 0],
  // Bauhaus-Uni cluster NW2 – OSM 89166152
  [-54,-28,   4.5, 3,  10, 'university', 0],
  // University annex NW3 – OSM 89166172
  [-47,-34,   4.5, 3,  10, 'university', 0],
  // Thüringenkolleg – OSM 89166157
  [-51,-58,   5, 3,    10, 'university', 0],
  // Schools S near Geschwister-Scholl-Str – OSM 54255905/06/07
  [-19, 42,   5, 3,    12, 'university', 0],
  [-23, 43,   4, 2.5,   6, 'university', 0],
  [-18, 36,   4, 2.5,   6, 'university', 0],

  // ── OSM RESIDENTIAL (NW near university) ─────────────────────────────────
  // Consolidated OSM ids 89166142/145/146/169/176/178
  // [-47,-20] & [-48,-24] merged into [-46,-22] block; [-20,-51] removed (dup)
  [-46,-22,   5, 4,    10, 'residential', 0],
  [-43,-22,   4, 3,    10, 'residential', 0],
  [-40,-23,   4, 3,     8, 'residential', 0],
  [-21,-52,   4, 3,     8, 'residential', 0],
  [-21,-44,   4, 3,     8, 'residential', 0],

  // ── HISTORIC CORE ─────────────────────────────────────────────────────────
  // N of Markt toward Herderplatz
  [ -6, -8,   5, 4,    17, 'old_town', 0],
  [  5, -8,   5, 4,    18, 'old_town', 0],
  [ 12, -8,   5, 4,    15, 'old_town', 0],
  [-14, -8,   4, 3,    20, 'old_town', 0],
  [  0,-14,   5, 4,    15, 'old_town', 0],
  [  8,-14,   4, 3,    13, 'old_town', 0],
  [-20,-16,   5, 4,    13, 'old_town', 0],  // clear of Wittumspalais [-20,-10,4,3.5]
  [-10,-16,   5, 4,    14, 'old_town', 0],

  // E of Markt toward Platz der Demokratie / river
  [ 14,  2,   5, 5,    18, 'old_town', 0],
  [ 22, -2,   5, 5,    16, 'old_town', 0],
  [ 22,  6,   5, 5,    14, 'old_town', 0],
  [ 28,  2,   4, 4,    13, 'old_town', 0],
  [ 32, -8,   5, 4,    11, 'old_town', 0],
  [ 30,  8,   5, 4,    13, 'old_town', 0],

  // S of Markt toward Frauenplan
  [ -1,  8,   5, 4,    18, 'old_town', 0],
  [  7, 10,   5, 5,    16, 'old_town', 0],
  [-10,  8,   5, 4,    15, 'old_town', 0],
  [  1, 15,   5, 4,    17, 'old_town', 0],
  [ -5, 14,   4, 3,    13, 'old_town', 0],
  [ 10, 15,   4, 3,    15, 'old_town', 0],

  // W of Markt toward Nationaltheater
  [ -9, -2,   5, 5,    20, 'old_town', 0],
  [ -9,  5,   5, 5,    16, 'old_town', 0],
  // [-20,-8] removed (overlapped Wittumspalais); shifted west:
  [-26, -7,   5, 4,    13, 'old_town', 0],
  [-25,  4,   5, 5,    15, 'old_town', 0],
  [-33,-16,   5, 4,    11, 'old_town', 0],  // was [-28,-8], moved clear of Goethekaufhaus
  [-18,  2,   5, 4,    13, 'old_town', 0],

  // ── RESIDENTIAL FILL ──────────────────────────────────────────────────────
  // NE: Herderkirche → Stadtschloss
  [  8,-17,   6, 5,    13, 'old_town', 0],
  [ 15,-17,   6, 5,    15, 'old_town', 0],
  [  8,-26,   6, 5,    12, 'residential', 0],
  [ 18,-26,   6, 5,    11, 'residential', 0],
  [ 26,-20,   6, 5,    10, 'residential', 0],
  [ 33,-26,   5, 4,     9, 'residential', 0],
  [ 38,-18,   6, 5,     9, 'residential', 0],
  [ 44,-10,   6, 5,     9, 'residential', 0],

  // NW around Theaterplatz
  [-44, -8,   6, 5,    11, 'old_town', 0],
  [-44,  4,   6, 5,    13, 'old_town', 0],
  [-35,-12,   7, 5,    10, 'residential', 0],
  // [-28,-25] removed (overlapped Haus der Erholung); shifted:
  [-30,-28,   6, 5,     9, 'residential', 0],
  [-37,-22,   6, 5,     9, 'residential', 0],

  // N between Theaterplatz and Bauhaus Museum
  [-38,-35,   7, 5,     9, 'residential', 0],
  [-25,-42,   6, 5,    10, 'residential', 0],
  [-50,-45,   6, 5,     8, 'residential', 0],
  [-15,-45,   7, 5,     9, 'residential', 0],
  [-28,-50,   6, 5,     8, 'residential', 0],
  [ -2,-38,   6, 5,     9, 'residential', 0],
  [ 10,-40,   6, 5,     9, 'residential', 0],
  [ 22,-42,   6, 5,     8, 'residential', 0],

  // SE: Goethehaus neighbourhood
  [  7, 17,   6, 5,    15, 'old_town', 0],
  // [22,8] removed (overlapped old_town 22,6); moved south:
  [ 22, 14,   6, 5,    11, 'residential', 0],
  [ 22, 21,   6, 5,    10, 'residential', 0],
  [ 28, 12,   5, 5,    10, 'residential', 0],
  [ 32,  4,   6, 5,    11, 'residential', 0],
  [ 40,  8,   6, 5,     9, 'residential', 0],
  [ 36, 18,   6, 5,     9, 'residential', 0],
  [ 44,  2,   6, 5,     9, 'residential', 0],

  // S toward Bauhaus-Uni
  [ -5, 28,   6, 5,    11, 'residential', 0],
  [ 12, 28,   6, 5,    10, 'residential', 0],
  [-15, 28,   5, 4,     9, 'residential', 0],
  [ 12, 35,   5, 4,     9, 'residential', 0],
  [-12, 35,   6, 5,     8, 'residential', 0],
  [-22, 35,   6, 5,     8, 'residential', 0],
  [-22, 48,   6, 5,     8, 'residential', 0],
  [ 20, 45,   6, 5,     8, 'residential', 0],
  [  5, 50,   6, 5,     8, 'residential', 0],
  [ -8, 50,   6, 5,     8, 'residential', 0],
  [ 28, 38,   5, 4,     8, 'residential', 0],
  [ 36, 32,   5, 4,     9, 'residential', 0],

  // E park-edge residential
  [ 32, -5,   6, 5,    11, 'residential', 0],
  // [32,8] removed (overlapped old_town 30,8); moved east:
  [ 36,  8,   6, 5,    10, 'residential', 0],
  [ 44, -5,   6, 5,     9, 'residential', 0],
  [ 44,  8,   6, 5,     9, 'residential', 0],
  [ 32,-18,   6, 5,    10, 'residential', 0],
  [ 44,-18,   6, 5,     8, 'residential', 0],
  [ 50,-10,   6, 5,     8, 'residential', 0],
  [ 50,  4,   6, 5,     8, 'residential', 0],

  // Far N
  // [-10,-30] removed (overlapped Sparkasse at -13,-28); shifted:
  [ -8,-33,   6, 5,    11, 'residential', 0],
  [  5,-35,   6, 5,    10, 'residential', 0],
  [ 20,-35,   6, 5,     9, 'residential', 0],
  [ -2,-42,   6, 5,     9, 'residential', 0],
  [ 12,-45,   5, 4,     8, 'residential', 0],
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

// ── World spread factor ───────────────────────────────────────────────────────
// Multiplied into every X/Z position so buildings gain breathing room.
// Building sizes (w, d, h) are unchanged — only their placement is spread.
export const WORLD_SPREAD = 2.5;

// ── World ─────────────────────────────────────────────────────────────────────

export class WeimarWorld {
  constructor(scene) {
    this.scene = scene;
    this.worldGroup = new THREE.Group();
    scene.add(this.worldGroup);

    this.ground        = null;
    this.buildingMeshes = [];
    this.streetMeshes  = [];
    this.parkMeshes    = [];
    this.riverMesh     = null;
    this.treeMeshes    = [];
    this.particles     = null;
    // Each playground: { cx, cz, mats: Material[], objects: Mesh[] }
    this.playgrounds   = [];
    // Each student group: { cx, cz, objects: Mesh[], capMats: Material[], lastChat }
    this.studentGroups = [];
    // Each meat smell zone: { cx, cz, objects: Mesh[], ringMats: Material[], lastSniff }
    this.meatSmells = [];
    // Accessibility geometry (visible only in SOLEN's world)
    this.accessibilityMeshes = [];
    // Sidewalk bounding boxes for speed factor lookup
    this._sidewalkZones = [];
    // VEX educational buildings: enhanced exteriors + interiors
    this.vexBuildings  = [];  // THREE.Group[] — enhanced exterior overlays
    this.vexInteriors  = [];  // { id, label, doorX, doorZ, spawnX, spawnZ, exitX, exitZ, objects[] }

    this._build();
  }

  _build() {
    this._buildGround();
    this._buildStreets();
    this._buildParks();
    this._buildRiver();
    this._buildBuildings();
    this._buildGraffiti();
    this._buildPlazas();
    this._buildPlaygrounds();
    this._buildStudentGroups();
    this._buildMeatSmells();
    this._buildAccessibilityFeatures();
    this._buildVexEducational();
    this._buildTrees();
    this._buildParticles();
  }

  // ── Ground ────────────────────────────────────────────────────────────────
  _buildGround() {
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1, metalness: 0 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.worldGroup.add(this.ground);
  }

  // ── Streets ───────────────────────────────────────────────────────────────
  _buildStreets() {
    const S = WORLD_SPREAD;
    STREETS.forEach(([cx, cz, w, len, rot]) => {
      const geo = new THREE.PlaneGeometry(len * S, w * 1.6); // wider roads
      const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rot;
      mesh.position.set(cx * S, 0.02, cz * S);
      mesh.receiveShadow = true;
      this.worldGroup.add(mesh);
      this.streetMeshes.push(mesh);
    });
  }

  // ── Parks ─────────────────────────────────────────────────────────────────
  _buildParks() {
    const S = WORLD_SPREAD;
    PARKS.forEach(([cx, cz, rx, rz]) => {
      const geo = new THREE.CircleGeometry(1, 32);
      geo.scale(rx * S, 1, rz * S);
      const mat = new THREE.MeshStandardMaterial({ color: 0x112200, roughness: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(cx * S, 0.01, cz * S);
      mesh.receiveShadow = true;
      this.worldGroup.add(mesh);
      this.parkMeshes.push(mesh);
    });
  }

  // ── River Ilm ─────────────────────────────────────────────────────────────
  _buildRiver() {
    const S = WORLD_SPREAD;
    const curve = new THREE.CatmullRomCurve3(
      RIVER_PATH.map(([x, z]) => new THREE.Vector3(x * S, 0.03, z * S))
    );
    const geo = new THREE.TubeGeometry(curve, 40, 3.2, 6, false);
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
    const S = WORLD_SPREAD;
    this.buildingColliders = [];
    BUILDINGS.forEach(([cx, cz, w, d, baseH, type, rotY = 0]) => {
      const group = new THREE.Group();
      group.position.set(cx * S, 0, cz * S);
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

      // ── AABB collider (world-space, XZ plane) ─────────────────────────
      this.buildingColliders.push({
        minX: cx * S - w / 2,
        maxX: cx * S + w / 2,
        minZ: cz * S - d / 2,
        maxZ: cz * S + d / 2,
      });
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

  // ── Graffiti (Thrak) ─────────────────────────────────────────────────────
  _buildGraffiti() {
    this.graffitiMeshes = [];

    const TAGS = [
      'COMPLY',
      'NO FUN ZONE',
      'BADGE #666',
      'UNDER\nSURVEILLANCE',
      'MOVE ALONG',
      'SUSPECT\nAREA',
      'VIOLATORS\nPROCESSED',
      'OBEY',
      'DO NOT\nGATHER',
      'CITATION\nISSUED',
      'ZONE 4B\nRESTRICTED',
      'THRAK\nWAS HERE',
      'YOU ARE\nBEING WATCHED',
      'NO\nFUN',
      'STOP\nOR ELSE',
      'FINED',
      'PAPERS\nPLEASE',
      'CURFEW\n22:00',
      'REPORT\nSUSPECTS',
      'GUILTY',
      'DISPERSE\nNOW',
      'LAW\nENFORCED',
      'STEP\nBACK',
      'RESTRICTED\nZONE',
      '⚡ THRAK ⚡',
      'NO\nSMILING',
      'HANDS\nWHERE I\nCAN SEE',
    ];

    // Tag almost every building — pick indices across the full list
    const total = this.buildingMeshes.length;
    const targets = [];
    for (let i = 0; i < total; i += 2) targets.push(i); // every other building

    targets.forEach((bi, ti) => {
      const b = this.buildingMeshes[bi];
      if (!b) return;

      // Place 1–2 tags per building
      const tagCount = (ti % 3 === 0) ? 2 : 1;

      for (let t = 0; t < tagCount; t++) {
        const tag   = TAGS[(ti * 2 + t) % TAGS.length];
        const lines = tag.split('\n');

        // High-res canvas for crispness
        const cw = 512, ch = 512;
        const canvas  = document.createElement('canvas');
        canvas.width  = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, cw, ch);

        // Slight spray-paint tilt
        const angle = (Math.random() - 0.5) * 0.22;
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate(angle);

        const fontSize = lines.length > 2 ? 110 : lines.length > 1 ? 130 : 160;
        ctx.font        = `900 ${fontSize}px 'Arial Black', Impact, sans-serif`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';

        // Outer glow pass — wide blurry yellow halo
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur  = 80;
        ctx.fillStyle   = '#ffff00';
        for (let g = 0; g < 4; g++) {
          const lineH  = fontSize * 1.2;
          const startY = -(lines.length - 1) * lineH / 2;
          lines.forEach((l, li) => ctx.fillText(l, 0, startY + li * lineH));
        }

        // Bright core — pure white centre on top of yellow
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = '#ffffff';
        {
          const lineH  = fontSize * 1.2;
          const startY = -(lines.length - 1) * lineH / 2;
          lines.forEach((l, li) => ctx.fillText(l, 0, startY + li * lineH));
        }

        // Yellow outline
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth   = 8;
        {
          const lineH  = fontSize * 1.2;
          const startY = -(lines.length - 1) * lineH / 2;
          lines.forEach((l, li) => ctx.strokeText(l, 0, startY + li * lineH));
        }

        ctx.restore();

        // Separate emissive-only texture (same canvas, full opacity)
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
          roughness: 0.9,
          metalness: 0,
          emissive: new THREE.Color(0xffff00),
          emissiveMap: tex,
          emissiveIntensity: 4.0,
        });

        // Large decals — nearly full wall width
        const pw = Math.max(b.w * 0.9, 5);
        const ph = pw * (lines.length > 1 ? 0.9 : 0.6);
        const geo = new THREE.PlaneGeometry(pw, ph);

        const decal = new THREE.Mesh(geo, mat);
        decal.visible = false;

        // Spread tags across all 4 faces
        const face   = (ti * 2 + t) % 4;
        const halfW  = b.w / 2 + 0.06;
        const halfD  = b.d / 2 + 0.06;
        // Alternate height so double-tags don't overlap
        const midH   = b.baseH * (t === 0 ? 0.45 : 0.72);

        if (face === 0) {
          decal.position.set(0, midH, halfD);
        } else if (face === 1) {
          decal.position.set(0, midH, -halfD);
          decal.rotation.y = Math.PI;
        } else if (face === 2) {
          decal.position.set(halfW, midH, 0);
          decal.rotation.y = Math.PI / 2;
        } else {
          decal.position.set(-halfW, midH, 0);
          decal.rotation.y = -Math.PI / 2;
        }

        decal.userData.worldX = b.group.position.x;
        decal.userData.worldZ = b.group.position.z;
        b.group.add(decal);
        this.graffitiMeshes.push(decal);
      }
    });
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
    // Bubble (Niko — kid) — balloon-like sphere, soft & translucent
    {
      const r = Math.max(w, d) * 0.52;
      const geo = new THREE.SphereGeometry(r, 10, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff88cc, metalness: 0.05, roughness: 0.2,
        emissive: 0x881144, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.78,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = topY + r;
      m.visible = false;
      group.add(m);
      roofMeshes.bubble = m;
    }

    return roofMeshes;
  }

  // ── Plazas ────────────────────────────────────────────────────────────────
  _buildPlazas() {
    const S = WORLD_SPREAD;
    const plazas = [
      [0,    0,    8*S, 7.5*S],  // Markt
      [-35, -3,   18*S, 14*S],   // Theaterplatz
      [-4,  -20,   8*S,  6*S],   // Herderplatz
      [ 21, -14,  12*S,  8*S],   // Burgplatz
      [ 17,  10,   6*S,  5*S],   // Platz der Demokratie
    ];
    plazas.forEach(([cx, cz, w, d]) => {
      const geo = new THREE.PlaneGeometry(w, d);
      const mat = new THREE.MeshStandardMaterial({ color: 0x222020, roughness: 0.95 });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(cx * S, 0.03, cz * S);
      this.worldGroup.add(m);
    });

    // Goethe & Schiller statue pedestal on Theaterplatz
    const pedestalGeo = new THREE.BoxGeometry(1, 2.5, 1);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(-35 * S, 1.25, 1 * S);
    pedestal.castShadow = true;
    this.worldGroup.add(pedestal);
  }

  // ── Playgrounds ──────────────────────────────────────────────────────────
  _buildPlaygrounds() {
    const S = WORLD_SPREAD;
    this._addPlayground(52*S, 22*S);   // Ilm park children's area
    this._addPlayground(-6*S, 37*S);   // South residential near Bauhaus-Uni
    this._addPlayground(-28*S, -20*S); // Near Theaterplatz residential
    this._addPlayground(8*S, -52*S);   // Near Goethepark north area
  }

  _addPlayground(cx, cz) {
    const pg = { cx, cz, mats: [], objects: [], animated: { swings: [], merry: null, seesaw: null, springers: [] } };
    this.playgrounds.push(pg);

    const mkMat = (color, emissive = 0x000000) => new THREE.MeshStandardMaterial({
      color, roughness: 0.65, metalness: 0.1, emissive, emissiveIntensity: 0,
    });
    // Place a static mesh directly in worldGroup
    const place = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true; m.receiveShadow = true;
      m.visible = false;
      this.worldGroup.add(m);
      pg.mats.push(mat); pg.objects.push(m);
      return m;
    };
    // Create an animated Group tracked for visibility; children added separately
    const makeGroup = (x, y, z) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.visible = false;
      this.worldGroup.add(g);
      pg.objects.push(g);
      return g;
    };
    // Add a mesh as child of a group, tracking mat for glow
    const child = (grp, geo, mat, lx = 0, ly = 0, lz = 0, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(lx, ly, lz);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true; m.receiveShadow = true;
      grp.add(m);
      pg.mats.push(mat);
      return m;
    };

    // ── Rubber ground pad (large, two-tone) ───────────────────────────────
    const padMat = new THREE.MeshStandardMaterial({ color: 0x33aa55, roughness: 1, metalness: 0, emissive: 0x44ff44, emissiveIntensity: 0 });
    const pad = new THREE.Mesh(new THREE.CircleGeometry(13, 32), padMat);
    pad.rotation.x = -Math.PI / 2; pad.position.set(cx, 0.05, cz);
    pad.receiveShadow = true; pad.visible = false;
    this.worldGroup.add(pad); pg.mats.push(padMat); pg.objects.push(pad);

    const innerPadMat = new THREE.MeshStandardMaterial({ color: 0x228844, roughness: 1, metalness: 0, emissive: 0x33ff88, emissiveIntensity: 0 });
    const innerPad = new THREE.Mesh(new THREE.CircleGeometry(6, 32), innerPadMat);
    innerPad.rotation.x = -Math.PI / 2; innerPad.position.set(cx, 0.06, cz);
    innerPad.receiveShadow = true; innerPad.visible = false;
    this.worldGroup.add(innerPad); pg.mats.push(innerPadMat); pg.objects.push(innerPad);

    // ── Colorful fence ring ───────────────────────────────────────────────
    const fenceColors = [0xff2244, 0xff8800, 0xffdd00, 0x44ff88, 0x2288ff, 0xaa44ff];
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2;
      place(new THREE.CylinderGeometry(0.15, 0.15, 1.6, 6),
        mkMat(fenceColors[i % fenceColors.length], fenceColors[i % fenceColors.length]),
        cx + Math.cos(angle) * 12.2, 0.8, cz + Math.sin(angle) * 12.2);
    }

    // ── Big swing set — static frame + animated pivot groups ──────────────
    const swX = cx - 5.5, swZ = cz - 6;
    const swH = 7.0, swW = 9.5;
    place(new THREE.CylinderGeometry(0.2, 0.2, swH, 6), mkMat(0xdd2200, 0xff4400), swX - swW/2, swH/2, swZ - 0.9, -0.12, 0, 0);
    place(new THREE.CylinderGeometry(0.2, 0.2, swH, 6), mkMat(0xdd2200, 0xff4400), swX - swW/2, swH/2, swZ + 0.9,  0.12, 0, 0);
    place(new THREE.CylinderGeometry(0.2, 0.2, swH, 6), mkMat(0xdd2200, 0xff4400), swX + swW/2, swH/2, swZ - 0.9, -0.12, 0, 0);
    place(new THREE.CylinderGeometry(0.2, 0.2, swH, 6), mkMat(0xdd2200, 0xff4400), swX + swW/2, swH/2, swZ + 0.9,  0.12, 0, 0);
    place(new THREE.CylinderGeometry(0.14, 0.14, swW + 1.0, 8), mkMat(0xaa1100, 0xff3300), swX, swH - 0.1, swZ, 0, 0, Math.PI / 2);
    // Each swing: pivot group at top attachment (crossbar height), chains and seat hang down
    [0x2266ff, 0xff66cc, 0x44ffaa].forEach((col, s) => {
      const sx = swX - 3 + s * 3;
      const swingPivot = makeGroup(sx, swH - 0.15, swZ);
      child(swingPivot, new THREE.CylinderGeometry(0.045, 0.045, 4.6, 4), mkMat(0x999999), -0.32, -2.45, 0);
      child(swingPivot, new THREE.CylinderGeometry(0.045, 0.045, 4.6, 4), mkMat(0x999999),  0.32, -2.45, 0);
      child(swingPivot, new THREE.BoxGeometry(1.2, 0.15, 0.6), mkMat(col, col), 0, -4.75, 0);
      pg.animated.swings.push({ pivot: swingPivot, phase: s * 1.3 });
    });

    // ── Tall slide tower (fully static) ───────────────────────────────────
    const slX = cx + 5.5, slZ = cz - 5;
    place(new THREE.BoxGeometry(3.2, 6.0, 3.2), mkMat(0xff6600, 0xff8800), slX, 3.0, slZ);
    place(new THREE.BoxGeometry(3.6, 0.3,  3.6), mkMat(0xffaa00, 0xffcc44), slX, 6.1, slZ);
    place(new THREE.BoxGeometry(2.0, 0.18, 8.5), mkMat(0xffdd00, 0xffee44), slX, 3.0, slZ + 6.1, -0.7, 0, 0);
    place(new THREE.BoxGeometry(0.14, 0.65, 8.5), mkMat(0xffcc00), slX - 1.05, 3.3, slZ + 6.1, -0.7, 0, 0);
    place(new THREE.BoxGeometry(0.14, 0.65, 8.5), mkMat(0xffcc00), slX + 1.05, 3.3, slZ + 6.1, -0.7, 0, 0);
    const ladX = slX - 1.6;
    place(new THREE.CylinderGeometry(0.09, 0.09, 6.0, 6), mkMat(0x888888), ladX,       3.0, slZ - 1.6);
    place(new THREE.CylinderGeometry(0.09, 0.09, 6.0, 6), mkMat(0x888888), ladX + 0.8, 3.0, slZ - 1.6);
    for (let r = 0; r < 8; r++) {
      place(new THREE.BoxGeometry(0.8, 0.09, 0.15), mkMat(0x4488ff, 0x66aaff), ladX + 0.4, 0.4 + r * 0.7, slZ - 1.6);
    }

    // ── Merry-go-round — static axle + animated spinning group ───────────
    const mgX = cx - 5, mgZ = cz + 5;
    place(new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8), mkMat(0x666666), mgX, 0.6, mgZ); // axle
    const merryGroup = makeGroup(mgX, 0.58, mgZ);
    child(merryGroup, new THREE.CylinderGeometry(3.6, 3.6, 0.25, 24), mkMat(0xff44aa, 0xff66cc));
    child(merryGroup, new THREE.TorusGeometry(3.55, 0.12, 6, 28), mkMat(0xaa2277, 0xff44cc), 0, 0.15, 0, Math.PI / 2, 0, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bx = Math.cos(a) * 1.8, bz = Math.sin(a) * 1.8;
      child(merryGroup, new THREE.CylinderGeometry(0.07, 0.07, 3.6, 4), mkMat(0xdd44bb, 0xff66dd), bx, 0.12, bz, 0, 0, Math.PI / 2 + a);
      child(merryGroup, new THREE.CylinderGeometry(0.12, 0.12, 1.4, 6), mkMat(0xff88ee, 0xffaaff), bx, 0.55, bz);
    }
    pg.animated.merry = merryGroup;

    // ── Seesaw — static base + animated pivot group ───────────────────────
    const ssX = cx + 5, ssZ = cz + 5;
    place(new THREE.CylinderGeometry(0.15, 0.18, 1.1, 8), mkMat(0x888800), ssX, 0.55, ssZ);   // post
    place(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 6), mkMat(0x888800), ssX, 1.2, ssZ);   // pin
    const seesawPivot = makeGroup(ssX, 1.33, ssZ);
    child(seesawPivot, new THREE.BoxGeometry(7.5, 0.22, 0.5),   mkMat(0x22cc44, 0x55ff66));
    child(seesawPivot, new THREE.BoxGeometry(1.0, 0.14, 0.6),   mkMat(0xff3333, 0xff6666), -3.4,  0.52, 0);
    child(seesawPivot, new THREE.BoxGeometry(1.0, 0.14, 0.6),   mkMat(0x3333ff, 0x6666ff),  3.4, -0.52, 0);
    child(seesawPivot, new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8), mkMat(0xdddddd), -3.4,  0.67, 0.28, Math.PI / 2, 0, 0);
    child(seesawPivot, new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8), mkMat(0xdddddd),  3.4, -0.38, 0.28, Math.PI / 2, 0, 0);
    pg.animated.seesaw = seesawPivot;

    // ── Climbing frame ────────────────────────────────────────────────────
    const cfX = cx - 1, cfZ = cz + 3;
    const cfCols = [0xff2244, 0xff8800, 0xffdd00, 0x44ee88, 0x2288ff, 0xaa44ff];
    const postPos = [];
    for (let pi = 0; pi < 3; pi++) {
      for (let pj = 0; pj < 2; pj++) {
        const px = cfX + (pi - 1) * 2.8, pz = cfZ + (pj - 0.5) * 2.8;
        postPos.push([px, pz]);
        place(new THREE.CylinderGeometry(0.14, 0.14, 5.0, 6), mkMat(cfCols[(pi * 2 + pj) % 6], cfCols[(pi * 2 + pj) % 6]), px, 2.5, pz);
      }
    }
    place(new THREE.BoxGeometry(5.8, 0.2, 2.9), mkMat(0xffaa44, 0xffcc66), cfX, 5.0, cfZ);
    [1.1, 2.1, 3.3, 4.4].forEach(h => {
      [0, 1].forEach(pj => {
        [[0, 2], [2, 4]].forEach(([a, b]) => {
          const mx = (postPos[a + pj][0] + postPos[b + pj][0]) / 2;
          place(new THREE.CylinderGeometry(0.055, 0.055, 2.8, 5), mkMat(0xffffff, 0xffffff), mx, h, postPos[a + pj][1], 0, 0, Math.PI / 2);
        });
      });
      [0, 2, 4].forEach(pi => {
        const mz = (postPos[pi][1] + postPos[pi + 1][1]) / 2;
        place(new THREE.CylinderGeometry(0.055, 0.055, 2.8, 5), mkMat(0xffffff, 0xffffff), postPos[pi][0], h, mz, Math.PI / 2, 0, 0);
      });
    });

    // ── Big sandbox with castle walls ─────────────────────────────────────
    const sbX = cx - 7.5, sbZ = cz + 4;
    place(new THREE.BoxGeometry(5.5, 0.45, 5.5), mkMat(0xcc8833, 0xffaa44), sbX, 0.22, sbZ);
    place(new THREE.BoxGeometry(4.9, 0.35, 4.9), mkMat(0xddcc77, 0xffee88), sbX, 0.18, sbZ);
    const twrCols = [0xff4444, 0xffbb00, 0x44aaff, 0xff44bb];
    [[-2.5, -2.5], [2.5, -2.5], [2.5, 2.5], [-2.5, 2.5]].forEach(([ox, oz], i) => {
      place(new THREE.CylinderGeometry(0.5, 0.55, 1.5, 8), mkMat(twrCols[i], twrCols[i]), sbX + ox, 0.75, sbZ + oz);
      place(new THREE.ConeGeometry(0.62, 0.7, 8), mkMat(twrCols[i], twrCols[i]), sbX + ox, 1.85, sbZ + oz);
    });

    // ── Bouncy springers — animated bob groups ────────────────────────────
    [[cx - 9, cz - 2, 0xff3388], [cx - 9.5, cz + 1.5, 0x44bbff]].forEach(([sx, sz, col], si) => {
      place(new THREE.CylinderGeometry(0.2, 0.25, 0.9, 8), mkMat(0x999999), sx, 0.45, sz); // spring base (static)
      const springerGrp = makeGroup(sx, 1.0, sz);
      child(springerGrp, new THREE.SphereGeometry(0.75, 8, 7),            mkMat(col, col),    0,     0.6,  0);
      child(springerGrp, new THREE.SphereGeometry(0.16, 6, 5),            mkMat(0xffffff),   -0.26,  0.85, 0.62);
      child(springerGrp, new THREE.SphereGeometry(0.16, 6, 5),            mkMat(0xffffff),    0.26,  0.85, 0.62);
      child(springerGrp, new THREE.SphereGeometry(0.08, 5, 4),            mkMat(0x111111),   -0.26,  0.85, 0.70);
      child(springerGrp, new THREE.SphereGeometry(0.08, 5, 4),            mkMat(0x111111),    0.26,  0.85, 0.70);
      child(springerGrp, new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), mkMat(0xdddddd),    0,     1.5,  0.32, Math.PI / 2, 0, 0);
      pg.animated.springers.push({ grp: springerGrp, phase: si * 2.1 });
    });

    // ── Tunnel (static) ───────────────────────────────────────────────────
    const tnX = cx + 8, tnZ = cz + 4;
    place(new THREE.CylinderGeometry(1.6, 1.6, 6.5, 14, 1, true), mkMat(0x44aaff, 0x66ccff), tnX, 1.5, tnZ, 0, 0, Math.PI / 2);
    place(new THREE.TorusGeometry(1.6, 0.18, 8, 18), mkMat(0x0066cc, 0x2288ff), tnX - 3.25, 1.5, tnZ, 0, Math.PI / 2, 0);
    place(new THREE.TorusGeometry(1.6, 0.18, 8, 18), mkMat(0x0066cc, 0x2288ff), tnX + 3.25, 1.5, tnZ, 0, Math.PI / 2, 0);
  }

  // ── Playground visibility & proximity glow ────────────────────────────────

  setPlaygroundsVisible(visible) {
    this.playgrounds.forEach(({ objects }) =>
      objects.forEach(o => { o.visible = visible; })
    );
  }

  updatePlaygroundProximity(px, pz, isNiko, glowColor, maxIntensity, time = 0) {
    // 50 world units ≈ 200 m (1 city unit = 10 m, WORLD_SPREAD = 2.5)
    const GLOW_RADIUS = 50;
    const ANIM_RADIUS = 50;
    const gc = new THREE.Color(glowColor ?? 0xffdd00);

    this.playgrounds.forEach(({ cx, cz, mats, animated }) => {
      const dist = Math.sqrt((px - cx) ** 2 + (pz - cz) ** 2);
      const t = isNiko ? Math.max(0, 1 - dist / GLOW_RADIUS) : 0;

      // ── Glow ──────────────────────────────────────────────────────────
      const intensity = t * t * (maxIntensity ?? 3.5);
      mats.forEach(m => {
        if (isNiko) {
          m.emissive.copy(gc);
          m.emissiveIntensity = intensity;
        } else {
          m.emissiveIntensity *= 0.85;
        }
      });

      if (!isNiko || !animated) return;

      // ── Animations (ramp up with proximity) ───────────────────────────
      const animT = Math.max(0, 1 - dist / ANIM_RADIUS); // 0→1 as player approaches
      const speed = 0.4 + animT * 0.9;                   // slow at edge, lively up close

      // Swings — each on its own phase, oscillate pivot rotation.z
      animated.swings.forEach(({ pivot, phase }) => {
        const amp = 0.55 * animT;
        pivot.rotation.z = Math.sin(time * speed + phase) * amp;
      });

      // Merry-go-round — spin around Y
      if (animated.merry) {
        animated.merry.rotation.y = time * speed * 0.7;
      }

      // Seesaw — rock around Z
      if (animated.seesaw) {
        animated.seesaw.rotation.z = Math.sin(time * speed * 0.65) * 0.28 * animT;
      }

      // Springers — bob up and down on Y
      animated.springers?.forEach(({ grp, phase }) => {
        grp.position.y = 1.0 + Math.abs(Math.sin(time * speed * 1.4 + phase)) * 0.55 * animT;
        grp.rotation.z = Math.sin(time * speed * 0.9 + phase) * 0.18 * animT;
      });
    });
  }

  // ── Student Groups (VEX universe) ─────────────────────────────────────────
  _buildStudentGroups() {
    const S = WORLD_SPREAD;
    // Groups placed at key social spots around Weimar
    this._addStudentGroup(  2*S,  44*S, 4);  // Bauhaus-Uni entrance
    this._addStudentGroup(-35*S,   2*S, 5);  // Theaterplatz steps
    this._addStudentGroup(  0*S,   5*S, 3);  // Markt centre
    this._addStudentGroup( 48*S,  20*S, 4);  // Ilm park lawn
    this._addStudentGroup( -4*S, -15*S, 3);  // Herderplatz
    this._addStudentGroup( -7*S,  19*S, 3);  // Goethehaus lane
    this._addStudentGroup(-38*S, -55*S, 4);  // Bauhaus Museum square
    this._addStudentGroup(-14*S,   9*S, 2);  // Schillerstraße corner
  }

  _addStudentGroup(cx, cz, count) {
    const sg = { cx, cz, objects: [], capMats: [], lastChat: -Infinity };
    this.studentGroups.push(sg);

    const capColors = [0x00ccff, 0xffdd00, 0xff6699, 0xaa44ff, 0xff8800, 0x44ffbb, 0xff44cc, 0x88ff00];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const r     = 1.2 + Math.random() * 0.7;
      const nx    = cx + Math.cos(angle) * r;
      const nz    = cz + Math.sin(angle) * r;
      const scale = 0.6 + Math.random() * 0.22;
      const color = capColors[Math.floor(Math.random() * capColors.length)];

      // Stem
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xddddaa, roughness: 0.9 });
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2*scale, 0.26*scale, 1.1*scale, 7),
        stemMat
      );
      stem.position.set(nx, 0.55*scale, nz);
      stem.castShadow = true;
      stem.visible = false;
      this.worldGroup.add(stem);
      sg.objects.push(stem);

      // Cap
      const capGeo = new THREE.SphereGeometry(0.55*scale, 9, 7, 0, Math.PI*2, 0, Math.PI*0.62);
      const capMat = new THREE.MeshStandardMaterial({
        color, roughness: 0.75,
        emissive: new THREE.Color(color), emissiveIntensity: 0.18,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.rotation.x = Math.PI;
      cap.position.set(nx, 1.35*scale, nz);
      cap.castShadow = true;
      cap.visible = false;
      this.worldGroup.add(cap);
      sg.objects.push(cap);
      sg.capMats.push(capMat);

      // Spot dots on cap
      const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
      [[0.35, 0], [-0.25, 0.22], [0.1, -0.35]].slice(0, 1 + Math.floor(Math.random()*2)).forEach(([ox, oz]) => {
        const spot = new THREE.Mesh(new THREE.CircleGeometry(0.07*scale, 5), spotMat);
        spot.position.set(nx + ox*scale, 1.2*scale, nz + oz*scale);
        spot.lookAt(nx + ox*scale*3, 1.2*scale, nz + oz*scale*3);
        spot.visible = false;
        this.worldGroup.add(spot);
        sg.objects.push(spot);
      });

      // Face: two tiny eye-dots
      const eyeM = new THREE.MeshBasicMaterial({ color: 0x111111 });
      [-0.12*scale, 0.12*scale].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05*scale, 4, 3), eyeM);
        const faceAngle = angle + Math.PI; // face inward toward group centre
        eye.position.set(
          nx + Math.cos(faceAngle) * 0.52*scale + ex * Math.cos(faceAngle + Math.PI/2),
          1.0*scale,
          nz + Math.sin(faceAngle) * 0.52*scale + ex * Math.sin(faceAngle + Math.PI/2)
        );
        eye.visible = false;
        this.worldGroup.add(eye);
        sg.objects.push(eye);
      });
    }
  }

  setStudentGroupsVisible(visible) {
    this.studentGroups.forEach(({ objects }) =>
      objects.forEach(o => { o.visible = visible; })
    );
  }

  updateStudentGroupGlow(px, pz) {
    const glowRadius = 20;
    this.studentGroups.forEach(({ cx, cz, capMats }) => {
      const dist = Math.sqrt((px - cx)**2 + (pz - cz)**2);
      const t = Math.max(0, 1 - dist / glowRadius);
      const intensity = 0.18 + t * t * 2.8;
      capMats.forEach(m => {
        m.emissiveIntensity = intensity;
        m.needsUpdate = true;
      });
    });
  }

  // ── Smell Thread System (MORRA) ───────────────────────────────────────────
  // Meat zone data (attraction positions only — visuals are thread-based)
  static get MEAT_SPOTS() {
    return [
      [  0,   0, 'MARKT — Bratwurst stall'],
      [-38,   0, 'THEATERPLATZ — grill restaurant'],
      [ -7,  14, 'FRAUENPLAN — Schnitzel-Haus'],
      [  2,  25, 'SCHILLER STR — kebab shop'],
      [ 10, -17, 'STADTSCHLOSS — sausage cart'],
      [ -4, -30, 'HERDERKIRCHE — market grill'],
      [ 35,  15, 'ILMPARK — BBQ area'],
      [-24, -28, 'STÉPHANE-HESSEL-PLATZ — food truck'],
      [  2,  45, 'GESCHWISTER-SCHOLL — döner'],
    ];
  }

  _buildMeatSmells() {
    const S = WORLD_SPREAD;

    // Build attraction zone registry (no visual objects)
    WeimarWorld.MEAT_SPOTS.forEach(([x, z, label]) => {
      this.meatSmells.push({ cx: x * S, cz: z * S, label, lastSniff: -999 });
    });

    // ── Ambient city smell threads — the whole world smells of something ──────
    // Dogs register hundreds of overlapping scents simultaneously. Dense, everywhere.
    const AMB = 2200;
    const ambPos  = new Float32Array(AMB * 2 * 3);
    const ambCol  = new Float32Array(AMB * 2 * 3);
    this._ambData = [];

    // Smell palette: teal-greens, pale yellows, faint blues — what a dog "sees"
    const AMB_PALETTES = [
      // [r, g, b] normalized
      [0.0,  1.0,  0.55], // teal — fresh / grass / damp stone
      [0.0,  0.85, 0.4 ], // green — organic / earth
      [0.55, 0.9,  0.0 ], // yellow-green — urine / tree / post
      [0.0,  0.7,  1.0 ], // blue-cyan — water / rain / cold
      [0.7,  0.9,  0.0 ], // yellow — food scraps / general city
      [0.0,  1.0,  0.75], // bright teal — strong fresh smell
    ];

    for (let i = 0; i < AMB; i++) {
      const pal = AMB_PALETTES[i % AMB_PALETTES.length];
      const d = {
        x: (Math.random() - 0.5) * 180 * S,
        y: 0.2 + Math.random() * 14,
        z: (Math.random() - 0.5) * 180 * S,
        angle: Math.random() * Math.PI * 2,
        pitch: (Math.random() - 0.5) * 1.6,
        len: 2.5 + Math.random() * 12,       // much longer threads
        rotSpeed: (Math.random() - 0.5) * 3.0,
        driftX: (Math.random() - 0.5) * 0.06,
        driftZ: (Math.random() - 0.5) * 0.06,
        driftY: 0.006 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        maxY: 6 + Math.random() * 12,
        hx: 0, hz: 0,
        r: pal[0], g: pal[1], b: pal[2],
        bright: 0.55 + Math.random() * 0.45,
      };
      d.hx = d.x; d.hz = d.z;
      this._ambData.push(d);
    }

    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
    ambGeo.setAttribute('color',    new THREE.BufferAttribute(ambCol, 3));
    this._ambSmellLines = new THREE.LineSegments(ambGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.88, depthWrite: false,
    }));
    this._ambSmellLines.visible = false;
    this.worldGroup.add(this._ambSmellLines);

    // ── Meat plume threads — overwhelming orange-red pillars from each source ─
    const PLUME_PER = 200;
    const spots = WeimarWorld.MEAT_SPOTS;
    const totalPlume = PLUME_PER * spots.length;
    const meatPos = new Float32Array(totalPlume * 2 * 3);
    const meatCol = new Float32Array(totalPlume * 2 * 3);
    this._meatData = [];

    spots.forEach(([sx, sz]) => {
      const ox = sx * S, oz = sz * S;
      for (let i = 0; i < PLUME_PER; i++) {
        const startAngle = Math.random() * Math.PI * 2;
        const startR = Math.random() * 3.5;
        const d = {
          ox, oz,
          x: ox + Math.cos(startAngle) * startR,
          y: 0.2 + Math.random() * 8,
          z: oz + Math.sin(startAngle) * startR,
          travelAngle: startAngle + (Math.random() - 0.5) * 2.0,
          pitch: 0.1 + Math.random() * 1.1,
          len: 4.0 + Math.random() * 14,      // very long — dominant in scene
          speed: 0.05 + Math.random() * 0.32,
          rotSpeed: (Math.random() - 0.5) * 4.0,
          driftY: 0.008 + Math.random() * 0.035,
          phase: Math.random() * Math.PI * 2,
          maxR: 30 + Math.random() * 50,      // spread far from source
          maxY: 5 + Math.random() * 14,
          r: 0.95 + Math.random() * 0.05,
          g: 0.15 + Math.random() * 0.3,
          b: 0.0,
          bright: 0.75 + Math.random() * 0.25,
        };
        this._meatData.push(d);
      }
    });

    const meatGeo = new THREE.BufferGeometry();
    meatGeo.setAttribute('position', new THREE.BufferAttribute(meatPos, 3));
    meatGeo.setAttribute('color',    new THREE.BufferAttribute(meatCol, 3));
    this._meatSmellLines = new THREE.LineSegments(meatGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.96, depthWrite: false,
    }));
    this._meatSmellLines.visible = false;
    this.worldGroup.add(this._meatSmellLines);
  }

  setMeatSmellsVisible(visible) {
    if (this._ambSmellLines)  this._ambSmellLines.visible  = visible;
    if (this._meatSmellLines) this._meatSmellLines.visible = visible;
  }

  // Call every frame when Morra is active — delta in seconds
  updateMeatSmells(time, delta) {
    if (!this._ambSmellLines || !this._meatSmellLines) return;

    // ── Ambient threads ───────────────────────────────────────────────────────
    const aPos = this._ambSmellLines.geometry.attributes.position;
    const aCol = this._ambSmellLines.geometry.attributes.color;

    this._ambData.forEach((d, i) => {
      d.angle += d.rotSpeed * delta;
      d.x += Math.cos(d.angle) * d.driftX + Math.sin(time * 0.5 + d.phase) * 0.06;
      d.z += Math.sin(d.angle) * d.driftZ + Math.cos(time * 0.4 + d.phase) * 0.06;
      d.y += d.driftY + Math.sin(time * 1.1 + d.phase) * 0.012;
      if (d.y > d.maxY) { d.y = 0.2; d.x = d.hx + (Math.random()-0.5)*12; d.z = d.hz + (Math.random()-0.5)*12; }
      const cx = Math.cos(d.angle), cz = Math.sin(d.angle);
      const cy = Math.sin(d.pitch);
      const half = d.len * 0.5;
      aPos.setXYZ(i*2,   d.x - cx*half, d.y - cy*half, d.z - cz*half);
      aPos.setXYZ(i*2+1, d.x + cx*half, d.y + cy*half, d.z + cz*half);
      // Head bright, tail fades to near-invisible
      const br = d.bright * (0.75 + Math.sin(time * 2.0 + d.phase) * 0.25);
      aCol.setXYZ(i*2,   d.r*br, d.g*br, d.b*br);
      aCol.setXYZ(i*2+1, d.r*br*0.12, d.g*br*0.12, d.b*br*0.12);
    });
    aPos.needsUpdate = true;
    aCol.needsUpdate = true;

    // ── Meat plume threads ────────────────────────────────────────────────────
    const mPos = this._meatSmellLines.geometry.attributes.position;
    const mCol = this._meatSmellLines.geometry.attributes.color;

    this._meatData.forEach((d, i) => {
      d.travelAngle += d.rotSpeed * delta * 0.3;
      // Travel outward from source + upward
      d.x += Math.cos(d.travelAngle) * d.speed * delta + Math.sin(time * 0.6 + d.phase) * 0.04;
      d.z += Math.sin(d.travelAngle) * d.speed * delta + Math.cos(time * 0.5 + d.phase) * 0.04;
      d.y += d.driftY + Math.sin(time * 1.2 + d.phase) * 0.01;
      // Reset when drifted too far from source or too high
      const distSq = (d.x - d.ox)**2 + (d.z - d.oz)**2;
      if (distSq > d.maxR * d.maxR || d.y > d.maxY) {
        const ra = Math.random() * Math.PI * 2;
        const rr = Math.random() * 2;
        d.x = d.ox + Math.cos(ra) * rr;
        d.z = d.oz + Math.sin(ra) * rr;
        d.y = 0.3 + Math.random() * 2;
        d.travelAngle = ra + (Math.random() - 0.5) * 1.5;
      }
      // Thread endpoints
      const cx = Math.cos(d.travelAngle), cz = Math.sin(d.travelAngle);
      const cy = Math.sin(d.pitch);
      const half = d.len * 0.5;
      mPos.setXYZ(i*2,   d.x - cx*half, d.y - cy*half, d.z - cz*half);
      mPos.setXYZ(i*2+1, d.x + cx*half, d.y + cy*half, d.z + cz*half);
      // Color: bright at head, dimmer at tail; pulse intensity
      const br = d.bright * (0.75 + Math.sin(time * 2.5 + d.phase) * 0.25);
      mCol.setXYZ(i*2,   d.r*br, d.g*br, d.b*br);
      mCol.setXYZ(i*2+1, d.r*br*0.25, d.g*br*0.25, d.b*br*0.25);
    });
    mPos.needsUpdate = true;
    mCol.needsUpdate = true;
  }

  // Returns first smell zone within attraction radius (or null)
  getMeatSmellAttraction(px, pz) {
    const ATTRACT_RADIUS = 80;
    for (const zone of this.meatSmells) {
      const dist = Math.sqrt((px - zone.cx) ** 2 + (pz - zone.cz) ** 2);
      if (dist < ATTRACT_RADIUS) return zone;
    }
    return null;
  }

  // ── Accessibility Features — visible only in SOLEN's world ──────────────────
  _buildAccessibilityFeatures() {
    const S = WORLD_SPREAD;
    const dummy = new THREE.Object3D();
    const stepH = 0.55;   // exaggerated — each step is a big chunky block
    const stepD = 0.7;    // exaggerated — wider tread depth

    // All meshes start hidden; setAccessibilityVisible(true) reveals them
    const addMesh = (mesh) => {
      mesh.visible = false;
      this.accessibilityMeshes.push(mesh);
      this.worldGroup.add(mesh);
    };

    // ── Cobblestone patches ────────────────────────────────────────────────────
    const COBBLE = [
      { cx:  0, cz:  0, r: 7   },  // Markt
      { cx:-38, cz:  0, r: 5   },  // Theaterplatz
      { cx: -7, cz: 14, r: 3.5 },  // Frauenplan
      { cx: 10, cz: 10, r: 3   },  // Platz der Demokratie
    ];

    const patchMat = new THREE.MeshStandardMaterial({
      color: 0x0e0600, roughness: 1.0, metalness: 0,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x8a6030, roughness: 1.0, metalness: 0,
      emissive: 0x3a1800, emissiveIntensity: 0.6,
    });
    const stoneGeo = new THREE.BoxGeometry(0.55, 0.6, 0.55);

    this._cobbleZones = [];
    COBBLE.forEach(({ cx, cz, r }) => {
      const wxc = cx * S, wzc = cz * S, wr = r * S;
      this._cobbleZones.push({ cx: wxc, cz: wzc, r: wr });

      const patch = new THREE.Mesh(new THREE.CircleGeometry(wr, 28), patchMat.clone());
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(wxc, 0.022, wzc);
      patch.receiveShadow = true;
      addMesh(patch);

      const spacing = 0.48 * S;
      const positions = [];
      const half = Math.ceil(wr / spacing);
      for (let xi = -half; xi <= half; xi++) {
        for (let zi = -half; zi <= half; zi++) {
          const lx = xi * spacing + (Math.random() - 0.5) * 0.12 * S;
          const lz = zi * spacing + (Math.random() - 0.5) * 0.12 * S;
          if (lx * lx + lz * lz > wr * wr * 0.9) continue;
          positions.push([wxc + lx, lz + wzc]);
        }
      }
      const iMesh = new THREE.InstancedMesh(stoneGeo, stoneMat.clone(), positions.length);
      iMesh.castShadow = true;
      positions.forEach(([px, pz], k) => {
        dummy.position.set(px, 0.3, pz);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.scale.set(
          0.7 + Math.random() * 0.9,
          0.8 + Math.random() * 2.2,
          0.7 + Math.random() * 0.9
        );
        dummy.updateMatrix();
        iMesh.setMatrixAt(k, dummy.matrix);
      });
      iMesh.instanceMatrix.needsUpdate = true;
      addMesh(iMesh);
    });

    // ── Curbs / no cut-outs — raised strips at crossings ──────────────────────
    const CURBS = [
      { cx: -18, cz:  2, lx: 0.3, lz: 7   },  // W crossing of Schillerstr
      { cx:  18, cz:  2, lx: 0.3, lz: 7   },  // E crossing of Schillerstr
      { cx:   2, cz: 25, lx: 8,   lz: 0.3 },  // Geschwister-Scholl-Str crossing
    ];
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xff8800, roughness: 0.7, metalness: 0.1,
      emissive: 0xcc4400, emissiveIntensity: 0.8,
    });
    this._curbZones = [];

    CURBS.forEach(({ cx, cz, lx, lz }) => {
      const wcx = cx * S, wcz = cz * S;
      const hx = lx * S * 0.5 + 1.5;
      const hz = lz * S * 0.5 + 1.5;
      const c2x = wcx + (lx > lz ? 0 : 1.8 * S);
      const c2z = wcz + (lz > lx ? 0 : 1.8 * S);
      this._curbZones.push({ cx: wcx, cz: wcz, hx, hz });
      this._curbZones.push({ cx: c2x, cz: c2z, hx, hz });

      const curb = new THREE.Mesh(new THREE.BoxGeometry(lx * S, 0.75, lz * S), curbMat.clone());
      curb.position.set(wcx, 0.375, wcz);
      curb.castShadow = true;
      addMesh(curb);

      const curb2 = curb.clone();
      curb2.position.set(c2x, 0.375, c2z);
      addMesh(curb2);
    });

    // ── Steps — staircase geometry at landmark entrances ──────────────────────
    const STEPS_DEF = [
      { cx: -38, cz:  0, w: 9, n: 4, dx:  1, dz:  0 }, // Nationaltheater — steps face E
      { cx: -14, cz: 14, w: 6, n: 3, dx:  0, dz:  1 }, // Goethehaus — faces S
      { cx:  11, cz:-17, w: 6, n: 3, dx: -1, dz:  0 }, // Stadtschloss — faces W
      { cx:  -4, cz:-30, w: 7, n: 3, dx:  0, dz:  1 }, // Herderkirche — faces S
    ];
    const stepMat = new THREE.MeshStandardMaterial({
      color: 0xcc2200, roughness: 0.8, metalness: 0.1,
      emissive: 0x880000, emissiveIntensity: 0.9,
    });
    this._stepZones = [];
    const PAD = 1.5;

    STEPS_DEF.forEach(({ cx, cz, w, n, dx, dz }) => {
      const wcx = cx * S, wcz = cz * S;
      const ex = dx * n * stepD * S;
      const ez = dz * n * stepD * S;
      const hw = (w * S) / 2;
      this._stepZones.push({
        minX: Math.min(wcx, wcx + ex) - (dx === 0 ? hw : 0) - PAD,
        maxX: Math.max(wcx, wcx + ex) + (dx === 0 ? hw : 0) + PAD,
        minZ: Math.min(wcz, wcz + ez) - (dz === 0 ? hw : 0) - PAD,
        maxZ: Math.max(wcz, wcz + ez) + (dz === 0 ? hw : 0) + PAD,
      });

      for (let s = 0; s < n; s++) {
        const stepW = (w - s * 0.5) * S;
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(
            dx !== 0 ? stepD * S : stepW,
            stepH * (s + 1),
            dz !== 0 ? stepD * S : stepW
          ),
          stepMat.clone()
        );
        step.position.set(
          wcx + dx * (s * stepD * S + stepD * S * 0.5),
          stepH * (s + 1) * 0.5,
          wcz + dz * (s * stepD * S + stepD * S * 0.5)
        );
        step.castShadow = true;
        step.receiveShadow = true;
        addMesh(step);
      }
    });

    // ── Pedestrian sidewalks — smooth concrete paths alongside streets ─────────
    const SW = 3.0;  // sidewalk width (world units) — slightly wider, more visible
    const swMat = new THREE.MeshStandardMaterial({
      color: 0xddd8c0, roughness: 0.5, metalness: 0.05,
      emissive: 0x887755, emissiveIntensity: 0.35,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });

    STREETS.forEach(([scx, scz, sw, slen, rot]) => {
      const wcx = scx * S, wcz = scz * S;
      const swOffset = sw * 0.8 + SW / 2;  // distance from street center to sidewalk center

      if (Math.abs(rot) < 0.1) {
        // E-W street: sidewalks on N and S sides
        [-1, 1].forEach(side => {
          const szc = wcz + side * swOffset;
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(slen * S, SW), swMat.clone());
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.set(wcx, 0.018, szc);
          addMesh(mesh);
          this._sidewalkZones.push({
            minX: wcx - slen * S * 0.5,
            maxX: wcx + slen * S * 0.5,
            minZ: szc - SW * 0.5 - 0.3,
            maxZ: szc + SW * 0.5 + 0.3,
          });
        });
      } else if (Math.abs(Math.abs(rot) - Math.PI / 2) < 0.1) {
        // N-S street: sidewalks on E and W sides
        [-1, 1].forEach(side => {
          const sxc = wcx + side * swOffset;
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SW, slen * S), swMat.clone());
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.set(sxc, 0.018, wcz);
          addMesh(mesh);
          this._sidewalkZones.push({
            minX: sxc - SW * 0.5 - 0.3,
            maxX: sxc + SW * 0.5 + 0.3,
            minZ: wcz - slen * S * 0.5,
            maxZ: wcz + slen * S * 0.5,
          });
        });
      }
      // Diagonal streets: no sidewalks
    });
  }

  setAccessibilityVisible(visible) {
    this.accessibilityMeshes.forEach(m => { m.visible = visible; });
  }

  // ── VEX Educational Buildings — enhanced exteriors + interiors ────────────────
  _buildVexEducational() {
    const S = WORLD_SPREAD;
    const POCKET_Z   = 800;   // pocket-dimension Z — well outside fog range
    const POCKET_SPC = 120;   // spacing between interior rooms

    const EDU = [
      { id:'theater',     label:'NATIONALTHEATER',        cx:-35, cz: -3,  w:16, d:11, h:16, type:'theater'    },
      { id:'library',     label:'ANNA AMALIA BIBLIOTHEK', cx: 17, cz: 10,  w: 8, d: 9, h:18, type:'library'    },
      { id:'goethehaus',  label:'GOETHE NATIONAL MUSEUM', cx: -7, cz: 21,  w: 6, d: 7, h:18, type:'museum'     },
      { id:'stadtschloss',label:'STADTSCHLOSS MUSEUM',    cx: 21, cz:-14,  w:14, d:15, h:22, type:'palace'     },
      { id:'bauhaus_mus', label:'BAUHAUS MUSEUM WEIMAR',  cx:-38, cz:-60,  w:16, d: 6, h:12, type:'bauhaus'    },
      { id:'university',  label:'BAUHAUS-UNIVERSITÄT',    cx:  2, cz: 41,  w:12, d: 8, h:17, type:'university' },
    ];

    EDU.forEach((b, i) => {
      const wx = b.cx * S, wz = b.cz * S;
      const doorX = wx;
      const doorZ = wz + b.d / 2 + 2.0;   // just outside the south (front) face

      // Interior room world position (pocket dimension)
      const rx = (i - (EDU.length - 1) / 2) * POCKET_SPC;
      const rz = POCKET_Z;

      // ── Enhanced exterior group ──────────────────────────────────────────
      const extGroup = new THREE.Group();
      extGroup.position.set(wx, 0, wz);
      extGroup.visible = false;
      this.worldGroup.add(extGroup);
      this.vexBuildings.push(extGroup);
      this._addVexExterior(extGroup, b);

      // ── Interior room ────────────────────────────────────────────────────
      const intObjs = [];
      this._buildInterior(intObjs, rx, rz, b);
      intObjs.forEach(m => { m.visible = false; this.worldGroup.add(m); });

      this.vexInteriors.push({
        id: b.id, label: b.label, type: b.type,
        doorX, doorZ,
        spawnX: rx, spawnZ: rz + 5,     // just inside the door (south face)
        exitX:  doorX, exitZ: doorZ + 3, // just outside the building door
        objects: intObjs,
      });
    });
  }

  _addVexExterior(group, b) {
    const mk = (color, emissive = 0x000000, eInt = 0) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08, emissive, emissiveIntensity: eInt });

    const COLS = {
      theater:    { wall: 0xf5f0e0, trim: 0xc8a050, accent: 0x8b0000 },
      library:    { wall: 0xeee8d0, trim: 0x9b7728, accent: 0x2244aa },
      museum:     { wall: 0xe8e0c8, trim: 0xa07840, accent: 0x664422 },
      palace:     { wall: 0xf0e8d0, trim: 0xb89050, accent: 0x880000 },
      bauhaus:    { wall: 0xfafafa, trim: 0x111111, accent: 0xcc0000 },
      university: { wall: 0xeadbb0, trim: 0x7a5a30, accent: 0x224400 },
    };
    const c = COLS[b.type] ?? { wall: 0xdddddd, trim: 0x888888, accent: 0x444444 };

    // ── Main enlarged body ─────────────────────────────────────────────────
    const body = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), mk(c.wall));
    body.position.y = b.h / 2;
    body.castShadow = true; body.receiveShadow = true;
    group.add(body);

    // ── Horizontal floor bands / entablature ──────────────────────────────
    const bandH = Math.floor(b.h / 4);
    for (let fi = 0; fi < bandH; fi++) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.15, 0.22, b.d + 0.15), mk(c.trim, c.trim, 0.18));
      band.position.y = 2.0 + fi * 4.0;
      group.add(band);
    }

    // ── Top cornice ───────────────────────────────────────────────────────
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.6, 0.5, b.d + 0.6), mk(c.trim, c.trim, 0.2));
    cornice.position.y = b.h + 0.25;
    group.add(cornice);

    // ── Front columns (neoclassical buildings) ────────────────────────────
    if (['theater','library','palace','university'].includes(b.type)) {
      const nCols  = b.type === 'theater' ? 6 : b.type === 'palace' ? 5 : 4;
      const colH   = b.h * 0.82;
      const colSpan = b.w * 0.72;
      for (let ci = 0; ci < nCols; ci++) {
        const cx = (ci / (nCols - 1) - 0.5) * colSpan;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, colH, 12), mk(c.wall));
        col.position.set(cx, colH / 2, b.d / 2 + 0.35);
        col.castShadow = true;
        group.add(col);
        // Capital (flared top)
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.8), mk(c.trim));
        cap.position.set(cx, colH + 0.17, b.d / 2 + 0.35);
        group.add(cap);
      }
      // Pediment (triangle)
      const ped = new THREE.Mesh(new THREE.ConeGeometry(b.w * 0.40, b.h * 0.17, 3), mk(c.wall));
      ped.rotation.y = Math.PI / 6;
      ped.position.set(0, b.h + b.h * 0.085, b.d / 2 + 0.1);
      group.add(ped);
      // Frieze strip under pediment
      const frieze = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.85, 0.35, 0.22), mk(c.trim, c.accent, 0.15));
      frieze.position.set(0, b.h + 0.5, b.d / 2 + 0.35);
      group.add(frieze);
    }

    // ── Bauhaus-style primary-color stripes ───────────────────────────────
    if (b.type === 'bauhaus') {
      [[0xff0000, 2.2], [0x0000ff, 5.0], [0xffff00, 7.8]].forEach(([sc, sy]) => {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(b.w, 0.6, 0.15), mk(sc, sc, 0.7));
        stripe.position.set(0, sy, b.d / 2 + 0.08);
        group.add(stripe);
      });
      // Large glass window panel
      const win = new THREE.Mesh(new THREE.BoxGeometry(b.w - 2, b.h * 0.55, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x88ccee, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.6 }));
      win.position.set(0, b.h * 0.5, b.d / 2 + 0.06);
      group.add(win);
    }

    // ── Window rows for non-Bauhaus ───────────────────────────────────────
    if (b.type !== 'bauhaus') {
      const nWinFloors = Math.floor((b.h - 4) / 4);
      const nWinW = Math.max(2, Math.floor(b.w / 3));
      for (let wf = 0; wf < nWinFloors; wf++) {
        for (let wc = 0; wc < nWinW; wc++) {
          const wx2 = (wc / (nWinW - 1) - 0.5) * (b.w * 0.78);
          const wy  = 4.0 + wf * 4.0;
          const winM = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.55 });
          const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.12), winM);
          win.position.set(wx2, wy, b.d / 2 + 0.07);
          group.add(win);
          // Window sill
          const sill = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 0.22), mk(c.trim));
          sill.position.set(wx2, wy - 1.0, b.d / 2 + 0.12);
          group.add(sill);
        }
      }
    }

    // ── Door arch + opening ───────────────────────────────────────────────
    const archMat = mk(c.trim, c.trim, 0.35);
    const arch = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.2, 0.5), archMat);
    arch.position.set(0, 2.1, b.d / 2 + 0.25);
    group.add(arch);
    // Rounded top on arch
    const archTop = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 12, 1, false, 0, Math.PI), mk(c.trim));
    archTop.rotation.z = -Math.PI / 2;
    archTop.position.set(0, 4.2, b.d / 2 + 0.25);
    group.add(archTop);
    // Door void (dark opening)
    const doorVoid = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x050505 }));
    doorVoid.position.set(0, 1.75, b.d / 2 + 0.25);
    group.add(doorVoid);
    // Entry lantern above door
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mk(0xffeeaa, 0xffdd55, 3.0));
    lantern.position.set(0, 4.5, b.d / 2 + 0.45);
    group.add(lantern);
    // Glowing door-step strip
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 1.2), mk(c.trim, c.trim, 0.5));
    step.position.set(0, 0.07, b.d / 2 + 0.85);
    group.add(step);
  }

  _buildInterior(objects, rx, rz, b) {
    const RW = 24, RD = 18, RH = 6.5, WT = 0.4;
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz2 = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz2);
      m.castShadow = true; m.receiveShadow = true;
      objects.push(m);
      return m;
    };
    const mk = (color, rough = 0.8, emissive = 0x000000, eInt = 0) =>
      new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.05, emissive, emissiveIntensity: eInt });

    const FLOOR_COL = { theater:0x2a1008, library:0x7a5a28, museum:0x4a3418, palace:0xe0d4b0, bauhaus:0xf4f4f4, university:0x5a4020 };
    const floorCol = FLOOR_COL[b.type] ?? 0x888888;

    // Floor
    add(new THREE.BoxGeometry(RW, 0.06, RD), mk(floorCol, 0.9), rx, -0.03, rz);
    // Ceiling
    add(new THREE.BoxGeometry(RW + WT*2, 0.15, RD + WT*2), mk(0xf0ece5, 0.6), rx, RH, rz);
    // Back wall (north)
    add(new THREE.BoxGeometry(RW, RH, WT), mk(0xf5f0e8, 0.75), rx, RH/2, rz - RD/2);
    // Side walls
    add(new THREE.BoxGeometry(WT, RH, RD), mk(0xf2ede5, 0.75), rx - RW/2, RH/2, rz);
    add(new THREE.BoxGeometry(WT, RH, RD), mk(0xf2ede5, 0.75), rx + RW/2, RH/2, rz);
    // Front wall — left panel, right panel, transom
    const panW = (RW - 3.0) / 2;
    add(new THREE.BoxGeometry(panW, RH, WT), mk(0xf2ede5, 0.75), rx - (1.5 + panW/2), RH/2, rz + RD/2);
    add(new THREE.BoxGeometry(panW, RH, WT), mk(0xf2ede5, 0.75), rx + (1.5 + panW/2), RH/2, rz + RD/2);
    add(new THREE.BoxGeometry(3.0, RH - 3.6, WT), mk(0xf2ede5, 0.75), rx, 3.6 + (RH-3.6)/2, rz + RD/2);
    // Door lintel / frame
    add(new THREE.BoxGeometry(3.4, 0.3, WT), mk(0xc8b080, 0.6), rx, 3.65, rz + RD/2);
    // Ceiling light strip
    add(new THREE.BoxGeometry(RW*0.55, 0.14, 0.5), mk(0xffffff, 0.3, 0xffffee, 2.0), rx, RH - 0.1, rz);
    // Side accent lights
    add(new THREE.BoxGeometry(0.14, 0.5, RD*0.55), mk(0xffffff, 0.3, 0xffffee, 1.5), rx - RW/2 + 0.3, RH - 0.4, rz);
    add(new THREE.BoxGeometry(0.14, 0.5, RD*0.55), mk(0xffffff, 0.3, 0xffffee, 1.5), rx + RW/2 - 0.3, RH - 0.4, rz);
    // Skirting boards
    add(new THREE.BoxGeometry(RW, 0.22, WT/2), mk(0xc8b880, 0.6), rx, 0.11, rz - RD/2 + 0.05);
    add(new THREE.BoxGeometry(WT/2, 0.22, RD), mk(0xc8b880, 0.6), rx - RW/2 + 0.05, 0.11, rz);
    add(new THREE.BoxGeometry(WT/2, 0.22, RD), mk(0xc8b880, 0.6), rx + RW/2 - 0.05, 0.11, rz);

    // Furniture
    this._addInteriorFurniture(objects, add, mk, rx, rz, RW, RD, b.type);
  }

  _addInteriorFurniture(objects, add, mk, rx, rz, RW, RD, type) {
    // stage side = rz - RD/2 (back wall), audience/door side = rz + RD/2
    const BK = rz - RD/2; // back wall Z
    const FR = rz + RD/2; // front wall Z

    switch (type) {

      case 'theater': {
        // ── Stage platform ──────────────────────────────────────────────
        const STAGE_Z = BK + RD * 0.38; // stage front edge
        const STAGE_H = 0.85;
        add(new THREE.BoxGeometry(RW - 1.6, STAGE_H, RD * 0.44), mk(0x150600, 0.95),
            rx, STAGE_H/2, BK + RD*0.22);

        // Stage floor boards (horizontal strips)
        for (let bi = 0; bi < 6; bi++) {
          add(new THREE.BoxGeometry(RW - 2.2, 0.04, 0.55), mk(0x3a1a08, 0.8),
              rx, STAGE_H + 0.02, BK + 1.2 + bi * 0.85);
        }

        // ── Proscenium arch ─────────────────────────────────────────────
        const ARCH_Z = STAGE_Z + 0.3;
        // Two thick columns
        [-1, 1].forEach(s => {
          add(new THREE.BoxGeometry(1.8, 6.0, 0.9), mk(0x2a1800, 0.85),
              rx + s * (RW/2 - 1.8), 3.0, ARCH_Z);
          // Column capital
          add(new THREE.BoxGeometry(2.2, 0.4, 1.2), mk(0x3a2210, 0.7),
              rx + s * (RW/2 - 1.8), 6.1, ARCH_Z);
        });
        // Horizontal arch beam
        add(new THREE.BoxGeometry(RW - 2.2, 1.0, 0.9), mk(0x2a1800, 0.85),
            rx, 6.3, ARCH_Z);
        // Arch valance (decorative pelmet strip)
        add(new THREE.BoxGeometry(RW - 4.0, 0.7, 0.15), mk(0x8b0000, 0.85, 0x440000, 0.2),
            rx, 5.65, ARCH_Z - 0.2);

        // ── Curtains ────────────────────────────────────────────────────
        // Main backdrop
        add(new THREE.BoxGeometry(RW - 2.8, 5.8, 0.18), mk(0x6a0000, 0.9, 0x300000, 0.25),
            rx, 3.5, BK + 0.5);
        // Main act curtain panels (parted in middle)
        [-1, 1].forEach(s => {
          add(new THREE.BoxGeometry(4.5, 5.5, 0.15), mk(0x8b0000, 0.85, 0x440000, 0.35),
              rx + s * 4.2, 3.2, ARCH_Z - 0.6);
          // Curtain folds (thin vertical strips to suggest draping)
          for (let fi = 0; fi < 3; fi++) {
            add(new THREE.BoxGeometry(0.12, 5.4, 0.08), mk(0x5a0000, 0.9),
                rx + s * (3.2 + fi * 0.7), 3.2, ARCH_Z - 0.55);
          }
        });
        // Wing curtains (stage sides)
        [-1, 1].forEach(s => {
          [BK+1.5, BK+3.5, BK+5.5].forEach(wz => {
            add(new THREE.BoxGeometry(0.15, 5.0, 1.8), mk(0x7a0000, 0.88, 0x330000, 0.2),
                rx + s * (RW/2 - 1.1), 2.5, wz);
          });
        });

        // ── Footlights ──────────────────────────────────────────────────
        for (let li = 0; li < 9; li++) {
          add(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 8),
              mk(0xffeeaa, 0.2, 0xffdd44, 3.5),
              rx - 8 + li * 2, STAGE_H + 0.09, STAGE_Z + 0.3);
          add(new THREE.BoxGeometry(0.22, 0.28, 0.22), mk(0x111111, 0.9),
              rx - 8 + li * 2, STAGE_H + 0.25, STAGE_Z + 0.45);
        }

        // ── Tiered audience seating (5 rows, each 0.28 higher) ──────────
        const SEAT_START_Z = STAGE_Z + 1.4;
        for (let row = 0; row < 5; row++) {
          const baseY  = row * 0.28;
          const rowZ   = SEAT_START_Z + row * 1.65;
          const seats  = 9;
          const spread = 1.95;

          // Row riser platform
          if (row > 0) {
            add(new THREE.BoxGeometry(RW - 1.0, row * 0.28 + 0.06, 1.6), mk(0x0e0600, 0.95),
                rx, (row * 0.28) / 2, rowZ - 0.5);
          }

          // Seats
          for (let col = 0; col < seats; col++) {
            const sx = rx - ((seats-1)/2)*spread + col*spread;
            // Seat cushion
            add(new THREE.BoxGeometry(0.82, 0.18, 0.55), mk(0x6a0020, 0.7),
                sx, baseY + 0.52, rowZ);
            // Seat back
            add(new THREE.BoxGeometry(0.82, 0.72, 0.12), mk(0x820025, 0.65),
                sx, baseY + 1.02, rowZ - 0.28);
            // Armrests
            [-0.44, 0.44].forEach(ax =>
              add(new THREE.BoxGeometry(0.08, 0.12, 0.5), mk(0x1a0a04, 0.9),
                  sx + ax, baseY + 0.64, rowZ));
          }
        }

        // ── Grand chandelier above audience ─────────────────────────────
        const CHAND_Z = SEAT_START_Z + 4.0;
        add(new THREE.SphereGeometry(0.55, 12, 9), mk(0xffffcc, 0.2, 0xffee66, 3.2),
            rx, 5.8, CHAND_Z);
        add(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), mk(0xccaa44),
            rx, 6.4, CHAND_Z);
        for (let ci = 0; ci < 12; ci++) {
          const ca = (ci / 12) * Math.PI * 2;
          const ar = ci < 6 ? 1.8 : 3.2;
          add(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), mk(0xbbaa33),
              rx + Math.cos(ca)*ar, 5.55, CHAND_Z + Math.sin(ca)*ar);
          add(new THREE.SphereGeometry(0.13, 6, 5), mk(0xffffaa, 0.15, 0xffee44, 2.8),
              rx + Math.cos(ca)*ar, 5.1, CHAND_Z + Math.sin(ca)*ar);
        }

        // ── Orchestra pit ───────────────────────────────────────────────
        add(new THREE.BoxGeometry(RW - 3.5, 0.08, 1.6), mk(0x0a0500, 0.95),
            rx, 0.04, STAGE_Z + 0.8);
        // Music stands in pit
        for (let ms = 0; ms < 5; ms++) {
          add(new THREE.CylinderGeometry(0.04, 0.06, 1.1, 6), mk(0x444433),
              rx - 4 + ms * 2, 0.55, STAGE_Z + 1.1);
          add(new THREE.BoxGeometry(0.55, 0.4, 0.05), mk(0x222211, 0.5),
              rx - 4 + ms * 2, 1.4, STAGE_Z + 1.0, -0.3);
        }
        break;
      }

      case 'university': {
        // Lecture hall — 5 tiered rows, blackboard, podium
        const TIER_H   = 0.42;   // height gain per row
        const TIER_D   = 1.9;    // depth per tier (Z spacing)
        const DESK_W   = RW - 2.5;
        const DESK_START_Z = BK + 3.5;
        const PODIUM_Z     = BK + 1.5;

        // ── Full-width blackboard on back wall ───────────────────────────
        add(new THREE.BoxGeometry(RW - 1.5, 3.8, 0.18), mk(0x0d1a0d, 0.98),
            rx, 3.4, BK + 0.2);
        // Green chalkboard surface
        add(new THREE.BoxGeometry(RW - 2.5, 3.0, 0.1), mk(0x1c3320, 0.95),
            rx, 3.4, BK + 0.28);
        // Chalk lines (equations / diagrams)
        const chalkLines = [
          [RW-4, 0.05, 0.05, rx, 2.2, BK+0.33],
          [RW-4, 0.05, 0.05, rx, 3.0, BK+0.33],
          [RW-4, 0.05, 0.05, rx, 3.8, BK+0.33],
          [4.0,  0.05, 0.05, rx-5, 2.5, BK+0.33],
          [4.0,  0.05, 0.05, rx-5, 2.9, BK+0.33],
          [3.0,  0.05, 0.05, rx+5, 2.7, BK+0.33],
        ];
        chalkLines.forEach(([w,h,d,x,y,z]) =>
          add(new THREE.BoxGeometry(w,h,d), mk(0xddddb8, 0.3, 0xccccaa, 0.6), x, y, z));
        // Board tray
        add(new THREE.BoxGeometry(RW - 1.6, 0.1, 0.3), mk(0x332211, 0.9),
            rx, 1.65, BK + 0.25);

        // ── Podium + lamp ───────────────────────────────────────────────
        add(new THREE.BoxGeometry(1.8, 1.2, 1.0), mk(0x4a3010, 0.7),
            rx, 0.6, PODIUM_Z);
        add(new THREE.BoxGeometry(1.9, 0.06, 1.1), mk(0x6a4a18, 0.45),
            rx, 1.23, PODIUM_Z);
        // Lamp on podium
        add(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), mk(0x888888),
            rx + 0.7, 1.98, PODIUM_Z);
        add(new THREE.CylinderGeometry(0.28, 0.18, 0.22, 8), mk(0x228844, 0.5),
            rx + 0.7, 2.82, PODIUM_Z);
        add(new THREE.SphereGeometry(0.12, 6, 5), mk(0xffffcc, 0.1, 0xffee88, 3.5),
            rx + 0.7, 2.72, PODIUM_Z);
        // Open book on podium
        add(new THREE.BoxGeometry(0.9, 0.04, 0.65), mk(0xf5f0e0, 0.4),
            rx - 0.2, 1.26, PODIUM_Z);
        add(new THREE.BoxGeometry(0.44, 0.06, 0.62), mk(0xe8e0cc, 0.5, 0x888866, 0.1),
            rx - 0.43, 1.28, PODIUM_Z, 0, 0, 0.12);

        // ── 5 Tiered desk rows ──────────────────────────────────────────
        for (let row = 0; row < 5; row++) {
          const floorY = row * TIER_H;
          const rowZ   = DESK_START_Z + row * TIER_D;

          // Riser step (platform for this row)
          if (row > 0) {
            add(new THREE.BoxGeometry(RW - 0.8, row * TIER_H, TIER_D * row + 0.5), mk(0x111111, 0.9),
                rx, (row * TIER_H) / 2, DESK_START_Z + (row-1) * TIER_D * 0.5 + 0.25);
          }

          // Long continuous desk
          add(new THREE.BoxGeometry(DESK_W, 0.1, 0.75), mk(0xd4c8a0, 0.45),
              rx, floorY + 0.99, rowZ);
          // Desk front panel
          add(new THREE.BoxGeometry(DESK_W, 0.65, 0.1), mk(0xaa9060, 0.7),
              rx, floorY + 0.65, rowZ - 0.38);
          // Desk legs (4)
          [rx - DESK_W/2 + 0.7, rx + DESK_W/2 - 0.7].forEach(lx => {
            add(new THREE.BoxGeometry(0.1, 0.95, 0.1), mk(0x888888, 0.5),
                lx, floorY + 0.47, rowZ + 0.28);
          });

          // 7 chairs per row (Bauhaus tube-steel aesthetic)
          const chairCount = 7;
          const chairSpread = (DESK_W - 1.5) / (chairCount - 1);
          for (let col = 0; col < chairCount; col++) {
            const cx = rx - (DESK_W - 1.5)/2 + col * chairSpread;
            // Seat
            add(new THREE.BoxGeometry(0.78, 0.08, 0.72), mk(0x1a1a1a, 0.4),
                cx, floorY + 0.48, rowZ + 0.85);
            // Backrest
            add(new THREE.BoxGeometry(0.78, 0.58, 0.06), mk(0x1a1a1a, 0.4),
                cx, floorY + 0.9, rowZ + 0.52);
            // Legs (tube steel, two bent U-shapes)
            [-0.32, 0.32].forEach(lx2 => {
              add(new THREE.BoxGeometry(0.05, 0.48, 0.05), mk(0x999999, 0.3),
                  cx + lx2, floorY + 0.24, rowZ + 0.55);
              add(new THREE.BoxGeometry(0.05, 0.48, 0.05), mk(0x999999, 0.3),
                  cx + lx2, floorY + 0.24, rowZ + 1.1);
            });
            // Notebook on desk
            if (col % 2 === 0) {
              add(new THREE.BoxGeometry(0.5, 0.04, 0.36), mk(0xfaf8f2, 0.35),
                  cx, floorY + 1.04, rowZ - 0.15);
            }
          }
        }

        // ── Pendant lights (ceiling, over each row) ─────────────────────
        for (let row = 0; row < 5; row++) {
          const lz = DESK_START_Z + row * TIER_D;
          [rx - 6, rx, rx + 6].forEach(lx => {
            add(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), mk(0x555555),
                lx, 6.2, lz);
            add(new THREE.CylinderGeometry(0.38, 0.3, 0.3, 8), mk(0xffffff, 0.3),
                lx, 5.65, lz);
            add(new THREE.SphereGeometry(0.14, 6, 5), mk(0xffffee, 0.1, 0xffeecc, 3.5),
                lx, 5.5, lz);
          });
        }

        // ── Projector on ceiling ────────────────────────────────────────
        add(new THREE.BoxGeometry(0.6, 0.25, 0.45), mk(0x222222, 0.6),
            rx, 6.35, BK + 3.5);
        add(new THREE.CylinderGeometry(0.12, 0.08, 0.35, 8), mk(0x111133, 0.4),
            rx, 6.05, BK + 3.5, Math.PI/2, 0, 0);
        break;
      }

      case 'bauhaus': {
        // Bauhaus Museum — 8 sculptures + pedestals + spotlights + wall art + bench
        const SCULPTURES = [
          // [x_offset, z_offset, pedH, type, color, scale]
          { dx: -9,   dz: -4,   ph: 0.7,  type: 'sphere',   col: 0xee1111, sc: 1.1 },
          { dx: -4,   dz: -5.5, ph: 1.2,  type: 'cube',     col: 0x1111ee, sc: 1.0 },
          { dx:  1,   dz: -4,   ph: 1.6,  type: 'cone',     col: 0xeeee00, sc: 0.95 },
          { dx:  6,   dz: -5,   ph: 0.9,  type: 'cylinder', col: 0x111111, sc: 1.05 },
          { dx:  9.5, dz: -2.5, ph: 1.4,  type: 'torus',    col: 0xcccccc, sc: 0.9 },
          { dx: -8,   dz:  1.5, ph: 1.0,  type: 'composite',col: 0xffffff, sc: 1.0 },
          { dx:  0,   dz:  2.5, ph: 1.8,  type: 'tetra',    col: 0x004400, sc: 1.1 },
          { dx:  7,   dz:  2,   ph: 2.0,  type: 'crystal',  col: 0x8844cc, sc: 0.85 },
        ];

        SCULPTURES.forEach(({ dx, dz, ph, type: stype, col, sc }) => {
          const sx = rx + dx, sz = rz + dz;

          // Pedestal — white, proportional height
          add(new THREE.BoxGeometry(1.6, ph, 1.6), mk(0xf8f8f8, 0.2), sx, ph/2, sz);
          // Pedestal top cap
          add(new THREE.BoxGeometry(1.8, 0.08, 1.8), mk(0xeeeeee, 0.15), sx, ph + 0.04, sz);

          // Sculpture
          const artMat = mk(col, 0.15, col, 0.12);
          const base = ph + 0.08;
          if (stype === 'sphere')
            add(new THREE.SphereGeometry(0.72 * sc, 14, 10), artMat, sx, base + 0.72*sc, sz);
          else if (stype === 'cube')
            add(new THREE.BoxGeometry(1.1*sc, 1.1*sc, 1.1*sc), artMat, sx, base + 0.55*sc, sz);
          else if (stype === 'cone')
            add(new THREE.ConeGeometry(0.7*sc, 1.7*sc, 4), artMat, sx, base + 0.85*sc, sz);
          else if (stype === 'cylinder')
            add(new THREE.CylinderGeometry(0.38*sc, 0.55*sc, 1.4*sc, 12), artMat, sx, base + 0.7*sc, sz);
          else if (stype === 'torus')
            add(new THREE.TorusGeometry(0.6*sc, 0.22*sc, 10, 20), artMat, sx, base + 0.62*sc, sz, Math.PI/2);
          else if (stype === 'composite') {
            add(new THREE.BoxGeometry(0.9*sc, 0.9*sc, 0.9*sc), artMat, sx, base + 0.45*sc, sz);
            add(new THREE.SphereGeometry(0.5*sc, 10, 8), artMat, sx, base + 1.25*sc, sz);
            add(new THREE.CylinderGeometry(0.2*sc, 0.35*sc, 0.6*sc, 8), artMat, sx, base + 2.05*sc, sz);
          } else if (stype === 'tetra')
            add(new THREE.ConeGeometry(0.72*sc, 1.5*sc, 3), artMat, sx, base + 0.75*sc, sz);
          else if (stype === 'crystal') {
            add(new THREE.ConeGeometry(0.55*sc, 1.2*sc, 6), artMat, sx, base + 0.6*sc, sz);
            add(new THREE.ConeGeometry(0.55*sc, 0.9*sc, 6), artMat, sx, base + 1.55*sc, sz, Math.PI, 0, 0);
          }

          // Spotlight cone (pointing down from ceiling)
          const spotH = 6.4 - ph;
          add(new THREE.ConeGeometry(0.55, spotH, 10),
              new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 0.2, transparent: true, opacity: 0.09, depthWrite: false }),
              sx, ph + 0.08 + spotH/2 + 0.5, sz, Math.PI, 0, 0);
          // Spot fixture on ceiling
          add(new THREE.CylinderGeometry(0.14, 0.18, 0.28, 8), mk(0x333333, 0.4),
              sx, 6.36, sz);

          // Rope barrier (4 posts around pedestal)
          [[-1.3, 0],[1.3, 0],[0,-1.3],[0,1.3]].forEach(([ox,oz]) => {
            add(new THREE.CylinderGeometry(0.055, 0.055, 0.9, 6), mk(0xbb9900),
                sx + ox, 0.45, sz + oz);
            add(new THREE.SphereGeometry(0.08, 6, 5), mk(0xddbb22, 0.3, 0xccaa00, 0.5),
                sx + ox, 0.93, sz + oz);
          });
          // Rope segments
          [[-1.3,0,0,-1.3],[0,-1.3,1.3,0],[1.3,0,0,1.3],[0,1.3,-1.3,0]].forEach(([ax,az,bx,bz]) =>
            add(new THREE.BoxGeometry(
              Math.hypot(bx-ax, bz-az) * 1.0 + 0.05, 0.04, 0.04),
              mk(0xcc9900, 0.5, 0x886600, 0.25),
              sx + (ax+bx)/2, 0.82, sz + (az+bz)/2,
              0, Math.atan2(bx-ax, bz-az)));
        });

        // ── Large primary-color panels on back wall ──────────────────────
        [[0xff0000, rx-8, 4.2, 3.8],[0x0000ff, rx, 4.0, 3.6],[0xffff00, rx+8, 4.2, 3.8]]
          .forEach(([c2, px, pw, ph2]) => {
            add(new THREE.BoxGeometry(pw, ph2, 0.12), mk(c2, 0.55, c2, 0.45), px, 3.6, BK + 0.2);
            // Gold frame
            [-pw/2, pw/2].forEach(fx => add(new THREE.BoxGeometry(0.18, ph2+0.3, 0.15), mk(0xccaa22), px+fx, 3.6, BK+0.22));
            [-ph2/2, ph2/2].forEach(fz => add(new THREE.BoxGeometry(pw+0.3, 0.18, 0.15), mk(0xccaa22), px, 3.6+fz, BK+0.22));
          });

        // ── Smaller geometric artworks on side walls ─────────────────────
        [-1, 1].forEach((s, si) => {
          const wallX = rx + s * (RW/2 - 0.2);
          [[0xee2222, rz-3, 2.8, 2.2],[0x2222ee, rz, 2.2, 2.8],[0xeeee22, rz+3, 2.8, 2.4]]
            .forEach(([c2, wz, pw, ph3]) => {
              add(new THREE.BoxGeometry(0.12, ph3, pw), mk(c2, 0.55, c2, 0.3), wallX, 3.2, wz);
              add(new THREE.BoxGeometry(0.15, ph3+0.22, pw+0.22), mk(0x111111, 0.8), wallX - s*0.03, 3.2, wz);
            });
        });

        // ── Central viewing bench ────────────────────────────────────────
        add(new THREE.BoxGeometry(14, 0.18, 0.9), mk(0x111111, 0.2), rx, 0.45, rz + 5.5);
        add(new THREE.BoxGeometry(14, 0.12, 0.1), mk(0x222222, 0.2), rx, 0.8, rz + 5.15);
        // Bench legs
        [-6.5, -2.2, 2.2, 6.5].forEach(lx =>
          add(new THREE.BoxGeometry(0.12, 0.42, 0.86), mk(0x333333, 0.3),
              rx + lx, 0.21, rz + 5.5));

        // ── Bauhaus grid ceiling lights ──────────────────────────────────
        for (let gi = 0; gi < 5; gi++) {
          add(new THREE.BoxGeometry(0.08, 0.08, RD - 1.5), mk(0xffffff, 0.15, 0xffffee, 1.5),
              rx - 8 + gi * 4, 6.42, rz);
        }
        for (let gi = 0; gi < 4; gi++) {
          add(new THREE.BoxGeometry(RW - 1.5, 0.08, 0.08), mk(0xffffff, 0.15, 0xffffee, 1.5),
              rx, 6.42, rz - 6 + gi * 4);
        }
        break;
      }

      case 'library': {
        const wood = 0x5a3818;
        const bookPal = [0xaa2200, 0x224488, 0x226600, 0x884400, 0x442288, 0xcc6600, 0x886622, 0x336688];

        // ── Floor rotunda ring (Anna Amalia dome echo) ───────────────────
        const ring = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.7, 32),
          mk(0x9b7728, 0.45, 0x664400, 0.3));
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(rx, 0.03, rz - 1);
        objects.push(ring);

        // ── Back-wall shelving units (3) ─────────────────────────────────
        for (let si = 0; si < 3; si++) {
          const sx = rx - 8 + si * 8;
          // Unit frame
          add(new THREE.BoxGeometry(6.8, 5.8, 0.7), mk(wood, 0.95), sx, 2.9, BK + 0.6);
          // Shelf boards
          for (let shelf = 0; shelf < 6; shelf++) {
            add(new THREE.BoxGeometry(6.6, 0.1, 0.5), mk(wood, 0.8), sx, 0.45 + shelf*0.9, BK + 0.6);
            // Books on shelf (alternating heights/colors)
            for (let bk = 0; bk < 10; bk++) {
              const bw = 0.48 + Math.random() * 0.18;
              const bh = 0.55 + Math.random() * 0.28;
              add(new THREE.BoxGeometry(bw, bh, 0.36),
                mk(bookPal[(si*20+shelf*10+bk) % bookPal.length], 0.7),
                sx - 2.8 + bk * 0.58, 0.5 + shelf*0.9 + bh/2, BK + 0.62);
            }
          }
        }

        // ── Side-wall shelves ────────────────────────────────────────────
        [-1, 1].forEach(s => {
          const wallX = rx + s * (RW/2 - 0.55);
          add(new THREE.BoxGeometry(0.7, 5.5, RD - 4.0), mk(wood, 0.95), wallX, 2.75, rz - 1);
          for (let shelf = 0; shelf < 6; shelf++) {
            add(new THREE.BoxGeometry(0.5, 0.1, RD - 5.0), mk(wood, 0.8), wallX, 0.4 + shelf*0.9, rz - 1);
            for (let bk = 0; bk < 6; bk++) {
              add(new THREE.BoxGeometry(0.36, 0.5+Math.random()*0.25, 0.48),
                mk(bookPal[(shelf*6+bk) % bookPal.length], 0.7),
                wallX, 0.5+shelf*0.9+0.3, rz - 5 + bk * 1.35);
            }
          }
        });

        // ── Two reading tables with chairs ───────────────────────────────
        [rx - 5, rx + 5].forEach((tx, ti) => {
          // Table top
          add(new THREE.BoxGeometry(4.4, 0.1, 2.2), mk(0xd4aa70, 0.4), tx, 1.02, rz + 2.5);
          // Table legs (4)
          [[-2.0,-0.95],[2.0,-0.95],[-2.0,0.95],[2.0,0.95]].forEach(([lx,lz]) =>
            add(new THREE.CylinderGeometry(0.07,0.07,1.0,8), mk(wood),
                tx+lx, 0.51, rz+2.5+lz));
          // Open books on table
          [tx-0.9, tx+0.9].forEach(bx => {
            add(new THREE.BoxGeometry(0.8, 0.04, 0.6), mk(0xf5f0e5, 0.35), bx, 1.07, rz+2.5);
            add(new THREE.BoxGeometry(0.38, 0.06, 0.56), mk(0xeee8d5, 0.4, 0x888866, 0.05),
                bx-0.19, 1.09, rz+2.5, 0, 0, 0.1);
          });
          // Desk lamp
          add(new THREE.CylinderGeometry(0.04,0.04,1.2,6), mk(0x666655), tx, 1.67, rz+2.5);
          add(new THREE.CylinderGeometry(0.3,0.2,0.22,8), mk(0x228844,0.5), tx, 2.33, rz+2.5);
          add(new THREE.SphereGeometry(0.11,6,5), mk(0xffffcc,0.1,0xffee88,3.5), tx, 2.24, rz+2.5);
          // Chairs (2 per side)
          [-0.9, 0.9].forEach(cx2 => {
            add(new THREE.BoxGeometry(0.78,0.08,0.72), mk(0x3a2810,0.6), tx+cx2, 0.5, rz+4.05);
            add(new THREE.BoxGeometry(0.78,0.55,0.08), mk(0x3a2810,0.6), tx+cx2, 0.9, rz+3.7);
          });
        });

        // ── Globe + stand (center) ────────────────────────────────────────
        add(new THREE.SphereGeometry(0.8, 14, 10), mk(0x1a4488, 0.35, 0x0a2266, 0.2),
            rx, 2.05, rz - 1);
        add(new THREE.CylinderGeometry(0.06, 0.16, 1.7, 8), mk(wood), rx, 1.05, rz - 1);
        add(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 12), mk(wood, 0.9), rx, 0.2, rz - 1);

        // ── Ceiling light (warm dome pendant) ────────────────────────────
        add(new THREE.SphereGeometry(0.7, 10, 7), mk(0xffffee, 0.2, 0xffee88, 2.5),
            rx, 6.2, rz - 1);
        add(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6), mk(0xaa9933), rx, 6.55, rz - 1);
        break;
      }

      case 'museum': {
        // Goethe National Museum — study/period rooms feel
        // ── 7 display pedestals with varied artifacts ─────────────────────
        const PEDESTALS = [
          { px: rx-8, pz: rz-4.5, ph: 1.4, art: 'vase',     col: 0xc8a060 },
          { px: rx-3, pz: rz-5.5, ph: 1.7, art: 'bust',     col: 0xd4c8b0 },
          { px: rx+2, pz: rz-5,   ph: 1.2, art: 'urn',      col: 0x885544 },
          { px: rx+7, pz: rz-4,   ph: 1.5, art: 'book',     col: 0x5a4830 },
          { px: rx-7, pz: rz+1.5, ph: 1.0, art: 'scroll',   col: 0xd4b870 },
          { px: rx,   pz: rz+2,   ph: 1.8, art: 'quill',    col: 0xaa8844 },
          { px: rx+7, pz: rz+2,   ph: 1.3, art: 'clock',    col: 0x886633 },
        ];

        PEDESTALS.forEach(({ px, pz: pzz, ph, art, col }) => {
          add(new THREE.BoxGeometry(1.4, ph, 1.4), mk(0xfaf5ef, 0.4), px, ph/2, pzz);
          add(new THREE.BoxGeometry(1.6, 0.07, 1.6), mk(0xeeead8, 0.3), px, ph+0.035, pzz);
          const amat = mk(col, 0.35, col, 0.08);
          const ab = ph + 0.07;
          if (art === 'vase') {
            add(new THREE.CylinderGeometry(0.18, 0.28, 0.9, 12), amat, px, ab+0.45, pzz);
            add(new THREE.SphereGeometry(0.25, 10, 8), amat, px, ab+0.95, pzz);
          } else if (art === 'bust') {
            add(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 10), amat, px, ab+0.18, pzz);
            add(new THREE.SphereGeometry(0.32, 10, 8), amat, px, ab+0.65, pzz);
          } else if (art === 'urn') {
            add(new THREE.CylinderGeometry(0.22, 0.18, 0.85, 14), amat, px, ab+0.42, pzz);
            add(new THREE.CylinderGeometry(0.12, 0.22, 0.12, 10), amat, px, ab+0.9, pzz);
          } else if (art === 'book') {
            add(new THREE.BoxGeometry(0.65, 0.22, 0.5), amat, px, ab+0.11, pzz);
            add(new THREE.BoxGeometry(0.64, 0.22, 0.5), mk(0xf0e8d5, 0.4), px, ab+0.11, pzz+0.01, 0, 0, 0.15);
          } else if (art === 'scroll') {
            add(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), amat, px, ab+0.35, pzz, 0, 0, Math.PI/2);
            add(new THREE.CylinderGeometry(0.06, 0.1, 0.18, 8), amat, px-0.38, ab+0.35, pzz);
            add(new THREE.CylinderGeometry(0.06, 0.1, 0.18, 8), amat, px+0.38, ab+0.35, pzz);
          } else if (art === 'quill') {
            add(new THREE.BoxGeometry(0.5, 0.08, 0.4), mk(0xf8f4e8, 0.4), px, ab+0.04, pzz);
            add(new THREE.BoxGeometry(0.06, 0.06, 0.9), amat, px, ab+0.08, pzz-0.18, 0.35);
          } else if (art === 'clock') {
            add(new THREE.CylinderGeometry(0.28, 0.3, 0.55, 12), amat, px, ab+0.28, pzz);
            add(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), mk(0xf5f0d5,0.3), px, ab+0.59, pzz);
          }
          // Rope barrier (2-post, front only)
          [-0.9, 0.9].forEach(ox =>
            add(new THREE.CylinderGeometry(0.055,0.055,0.88,6), mk(0xc8a060), px+ox, 0.44, pzz+1.0));
          add(new THREE.BoxGeometry(1.8,0.04,0.04), mk(0xc8a060,0.5,0xaa8800,0.3), px, 0.8, pzz+1.0);
        });

        // ── Wall paintings (period portraits/landscapes) ─────────────────
        [[rx-8.5, 0x7a5a3a, 3.8, 3.0],
         [rx,     0x4a6888, 4.5, 3.5],
         [rx+8.5, 0x556644, 3.8, 3.0]].forEach(([px, pc, pw, ph2]) => {
          add(new THREE.BoxGeometry(pw+0.4, ph2+0.4, 0.15), mk(0x8b6830, 0.7), px, 3.8, BK+0.22); // frame
          add(new THREE.BoxGeometry(pw, ph2, 0.1), mk(pc, 0.8, pc, 0.06), px, 3.8, BK+0.28);     // canvas
        });

        // ── Goethe's writing desk ────────────────────────────────────────
        add(new THREE.BoxGeometry(4.2, 0.12, 2.2), mk(0x5a3818, 0.45), rx-7, 1.02, rz+3.5);
        [[-1.8,-0.9],[1.8,-0.9],[-1.8,0.9],[1.8,0.9]].forEach(([lx,lz]) =>
          add(new THREE.CylinderGeometry(0.08,0.08,1.0,8), mk(0x4a2808), rx-7+lx, 0.51, rz+3.5+lz));
        // Quill + inkwell
        add(new THREE.CylinderGeometry(0.1,0.12,0.2,8), mk(0x111111,0.5), rx-7+0.4, 1.14, rz+3.5);
        add(new THREE.BoxGeometry(0.06,0.06,0.8), mk(0xf5f0e0,0.4), rx-7-0.3, 1.12, rz+3.5, 0.25);
        // Open manuscript
        add(new THREE.BoxGeometry(1.0,0.04,0.75), mk(0xf5f0e0,0.35), rx-7-1.2, 1.06, rz+3.5);
        // Bookshelf chair
        add(new THREE.BoxGeometry(0.88,0.1,0.8), mk(0x3a2810,0.6), rx-7, 0.5, rz+5.0);
        add(new THREE.BoxGeometry(0.88,0.6,0.1), mk(0x3a2810,0.6), rx-7, 0.9, rz+4.62);

        // ── Period bench (center) ─────────────────────────────────────────
        add(new THREE.BoxGeometry(6, 0.18, 0.8), mk(0x5a3818, 0.65), rx+2, 0.5, rz+5.5);
        add(new THREE.BoxGeometry(6, 0.15, 0.1), mk(0x4a2808, 0.7), rx+2, 0.95, rz+5.2);

        // ── Warm pendant lights ───────────────────────────────────────────
        [rx-7, rx, rx+7].forEach(lx => {
          add(new THREE.SphereGeometry(0.45,8,6), mk(0xffeecc,0.2,0xffdd88,2.2), lx, 5.9, rz-2);
          add(new THREE.CylinderGeometry(0.05,0.05,0.6,6), mk(0x888844), lx, 6.25, rz-2);
        });
        break;
      }

      case 'palace': {
        // Stadtschloss — grand throne room
        // ── Grand double chandelier ──────────────────────────────────────
        [[rx-4, rz-2],[rx+4, rz+1]].forEach(([clx, clz]) => {
          add(new THREE.SphereGeometry(0.55, 12, 9), mk(0xffffcc, 0.18, 0xffee55, 3.5),
              clx, 5.55, clz);
          add(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6), mk(0xccaa44),
              clx, 6.12, clz);
          for (let ci = 0; ci < 12; ci++) {
            const ca = (ci/12)*Math.PI*2;
            const ar = ci < 6 ? 1.2 : 2.2;
            add(new THREE.CylinderGeometry(0.04,0.04,0.7,6), mk(0xbbaa33),
                clx+Math.cos(ca)*ar, 5.3, clz+Math.sin(ca)*ar);
            add(new THREE.SphereGeometry(0.12,6,5), mk(0xffffaa,0.15,0xffee44,3.2),
                clx+Math.cos(ca)*ar, 4.95, clz+Math.sin(ca)*ar);
          }
        });

        // ── Throne + dais ────────────────────────────────────────────────
        add(new THREE.BoxGeometry(RW-1, 0.22, 2.5), mk(0x2a1508, 0.9), rx, 0.11, BK+2);
        add(new THREE.BoxGeometry(3.5, 0.55, 2.8), mk(0xaa8800, 0.7), rx, 0.44, BK+2.2);
        add(new THREE.BoxGeometry(3.5, 4.2, 0.3), mk(0xaa8800, 0.5, 0x886600, 0.12),
            rx, 2.65, BK+1.45);
        add(new THREE.BoxGeometry(3.0, 0.22, 2.5), mk(0x990000, 0.65), rx, 0.66, BK+2.2);
        [-1.5, 1.5].forEach(ax => {
          add(new THREE.BoxGeometry(0.3, 0.9, 2.4), mk(0xaa8800), rx+ax, 0.72, BK+2.2);
          // Column flanking throne
          add(new THREE.CylinderGeometry(0.22, 0.26, 5.8, 12), mk(0xd4c8a0, 0.4),
              rx + ax*2.2, 2.9, BK + 1.0);
          add(new THREE.BoxGeometry(0.55, 0.28, 0.55), mk(0xccbb88, 0.35),
              rx + ax*2.2, 5.94, BK + 1.0);
        });
        // Canopy above throne
        add(new THREE.BoxGeometry(5.5, 0.18, 3.2), mk(0x7a0000, 0.85), rx, 5.85, BK+1.8);
        add(new THREE.BoxGeometry(5.5, 4.0, 0.14), mk(0x6a0000, 0.88, 0x330000, 0.08),
            rx, 3.9, BK+0.28);

        // ── Tapestries ────────────────────────────────────────────────────
        [[rx-8.5, 0x7a0000, 3.5],[rx-4, 0x003388, 3.0],[rx+4, 0x005500, 3.0],[rx+8.5, 0x660000, 3.5]]
          .forEach(([px, tc, tw]) => {
            add(new THREE.BoxGeometry(tw, 5.2, 0.1), mk(tc, 0.92, tc, 0.07), px, 3.8, BK+0.6);
            [-tw/2-0.12, tw/2+0.12].forEach(ox =>
              add(new THREE.BoxGeometry(0.2, 5.4, 0.16), mk(0xcc9900), px+ox, 3.8, BK+0.62));
            add(new THREE.BoxGeometry(tw+0.4, 0.25, 0.18), mk(0xcc9900), px, 6.35, BK+0.62);
          });

        // ── Display cases with regalia ────────────────────────────────────
        [rx-8, rx+8].forEach((dx, di) => {
          add(new THREE.BoxGeometry(3.2, 2.2, 1.8),
              new THREE.MeshStandardMaterial({ color: 0xccddee, roughness:0.04, metalness:0.6, transparent:true, opacity:0.32 }),
              dx, 1.1, rz+2.5);
          add(new THREE.BoxGeometry(3.0, 0.1, 1.6), mk(0x1a1a1a,0.85), dx, 0.08, rz+2.5);
          add(new THREE.BoxGeometry(3.0, 0.1, 1.6), mk(0x1a1a1a,0.85), dx, 2.15, rz+2.5);
          if (di===0) {
            add(new THREE.CylinderGeometry(0.22,0.28,0.6,8), mk(0xffdd44,0.25,0xddbb22,0.6), dx, 0.7, rz+2.5);
            add(new THREE.SphereGeometry(0.3,10,8), mk(0xffdd44,0.25,0xddbb22,0.5), dx, 1.22, rz+2.5);
          } else {
            add(new THREE.BoxGeometry(0.55,1.5,0.55), mk(0xffdd44,0.25,0xddbb22,0.5), dx, 0.85, rz+2.5);
            add(new THREE.SphereGeometry(0.24,8,7), mk(0xffdd44,0.25,0xddbb22,0.5), dx, 1.73, rz+2.5);
          }
        });

        // ── Ceremonial carpet ─────────────────────────────────────────────
        const carpet = new THREE.Mesh(new THREE.PlaneGeometry(4.5, RD-2),
          mk(0x8b0000, 0.85, 0x440000, 0.08));
        carpet.rotation.x = -Math.PI/2;
        carpet.position.set(rx, 0.02, rz-1);
        objects.push(carpet);

        // ── Ornate floor border ───────────────────────────────────────────
        const border = new THREE.Mesh(new THREE.RingGeometry(4.5, 5.5, 4),
          mk(0xcc9900, 0.5, 0x886600, 0.2));
        border.rotation.x = -Math.PI/2;
        border.position.set(rx, 0.03, rz-1);
        objects.push(border);
        break;
      }
    }
  }

  setVexEducationalVisible(visible) {
    this.vexBuildings.forEach(g => { g.visible = visible; });
    // Always hide all interiors — entered individually
    this.vexInteriors.forEach(({ objects }) => objects.forEach(o => { o.visible = false; }));
  }

  showInterior(id) {
    this.vexInteriors.forEach(intr => {
      const vis = intr.id === id;
      intr.objects.forEach(o => { o.visible = vis; });
    });
  }

  hideAllInteriors() {
    this.vexInteriors.forEach(({ objects }) => objects.forEach(o => { o.visible = false; }));
  }

  getNearbyInteriorDoor(px, pz, radius = 7) {
    for (const intr of this.vexInteriors) {
      const dx = px - intr.doorX, dz = pz - intr.doorZ;
      if (dx*dx + dz*dz < radius*radius) return intr;
    }
    return null;
  }

  // ── Trees ────────────────────────────────────────────────────────────────
  _buildTrees() {
    const S = WORLD_SPREAD;
    // Park an der Ilm — dense woodland
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rx = 30 * S, rz = 45 * S;
      const r = Math.sqrt(Math.random());
      this._addTree(50*S + Math.cos(angle) * rx * r, 15*S + Math.sin(angle) * rz * r, 0.6 + Math.random() * 1.0);
    }
    // Goethepark
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      this._addTree(10*S + Math.cos(angle) * 18*S * r, -60*S + Math.sin(angle) * 15*S * r, 0.5 + Math.random() * 0.8);
    }
    // Street trees along main axes
    for (let i = -6; i <= 6; i++) {
      if (Math.abs(i) < 1) continue;
      this._addTree(i * 10 * S,  5 * S, 0.5 + Math.random() * 0.35);
      this._addTree(i * 10 * S, -5 * S, 0.5 + Math.random() * 0.35);
      this._addTree( 5 * S, i * 10 * S, 0.5 + Math.random() * 0.35);
      this._addTree(-5 * S, i * 10 * S, 0.5 + Math.random() * 0.35);
    }
    // Scattered city trees
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 200 * S;
      const z = (Math.random() - 0.5) * 200 * S;
      if (Math.abs(x) < 10*S && Math.abs(z) < 10*S) continue;
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
    const S = WORLD_SPREAD;
    for (let i = 0; i < count; i++) {
      positions[i * 3    ] = (Math.random() - 0.5) * 220 * S;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220 * S;
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

      // Roof switch (supports roofShapeMix for crash universes)
      const rs = theme.roofShapeMix
        ? theme.roofShapeMix[i % theme.roofShapeMix.length]
        : theme.roofShape;
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

    // Graffiti (Thrak only)
    const showGraffiti = theme.showGraffiti || false;
    (this.graffitiMeshes ?? []).forEach(m => { m.visible = showGraffiti; });

    // Particles
    if (this.particles) {
      this.particles.material.color.lerp(new THREE.Color(theme.particleColor), t);
      this.particles.material.size += (theme.particleSize - this.particles.material.size) * t;
    }
  }

  // ── Accessibility Zones (SOLEN) ───────────────────────────────────────────
  // Returns { factor: 0.0–1.0+, label: string }
  // factor>1 → boosted (sidewalk); factor=1 → normal; factor<1 → slowed; ~0.12 → nearly blocked
  getAccessibilityFactor(wx, wz) {
    // Steps — nearly blocked (footprint matches visible stair geometry)
    for (const z of (this._stepZones ?? [])) {
      if (wx >= z.minX && wx <= z.maxX && wz >= z.minZ && wz <= z.maxZ) {
        return { factor: 0.12, label: 'STEPS — no ramp access' };
      }
    }
    // Curbs — very slow (box matches visible curb strip + approach buffer)
    for (const z of (this._curbZones ?? [])) {
      if (Math.abs(wx - z.cx) < z.hx && Math.abs(wz - z.cz) < z.hz) {
        return { factor: 0.22, label: 'NO CURB CUT — difficult crossing' };
      }
    }
    // Cobblestone — slowed (radius matches visible circle patch)
    for (const z of (this._cobbleZones ?? [])) {
      const d = Math.sqrt((wx - z.cx) ** 2 + (wz - z.cz) ** 2);
      if (d < z.r) {
        const t = Math.max(0, 1 - d / z.r);
        return { factor: 1.0 - t * 0.6, label: 'COBBLESTONE — rough surface' };
      }
    }
    // Sidewalk — smooth boost (AABB matches visible path geometry)
    for (const z of (this._sidewalkZones ?? [])) {
      if (wx >= z.minX && wx <= z.maxX && wz >= z.minZ && wz <= z.maxZ) {
        return { factor: 1.3, label: 'SIDEWALK — smooth path' };
      }
    }
    return { factor: 1.0, label: '' };
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
