import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ScenarioDef } from '../types';
import { Camera, Eye, Video, Compass, AlertTriangle, CheckCircle2, Play, Pause, RotateCcw, Timer, Zap, Map, Sparkles, ExternalLink, FastForward } from 'lucide-react';

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
  const [simProgress, setSimProgress] = useState<number>(0); // 0.0 to 1.0
  const [cameraMode, setCameraMode] = useState<"isometric" | "topdown" | "rover1" | "rover2">("isometric");
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<number>(1.0);

  // Scene & animation refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const rover1MeshRef = useRef<THREE.Group | null>(null);
  const rover2MeshRef = useRef<THREE.Group | null>(null);
  const bridgeAlphaDeckRef = useRef<THREE.Group | null>(null);
  const pathRibbonRef = useRef<THREE.Line | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const obstacleGroupRef = useRef<THREE.Group | null>(null);

  // Simulation internal state ref for uninterrupted 60fps render loop
  const simStateRef = useRef({
    progress: 0.0,
    isPlaying: false,
    timeScale: 1.0,
    isBlocked: isBridgeBlocked,
    r1Pos: new THREE.Vector3(0, 0, -30),
    r2Pos: new THREE.Vector3(0, 0, -35),
    r1Status: "IDLE",
    r2Status: "IDLE",
    r2ActiveRoute: "VIA_BRIDGE_ALPHA",
  });

  // Keep ref synchronized with props
  useEffect(() => {
    simStateRef.current.isBlocked = isBridgeBlocked;
  }, [isBridgeBlocked]);

  useEffect(() => {
    simStateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    simStateRef.current.timeScale = timeScale;
  }, [timeScale]);

  const pos = scenario.positions;

  // Compute smooth parametric path curves for rovers
  const getRouteCurves = () => {
    // Lead Scout Route (Goes straight to Bridge Alpha / Primary)
    const r1Points = [
      new THREE.Vector3(pos.start.x, 0.4, pos.start.y),
      new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
      new THREE.Vector3(pos.primaryEntry.x, 0.4, pos.primaryEntry.y),
      new THREE.Vector3(pos.primaryMid.x, 0.4, pos.primaryMid.y),
    ];
    const r1Curve = new THREE.CatmullRomCurve3(r1Points);

    // Rover 2 Primary Route (Via Bridge Alpha)
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

    // Rover 2 Detour Route (Via Bridge Beta / Detour Corridor)
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

  // Build Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 800);
    camera.position.set(50, 45, -55);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 15;
    controls.maxDistance = 180;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // 1. Equirectangular Skybox & Environment Map
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/scene_pano.png', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    }, undefined, () => {
      // Fallback gradient background if texture not loaded
      scene.background = new THREE.Color(0x070d1a);
    });

    // 2. Photorealistic Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffaed, 1.8);
    sun.position.set(50, 90, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0005;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 250;
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    scene.add(sun);

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-50, 40, -40);
    scene.add(fillLight);

    // 3. Optional World Labs Collider GLTF/GLB Loader
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/assets/scene_collider.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.2, 0.2, 0.2); // Scaled appropriately
      model.position.set(0, -1.0, 0);
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      // Add subtle background digital twin reference layer
      model.visible = false; // Kept in stage for physics reference
      scene.add(model);
    }, undefined, () => {
      console.log("Using procedural high-resolution geometry");
    });

    // ================= HIGH-RESOLUTION PROCEDURAL WORLD =================
    // South and North Terrains
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090e1a,
      roughness: 0.95,
      metalness: 0.05,
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.1,
    });

    if (scenario.environmentType === "waterway_bridges") {
      // ---------------- SF MISSION CREEK CANAL & TWIN BRIDGES ----------------
      // Shorelines
      const southBank = new THREE.Mesh(new THREE.BoxGeometry(170, 4, 70), groundMat);
      southBank.position.set(0, -2, -43);
      southBank.receiveShadow = true;
      scene.add(southBank);

      const northBank = new THREE.Mesh(new THREE.BoxGeometry(170, 4, 70), groundMat);
      northBank.position.set(0, -2, 43);
      northBank.receiveShadow = true;
      scene.add(northBank);

      // Concrete Canal Retaining Walls
      const sWall = new THREE.Mesh(new THREE.BoxGeometry(170, 4.5, 2), concreteMat);
      sWall.position.set(0, -0.25, -8);
      sWall.castShadow = true;
      scene.add(sWall);

      const nWall = new THREE.Mesh(new THREE.BoxGeometry(170, 4.5, 2), concreteMat);
      nWall.position.set(0, -0.25, 8);
      nWall.castShadow = true;
      scene.add(nWall);

      // Water Canal (Deep blue with wave vertex animation)
      const waterGeo = new THREE.PlaneGeometry(170, 30, 80, 80);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.05,
        metalness: 0.95,
        transparent: true,
        opacity: 0.92,
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, -1.8, 0);
      water.receiveShadow = true;
      scene.add(water);
      waterMeshRef.current = water;

      // Asphalt Road Networks
      const southSpine = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 50), asphaltMat);
      southSpine.position.set(0, 0.1, -32);
      southSpine.receiveShadow = true;
      scene.add(southSpine);

      const southCross = new THREE.Mesh(new THREE.BoxGeometry(80, 0.25, 10), asphaltMat);
      southCross.position.set(2, 0.1, -12);
      southCross.receiveShadow = true;
      scene.add(southCross);

      const northCross = new THREE.Mesh(new THREE.BoxGeometry(80, 0.25, 10), asphaltMat);
      northCross.position.set(2, 0.1, 26);
      northCross.receiveShadow = true;
      scene.add(northCross);

      const northSpine = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 40), asphaltMat);
      northSpine.position.set(0, 0.1, 40);
      northSpine.receiveShadow = true;
      scene.add(northSpine);

      // --- BRIDGE 1: 4TH STREET BRIDGE (WEST / ALPHA - 88m Route) ---
      const bAlpha = new THREE.Group();
      bAlpha.position.set(-18, 0, 0);
      scene.add(bAlpha);

      // Piers
      const pS = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 4), concreteMat);
      pS.position.set(0, -2, -7);
      bAlpha.add(pS);
      const pN = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 4), concreteMat);
      pN.position.set(0, -2, 7);
      bAlpha.add(pN);

      // Bascule Pivot Arm Deck (LIFTS UP 50 DEGREES WHEN BLOCKED!)
      const alphaDeckGrp = new THREE.Group();
      alphaDeckGrp.position.set(0, 0.2, -7);
      bAlpha.add(alphaDeckGrp);
      bridgeAlphaDeckRef.current = alphaDeckGrp;

      const alphaDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 22), asphaltMat);
      alphaDeck.position.set(0, 0, 11);
      alphaDeck.castShadow = true;
      alphaDeck.receiveShadow = true;
      alphaDeckGrp.add(alphaDeck);

      // Blue Steel Bascule Trusses
      const trussMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
      const tL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 22), trussMat);
      tL.position.set(-4.6, 2.75, 11);
      alphaDeckGrp.add(tL);
      const tR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 22), trussMat);
      tR.position.set(4.6, 2.75, 11);
      alphaDeckGrp.add(tR);

      // Yellow Center Road Striping
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 20), stripeMat);
      stripe1.position.set(0, 0.35, 11);
      alphaDeckGrp.add(stripe1);

      // --- BRIDGE 2: 3RD STREET BRIDGE (EAST / BETA - 120m Detour Route) ---
      const bBeta = new THREE.Group();
      bBeta.position.set(22, 0, 0);
      scene.add(bBeta);

      const betaDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 26), asphaltMat);
      betaDeck.position.set(0, 0.2, 0);
      betaDeck.castShadow = true;
      betaDeck.receiveShadow = true;
      bBeta.add(betaDeck);

      const bpS = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 4), concreteMat);
      bpS.position.set(0, -2, -9);
      bBeta.add(bpS);
      const bpN = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 4), concreteMat);
      bpN.position.set(0, -2, 9);
      bBeta.add(bpN);

      // Distinct Cyan Scherzer Rolling Lift Arch Trusses
      const betaTrussMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.8, roughness: 0.2 });
      const btL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7.5, 26), betaTrussMat);
      btL.position.set(-4.6, 3.75, 0);
      bBeta.add(btL);
      const btR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7.5, 26), betaTrussMat);
      btR.position.set(4.6, 3.75, 0);
      bBeta.add(btR);

      const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 24), stripeMat);
      stripe2.position.set(0, 0.55, 0);
      bBeta.add(stripe2);

      // Barrier Barricade for Bridge Alpha
      const barrier = new THREE.Group();
      barrier.position.set(-18, 0.5, -9);
      const barArm = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      barArm.position.set(0, 1.4, 0);
      barrier.add(barArm);
      const hazLight = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      hazLight.position.set(0, 2.4, 0);
      barrier.add(hazLight);
      scene.add(barrier);
      obstacleGroupRef.current = barrier;

      // Waterfront buildings
      const addBldg = (x: number, z: number, w: number, h: number, d: number) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), concreteMat);
        b.position.set(x, h / 2, z);
        b.castShadow = true;
        scene.add(b);
      };
      addBldg(-50, -40, 26, 22, 30);
      addBldg(50, -40, 26, 18, 30);
      addBldg(-50, 40, 26, 26, 30);
      addBldg(50, 40, 26, 32, 30);

    } else if (scenario.environmentType === "urban_grid") {
      // ---------------- NYC SOHO URBAN CANYON ----------------
      bridgeAlphaDeckRef.current = null;
      waterMeshRef.current = null;

      const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      const alley = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 80), asphaltMat);
      alley.position.set(0, 0.08, 0);
      scene.add(alley);

      const broadway = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 80), asphaltMat);
      broadway.position.set(26, 0.08, 0);
      scene.add(broadway);

      const prince = new THREE.Mesh(new THREE.BoxGeometry(80, 0.15, 12), asphaltMat);
      prince.position.set(13, 0.08, -16);
      scene.add(prince);

      const spring = new THREE.Mesh(new THREE.BoxGeometry(80, 0.15, 12), asphaltMat);
      spring.position.set(13, 0.08, 28);
      scene.add(spring);

      // Red brick facades
      const redBrick = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.85 });
      const castIron = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 });
      const addSohoBldg = (x: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        b.position.set(x, h / 2, z);
        b.castShadow = true;
        scene.add(b);
      };

      addSohoBldg(-18, -35, 24, 30, 24, redBrick);
      addSohoBldg(-18, 5, 24, 35, 40, castIron);
      addSohoBldg(13, 5, 14, 32, 40, redBrick);
      addSohoBldg(46, 5, 20, 38, 40, castIron);

      const trench = new THREE.Group();
      trench.position.set(0, 0.2, 0);
      const hole = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.6, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      hole.position.set(0, -0.2, 0);
      trench.add(hole);
      scene.add(trench);
      obstacleGroupRef.current = trench;

    } else if (scenario.environmentType === "port_depot") {
      // ---------------- PORT CONTAINER TERMINAL ----------------
      bridgeAlphaDeckRef.current = null;
      waterMeshRef.current = null;

      const portFloor = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), concreteMat);
      portFloor.rotation.x = -Math.PI / 2;
      portFloor.receiveShadow = true;
      scene.add(portFloor);

      const laneA = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 80), asphaltMat);
      laneA.position.set(-15, 0.05, 0);
      scene.add(laneA);

      const laneB = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 80), asphaltMat);
      laneB.position.set(18, 0.05, 0);
      scene.add(laneB);

      const crossS = new THREE.Mesh(new THREE.BoxGeometry(80, 0.1, 10), asphaltMat);
      crossS.position.set(2, 0.05, -12);
      scene.add(crossS);

      const colors = [0x0284c7, 0xdc2626, 0x16a34a, 0xeab308];
      const addContainers = (x: number, z: number, tiers: number, rows: number) => {
        for (let r = 0; r < rows; r++) {
          for (let t = 0; t < tiers; t++) {
            const col = colors[(t + r + Math.abs(x)) % colors.length];
            const c = new THREE.Mesh(
              new THREE.BoxGeometry(3.6, 3.2, 12),
              new THREE.MeshStandardMaterial({ color: col, metalness: 0.5, roughness: 0.4 })
            );
            c.position.set(x + r * 3.8, t * 3.2 + 1.6, z);
            c.castShadow = true;
            scene.add(c);
          }
        }
      };
      addContainers(-38, -25, 4, 3);
      addContainers(-38, 15, 4, 3);
      addContainers(1, 0, 3, 2);
      addContainers(38, 0, 4, 3);

      const spill = new THREE.Group();
      spill.position.set(-15, 0.2, 4);
      const tipped = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xdc2626 })
      );
      tipped.position.set(0, 1.8, 0);
      tipped.rotation.z = -0.55;
      spill.add(tipped);
      scene.add(spill);
      obstacleGroupRef.current = spill;
    }

    // ================= DETAILED 3D ROVER MODELS =================
    const createRoverMesh = (colorHex: number, isScout: boolean) => {
      const group = new THREE.Group();

      // Main Chassis
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.0, 3.4),
        new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.6, roughness: 0.25 })
      );
      body.position.y = 0.8;
      body.castShadow = true;
      group.add(body);

      // Carbon Fiber Top Shell
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 })
      );
      top.position.set(0, 1.5, 0);
      group.add(top);

      // Rubber Tires with Rims
      const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 18);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
      const rimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.46, 12);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });

      [[-1.35, 0.55, -1.1], [1.35, 0.55, -1.1], [-1.35, 0.55, 1.1], [1.35, 0.55, 1.1]].forEach(([wx, wy, wz]) => {
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

      // Lidar Puck with Active Spinning Laser Fan
      const lidar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
      );
      lidar.position.set(0, 2.0, -0.4);
      group.add(lidar);

      if (isScout) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(5.5, 14, 16, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
        );
        cone.rotation.x = -Math.PI / 2;
        cone.position.set(0, 1.2, 8);
        group.add(cone);
      }

      // High-intensity LED Headlights
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), hlMat);
      hl1.position.set(-0.85, 0.85, 1.7);
      group.add(hl1);
      const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), hlMat);
      hl2.position.set(0.85, 0.85, 1.7);
      group.add(hl2);

      return group;
    };

    const r1Mesh = createRoverMesh(0xf59e0b, true); // Rover 1 (Scout)
    r1Mesh.position.set(pos.start.x, 0, pos.start.y);
    scene.add(r1Mesh);
    rover1MeshRef.current = r1Mesh;

    const r2Mesh = createRoverMesh(0x00f0ff, false); // Rover 2 (Delivery)
    r2Mesh.position.set(pos.start.x, 0, pos.start.y - 4);
    scene.add(r2Mesh);
    rover2MeshRef.current = r2Mesh;

    // Glowing 3D Neon Path Ribbon
    const pathMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3.5 });
    const ribbon = new THREE.Line(new THREE.BufferGeometry(), pathMat);
    scene.add(ribbon);
    pathRibbonRef.current = ribbon;

    // ================= CONTINUOUS TIME-BASED NAVIGATION ENGINE =================
    let animationFrameId: number;
    let clock = new THREE.Clock();
    const { r1Curve, r2AlphaCurve, r2BetaCurve } = getRouteCurves();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Advance continuous simulation progress when playing
      if (simStateRef.current.isPlaying) {
        simStateRef.current.progress += (delta * 0.08 * simStateRef.current.timeScale);
        if (simStateRef.current.progress >= 1.0) {
          simStateRef.current.progress = 1.0;
          simStateRef.current.isPlaying = false;
          setIsPlaying(false);
        }
        setSimProgress(simStateRef.current.progress);
      }

      const t = simStateRef.current.progress;

      // 1. Water waves
      if (waterMeshRef.current) {
        const p = waterMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const u = p.getX(i);
          const v = p.getY(i);
          p.setZ(i, Math.sin(u * 0.15 + elapsed * 2.2) * 0.28 + Math.cos(v * 0.2 + elapsed * 1.8) * 0.22);
        }
        p.needsUpdate = true;
      }

      // 2. Obstacle & Bridge Bascule Lift Dynamics
      const isBlocked = simStateRef.current.isBlocked || t >= 0.38; // Automatically triggers when scout arrives!
      if (bridgeAlphaDeckRef.current) {
        const targetAngle = isBlocked ? -0.85 : 0.0;
        bridgeAlphaDeckRef.current.rotation.x = THREE.MathUtils.lerp(bridgeAlphaDeckRef.current.rotation.x, targetAngle, 0.06);
      }

      if (obstacleGroupRef.current) {
        obstacleGroupRef.current.visible = isBlocked;
      }

      // 3. Rover 1 (Scout) Position: Moves from 0% to 40% where it reaches barrier and halts
      if (rover1MeshRef.current) {
        const r1T = Math.min(0.95, t * 2.5); // Fast lead scout
        const pt = r1Curve.getPoint(r1T);
        rover1MeshRef.current.position.copy(pt);

        // Compute heading orientation
        if (r1T < 0.94) {
          const nextPt = r1Curve.getPoint(Math.min(1.0, r1T + 0.02));
          rover1MeshRef.current.lookAt(nextPt.x, pt.y, nextPt.z);
        }
      }

      // 4. Rover 2 (Delivery Unit) Position & Reroute Logic
      if (rover2MeshRef.current) {
        let pt: THREE.Vector3;
        const willReroute = isBlocked && t >= 0.25;

        if (willReroute) {
          // Trailing rover detours smoothly via Bridge Beta!
          const r2T = Math.min(1.0, Math.max(0.0, (t - 0.05) * 1.05));
          pt = r2BetaCurve.getPoint(r2T);
          rover2MeshRef.current.position.copy(pt);

          if (r2T < 0.98) {
            const nextPt = r2BetaCurve.getPoint(Math.min(1.0, r2T + 0.02));
            rover2MeshRef.current.lookAt(nextPt.x, pt.y, nextPt.z);
          }
        } else {
          // Normal route via Bridge Alpha
          const r2T = Math.min(1.0, Math.max(0.0, (t - 0.05) * 1.05));
          pt = r2AlphaCurve.getPoint(r2T);
          rover2MeshRef.current.position.copy(pt);

          if (r2T < 0.98) {
            const nextPt = r2AlphaCurve.getPoint(Math.min(1.0, r2T + 0.02));
            rover2MeshRef.current.lookAt(nextPt.x, pt.y, nextPt.z);
          }
        }
      }

      // 5. Dynamic 3D Path Ribbon Update
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
        }
        pathRibbonRef.current.geometry.setFromPoints(ribbonPoints);
      }

      // 6. Camera Follow Controller
      if (cameraMode === "rover1" && rover1MeshRef.current) {
        const p = rover1MeshRef.current.position;
        camera.position.set(p.x, p.y + 10, p.z - 16);
        camera.lookAt(p.x, p.y + 2, p.z + 16);
      } else if (cameraMode === "rover2" && rover2MeshRef.current) {
        const p = rover2MeshRef.current.position;
        camera.position.set(p.x, p.y + 10, p.z - 16);
        camera.lookAt(p.x, p.y + 2, p.z + 16);
      } else if (cameraMode === "topdown") {
        camera.position.set(0, 115, 0);
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

  // Controls Handlers
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
      cameraRef.current.position.set(50, 45, -55);
      controlsRef.current.target.set(0, 2, 0);
    }
  };

  // 2D Minimap coordinates
  const miniX = (x: number) => 100 + (x * 2.3);
  const miniY = (y: number) => 65 - (y * 1.4);

  const isRerouted = isBridgeBlocked || simProgress >= 0.38;

  return (
    <div className="relative w-full h-[82vh] min-h-[620px] bg-[#050811] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRerouted ? "bg-rose-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRerouted ? "bg-rose-500" : "bg-emerald-500"}`}></span>
            </span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              {scenario.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono border-l border-slate-800 pl-2">
              {isRerouted ? `⛔ ${scenario.incidentTitle}` : "🟢 All Paths Clear"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRerouted && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
              <Timer className="w-3.5 h-3.5" />
              +{scenario.delayAvoided} Saved
            </div>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md text-indigo-300 text-xs font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Convex &lt;12ms
          </div>
        </div>
      </div>

      {/* Floating 2D Overview Minimap */}
      <div className="absolute top-16 right-4 pointer-events-auto">
        {showMinimap ? (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2.5 shadow-2xl backdrop-blur-md w-60">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Map className="w-3 h-3 text-cyan-400" />
                2D Overview Minimap
              </span>
              <button onClick={() => setShowMinimap(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <svg viewBox="0 0 200 130" className="w-full h-28 bg-[#070b14] rounded border border-slate-900">
              {scenario.environmentType === "waterway_bridges" && (
                <rect x="0" y="50" width="200" height="30" fill="#0369a1" fillOpacity="0.4" />
              )}
              
              <path
                d={`M ${miniX(pos.start.x)} ${miniY(pos.start.y)}
                    L ${miniX(pos.fork.x)} ${miniY(pos.fork.y)}
                    L ${miniX(pos.primaryEntry.x)} ${miniY(pos.primaryEntry.y)}
                    L ${miniX(pos.primaryExit.x)} ${miniY(pos.primaryExit.y)}
                    L ${miniX(pos.northApproach.x)} ${miniY(pos.northApproach.y)}
                    L ${miniX(pos.goal.x)} ${miniY(pos.goal.y)}`}
                stroke={isRerouted ? "#f43f5e" : "#334155"}
                strokeWidth="2"
                strokeDasharray={isRerouted ? "3 2" : "none"}
                fill="none"
              />

              <path
                d={`M ${miniX(pos.fork.x)} ${miniY(pos.fork.y)}
                    L ${miniX(pos.detourApproach.x)} ${miniY(pos.detourApproach.y)}
                    L ${miniX(pos.detourExit.x)} ${miniY(pos.detourExit.y)}
                    L ${miniX(pos.northApproach.x)} ${miniY(pos.northApproach.y)}`}
                stroke="#00f0ff"
                strokeWidth="2"
                fill="none"
              />

              {rover1MeshRef.current && (
                <circle cx={miniX(rover1MeshRef.current.position.x)} cy={miniY(rover1MeshRef.current.position.z)} r="4" fill="#f59e0b" />
              )}
              {rover2MeshRef.current && (
                <circle cx={miniX(rover2MeshRef.current.position.x)} cy={miniY(rover2MeshRef.current.position.z)} r="4" fill="#00f0ff" className="animate-pulse" />
              )}
            </svg>
          </div>
        ) : (
          <button
            onClick={() => setShowMinimap(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 shadow-xl backdrop-blur-md"
          >
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            Show 2D Map
          </button>
        )}
      </div>

      {/* Floating Center-Bottom Mission Action Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-lg pointer-events-auto">
        {/* Play / Pause */}
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

        {/* Hazard / Obstacle Toggle */}
        <button
          onClick={() => onToggleBridge("Bridge_Alpha")}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
            isRerouted
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
          }`}
        >
          {isRerouted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          {isRerouted ? "Clear Hazard" : "Lift Bridge / Hazard"}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all"
          title="Reset Demo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Speed toggle */}
        <button
          onClick={() => setTimeScale(timeScale === 1.0 ? 2.0 : 1.0)}
          className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
            timeScale === 2.0 ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
          title="Simulation Speed"
        >
          {timeScale}x
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Camera Angles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCameraMode("isometric")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              cameraMode === "isometric" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            3D Orbit
          </button>
          <button
            onClick={() => setCameraMode("rover1")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              cameraMode === "rover1" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Scout Cam
          </button>
          <button
            onClick={() => setCameraMode("rover2")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              cameraMode === "rover2" ? "bg-cyan-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Delivery Cam
          </button>
        </div>
      </div>
    </div>
  );
};
