/**
 * Drive the G1 around inside a World Labs Gaussian splat.
 *
 * Deliberately minimal. The full replay page grew too many branches to debug,
 * so this does three things only: render the splat, render the G1, and let you
 * move the G1 with the keyboard. Aligning a splat to a physics frame is
 * fundamentally a "look at it and nudge" problem, so the nudging is the feature
 * rather than something hidden in a constant.
 *
 * Everything is in MuJoCo coordinates (Z-up). The splat is glTF Y-up, so it is
 * rotated +90 about X and translated by the offset measured from the splat
 * itself (scripts/spz_align.py) - never from its bounding box, which outlier
 * splats inflate by 3-4x.
 *
 * Keys:  W/S forward-back   A/D strafe   Q/E turn   R/F up-down
 *        Space play/pause the walk   [ / ] step frames   G log the transform
 */

import * as THREE from 'three';
import { SplatMesh, SparkRenderer } from '@sparkjsdev/spark';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const P = new URLSearchParams(location.search);
const SPLAT = P.get('splat') ?? 'room2.spz';
const WORLD = P.get('world') ?? 'new_world';
const TASK = P.get('task') ?? 'g1_book';
const num = (k: string, d: number) => (P.get(k) === null ? d : Number(P.get(k)));

const $ = (id: string) => document.getElementById(id)!;
const say = (s: string) => { $('status').textContent = s; };

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e18);
// Spark rasterises splats through this; a SplatMesh alone never draws.
// SparkRenderer has no geometry of its own, so three.js frustum-culls it and
// its onBeforeRender never fires - the splats are loaded but never accumulated
// or drawn. Disable culling AND drive update() explicitly each frame.
const spark = new SparkRenderer({ renderer });
spark.frustumCulled = false;
scene.add(spark);

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.03, 200);
camera.up.set(0, 0, 1);
camera.position.set(num('cx', 3.2), num('cy', -3.4), num('cz', 2.0));
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 1.0);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dir = new THREE.DirectionalLight(0xfff2e0, 1.2);
dir.position.set(-2, -3, 4);
scene.add(dir);

// The G1 lives under one group so the whole robot can be nudged as a unit
// while its links keep their per-frame poses from MuJoCo.
const rig = new THREE.Group();
scene.add(rig);

let frames: any[] = [];
let meshes: THREE.Mesh[] = [];
let i = 0;
let playing = true;

async function boot() {
  say('loading splat…');
  const splat = new SplatMesh({ url: `/assets/scenarios/${WORLD}/${SPLAT}` });
  scene.add(splat);
  await splat.initialized;

  let meta: any = null;
  try { meta = await (await fetch(`/assets/sim/${WORLD}.meta.json`)).json(); } catch {}
  const a = meta?.bounds?.spz_to_mujoco;
  splat.rotation.set(THREE.MathUtils.degToRad(num('rx', a?.rotate_x_deg ?? 90)), 0, 0);
  splat.position.set(num('tx', a?.then_translate?.[0] ?? 0),
                     num('ty', a?.then_translate?.[1] ?? 0),
                     num('tz', a?.then_translate?.[2] ?? 0));
  splat.scale.setScalar(num('s', 1));
  (window as any).splat = splat;

  // Put the camera INSIDE the room, derived from the measured dimensions.
  // A hardcoded position lands outside the wall for a room of a different
  // shape, and from outside you see nothing - which reads as "the splat did
  // not load" when it loaded perfectly well.
  const room = a?.measured_room_m;
  if (room && !P.has('cx')) {
    const hw = room.width / 2, hd = room.depth / 2;
    camera.position.set(hw * 0.45, -hd * 0.55, Math.min(1.7, room.height * 0.6));
    controls.target.set(0, hd * 0.15, room.height * 0.4);
    controls.update();
  }

  const bb = new THREE.Vector3();
  splat.getBoundingBox(true).getSize(bb);
  $('info').textContent =
    `${SPLAT} · room ${room ? `${room.width}×${room.depth}×${room.height}m` : '?'} · ` +
    `cam ${camera.position.toArray().map((v) => v.toFixed(1)).join(',')}`;

  say('loading G1…');
  const [man, buf, traj] = await Promise.all([
    fetch('/assets/g1/g1_geom.json').then((r) => r.json()),
    fetch('/assets/g1/g1_geom.bin').then((r) => r.arrayBuffer()),
    fetch(`/assets/tasks/${TASK}_traj.json`).then((r) => r.json()),
  ]);
  frames = traj.frames;

  const mat = new THREE.MeshStandardMaterial({ color: 0xe8ecf2, roughness: 0.38, metalness: 0.55 });
  meshes = man.map((m: any) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array(buf, m.vertOffset, m.vertCount * 3), 3));
    g.setIndex(new THREE.BufferAttribute(
      new Uint32Array(buf, m.faceOffset, m.faceCount * 3), 1));
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, mat);
    rig.add(mesh);
    return mesh;
  });

  rig.position.set(num('gx', 0), num('gy', 0), num('gz', 0));
  rig.rotation.z = THREE.MathUtils.degToRad(num('gr', 0));
  say(`ready · ${frames.length} frames · ${meshes.length} links`);
}

