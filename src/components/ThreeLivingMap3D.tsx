import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Robot, Bridge, ScenarioDef } from '../types';
import { Camera, Eye, Video, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ThreeLivingMap3DProps {
  robots: Robot[];
  bridges: Bridge[];
  scenario: ScenarioDef;
  onToggleBridge: (bridgeId: string) => void;
}

export const ThreeLivingMap3D: React.FC<ThreeLivingMap3DProps> = ({
  robots,
  bridges,
  scenario,
  onToggleBridge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<"isometric" | "topdown" | "rover1" | "rover2">("isometric");

  const bridgeAlpha = bridges.find(b => b.bridgeId === "Bridge_Alpha");
  const alphaBlocked = bridgeAlpha?.isBlocked ?? false;

  const rover1 = robots.find(r => r.robotId === "Rover_1");
  const rover2 = robots.find(r => r.robotId === "Rover_2");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const rover1MeshRef = useRef<THREE.Group | null>(null);
  const rover2MeshRef = useRef<THREE.Group | null>(null);
  const bridgeAlphaDeckRef = useRef<THREE.Group | null>(null);
  const pathRibbonRef = useRef<THREE.Line | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const obstacleGroupRef = useRef<THREE.Group | null>(null);

  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: 0.785, phi: 0.85, radius: 105 });

  // Re-build 3D environment when scenario changes
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.007);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 500);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Common Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
    sunLight.position.set(40, 75, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const pos = scenario.positions;

    // ================= BUILD SCENARIO-SPECIFIC 3D WORLD =================
    if (scenario.environmentType === "waterway_bridges") {
      // -------------------------------------------------------------
      // 1. SF MISSION CREEK CANAL & TWIN PARALLEL BRIDGES
      // -------------------------------------------------------------
      // South Bank & North Bank
      const bankMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
      const southBank = new THREE.Mesh(new THREE.BoxGeometry(140, 4, 60), bankMat);
      southBank.position.set(0, -2, -35);
      southBank.receiveShadow = true;
      scene.add(southBank);

      const northBank = new THREE.Mesh(new THREE.BoxGeometry(140, 4, 60), bankMat);
      northBank.position.set(0, -2, 35);
      northBank.receiveShadow = true;
      scene.add(northBank);

      // Water Canal
      const waterGeo = new THREE.PlaneGeometry(140, 24, 64, 64);
      const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.85, transparent: true, opacity: 0.88 });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.set(0, -1.8, 0);
      scene.add(waterMesh);
      waterMeshRef.current = waterMesh;

      // Asphalt roads
      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const r1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 50), asphaltMat);
      r1.position.set(0, 0.1, -30);
      scene.add(r1);

      const rCrossS = new THREE.Mesh(new THREE.BoxGeometry(70, 0.2, 10), asphaltMat);
      rCrossS.position.set(2, 0.1, -12);
      scene.add(rCrossS);

      const rCrossN = new THREE.Mesh(new THREE.BoxGeometry(70, 0.2, 10), asphaltMat);
      rCrossN.position.set(2, 0.1, 26);
      scene.add(rCrossN);

      // --- BRIDGE 1: 4TH STREET BRIDGE (WEST / ALPHA) ---
      const bAlphaGrp = new THREE.Group();
      bAlphaGrp.position.set(-18, 0, 0);
      scene.add(bAlphaGrp);

      const pierGeo = new THREE.BoxGeometry(14, 6, 4);
      const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const pS = new THREE.Mesh(pierGeo, pierMat); pS.position.set(0, -2, -6); bAlphaGrp.add(pS);
      const pN = new THREE.Mesh(pierGeo, pierMat); pN.position.set(0, -2, 6); bAlphaGrp.add(pN);

      const alphaDeckGrp = new THREE.Group();
      alphaDeckGrp.position.set(0, 0.2, -6);
      bAlphaGrp.add(alphaDeckGrp);
      bridgeAlphaDeckRef.current = alphaDeckGrp;

      const alphaDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 20), asphaltMat);
      alphaDeck.position.set(0, 0, 10);
      alphaDeck.castShadow = true;
      alphaDeckGrp.add(alphaDeck);

      const trussMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
      const tL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 20), trussMat);
      tL.position.set(-4.6, 2.5, 10); alphaDeckGrp.add(tL);
      const tR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 20), trussMat);
      tR.position.set(4.6, 2.5, 10); alphaDeckGrp.add(tR);

      // --- BRIDGE 2: 3RD STREET BRIDGE (EAST / BETA) ---
      const bBetaGrp = new THREE.Group();
      bBetaGrp.position.set(22, 0, 0);
      scene.add(bBetaGrp);

      const betaDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 24), asphaltMat);
      betaDeck.position.set(0, 0.2, 0);
      betaDeck.castShadow = true;
      bBetaGrp.add(betaDeck);

      const bPierS = new THREE.Mesh(pierGeo, pierMat); bPierS.position.set(0, -2, -8); bBetaGrp.add(bPierS);
      const bPierN = new THREE.Mesh(pierGeo, pierMat); bPierN.position.set(0, -2, 8); bBetaGrp.add(bPierN);

      const betaTrussMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.7 });
      const btL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.5, 24), betaTrussMat);
      btL.position.set(-4.6, 3.2, 0); bBetaGrp.add(btL);
      const btR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.5, 24), betaTrussMat);
      btR.position.set(4.6, 3.2, 0); bBetaGrp.add(btR);

      // Barrier Mesh
      const barrierGrp = new THREE.Group();
      barrierGrp.position.set(-18, 0.5, -8);
      const bArm = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 0.2), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      bArm.position.set(0, 1.4, 0); barrierGrp.add(bArm);
      scene.add(barrierGrp);
      obstacleGroupRef.current = barrierGrp;

    } else if (scenario.environmentType === "urban_grid") {
      // -------------------------------------------------------------
      // 2. NYC SOHO URBAN GRID (MANHATTAN ALLEYWAYS & CAST-IRON BUILDINGS)
      // -------------------------------------------------------------
      bridgeAlphaDeckRef.current = null;
      waterMeshRef.current = null;

      // Solid Manhattan Ground
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const cityGround = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
      cityGround.rotation.x = -Math.PI / 2;
      cityGround.receiveShadow = true;
      scene.add(cityGround);

      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
      const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

      // Primary Narrow Alleyway (Mercer St - X = 0)
      const alleyRoad = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 80), asphaltMat);
      alleyRoad.position.set(0, 0.08, 0);
      scene.add(alleyRoad);

      // Detour Wide Avenue (Broadway - X = 26)
      const broadwayRoad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 80), asphaltMat);
      broadwayRoad.position.set(26, 0.08, 0);
      scene.add(broadwayRoad);

      // Crosstown connector streets (Prince St Z = -16, Spring St Z = 28)
      const princeSt = new THREE.Mesh(new THREE.BoxGeometry(70, 0.15, 12), asphaltMat);
      princeSt.position.set(13, 0.08, -16);
      scene.add(princeSt);

      const springSt = new THREE.Mesh(new THREE.BoxGeometry(70, 0.15, 12), asphaltMat);
      springSt.position.set(13, 0.08, 28);
      scene.add(springSt);

      // Historic Cast-Iron Brick Facades lining Mercer Alley
      const brickMat1 = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 }); // Red brick
      const brickMat2 = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }); // Cast iron dark
      const brickMat3 = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 }); // Brownstone

      const addBuilding = (x: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        b.position.set(x, h / 2, z);
        b.castShadow = true;
        b.receiveShadow = true;
        scene.add(b);
      };

      // West side of Mercer Alley
      addBuilding(-18, -35, 24, 28, 24, brickMat1);
      addBuilding(-18, 5, 24, 32, 40, brickMat2);
      addBuilding(-18, 42, 24, 26, 24, brickMat3);

      // Block between Mercer St and Broadway
      addBuilding(13, 5, 14, 30, 40, brickMat1);
      addBuilding(13, -35, 14, 24, 24, brickMat3);
      addBuilding(13, 42, 14, 28, 24, brickMat2);

      // East side of Broadway
      addBuilding(46, 5, 20, 36, 40, brickMat2);
      addBuilding(46, -35, 20, 30, 24, brickMat1);
      addBuilding(46, 42, 20, 32, 24, brickMat3);

      // Utility Trench Obstacle in Mercer Alley
      const trenchGrp = new THREE.Group();
      trenchGrp.position.set(0, 0.2, 0);

      // Dig Hole (Black recessed box)
      const hole = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.6, 6), new THREE.MeshBasicMaterial({ color: 0x050505 }));
      hole.position.set(0, -0.2, 0); trenchGrp.add(hole);

      // Dirt mound
      const dirt = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x573010, roughness: 0.95 }));
      dirt.position.set(2, 0.7, -1); trenchGrp.add(dirt);

      // Safety Cones
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
      [-3, -1, 1, 3].forEach((cx) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 8), coneMat);
        cone.position.set(cx, 0.6, -3.5); trenchGrp.add(cone);
      });

      scene.add(trenchGrp);
      obstacleGroupRef.current = trenchGrp;

    } else if (scenario.environmentType === "port_depot") {
      // -------------------------------------------------------------
      // 3. AUTOMATED PORT CONTAINER TERMINAL (HEAVY AGV FREIGHT DEPOT)
      // -------------------------------------------------------------
      bridgeAlphaDeckRef.current = null;
      waterMeshRef.current = null;

      // Industrial Concrete Apron Ground
      const portGround = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 160),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
      );
      portGround.rotation.x = -Math.PI / 2;
      portGround.receiveShadow = true;
      scene.add(portGround);

      // Heavy AGV guide lanes
      const laneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const laneAlpha = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 80), laneMat);
      laneAlpha.position.set(-15, 0.05, 0); scene.add(laneAlpha);

      const laneBeta = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 80), laneMat);
      laneBeta.position.set(18, 0.05, 0); scene.add(laneBeta);

      const crossS = new THREE.Mesh(new THREE.BoxGeometry(70, 0.1, 10), laneMat);
      crossS.position.set(2, 0.05, -12); scene.add(crossS);

      const crossN = new THREE.Mesh(new THREE.BoxGeometry(70, 0.1, 10), laneMat);
      crossN.position.set(2, 0.05, 26); scene.add(crossN);

      // Container Stack Builder (ISO 40ft containers: 3.5w x 3.5h x 12d)
      const containerColors = [0x0284c7, 0xdc2626, 0x16a34a, 0xeab308, 0x9333ea]; // Blue, Red, Green, Yellow, Purple

      const addContainerStack = (x: number, z: number, tiers: number, rows: number) => {
        for (let r = 0; r < rows; r++) {
          for (let t = 0; t < tiers; t++) {
            const col = containerColors[(t + r + Math.abs(x)) % containerColors.length];
            const cMat = new THREE.MeshStandardMaterial({ color: col, metalness: 0.4, roughness: 0.5 });
            const c = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 12), cMat);
            c.position.set(x + r * 3.8, t * 3.2 + 1.6, z);
            c.castShadow = true;
            c.receiveShadow = true;
            scene.add(c);
          }
        }
      };

      // West Yard Stacks
      addContainerStack(-38, -25, 4, 3);
      addContainerStack(-38, 15, 4, 3);

      // Central Stacks between Bay Alpha and Bay Beta
      addContainerStack(1, -25, 3, 2);
      addContainerStack(1, 15, 4, 2);

      // East Yard Stacks
      addContainerStack(38, -25, 4, 3);
      addContainerStack(38, 15, 4, 3);

      // Gantry Crane overhead steel portals
      const craneMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
      const addGantry = (z: number) => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 2), craneMat);
        beam.position.set(-15, 20, z); scene.add(beam);
        const legL = new THREE.Mesh(new THREE.BoxGeometry(2, 20, 2), craneMat);
        legL.position.set(-34, 10, z); scene.add(legL);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(2, 20, 2), craneMat);
        legR.position.set(4, 10, z); scene.add(legR);
      };
      addGantry(-15);
      addGantry(15);

      // Fallen / Spilled Shipping Container in Bay Alpha
      const spillGrp = new THREE.Group();
      spillGrp.position.set(-15, 0.2, 4);

      const tippedBox = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.5, roughness: 0.4 })
      );
      tippedBox.position.set(0, 1.8, 0);
      tippedBox.rotation.z = -0.55; // Tilted across lane
      tippedBox.rotation.y = 0.4;
      tippedBox.castShadow = true;
      spillGrp.add(tippedBox);

      // Hazard beacon
      const hLight = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      hLight.position.set(0, 4.5, 0); spillGrp.add(hLight);

      scene.add(spillGrp);
      obstacleGroupRef.current = spillGrp;
    }

    // ================= 3D ROBOT ROVERS =================
    const createRoverMesh = (colorHex: number, isScout: boolean) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 3.2), new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4 }));
      body.position.y = 0.8;
      body.castShadow = true;
      group.add(body);

      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.8), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      top.position.set(0, 1.5, 0);
      group.add(top);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
      [[-1.3, 0.5, -1], [1.3, 0.5, -1], [-1.3, 0.5, 1], [1.3, 0.5, 1]].forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, wy, wz);
        group.add(w);
      });

      // Lidar cone for Scout
      if (isScout) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(5, 12, 16, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
        );
        cone.rotation.x = -Math.PI / 2;
        cone.position.set(0, 1.2, 7);
        group.add(cone);
      }
      return group;
    };

    const r1Mesh = createRoverMesh(0xf59e0b, true);
    r1Mesh.position.set(pos.start.x, 0, pos.start.y);
    scene.add(r1Mesh);
    rover1MeshRef.current = r1Mesh;

    const r2Mesh = createRoverMesh(0x00f0ff, false);
    r2Mesh.position.set(pos.start.x, 0, pos.start.y - 4);
    scene.add(r2Mesh);
    rover2MeshRef.current = r2Mesh;

    // 3D Path Ribbon
    const pathMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3 });
    const ribbon = new THREE.Line(new THREE.BufferGeometry(), pathMat);
    scene.add(ribbon);
    pathRibbonRef.current = ribbon;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Water animation if present
      if (waterMeshRef.current) {
        const p = waterMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const u = p.getX(i);
          const v = p.getY(i);
          p.setZ(i, Math.sin(u * 0.15 + elapsedTime * 2) * 0.25 + Math.cos(v * 0.2 + elapsedTime * 1.5) * 0.2);
        }
        p.needsUpdate = true;
      }

      // Bascule lift if present
      if (bridgeAlphaDeckRef.current) {
        const targetRot = alphaBlocked ? -0.85 : 0.0;
        bridgeAlphaDeckRef.current.rotation.x = THREE.MathUtils.lerp(bridgeAlphaDeckRef.current.rotation.x, targetRot, 0.05);
      }

      // Obstacle hazard visibility
      if (obstacleGroupRef.current) {
        obstacleGroupRef.current.visible = alphaBlocked;
      }

      // Rover 1 and 2 positions in 3D
      if (rover1MeshRef.current && rover1) {
        rover1MeshRef.current.position.x = THREE.MathUtils.lerp(rover1MeshRef.current.position.x, rover1.position.x, 0.1);
        rover1MeshRef.current.position.z = THREE.MathUtils.lerp(rover1MeshRef.current.position.z, rover1.position.y, 0.1);
      }

      if (rover2MeshRef.current && rover2) {
        rover2MeshRef.current.position.x = THREE.MathUtils.lerp(rover2MeshRef.current.position.x, rover2.position.x, 0.1);
        rover2MeshRef.current.position.z = THREE.MathUtils.lerp(rover2MeshRef.current.position.z, rover2.position.y, 0.1);
      }

      // Dynamic Path Ribbon
      if (pathRibbonRef.current && rover2) {
        let pts: THREE.Vector3[] = [];
        const r2Pos = rover2MeshRef.current ? rover2MeshRef.current.position : new THREE.Vector3(pos.start.x, 0.4, pos.start.y);

        if (rover2.activeRoute === "VIA_BRIDGE_BETA") {
          pts = [
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
          pts = [
            new THREE.Vector3(r2Pos.x, 0.4, r2Pos.z),
            new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
            new THREE.Vector3(pos.primaryEntry.x, 0.4, pos.primaryEntry.y),
            new THREE.Vector3(pos.primaryMid.x, 0.4, pos.primaryMid.y),
            new THREE.Vector3(pos.primaryExit.x, 0.4, pos.primaryExit.y),
            new THREE.Vector3(pos.northApproach.x, 0.4, pos.northApproach.y),
            new THREE.Vector3(pos.goal.x, 0.4, pos.goal.y),
          ];
        }
        pathRibbonRef.current.geometry.setFromPoints(pts);
      }

      updateCameraPosition();
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

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;

    if (cameraMode === "rover1" && rover1MeshRef.current) {
      const p = rover1MeshRef.current.position;
      cameraRef.current.position.set(p.x, p.y + 12, p.z - 18);
      cameraRef.current.lookAt(p.x, p.y + 2, p.z + 20);
    } else if (cameraMode === "rover2" && rover2MeshRef.current) {
      const p = rover2MeshRef.current.position;
      cameraRef.current.position.set(p.x, p.y + 12, p.z - 18);
      cameraRef.current.lookAt(p.x, p.y + 2, p.z + 20);
    } else if (cameraMode === "topdown") {
      cameraRef.current.position.set(0, 110, 0);
      cameraRef.current.lookAt(0, 0, 0);
    } else {
      const { theta, phi, radius } = orbitAnglesRef.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cameraMode !== "isometric") return;
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || cameraMode !== "isometric") return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;

    orbitAnglesRef.current.theta -= dx * 0.006;
    orbitAnglesRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, orbitAnglesRef.current.phi - dy * 0.006));

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (cameraMode !== "isometric") return;
    orbitAnglesRef.current.radius = Math.max(30, Math.min(160, orbitAnglesRef.current.radius + e.deltaY * 0.08));
    updateCameraPosition();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Header with Camera Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '30s' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {scenario.title} — 3D Photorealistic Digital Twin
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                {scenario.environmentType.replace('_', ' ')}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {scenario.subtitle}
            </p>
          </div>
        </div>

        {/* Camera Views Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setCameraMode("isometric")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "isometric" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Tactical 3D
          </button>
          <button
            onClick={() => setCameraMode("rover1")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "rover1" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Rover 1 Cam
          </button>
          <button
            onClick={() => setCameraMode("rover2")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "rover2" ? "bg-cyan-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Rover 2 Cam
          </button>
          <button
            onClick={() => setCameraMode("topdown")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "topdown" ? "bg-indigo-500 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Top-Down
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        className="relative w-full aspect-[16/10] bg-[#070b14] rounded-xl border border-slate-800/90 overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* Floating Callout Badges */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800/80 rounded-lg p-2.5 text-[11px] font-mono shadow-xl backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${alphaBlocked ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
            <span className="text-white font-bold">{scenario.primaryName}</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            {alphaBlocked ? `⛔ ${scenario.incidentTitle}` : `🟢 CLEAR (${scenario.primaryDistance} Primary Route)`}
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-slate-950/85 border border-slate-800/80 rounded-lg p-2.5 text-[11px] font-mono shadow-xl backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-white font-bold">{scenario.detourName}</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            🟢 DETOUR CLEAR ({scenario.detourDistance} Corridor)
          </div>
        </div>

        <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          💡 Click & Drag to Orbit 360° • Scroll to Zoom
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Rover 1 (Lead Scout - Lidar Beam)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Rover 2 (Delivery - 3D Ribbon)</span>
          </div>
        </div>
        <button
          onClick={() => onToggleBridge("Bridge_Alpha")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            alphaBlocked
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
          }`}
        >
          {alphaBlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {alphaBlocked ? `Reopen ${scenario.primaryName}` : `Trigger ${scenario.incidentTitle}`}
        </button>
      </div>
    </div>
  );
};
