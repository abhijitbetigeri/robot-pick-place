import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ScenarioDef } from '../types';
import {
  Camera,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Zap,
  Map,
  Sparkles,
  ExternalLink,
  Box,
  FastForward,
  ShieldAlert,
} from 'lucide-react';

interface CinematicViewport3DProps {
  scenario: ScenarioDef;
  onToggleBridge: (bridgeId: string) => void;
  isBridgeBlocked: boolean;
}

export const CinematicViewport3D: React.FC<CinematicViewport3DProps> = ({
  scenario,
  onToggleBridge,
  isBridgeBlocked,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cameraMode, setCameraMode] = useState<"isometric" | "topdown" | "rover1" | "rover2">("isometric");
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [glbLoaded, setGlbLoaded] = useState<boolean>(false);
  const [glbSizeMB, setGlbSizeMB] = useState<string>("7.65");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const rover1MeshRef = useRef<THREE.Group | null>(null);
  const rover2MeshRef = useRef<THREE.Group | null>(null);
  const lidarBeamRef = useRef<THREE.Mesh | null>(null);
  const pathRibbonRef = useRef<THREE.Line | null>(null);
  const hazardGroupRef = useRef<THREE.Group | null>(null);
  const worldLabsModelRef = useRef<THREE.Group | null>(null);

  const simStateRef = useRef({
    progress: 0.0,
    isPlaying: false,
    speed: 1.0,
    isBlocked: isBridgeBlocked,
  });

  useEffect(() => {
    simStateRef.current.isBlocked = isBridgeBlocked;
  }, [isBridgeBlocked]);

  useEffect(() => {
    simStateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    simStateRef.current.speed = playbackSpeed;
  }, [playbackSpeed]);

  const pos = scenario.positions;

  // Catmull-Rom route curves
  const getRouteCurves = () => {
    const r1Points = [
      new THREE.Vector3(pos.start.x, 0.4, pos.start.y),
      new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
      new THREE.Vector3(pos.primaryEntry.x, 0.4, pos.primaryEntry.y),
      new THREE.Vector3(pos.primaryMid.x, 0.4, pos.primaryMid.y),
    ];
    const r1Curve = new THREE.CatmullRomCurve3(r1Points);

    const r2AlphaPoints = [
      new THREE.Vector3(pos.start.x, 0.4, pos.start.y - 4),
      new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
      new THREE.Vector3(pos.primaryEntry.x, 0.4, pos.primaryEntry.y),
      new THREE.Vector3(pos.primaryMid.x, 0.4, pos.primaryMid.y),
      new THREE.Vector3(pos.primaryExit.x, 0.4, pos.primaryExit.y),
      new THREE.Vector3(pos.northApproach.x, 0.4, pos.northApproach.y),
      new THREE.Vector3(pos.goal.x, 0.4, pos.goal.y),
    ];
    const r2AlphaCurve = new THREE.CatmullRomCurve3(r2AlphaPoints);

    const r2BetaPoints = [
      new THREE.Vector3(pos.start.x, 0.4, pos.start.y - 4),
      new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
      new THREE.Vector3(pos.detourApproach.x, 0.4, pos.detourApproach.y),
      new THREE.Vector3(pos.detourEntry.x, 0.4, pos.detourEntry.y),
      new THREE.Vector3(pos.detourMid.x, 0.4, pos.detourMid.y),
      new THREE.Vector3(pos.detourExit.x, 0.4, pos.detourExit.y),
      new THREE.Vector3(pos.northApproach.x, 0.4, pos.northApproach.y),
      new THREE.Vector3(pos.goal.x, 0.4, pos.goal.y),
    ];
    const r2BetaCurve = new THREE.CatmullRomCurve3(r2BetaPoints);

    return { r1Curve, r2AlphaCurve, r2BetaCurve };
  };

  useEffect(() => {
    if (!containerRef.current) return;
    setGlbLoaded(false);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(45, 42, -52);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 15;
    controls.maxDistance = 250;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // 1. Scenario-Specific 360 Equirectangular Skybox & PBR Environment
    const textureLoader = new THREE.TextureLoader();
    if (scenario.panoPath) {
      textureLoader.load(
        scenario.panoPath,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.background = texture;
          scene.environment = texture;
        },
        undefined,
        () => {
          scene.background = new THREE.Color(0x070d1a);
        }
      );
    }

    // 2. Cinematic Physical Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.9);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffaed, 2.0);
    sun.position.set(60, 95, 45);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0005;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 300;
    sun.shadow.camera.left = -90;
    sun.shadow.camera.right = 90;
    sun.shadow.camera.top = 90;
    sun.shadow.camera.bottom = -90;
    scene.add(sun);

    // Subtle blue fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    fillLight.position.set(-50, 40, -50);
    scene.add(fillLight);

    // 3. LOAD ACTUAL WORLD LABS MARBLE 3D GLTF/GLB MODEL WITH VERTEX COLORS
    const gltfLoader = new GLTFLoader();
    if (scenario.glbPath) {
      gltfLoader.load(
        scenario.glbPath,
        (gltf) => {
          const model = gltf.scene;

          // Compute raw model bounding box and center
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          // Metric scaling: scale so the World Labs model spans the navigable domain (~95m)
          const targetSpan = 95.0;
          const maxDim = Math.max(size.x, size.z);
          const scale = maxDim > 0 ? (targetSpan / maxDim) : (scenario.metricScale || 2.5);

          model.scale.set(scale, scale, scale);
          // Center the World Labs model in X/Z and align the ground road surface to Y = 0
          model.position.set(
            -center.x * scale,
            -box.min.y * scale * 0.18 - 0.5,
            -center.z * scale
          );

          // Preserve World Labs photorealistic vertex colors and normal maps
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.geometry) {
                mesh.geometry.computeVertexNormals();
              }
              mesh.material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.65,
                metalness: 0.12,
                side: THREE.DoubleSide,
              });
            }
          });

          scene.add(model);
          worldLabsModelRef.current = model;
          setGlbLoaded(true);
          setGlbSizeMB(
            scenario.id === "sf_mission_creek"
              ? "7.65"
              : scenario.id === "nyc_soho"
              ? "2.71"
              : "1.18"
          );
        },
        undefined,
        (err) => {
          console.warn("GLB load notice:", err);
        }
      );
    }

    // 4. Subtle Ground Shadow Catcher
    const shadowPlaneGeo = new THREE.PlaneGeometry(300, 300);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.05;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 5. Interactive Holographic Hazard Visualizer
    const hazardGroup = new THREE.Group();
    hazardGroup.position.set(pos.primaryMid.x, 0.4, pos.primaryMid.y);

    // Caution Holo-barrier
    const barGeo = new THREE.BoxGeometry(10, 0.6, 0.4);
    const barMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
    });
    const barrierBar = new THREE.Mesh(barGeo, barMat);
    barrierBar.position.y = 1.4;
    hazardGroup.add(barrierBar);

    // Flashing safety beacon
    const beaconGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 2.6, 0);
    hazardGroup.add(beacon);

    // Holographic warning ring
    const ringGeo = new THREE.RingGeometry(2.5, 4.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    hazardGroup.add(ring);

    hazardGroup.visible = isBridgeBlocked;
    scene.add(hazardGroup);
    hazardGroupRef.current = hazardGroup;

    // 6. High-Tech Wheeled Autonomous Mobile Robots (AMRs)
    const createRoverMesh = (colorHex: number, isScout: boolean) => {
      const group = new THREE.Group();

      // Carbon fiber chassis base
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 1.1, 3.6),
        new THREE.MeshStandardMaterial({
          color: colorHex,
          metalness: 0.7,
          roughness: 0.25,
        })
      );
      body.position.y = 0.85;
      body.castShadow = true;
      group.add(body);

      // Top sensor module / Cargo Pod
      const topModule = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.7, 2.2),
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.9,
          roughness: 0.15,
        })
      );
      topModule.position.set(0, 1.6, 0);
      group.add(topModule);

      // Heavy-duty wheels
      const tireGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.48, 18);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
      const rimGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.49, 12);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });

      [
        [-1.4, 0.6, -1.1],
        [1.4, 0.6, -1.1],
        [-1.4, 0.6, 1.1],
        [1.4, 0.6, 1.1],
      ].forEach(([wx, wy, wz]) => {
        const tire = new THREE.Mesh(tireGeo, tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(wx, wy, wz);
        tire.castShadow = true;
        group.add(tire);

        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(wx, wy, wz);
        group.add(rim);
      });

      // Spinning LiDAR turret
      const lidar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          metalness: 0.9,
          roughness: 0.1,
        })
      );
      lidar.position.set(0, 2.15, -0.3);
      group.add(lidar);

      if (isScout) {
        // Active LiDAR scanning fan cone
        const coneGeo = new THREE.ConeGeometry(6.5, 16, 24, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.rotation.x = -Math.PI / 2;
        cone.position.set(0, 1.3, 9);
        group.add(cone);
        lidarBeamRef.current = cone;
      }

      // High-power LED headlights
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), hlMat);
      hl1.position.set(-0.9, 0.9, 1.8);
      group.add(hl1);
      const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), hlMat);
      hl2.position.set(0.9, 0.9, 1.8);
      group.add(hl2);

      return group;
    };

    // Lead Scout Rover (Amber)
    const r1Mesh = createRoverMesh(0xf59e0b, true);
    r1Mesh.position.set(pos.start.x, 0, pos.start.y);
    scene.add(r1Mesh);
    rover1MeshRef.current = r1Mesh;

    // Delivery Unit AMR (Cyan)
    const r2Mesh = createRoverMesh(0x00f0ff, false);
    r2Mesh.position.set(pos.start.x, 0, pos.start.y - 4);
    scene.add(r2Mesh);
    rover2MeshRef.current = r2Mesh;

    // 7. Glowing 3D Trajectory Ribbon (A* Realtime Path)
    const pathMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 4.0,
    });
    const ribbon = new THREE.Line(new THREE.BufferGeometry(), pathMat);
    scene.add(ribbon);
    pathRibbonRef.current = ribbon;

    // 8. 60 FPS Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    const { r1Curve, r2AlphaCurve, r2BetaCurve } = getRouteCurves();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Advance continuous progress
      if (simStateRef.current.isPlaying) {
        simStateRef.current.progress += delta * 0.08 * simStateRef.current.speed;
        if (simStateRef.current.progress >= 1.0) {
          simStateRef.current.progress = 1.0;
          simStateRef.current.isPlaying = false;
          setIsPlaying(false);
        }
        setSimProgress(simStateRef.current.progress);
      }

      const t = simStateRef.current.progress;
      const isBlocked = simStateRef.current.isBlocked || t >= 0.38;

      // Update Hazard Visualizer
      if (hazardGroupRef.current) {
        hazardGroupRef.current.visible = isBlocked;
        if (isBlocked) {
          hazardGroupRef.current.rotation.y = elapsed * 1.5;
        }
      }

      // Rotate LiDAR beam for Scout
      if (lidarBeamRef.current) {
        lidarBeamRef.current.rotation.z = Math.sin(elapsed * 4.0) * 0.35;
      }

      // Rover 1 (Scout) Position
      if (rover1MeshRef.current) {
        const r1T = Math.min(0.96, t * 2.4);
        const pt = r1Curve.getPoint(r1T);
        rover1MeshRef.current.position.copy(pt);
        if (r1T < 0.95) {
          const nextPt = r1Curve.getPoint(Math.min(1.0, r1T + 0.02));
          rover1MeshRef.current.lookAt(nextPt.x, pt.y, nextPt.z);
        }
      }

      // Rover 2 (Delivery) Position & Reroute Logic
      if (rover2MeshRef.current) {
        let pt: THREE.Vector3;
        const willReroute = isBlocked && t >= 0.25;

        if (willReroute) {
          const r2T = Math.min(1.0, Math.max(0.0, (t - 0.04) * 1.05));
          pt = r2BetaCurve.getPoint(r2T);
          rover2MeshRef.current.position.copy(pt);
          if (r2T < 0.98) {
            const nextPt = r2BetaCurve.getPoint(Math.min(1.0, r2T + 0.02));
            rover2MeshRef.current.lookAt(nextPt.x, pt.y, nextPt.z);
          }
        } else {
          const r2T = Math.min(1.0, Math.max(0.0, (t - 0.04) * 1.05));
          pt = r2AlphaCurve.getPoint(r2T);
          rover2MeshRef.current.position.copy(pt);
          if (r2T < 0.98) {
            const nextPt = r2AlphaCurve.getPoint(Math.min(1.0, r2T + 0.02));
            rover2MeshRef.current.lookAt(nextPt.x, pt.y, nextPt.z);
          }
        }
      }

      // 3D Path Ribbon Update
      if (pathRibbonRef.current && rover2MeshRef.current) {
        const r2Pos = rover2MeshRef.current.position;
        const willReroute = isBlocked && t >= 0.25;
        let ribbonPoints: THREE.Vector3[] = [];

        if (willReroute) {
          ribbonPoints = [
            new THREE.Vector3(r2Pos.x, 0.4, r2Pos.z),
            new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
            new THREE.Vector3(pos.detourApproach.x, 0.4, pos.detourApproach.y),
            new THREE.Vector3(pos.detourEntry.x, 0.4, pos.detourEntry.y),
            new THREE.Vector3(pos.detourMid.x, 0.4, pos.detourMid.y),
            new THREE.Vector3(pos.detourExit.x, 0.4, pos.detourExit.y),
            new THREE.Vector3(pos.northApproach.x, 0.4, pos.northApproach.y),
            new THREE.Vector3(pos.goal.x, 0.4, pos.goal.y),
          ];
          (pathRibbonRef.current.material as THREE.LineBasicMaterial).color.setHex(0x00f0ff);
        } else {
          ribbonPoints = [
            new THREE.Vector3(r2Pos.x, 0.4, r2Pos.z),
            new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
            new THREE.Vector3(pos.primaryEntry.x, 0.4, pos.primaryEntry.y),
            new THREE.Vector3(pos.primaryMid.x, 0.4, pos.primaryMid.y),
            new THREE.Vector3(pos.primaryExit.x, 0.4, pos.primaryExit.y),
            new THREE.Vector3(pos.northApproach.x, 0.4, pos.northApproach.y),
            new THREE.Vector3(pos.goal.x, 0.4, pos.goal.y),
          ];
          (pathRibbonRef.current.material as THREE.LineBasicMaterial).color.setHex(
            isBlocked ? 0xf43f5e : 0x00f0ff
          );
        }
        pathRibbonRef.current.geometry.setFromPoints(ribbonPoints);
      }

      // Camera Modes
      if (cameraMode === "rover1" && rover1MeshRef.current) {
        const p = rover1MeshRef.current.position;
        camera.position.set(p.x, p.y + 11, p.z - 18);
        camera.lookAt(p.x, p.y + 2, p.z + 16);
      } else if (cameraMode === "rover2" && rover2MeshRef.current) {
        const p = rover2MeshRef.current.position;
        camera.position.set(p.x, p.y + 11, p.z - 18);
        camera.lookAt(p.x, p.y + 2, p.z + 16);
      } else if (cameraMode === "topdown") {
        camera.position.set(0, 125, 0);
        camera.lookAt(0, 0, 0);
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [scenario.id]);

  const handleTogglePlay = () => {
    if (simProgress >= 1.0) {
      simStateRef.current.progress = 0.0;
      setSimProgress(0.0);
    }
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    simStateRef.current.isPlaying = nextState;
  };

  const handleReset = () => {
    setIsPlaying(false);
    simStateRef.current.isPlaying = false;
    simStateRef.current.progress = 0.0;
    setSimProgress(0.0);
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(45, 42, -52);
      controlsRef.current.target.set(0, 2, 0);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    simStateRef.current.progress = val;
    setSimProgress(val);
  };

  const miniX = (x: number) => 100 + x * 2.3;
  const miniY = (y: number) => 65 - y * 1.4;

  const isRerouted = isBridgeBlocked || simProgress >= 0.38;

  return (
    <div className="relative w-full h-[84vh] min-h-[640px] bg-[#050811] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD with World Labs Model Badge & Status */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-md shadow-2xl flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isRerouted ? "bg-rose-400" : "bg-emerald-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isRerouted ? "bg-rose-500" : "bg-emerald-500"
                }`}
              ></span>
            </span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              {scenario.title}
            </span>
            <span className="text-[11px] text-slate-400 font-mono border-l border-slate-800 pl-2">
              {isRerouted ? `⛔ ${scenario.incidentTitle}` : "🟢 Optimal Route Clear"}
            </span>
          </div>

          {glbLoaded && (
            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md text-indigo-300 text-xs font-mono flex items-center gap-1.5 shadow-lg">
              <Box className="w-3.5 h-3.5 text-indigo-400" />
              <span>World Labs 3D Mesh Active ({glbSizeMB} MB)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRerouted && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
              <Timer className="w-3.5 h-3.5" />
              +{scenario.delayAvoided} Avoided
            </div>
          )}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-md text-cyan-300 text-xs font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Convex &lt;12ms Sync
          </div>
        </div>
      </div>

      {/* Floating 2D Overview Minimap */}
      <div className="absolute top-16 right-4 pointer-events-auto">
        {showMinimap ? (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 shadow-2xl backdrop-blur-md w-64">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Map className="w-3.5 h-3.5 text-cyan-400" />
                2D Nav Graph Overview
              </span>
              <button
                onClick={() => setShowMinimap(false)}
                className="text-slate-500 hover:text-slate-300 p-0.5"
              >
                ✕
              </button>
            </div>
            <svg viewBox="0 0 200 130" className="w-full h-28 bg-[#070b14] rounded border border-slate-900">
              {scenario.environmentType === "waterway_bridges" && (
                <rect x="0" y="50" width="200" height="30" fill="#0369a1" fillOpacity="0.4" />
              )}

              {/* Primary Path */}
              <path
                d={`M ${miniX(pos.start.x)} ${miniY(pos.start.y)}
                    L ${miniX(pos.fork.x)} ${miniY(pos.fork.y)}
                    L ${miniX(pos.primaryEntry.x)} ${miniY(pos.primaryEntry.y)}
                    L ${miniX(pos.primaryExit.x)} ${miniY(pos.primaryExit.y)}
                    L ${miniX(pos.northApproach.x)} ${miniY(pos.northApproach.y)}
                    L ${miniX(pos.goal.x)} ${miniY(pos.goal.y)}`}
                stroke={isRerouted ? "#f43f5e" : "#0284c7"}
                strokeWidth="2"
                strokeDasharray={isRerouted ? "3 2" : "none"}
                fill="none"
              />

              {/* Detour Path */}
              <path
                d={`M ${miniX(pos.fork.x)} ${miniY(pos.fork.y)}
                    L ${miniX(pos.detourApproach.x)} ${miniY(pos.detourApproach.y)}
                    L ${miniX(pos.detourExit.x)} ${miniY(pos.detourExit.y)}
                    L ${miniX(pos.northApproach.x)} ${miniY(pos.northApproach.y)}`}
                stroke="#00f0ff"
                strokeWidth="2"
                fill="none"
              />

              {/* Scout Rover Dot */}
              {rover1MeshRef.current && (
                <circle
                  cx={miniX(rover1MeshRef.current.position.x)}
                  cy={miniY(rover1MeshRef.current.position.z)}
                  r="4.5"
                  fill="#f59e0b"
                />
              )}

              {/* Delivery Rover Dot */}
              {rover2MeshRef.current && (
                <circle
                  cx={miniX(rover2MeshRef.current.position.x)}
                  cy={miniY(rover2MeshRef.current.position.z)}
                  r="4.5"
                  fill="#00f0ff"
                  className="animate-pulse"
                />
              )}
            </svg>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Scout (LiDAR)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Delivery AMR
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowMinimap(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 shadow-xl backdrop-blur-md"
          >
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            Show 2D Map
          </button>
        )}
      </div>

      {/* Floating Center-Bottom Mission Control Toolbar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto max-w-[95%]">
        {/* Timeline Scrubber */}
        <div className="w-full px-4 py-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl backdrop-blur-md flex items-center gap-3 shadow-xl">
          <span className="text-[10px] font-mono text-slate-400 min-w-[32px]">
            {(simProgress * 12.5).toFixed(1)}s
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={simProgress}
            onChange={handleScrub}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] font-mono text-slate-400 min-w-[32px]">12.5s</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-lg">
          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-lg ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? "Pause" : "▶ Start Demo"}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 4 : 1)}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1 transition-all"
            title="Toggle playback speed"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            {playbackSpeed}x
          </button>

          {/* Hazard Toggle */}
          <button
            onClick={() => onToggleBridge("Bridge_Alpha")}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
              isRerouted
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
            }`}
          >
            {isRerouted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            {isRerouted ? "Clear Hazard" : "Simulate Hazard"}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all"
            title="Reset Demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Camera Selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCameraMode("isometric")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                cameraMode === "isometric"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              3D Orbit
            </button>
            <button
              onClick={() => setCameraMode("rover1")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                cameraMode === "rover1"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Scout Cam
            </button>
            <button
              onClick={() => setCameraMode("rover2")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                cameraMode === "rover2"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Delivery Cam
            </button>
            <button
              onClick={() => setCameraMode("topdown")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                cameraMode === "topdown"
                  ? "bg-indigo-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tactical 2D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