// --- keyboard nudging -------------------------------------------------------
const held = new Set<string>();
addEventListener('keydown', (e) => {
  held.add(e.key.toLowerCase());
  if (e.key === ' ') { playing = !playing; e.preventDefault(); }
  if (e.key === '[') { i = Math.max(0, i - 1); playing = false; }
  if (e.key === ']') { i = Math.min(frames.length - 1, i + 1); playing = false; }
  if (e.key.toLowerCase() === 'g') {
    const p = rig.position;
    const line = `gx=${p.x.toFixed(2)}&gy=${p.y.toFixed(2)}&gz=${p.z.toFixed(2)}` +
                 `&gr=${THREE.MathUtils.radToDeg(rig.rotation.z).toFixed(0)}`;
    console.log('[g1] ' + line);
    $('info').textContent = line;
  }
});
addEventListener('keyup', (e) => held.delete(e.key.toLowerCase()));

function nudge(dt: number) {
  const v = 1.4 * dt, w = 1.6 * dt;
  const yaw = rig.rotation.z;
  const fx = Math.cos(yaw), fy = Math.sin(yaw);
  if (held.has('w')) { rig.position.x += fx * v; rig.position.y += fy * v; }
  if (held.has('s')) { rig.position.x -= fx * v; rig.position.y -= fy * v; }
  if (held.has('a')) { rig.position.x += -fy * v; rig.position.y += fx * v; }
  if (held.has('d')) { rig.position.x -= -fy * v; rig.position.y -= fx * v; }
  if (held.has('q')) rig.rotation.z += w;
  if (held.has('e')) rig.rotation.z -= w;
  if (held.has('r')) rig.position.z += v;
  if (held.has('f')) rig.position.z -= v;
}

let last = performance.now();
function tick(now: number) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  nudge(dt);

  if (frames.length && meshes.length) {
    if (playing) i = (i + 1) % frames.length;
    const g1 = frames[i]?.g1;
    if (g1) {
      for (let k = 0; k < meshes.length; k++) {
        const p = g1[k];
        if (!p) continue;
        meshes[k].position.set(p[0], p[1], p[2]);
        meshes[k].quaternion.set(p[4], p[5], p[6], p[3]);   // MuJoCo [w,x,y,z]
      }
    }
    $('phase').textContent = `${frames[i]?.phase ?? ''}  ${i + 1}/${frames.length}`;
  }

  controls.update();
  try { spark.update({ scene, camera }); } catch { /* older builds auto-update */ }
  renderer.render(scene, camera);
}

boot().then(() => requestAnimationFrame(tick))
      .catch((e) => { console.error(e); say('error: ' + e.message); });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
