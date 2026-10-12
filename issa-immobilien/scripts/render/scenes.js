import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen                                                     */
/* ------------------------------------------------------------------ */

// Deterministischer Zufall, damit jedes Rendering identisch ausfällt.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function noiseTexture(size, strength, seed = 1, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const r = rng(seed);
  for (let i = 0; i < size * size; i++) {
    const v = 128 + (r() - 0.5) * 255 * strength;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  return t;
}

// Leichte, großflächige Helligkeitsschwankung (Putz, Beton).
function cloudTexture(size, seed, base, spread, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const col = new THREE.Color(base);
  ctx.fillStyle = `#${col.getHexString()}`;
  ctx.fillRect(0, 0, size, size);
  const r = rng(seed);
  for (let i = 0; i < 900; i++) {
    const x = r() * size, y = r() * size, rad = 8 + r() * size * 0.12;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const d = (r() - 0.5) * spread;
    const shade = d > 0 ? '255,250,240' : '60,50,40';
    g.addColorStop(0, `rgba(${shade},${Math.abs(d)})`);
    g.addColorStop(1, `rgba(${shade},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  return t;
}

function woodTexture(seed) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8f7356';
  ctx.fillRect(0, 0, 64, 512);
  const r = rng(seed);
  for (let i = 0; i < 70; i++) {
    const x = r() * 64;
    ctx.strokeStyle = `rgba(${r() > 0.5 ? '60,40,25' : '190,160,120'},${0.05 + r() * 0.12})`;
    ctx.lineWidth = 0.5 + r() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + r() * 4 - 2, 170, x + r() * 4 - 2, 340, x + r() * 3 - 1.5, 512);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function skyTexture(top, horizon, bottom = horizon) {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, top);
  g.addColorStop(0.55, horizon);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const bumpNoise = noiseTexture(512, 0.55, 7, 6);

function plaster(color, seed = 3, repeat = 1) {
  return new THREE.MeshStandardMaterial({
    map: cloudTexture(512, seed, color, 0.03, repeat),
    roughness: 0.92,
    bumpMap: bumpNoise,
    bumpScale: 0.6,
  });
}

function solid(color, roughness = 0.85, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function glass(tint = '#2b2e2e') {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    roughness: 0.04,
    metalness: 0.1,
    envMapIntensity: 1.4,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  });
}

class Builder {
  constructor(scene) {
    this.scene = scene;
  }
  // Quader über Min/Max-Koordinaten (Meter) – deutlich lesbarer als Mittelpunkte.
  box(x0, y0, z0, x1, y1, z1, mat, { cast = true, receive = true } = {}) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    const m = new THREE.Mesh(g, mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = cast;
    m.receiveShadow = receive;
    this.scene.add(m);
    return m;
  }
}

function sun(scene, { color = '#ffe2bf', intensity = 3.2, pos, target = [0, 0, 0], size = 30, mapSize = 4096 }) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos);
  l.target.position.set(...target);
  l.castShadow = true;
  l.shadow.mapSize.set(mapSize, mapSize);
  l.shadow.camera.left = -size;
  l.shadow.camera.right = size;
  l.shadow.camera.top = size;
  l.shadow.camera.bottom = -size;
  l.shadow.camera.near = 0.5;
  l.shadow.camera.far = 200;
  l.shadow.bias = -0.0002;
  l.shadow.normalBias = 0.02;
  l.shadow.radius = 3;
  scene.add(l, l.target);
  return l;
}

// Unsichtbare Baumkrone, die nur Schatten wirft (Layer 1 = nur Schattenkamera).
function treeShadow(scene, light, center, { seed = 1, clumps = 5, spread = 3.2, leaves = 900 } = {}) {
  const r = rng(seed);
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const leaf = new THREE.PlaneGeometry(0.32, 0.22);
  const group = new THREE.Group();
  const centers = Array.from({ length: clumps }, () =>
    new THREE.Vector3(center[0] + (r() - 0.5) * spread * 2, center[1] + (r() - 0.5) * spread, center[2] + (r() - 0.5) * spread * 2),
  );
  for (let i = 0; i < leaves; i++) {
    const c = centers[i % clumps];
    const m = new THREE.Mesh(leaf, mat);
    const rad = 1.6 * Math.cbrt(r());
    const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1);
    m.position.set(c.x + rad * Math.sin(ph) * Math.cos(th), c.y + rad * 0.7 * Math.cos(ph), c.z + rad * Math.sin(ph) * Math.sin(th));
    m.rotation.set(r() * 6, r() * 6, r() * 6);
    group.add(m);
  }
  // Äste
  const branch = new THREE.CylinderGeometry(0.04, 0.07, 1, 6);
  for (const c of centers) {
    const m = new THREE.Mesh(branch, mat);
    const base = new THREE.Vector3(center[0], center[1] - spread, center[2]);
    m.position.copy(base.clone().lerp(c, 0.5));
    m.scale.y = base.distanceTo(c);
    m.lookAt(c);
    m.rotateX(Math.PI / 2);
    group.add(m);
  }
  group.traverse((o) => {
    o.castShadow = true;
    o.layers.set(1);
  });
  light.shadow.camera.layers.enable(1);
  scene.add(group);
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const pmrem = new THREE.PMREMGenerator(renderer);
const roomEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// Equirektangulare Himmelsumgebung für natürliches Fülllicht und Spiegelungen.
function skyEnv(top, horizon, ground) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top);
  g.addColorStop(0.47, horizon);
  g.addColorStop(0.5, ground);
  g.addColorStop(1, ground);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return pmrem.fromEquirectangular(t).texture;
}

function finish(width, height, { grain = 0.045, vignette = 0.22, warm = 0 } = {}) {
  // Filmkorn, Vignette und eine minimale Tonung – in 2D, nach dem 3D-Rendering.
  const out = document.createElement('canvas');
  out.width = width; out.height = height;
  const ctx = out.getContext('2d');
  ctx.drawImage(renderer.domElement, 0, 0);
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  const r = rng(99);
  const cx = width / 2, cy = height / 2, maxD = Math.hypot(cx, cy);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const n = (r() - 0.5) * 255 * grain;
      const v = 1 - vignette * Math.pow(Math.hypot(x - cx, y - cy) / maxD, 2.2);
      d[i] = Math.min(255, (d[i] + n + warm * 6) * v);
      d[i + 1] = Math.min(255, (d[i + 1] + n + warm * 2) * v);
      d[i + 2] = Math.min(255, (d[i + 2] + n - warm * 5) * v);
    }
  }
  ctx.putImageData(img, 0, 0);
  return out.toDataURL('image/png');
}

function render(scene, camera, width, height, post = {}) {
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  scene.environment = post.envMap ?? roomEnv;
  scene.environmentIntensity = post.env ?? 0.35;

  const composer = new EffectComposer(renderer);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, width, height);
  ao.updateGtaoMaterial({ radius: post.aoRadius ?? 0.6, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 16 });
  ao.blendIntensity = post.ao ?? 0.85;
  composer.addPass(ao);
  composer.addPass(new OutputPass());
  composer.render();
  const dataUrl = finish(width, height, post);
  composer.dispose();
  return { dataUrl, width, height };
}

/* ------------------------------------------------------------------ */
/* Szenen                                                              */
/* ------------------------------------------------------------------ */

const scenes = {
  /** Wohnhaus, Untersicht über Eck – auskragender Baukörper, Holzlamellen. */
  residence() {
    const scene = new THREE.Scene();
    scene.background = skyTexture('#aab6ba', '#e9e4da', '#efe7d9');
    scene.fog = new THREE.Fog('#e6dfd3', 60, 220);
    const b = new Builder(scene);

    const wall = plaster('#ebe5da', 3, 2);
    const stone = plaster('#a99c89', 5, 3);
    const concrete = plaster('#c9c1b3', 8, 4);
    const dark = glass();
    const frame = solid('#2c2b29', 0.5, 0.6);
    const wood = new THREE.MeshStandardMaterial({ map: woodTexture(4), roughness: 0.75 });

    // Gelände
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), plaster('#bdb4a6', 11, 40));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    b.box(-30, 0, 0.6, 14, 0.05, 4.6, concrete); // Terrasse
    for (let x = -30; x < 14; x += 1.2) b.box(x, 0.05, 0.6, x + 0.03, 0.053, 4.6, solid('#a8a092')); // Fugen
    b.box(-30, 0, 4.6, 14, 0.02, 6.2, plaster('#9a9184', 21, 6)); // Kiesstreifen

    // Erdgeschoss: Holzlamellen, zurückgesetzte Putzwand mit Verglasung
    b.box(-9.4, 0, -8, -5.6, 3.2, -0.6, wall);
    for (let x = -9.2; x < -5.8; x += 0.17) b.box(x, 0.05, -0.6, x + 0.07, 3.15, -0.42, wood);
    b.box(-5.6, 0, -8, 6.4, 3.2, -2.4, wall);
    b.box(-3.8, 0, -2.45, 3.6, 2.85, -2.35, dark);
    for (let x = -3.8; x <= 3.6; x += 1.85) b.box(x - 0.04, 0, -2.5, x + 0.04, 2.85, -2.3, frame);
    b.box(-3.85, 2.85, -2.5, 3.65, 2.91, -2.3, frame);

    // Obergeschoss – auskragender Riegel mit tiefer Bandfensterlaibung
    const x0 = -9.6, x1 = 10.4, zb = -8.4, zf = 0.4;
    b.box(x0, 3.2, zb, x1, 3.95, zf, wall);
    b.box(x0, 5.55, zb, x1, 6.6, zf, wall);
    b.box(x0, 3.95, zb, x0 + 0.9, 5.55, zf, wall);
    b.box(x1 - 1.1, 3.95, zb, x1, 5.55, zf, wall);
    b.box(x0 + 0.9, 3.95, zb, x1 - 1.1, 5.55, zf - 0.55, dark);
    for (let x = x0 + 0.9 + 2.2; x < x1 - 1.3; x += 2.2) b.box(x, 3.95, zf - 0.6, x + 0.06, 5.55, zf - 0.5, frame);
    b.box(x0 - 0.02, 6.6, zb, x1 + 0.02, 6.66, zf + 0.02, solid('#d6cfc3'));

    // Gartenmauer, seitlich
    b.box(-30, 0, 9, -6, 1.0, 9.35, concrete);

    // Nachbarvolumen in der Tiefe
    b.box(-30, 0, -20, -14, 4.2, -10, wall);

    sun(scene, { color: '#ffe7cc', pos: [-24, 16, 18], target: [0, 2, -2], intensity: 4.4, size: 30 });
    // Hecke und Nachbarbebauung in der Tiefe
    const hedge = plaster('#6d6c55', 31, 3);
    b.box(8, 0, -17, 60, 2.4, -14.5, hedge);
    b.box(24, 0, -60, 46, 9, -44, plaster('#d9d2c5', 33, 2));

    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    cam.position.set(16.5, 1.0, 9.5);
    cam.lookAt(5.5, 4.9, -3);
    return render(scene, cam, 3200, 4000, { env: 0.9, envMap: skyEnv('#9fb0b8', '#e8e2d6', '#b9ae9c') });
  },

  /** Fassadendetail – vertikale Lamellen im Streiflicht, tiefe Laibung. */
  facade() {
    const scene = new THREE.Scene();
    scene.background = skyTexture('#b3bec2', '#ddd9d0');
    const b = new Builder(scene);
    const wall = plaster('#e9e3d8', 41, 2);
    const fin = plaster('#e4ddd1', 43, 1);
    const dark = glass('#272a2a');
    const frame = solid('#2f2d2a', 0.45, 0.6);

    b.box(-12, -6, -1, 12, 20, 0, wall);
    // Fensteröffnung mit tiefer Laibung (Wand aus Teilen)
    scene.children.pop();
    b.box(-12, -6, -1, 12, 3.6, 0, wall);
    b.box(-12, 7.4, -1, 12, 20, 0, wall);
    b.box(-12, 3.6, -1, -1.2, 7.4, 0, wall);
    b.box(1.6, 3.6, -1, 12, 7.4, 0, wall);
    b.box(-1.2, 3.6, -1, 1.6, 7.4, -0.75, dark);
    b.box(-1.2, 3.6, -0.76, 1.6, 3.66, -0.7, frame);
    b.box(-0.05, 3.6, -0.78, 0.03, 7.4, -0.72, frame);
    // Vorgestellte Lamellen links und rechts der Öffnung
    for (let x = -11; x < -1.6; x += 0.62) b.box(x, -6, 0.15, x + 0.12, 20, 0.75, fin);
    for (let x = 2.2; x < 12; x += 0.62) b.box(x, -6, 0.15, x + 0.12, 20, 0.75, fin);

    sun(scene, { color: '#ffe3c2', pos: [-15, 17, 24], target: [0, 4, 0], intensity: 4.4, size: 16 });

    const cam = new THREE.PerspectiveCamera(17, 1, 0.1, 500);
    cam.position.set(9, 3.2, 30);
    cam.lookAt(0.6, 5.2, 0);
    return render(scene, cam, 2400, 3000, { env: 0.75, envMap: skyEnv('#a6b3b9', '#e4ded2', '#b8ad9b'), aoRadius: 0.35 });
  },

  /** Innenraum – Lichteinfall durch eine große Öffnung, schwebende Treppe. */
  interior() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e9e4da');
    const b = new Builder(scene);
    const wall = plaster('#e6e0d5', 51, 2);
    const floor = plaster('#bfb5a5', 53, 3);
    const oak = new THREE.MeshStandardMaterial({ map: woodTexture(9), roughness: 0.7 });
    const frame = solid('#2c2b28', 0.5, 0.5);

    const W = 9, D = 10, H = 3.4;
    b.box(-W / 2, -0.2, -D, W / 2, 0, 2, floor);
    b.box(-W / 2, H, -D, W / 2, H + 0.3, 2, wall);
    b.box(-W / 2 - 0.3, 0, -D - 0.3, W / 2 + 0.3, H, -D, wall); // Rückwand
    b.box(W / 2, 0, -D, W / 2 + 0.3, H, 2, wall); // rechte Wand
    // Linke Wand mit großer Öffnung
    const wx0 = -W / 2 - 0.35, wx1 = -W / 2;
    b.box(wx0, 0, -D, wx1, 0.45, 2, wall);
    b.box(wx0, 2.9, -D, wx1, H, 2, wall);
    b.box(wx0, 0.45, -D, wx1, 2.9, -7.2, wall);
    b.box(wx0, 0.45, -2.2, wx1, 2.9, 2, wall);
    b.box(wx0 + 0.15, 0.45, -7.2, wx0 + 0.2, 2.9, -7.16, frame);
    b.box(wx0 + 0.15, 0.45, -2.24, wx0 + 0.2, 2.9, -2.2, frame);
    b.box(wx0 - 0.05, 0.4, -7.25, wx1 + 0.05, 0.45, -2.15, oak); // Sitzbank in der Laibung
    // Schwebende Treppe an der Rückwand
    for (let i = 0; i < 12; i++) {
      const x = W / 2 - 1.1 - i * 0.29;
      b.box(x - 0.29, 0.26 + i * 0.26, -D, x, 0.32 + i * 0.26, -D + 1.05, oak);
    }
    b.box(-W / 2 + 0.6, 0, -D + 0.05, -W / 2 + 1.4, 0.44, -D + 3.2, plaster('#d8d0c3', 55, 1)); // Sockelbank

    // Außenwelt (nur als Lichtquelle sichtbar)
    sun(scene, { color: '#ffe0b8', pos: [-22, 11, -2], target: [0, 0, -5], intensity: 6.5, size: 14 });

    const cam = new THREE.PerspectiveCamera(46, 1, 0.05, 200);
    cam.position.set(3.0, 1.5, 1.4);
    cam.lookAt(-1.6, 1.1, -6);
    return render(scene, cam, 2800, 3500, { env: 0.8, envMap: skyEnv('#c9d1d4', '#ece6db', '#b7ab98'), aoRadius: 0.5, ao: 1 });
  },

  /** Gewerbebau – tiefe Rasterfassade in Untersicht. */
  urban() {
    const scene = new THREE.Scene();
    scene.background = skyTexture('#9fb0b8', '#dfdcd4');
    const b = new Builder(scene);
    const stoneMat = plaster('#d6cdbd', 61, 3);
    const dark = glass('#2a2d2e');
    const cols = 9, rows = 7, cw = 3.0, rh = 3.7, depth = 0.7;
    b.box(-14, 0, -12, -14 + cols * cw + 0.5, rows * rh + 0.8, -depth, dark);
    for (let i = 0; i <= cols; i++) b.box(-14 + i * cw, 0, -depth, -14 + i * cw + 0.5, rows * rh + 0.8, 0, stoneMat);
    for (let j = 0; j <= rows; j++) b.box(-14, j * rh, -depth, -14 + cols * cw + 0.5, j * rh + 0.8, 0, stoneMat);
    // Seitenfassade
    b.box(-14 + cols * cw + 0.5, 0, -12, -14 + cols * cw + 0.8, rows * rh + 0.8, 0, stoneMat);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), plaster('#a9a195', 63, 30));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    sun(scene, { color: '#ffe6c9', pos: [-26, 26, 14], target: [0, 12, -3], intensity: 4.6, size: 30 });

    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    cam.position.set(14, 1.6, 12);
    cam.lookAt(0, 13, -4);
    return render(scene, cam, 4000, 2668, { env: 0.8, envMap: skyEnv('#9fb0b8', '#e2ddd2', '#a69d8f'), aoRadius: 0.6 });
  },

  /** Langgestrecktes Haus mit Mauer im tiefen Abendlicht – Panorama. */
  horizon() {
    const scene = new THREE.Scene();
    scene.background = skyTexture('#b9bfbd', '#efe2cf', '#e9dcc6');
    scene.fog = new THREE.Fog('#e8dcc8', 50, 260);
    const b = new Builder(scene);
    const wall = plaster('#e8e1d4', 71, 3);
    const brick = plaster('#a6957d', 73, 4);
    const dark = glass('#26292a');

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), plaster('#a59d8e', 75, 60));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    b.box(-40, 0, 1, 40, 0.03, 6, plaster('#cbc2b2', 77, 6));

    // Langer, flacher Baukörper
    b.box(-20, 0, -9, 16, 3.3, -1, wall);
    b.box(-14, 0.3, -1.02, 6, 2.9, -0.98, dark);
    b.box(-20.3, 3.3, -9.3, 16.3, 3.6, -0.6, wall); // auskragendes Dach
    // Freistehende Mauer, die den Eingang fasst
    b.box(-36, 0, 2.2, -8, 2.4, 2.65, brick);
    b.box(9, 0, -0.2, 9.45, 2.4, 9, brick);
    // Hecke
    b.box(-60, 0, -24, 60, 3.2, -20, plaster('#6c6b52', 79, 6));

    sun(scene, { color: '#ffdcb6', pos: [-30, 13, 30], target: [-4, 1, -2], intensity: 4.8, size: 40 });

    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 600);
    cam.position.set(4, 1.15, 13);
    cam.lookAt(-14, 2.1, 0);
    return render(scene, cam, 4800, 2700, { env: 0.7, envMap: skyEnv('#aeb7b6', '#eadfcd', '#8f8d72'), warm: 0.2 });
  },
};

window.listScenes = () => Object.keys(scenes);
window.renderScene = (name) => scenes[name]();
window.__ready = true;
