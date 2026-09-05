/**
 * Photoreal replay: the MuJoCo rollout, played back inside the actual
 * World Labs Marble Gaussian splat.
 *
 * The collider mesh MuJoCo simulates against is a low-fidelity proxy - it is
 * what the physics needs, not what the world looks like. The splat is the
 * photoreal reconstruction, and it only renders in a browser. So physics runs
 * offline in MuJoCo, and this page replays the resulting trajectory inside the
 * splat.
 *
 * Everything here works in MUJOCO coordinates (Z-up). The splat arrives in
 * glTF's Y-up frame, so it gets the same rotate-90-about-X plus translation
 * that marble_to_mjcf.py applied when it produced the collider - that shared
 * transform is what makes the robot land on the real floor instead of floating.
 */

import * as THREE from 'three';
import { SplatMesh, SparkRenderer } from '@sparkjsdev/spark';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Pose { p: [number, number, number]; q: [number, number, number, number]; }
interface Frame {
  base: Pose; mast: Pose; lift: Pose; arm: Pose; gripper: Pose; object: Pose;
  held: boolean; phase: string;
}
interface TrajDoc {
  fps: number;
  marble_world: string | null;
  scene: { objects: Array<any> };
  frames: Frame[];
}

const params = new URLSearchParams(location.search);
const TASK = params.get('task') ?? 'scene_bedroom';
const WORLD = params.get('world') ?? 'new_world';

const $ = (id: string) => document.getElementById(id)!;
const setStatus = (s: string) => { $('status').textContent = s; };

// --- scene -----------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);

// Spark draws Gaussian splats through its own renderer object. A SplatMesh
// added to the scene without this is present but never rasterised - the page
// looks like the splat simply failed to load.
const spark = new SparkRenderer({ renderer });
scene.add(spark);

// Z-up, to match MuJoCo, so trajectory poses can be applied verbatim.
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 500);
camera.up.set(0, 0, 1);
// Inside the room (it is ~4.5 x 5.7 m, centred, floor at z=0), roughly eye
// height. Orbiting from outside a splat mostly shows you its back faces.
camera.position.set(1.9, -2.3, 1.75);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.3, 0.85);
controls.enableDamping = true;
controls.maxDistance = 14;

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const key = new THREE.DirectionalLight(0xfff3e0, 1.15);
key.position.set(-2, -3, 4);
scene.add(key);

// --- robot -----------------------------------------------------------------
// Geometry offsets are baked in so each part can be driven directly by its
// body pose from the trajectory.
const CYAN = new THREE.MeshStandardMaterial({ color: 0x1ab8d8, roughness: 0.45, metalness: 0.15 });
const DARK = new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.6, metalness: 0.25 });
const BOOK = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.7 });

function box(sx: number, sy: number, sz: number, mat: THREE.Material, off?: [number, number, number]) {
  const g = new THREE.BoxGeometry(sx * 2, sy * 2, sz * 2);
  if (off) g.translate(off[0], off[1], off[2]);
  return new THREE.Mesh(g, mat);
}

function part(children: THREE.Mesh[]) {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  scene.add(g);
  return g;
}

const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.26, 28), CYAN);
baseCyl.geometry.rotateX(Math.PI / 2);          // MuJoCo cylinders are Z-axis
const parts = {
  base: part([baseCyl, box(0.06, 0.16, 0.05, DARK, [0.2, 0, 0.02])]),
  mast: part([box(0.05, 0.05, 0.62, DARK, [0, 0, 0.62])]),
  lift: part([box(0.07, 0.07, 0.05, CYAN)]),
  arm: part([box(0.035, 0.3, 0.035, CYAN, [0, 0.3, 0])]),
  gripper: part([
    box(0.05, 0.035, 0.045, DARK),
    box(0.012, 0.055, 0.035, DARK, [-0.045, 0.08, 0]),
    box(0.012, 0.055, 0.035, DARK, [0.045, 0.08, 0]),
  ]),
  object: part([box(0.14, 0.2, 0.032, BOOK)]),
};

function applyPose(g: THREE.Group, pose: Pose) {
  g.position.set(pose.p[0], pose.p[1], pose.p[2]);
  // MuJoCo quaternions are [w, x, y, z]; three.js takes (x, y, z, w).
  g.quaternion.set(pose.q[1], pose.q[2], pose.q[3], pose.q[0]);
}

// --- load ------------------------------------------------------------------
async function load() {
  setStatus('loading trajectory…');
  const traj: TrajDoc = await (await fetch(`/assets/tasks/${TASK}_traj.json`)).json();

  setStatus('loading Marble world…');
  let meta: any = null;
  try {
    meta = await (await fetch(`/assets/sim/${WORLD}.meta.json`)).json();
  } catch { /* transform falls back to identity below */ }

  const splatUrl = `/assets/scenarios/${WORLD}/scene.spz`;
  const head = await fetch(splatUrl, { method: 'HEAD' }).catch(() => null);

  if (head && head.ok) {
    const splat = new SplatMesh({ url: splatUrl });
    scene.add(splat);
    await splat.initialized;

    // Same transform marble_to_mjcf.py applied to the collider, so the splat
    // and the physics share one frame. Splat exports vary in handedness, so
    // every term is overridable from the query string - retuning it should not
    // need a code edit.
    const num = (k: string, d: number) => {
      const v = params.get(k);
      return v === null ? d : Number(v);
    };

    // Use the transform measured from the SPLAT ITSELF (scripts/spz_align.py),
    // not the collider's.
    //
    // The two are the same world but do not share an origin once loaded:
    // trimesh bakes the GLB's node transform, while the raw .spz arrives in the
    // exporter's own frame - here with the origin at CEILING height. Reusing
    // the collider's offset drops the splat ~2.8 m through the floor, which is
    // what put the camera inside the geometry.
    //
    // And never fit to the splat's bounding box: outlier splats make it
    // 11.5 x 20.4 x 17.2 m for a room that is really 4.4 x 5.2 x 2.8 m.
    const align = meta?.bounds?.spz_to_mujoco ?? meta?.bounds?.gltf_to_mujoco;
    const t = align?.then_translate ?? [0, 0, 0];
    const rot = align?.rotate_x_deg ?? 90;

    splat.rotation.set(
      THREE.MathUtils.degToRad(num('rx', rot)),
      THREE.MathUtils.degToRad(num('ry', 0)),
      THREE.MathUtils.degToRad(num('rz', 0)),
    );
    splat.position.set(num('tx', t[0]), num('ty', t[1]), num('tz', t[2]));
    splat.scale.setScalar(num('s', 1));
    splat.updateMatrixWorld(true);

    (window as any).splat = splat;   // tweak live from the console
    const size = new THREE.Vector3();
    splat.getBoundingBox(true).getSize(size);
    console.log('[splat] rotX', num('rx', rot), 'translate', t,
                '| bbox (includes outlier splats)', size.toArray().map(v => +v.toFixed(2)),
                '| room from collider',
                meta?.bounds && [meta.bounds.width_m, meta.bounds.depth_m, meta.bounds.height_m]
                  .map((v: number) => +v.toFixed(2)));
    $('worldlabel').textContent = 'World Labs Marble · Gaussian splat';

    // Alignment check: overlay the collider the physics actually ran against,
    // under the same transform. If the wireframe hugs the splat's walls, the
    // two frames agree and the robot is standing on the real floor.
    if (params.get('ref') === '1') {
      const g = await new GLTFLoader().loadAsync(
        `/assets/scenarios/${WORLD}/scene_collider.glb`);
      g.scene.traverse((o: any) => {
        if (o.isMesh) o.material = new THREE.MeshBasicMaterial({
          color: 0x34d399, wireframe: true, transparent: true, opacity: 0.35,
        });
      });
      g.scene.rotation.copy(splat.rotation);
      g.scene.position.copy(splat.position);
      scene.add(g.scene);
    }
  } else {
    setStatus('no scene.spz — falling back to collider mesh');
    const g = await new GLTFLoader().loadAsync(
      `/assets/scenarios/${WORLD}/scene_collider.glb`);
    const t = meta?.bounds?.gltf_to_mujoco?.then_translate ?? [0, 0, 0];
    g.scene.rotateX(Math.PI / 2);
    g.scene.position.set(t[0], t[1], t[2]);
    scene.add(g.scene);
    $('worldlabel').textContent = 'collider mesh (no splat found)';
  }

  // Generated furniture, at the poses staged in the studio.
  const loader = new GLTFLoader();
  for (const o of traj.scene.objects) {
    try {
      const gl = await loader.loadAsync(`/assets/furniture/${o.assetId}.glb`);
      const m = gl.scene;
      m.rotateX(Math.PI / 2);                       // glTF Y-up -> Z-up
      // studio is Y-up three.js: (x, y=height, z=depth) -> MuJoCo (x, -z, y)
      m.position.set(o.position.x, -o.position.z, o.position.y);
      const box3 = new THREE.Box3().setFromObject(m);
      const h = box3.max.z - box3.min.z;
      if (h > 0.01) m.scale.multiplyScalar(o.dimensions.height / h);
      scene.add(m);
    } catch {
      // No generated asset for this id yet - the room still reads fine without it.
    }
  }

  return traj;
}

// --- playback --------------------------------------------------------------
load().then((traj) => {
  const frames = traj.frames;
  const dt = 1 / (traj.fps || 30);
  let i = 0;
  let playing = true;
  let last = performance.now();
  let acc = 0;

  const scrub = $('scrub') as HTMLInputElement;
  scrub.max = String(frames.length - 1);
  scrub.addEventListener('input', () => { i = Number(scrub.value); playing = false; $('play').textContent = '▶'; });
  $('play').addEventListener('click', () => {
    playing = !playing;
    $('play').textContent = playing ? '❚❚' : '▶';
  });

  function tick(now: number) {
    requestAnimationFrame(tick);
    acc += (now - last) / 1000;
    last = now;
    if (playing) {
      while (acc >= dt) { acc -= dt; i = (i + 1) % frames.length; }
      scrub.value = String(i);
    } else { acc = 0; }

    const f = frames[i];
    applyPose(parts.base, f.base);
    applyPose(parts.mast, f.mast);
    applyPose(parts.lift, f.lift);
    applyPose(parts.arm, f.arm);
    applyPose(parts.gripper, f.gripper);
    applyPose(parts.object, f.object);

    $('phase').textContent = f.phase;
    $('held').textContent = f.held ? 'HOLDING' : '';
    setStatus(`frame ${i + 1}/${frames.length}`);

    controls.update();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}).catch((e) => setStatus(`error: ${e.message}`));

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
