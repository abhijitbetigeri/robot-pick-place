import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RealEstateListing, PlacedObject } from '../types';
import { MeshFactory } from './MeshFactory';
import {
  Move,
  RotateCw,
  Maximize2,
  Trash2,
  Copy,
  Eye,
  Camera,
  Grid,
  Box,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Footprints,
  ArrowDownToLine,
  ExternalLink,
} from 'lucide-react';

interface Viewport3DProps {
  listing: RealEstateListing;
  objects: PlacedObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: PlacedObject) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  transformMode: "translate" | "rotate" | "scale";
  onChangeTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  viewMode: "perspective" | "topdown" | "robot_fpv" | "wireframe_physics";
  onChangeViewMode: (mode: "perspective" | "topdown" | "robot_fpv" | "wireframe_physics") => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  listing,
  objects,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  transformMode,
  onChangeTransformMode,
  viewMode,
  onChangeViewMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);
  const marble3dGroupRef = useRef<THREE.Group | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const selectionBoxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const physicsWireframeGroupRef = useRef<THREE.Group | null>(null);

  const [lightingPreset, setLightingPreset] = useState<'day' | 'golden_hour' | 'night'>('day');
  const [showWorldLabs3D, setShowWorldLabs3D] = useState<boolean>(true);

  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Keep latest props in refs for event listeners
  const objectsRef = useRef<PlacedObject[]>(objects);
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  const selectedIdRef = useRef<string | null>(selectedObjectId);
  useEffect(() => {
    selectedIdRef.current = selectedObjectId;
  }, [selectedObjectId]);

  // Keyboard movement state for FPS Walkthrough
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // --- INITIALIZE THREE.JS SCENE ---
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    camera.position.set(7.5, 7.0, 9.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // Orbit Controls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbit.maxPolarAngle = Math.PI / 2.02;
    orbit.minDistance = 1.5;
    orbit.maxDistance = 50;
    orbit.target.set(0, 1.2, 0);
    orbitControlsRef.current = orbit;

    // Transform Controls (Gizmo)
    const transform = new TransformControls(camera, renderer.domElement);
    transform.size = 0.75;
    transform.space = "world";
    transformControlsRef.current = transform;
    scene.add(transform.getHelper());

    let isGizmoDragging = false;
    transform.addEventListener("dragging-changed", (event) => {
      isGizmoDragging = Boolean(event.value);
      orbit.enabled = !event.value;
    });

    transform.addEventListener("objectChange", () => {
      if (!transform.object || !selectedIdRef.current) return;
      const tObj = transform.object;
      const currentObj = objectsRef.current.find((o) => o.id === selectedIdRef.current);
      if (currentObj) {
        const updated: PlacedObject = {
          ...currentObj,
          position: { x: tObj.position.x, y: tObj.position.y, z: tObj.position.z },
          rotation: { x: tObj.rotation.x, y: tObj.rotation.y, z: tObj.rotation.z },
          scale: { x: tObj.scale.x, y: tObj.scale.y, z: tObj.scale.z },
        };
        onUpdateObject(updated);
      }
    });

    // PBR Lighting
    const ambient = new THREE.AmbientLight(0xfff7ed, 0.8);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    const sun = new THREE.DirectionalLight(0xffedd5, 2.0);
    sun.position.set(10, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0003;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    scene.add(sun);
    sunLightRef.current = sun;

    // Architectural Downlights
    const warmCeilingSpot = new THREE.SpotLight(0xfffaed, 1.2, 16, Math.PI / 3, 0.8, 1);
    warmCeilingSpot.position.set(0, 3.4, 0);
    warmCeilingSpot.target.position.set(0, 0, 0);
    scene.add(warmCeilingSpot);
    scene.add(warmCeilingSpot.target);

    // Architectural Room Shell Group
    const roomGroup = new THREE.Group();
    roomGroup.name = "Architectural_Shell";
    scene.add(roomGroup);
    roomGroupRef.current = roomGroup;

    // World Labs 3D Generative Mesh Group
    const marbleGroup = new THREE.Group();
    marbleGroup.name = "World_Labs_3D_Mesh";
    scene.add(marbleGroup);
    marble3dGroupRef.current = marbleGroup;

    // Objects Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // Physics Wireframe Group
    const wireframeGroup = new THREE.Group();
    wireframeGroup.visible = false;
    scene.add(wireframeGroup);
    physicsWireframeGroupRef.current = wireframeGroup;

    // Selection Box Helper
    const boxHelper = new THREE.BoxHelper(new THREE.Object3D(), 0x00f0ff);
    boxHelper.visible = false;
    scene.add(boxHelper);
    selectionBoxHelperRef.current = boxHelper;

    // Raycasting for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      if (isGizmoDragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (!objectsGroupRef.current) return;

      const intersects = raycaster.intersectObjects(objectsGroupRef.current.children, true);
      if (intersects.length > 0) {
        let topGroup: THREE.Object3D | null = intersects[0].object;
        while (topGroup && topGroup.parent !== objectsGroupRef.current) {
          topGroup = topGroup.parent;
        }
        if (topGroup && topGroup.userData?.id) {
          onSelectObject(topGroup.userData.id);
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // FPS Walkthrough movement
      if (viewMode === "robot_fpv" && cameraRef.current) {
        const moveSpeed = 4.0 * delta;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        if (keysPressed.current["w"] || keysPressed.current["W"] || keysPressed.current["ArrowUp"]) {
          camera.position.addScaledVector(forward, moveSpeed);
        }
        if (keysPressed.current["s"] || keysPressed.current["S"] || keysPressed.current["ArrowDown"]) {
          camera.position.addScaledVector(forward, -moveSpeed);
        }
        if (keysPressed.current["a"] || keysPressed.current["A"] || keysPressed.current["ArrowLeft"]) {
          camera.position.addScaledVector(right, -moveSpeed);
        }
        if (keysPressed.current["d"] || keysPressed.current["D"] || keysPressed.current["ArrowRight"]) {
          camera.position.addScaledVector(right, moveSpeed);
        }
      } else {
        orbit.update();
      }

      if (selectionBoxHelperRef.current && selectionBoxHelperRef.current.visible) {
        selectionBoxHelperRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // --- REBUILD ROOM & WORLD LABS 3D MESH REACTIVELY ON LISTING CHANGE ---
  useEffect(() => {
    if (!sceneRef.current || !roomGroupRef.current || !marble3dGroupRef.current) return;

    // 1. Rebuild architectural room geometry
    buildPhotorealisticRoom(sceneRef.current, listing);

    // 2. Load World Labs 3D GLTF Collider Mesh if available
    const marbleGroup = marble3dGroupRef.current;
    marbleGroup.clear();

    if (listing.glbUrl && showWorldLabs3D) {
      const loader = new GLTFLoader();
      loader.load(
        listing.glbUrl,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(0, 0, 0);

          // Compute bounding box to scale naturally into room
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.z);
          const targetDim = Math.max(listing.metricBounds.widthMeters, listing.metricBounds.depthMeters) * 0.95;
          const scale = maxDim > 0 ? targetDim / maxDim : 1;
          model.scale.set(scale, scale, scale);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                (mesh.material as THREE.Material).transparent = true;
                (mesh.material as THREE.Material).opacity = 0.85;
              }
            }
          });

          marbleGroup.add(model);
        },
        undefined,
        (err) => console.log("Notice: No custom GLB found for listing, using PBR spatial room", err)
      );
    }

    // 3. Re-frame camera and orbit controls to fit new room bounds
    if (cameraRef.current && orbitControlsRef.current) {
      const w = listing.metricBounds.widthMeters;
      const d = listing.metricBounds.depthMeters;
      const h = listing.metricBounds.ceilingHeightMeters;

      orbitControlsRef.current.target.set(0, h * 0.35, 0);
      cameraRef.current.position.set(w * 0.65, h * 1.8, d * 0.85);
      cameraRef.current.lookAt(0, h * 0.35, 0);
      orbitControlsRef.current.update();
    }
  }, [listing, showWorldLabs3D]);

  // --- PHOTOREALISTIC ARCHITECTURAL ROOM ---
  const buildPhotorealisticRoom = (scene: THREE.Scene, list: RealEstateListing) => {
    if (!roomGroupRef.current) return;
    const roomGroup = roomGroupRef.current;
    roomGroup.clear();

    const w = list.metricBounds.widthMeters;
    const d = list.metricBounds.depthMeters;
    const h = list.metricBounds.ceilingHeightMeters;

    // 1. European Parquet Hardwood Floor with High-End PBR Gloss
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#451a03';
    fCtx.fillRect(0, 0, 512, 512);

    // Wide plank herringbone wood tiles
    fCtx.strokeStyle = '#271e18';
    fCtx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 128) {
        fCtx.strokeRect(x, y, 64, 128);
        fCtx.fillStyle = (x + y) % 128 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
        fCtx.fillRect(x, y, 64, 128);
      }
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(w / 2.5, d / 2.5);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.35,
      metalness: 0.08,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // 2. High-End Wool Area Rug under Living Room
    const rugCanvas = document.createElement('canvas');
    rugCanvas.width = 256;
    rugCanvas.height = 256;
    const rCtx = rugCanvas.getContext('2d')!;
    rCtx.fillStyle = '#e2e8f0';
    rCtx.fillRect(0, 0, 256, 256);
    rCtx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    rCtx.lineWidth = 4;
    for (let x = 0; x < 256; x += 16) {
      rCtx.beginPath();
      rCtx.moveTo(x, 0);
      rCtx.lineTo(x, 256);
      rCtx.stroke();
    }
    const rugTex = new THREE.CanvasTexture(rugCanvas);
    rugTex.wrapS = THREE.RepeatWrapping;
    rugTex.wrapT = THREE.RepeatWrapping;
    rugTex.repeat.set(3, 4);

    const rugMat = new THREE.MeshStandardMaterial({
      map: rugTex,
      roughness: 0.95,
      metalness: 0.0,
      color: 0xf1f5f9,
    });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.38, d * 0.45), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-w * 0.2, 0.005, 0.5);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // 3. Metric Grid overlay
    const grid = new THREE.GridHelper(Math.max(w, d), Math.round(Math.max(w, d)), 0x38bdf8, 0x1e293b);
    grid.position.y = 0.003;
    roomGroup.add(grid);

    // 4. Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.88,
      side: THREE.DoubleSide,
    });

    // North Wall (Accent Slatted Wood Wall)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), wallMat);
    northWall.position.set(0, h / 2, -d / 2);
    northWall.receiveShadow = true;
    roomGroup.add(northWall);

    // Slat wood acoustic panels behind TV section
    const slatMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.5 });
    const slatW = w * 0.45;
    for (let x = -slatW / 2; x < slatW / 2; x += 0.12) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.04, h * 0.9, 0.03), slatMat);
      slat.position.set(x - w * 0.2, h / 2, -d / 2 + 0.07);
      roomGroup.add(slat);
    }

    // East Wall with Authentic Property Photo Gallery Display
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, d), wallMat);
    eastWall.position.set(w / 2, h / 2, 0);
    eastWall.receiveShadow = true;
    roomGroup.add(eastWall);

    // Load authentic property photo onto the gallery art frame
    const textureLoader = new THREE.TextureLoader();
    const photoUrl = list.photos && list.photos.length > 1 ? list.photos[1] : (list.photos[0] || '');

    if (photoUrl) {
      textureLoader.load(photoUrl, (photoTex) => {
        photoTex.colorSpace = THREE.SRGBColorSpace;
        const photoArtMat = new THREE.MeshStandardMaterial({ map: photoTex, roughness: 0.2 });
        const artFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });

        const artFrame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 2.6), artFrameMat);
        artFrame.position.set(w / 2 - 0.04, h * 0.58, 0);
        roomGroup.add(artFrame);

        const artPicture = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.7), photoArtMat);
        artPicture.rotation.y = -Math.PI / 2;
        artPicture.position.set(w / 2 - 0.07, h * 0.58, 0);
        roomGroup.add(artPicture);
      });
    }

    // South Wall (Low profile threshold)
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, 0.12), wallMat);
    southWall.position.set(0, 0.175, d / 2);
    roomGroup.add(southWall);

    // West Wall (Floor-to-Ceiling Panoramic Glass Window)
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.85 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.25,
    });

    const windowPane = new THREE.Mesh(new THREE.BoxGeometry(0.04, h * 0.92, d * 0.9), glassMat);
    windowPane.position.set(-w / 2, h * 0.5, 0);
    roomGroup.add(windowPane);

    // Mullions
    for (let i = -3; i <= 3; i++) {
      const mul = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.08), windowFrameMat);
      mul.position.set(-w / 2, h / 2, (d / 8) * i);
      roomGroup.add(mul);
    }

    // Outdoor Panoramic Backdrop (loads real exterior photo or skyline)
    const frontalPhotoUrl = list.photos && list.photos.length > 0 ? list.photos[0] : '';
    if (frontalPhotoUrl) {
      textureLoader.load(frontalPhotoUrl, (extTex) => {
        extTex.colorSpace = THREE.SRGBColorSpace;
        const extMat = new THREE.MeshBasicMaterial({ map: extTex });
        const extBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(d * 2.5, h * 2.5), extMat);
        extBackdrop.rotation.y = Math.PI / 2;
        extBackdrop.position.set(-w / 2 - 6, h * 0.6, 0);
        roomGroup.add(extBackdrop);
      });
    }

    // Baseboard Trims
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
    const bbNorth = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 0.03), baseboardMat);
    bbNorth.position.set(0, 0.07, -d / 2 + 0.06);
    roomGroup.add(bbNorth);

    const bbEast = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, d), baseboardMat);
    bbEast.position.set(w / 2 - 0.06, 0.07, 0);
    roomGroup.add(bbEast);
  };

  // --- SYNC PLACED OBJECTS IN 3D SCENE ---
  useEffect(() => {
    if (!objectsGroupRef.current || !sceneRef.current) return;
    const group = objectsGroupRef.current;
    group.clear();

    const wireframeGroup = physicsWireframeGroupRef.current;
    if (wireframeGroup) wireframeGroup.clear();

    objects.forEach((obj) => {
      const mesh = MeshFactory.createObjectMesh(obj);
      group.add(mesh);

      // Physics Wireframe Geoms
      if (wireframeGroup) {
        const hW = obj.dimensions.width * obj.scale.x;
        const hH = obj.dimensions.height * obj.scale.y;
        const hD = obj.dimensions.depth * obj.scale.z;

        let wireGeo: THREE.BufferGeometry;
        if (obj.physics.geomType === "cylinder") {
          wireGeo = new THREE.CylinderGeometry(hW / 2, hW / 2, hH, 16);
        } else if (obj.physics.geomType === "sphere") {
          wireGeo = new THREE.SphereGeometry(hW / 2, 12, 12);
        } else {
          wireGeo = new THREE.BoxGeometry(hW, hH, hD);
        }

        const wireMat = new THREE.MeshBasicMaterial({
          color: obj.physics.isStatic ? 0x10b981 : 0xf59e0b,
          wireframe: true,
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        wireMesh.position.set(obj.position.x, obj.position.y, obj.position.z);
        wireMesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
        wireframeGroup.add(wireMesh);
      }
    });

    // Update Gizmo Attachment
    if (transformControlsRef.current) {
      if (selectedObjectId) {
        const found = group.children.find((c) => c.userData?.id === selectedObjectId);
        if (found) {
          transformControlsRef.current.attach(found);
          if (selectionBoxHelperRef.current) {
            selectionBoxHelperRef.current.setFromObject(found);
            selectionBoxHelperRef.current.visible = true;
          }
        } else {
          transformControlsRef.current.detach();
          if (selectionBoxHelperRef.current) selectionBoxHelperRef.current.visible = false;
        }
      } else {
        transformControlsRef.current.detach();
        if (selectionBoxHelperRef.current) selectionBoxHelperRef.current.visible = false;
      }
    }
  }, [objects, selectedObjectId]);

  // --- UPDATE GIZMO TRANSFORM MODE ---
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  // --- LIGHTING PRESET CHANGER ---
  const handleChangeLighting = (preset: 'day' | 'golden_hour' | 'night') => {
    setLightingPreset(preset);
    if (!sunLightRef.current || !ambientLightRef.current || !sceneRef.current) return;

    if (preset === 'day') {
      sunLightRef.current.intensity = 2.0;
      sunLightRef.current.color.setHex(0xffedd5);
      ambientLightRef.current.intensity = 0.8;
      ambientLightRef.current.color.setHex(0xfff7ed);
      sceneRef.current.background = new THREE.Color(0x0a0f1d);
    } else if (preset === 'golden_hour') {
      sunLightRef.current.intensity = 2.5;
      sunLightRef.current.color.setHex(0xf59e0b);
      ambientLightRef.current.intensity = 0.6;
      ambientLightRef.current.color.setHex(0xfef3c7);
      sceneRef.current.background = new THREE.Color(0x1a0f0a);
    } else if (preset === 'night') {
      sunLightRef.current.intensity = 0.3;
      sunLightRef.current.color.setHex(0x38bdf8);
      ambientLightRef.current.intensity = 0.35;
      ambientLightRef.current.color.setHex(0x1e293b);
      sceneRef.current.background = new THREE.Color(0x030712);
    }
  };

  // --- CAMERA VIEW MODES ---
  useEffect(() => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    const camera = cameraRef.current;
    const orbit = orbitControlsRef.current;

    if (viewMode === "topdown") {
      orbit.enabled = true;
      camera.position.set(0, 16, 0.001);
      orbit.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
    } else if (viewMode === "robot_fpv") {
      // Eye-level walkthrough camera (1.65m height)
      orbit.enabled = false;
      camera.position.set(0, 1.65, 3.5);
      camera.lookAt(0, 1.65, 0);
    } else if (viewMode === "wireframe_physics") {
      orbit.enabled = true;
      if (physicsWireframeGroupRef.current) physicsWireframeGroupRef.current.visible = true;
      camera.position.set(7.5, 7.0, 9.5);
      orbit.target.set(0, 1.2, 0);
    } else {
      // Perspective Orbit
      orbit.enabled = true;
      if (physicsWireframeGroupRef.current) physicsWireframeGroupRef.current.visible = false;
      camera.position.set(7.5, 7.0, 9.5);
      orbit.target.set(0, 1.2, 0);
    }
  }, [viewMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      keysPressed.current[e.key] = true;

      if (e.key === "w" || e.key === "W") onChangeTransformMode("translate");
      if (e.key === "e" || e.key === "E") onChangeTransformMode("rotate");
      if (e.key === "r" || e.key === "R") onChangeTransformMode("scale");
      if (e.key === "f" || e.key === "F") {
        if (selectedObjectId) handleSnapToFloor(selectedObjectId);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId) onDeleteObject(selectedObjectId);
      }
      if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (selectedObjectId) onDuplicateObject(selectedObjectId);
      }
      if (e.key === "Escape") onSelectObject(null);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedObjectId, onChangeTransformMode, onDeleteObject, onDuplicateObject, onSelectObject]);

  const handleSnapToFloor = (id: string) => {
    const obj = objectsRef.current.find((o) => o.id === id);
    if (!obj) return;
    const targetY = (obj.dimensions.height * obj.scale.y) / 2;
    onUpdateObject({
      ...obj,
      position: {
        ...obj.position,
        y: Number(targetY.toFixed(3)),
      },
    });
  };

  const selectedObj = objects.find((o) => o.id === selectedObjectId);

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Property Info Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2.5">
        <div className="px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-md text-xs font-mono text-white flex items-center gap-2.5 shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">{listing.title}</span>
          <span className="text-slate-400 border-l border-slate-800 pl-2 font-mono">
            {listing.metricBounds.widthMeters}m × {listing.metricBounds.depthMeters}m • {listing.price}
          </span>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md text-xs font-mono text-indigo-300 flex items-center gap-1.5 shadow-lg">
          <Box className="w-3.5 h-3.5 text-indigo-400" />
          <span>{objects.length} Staged Physical Objects</span>
        </div>
      </div>

      {/* Lighting Presets & Transform Gizmo Toolbar (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        {/* Day / Golden Hour / Night Presets */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800/90 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
          <button
            onClick={() => handleChangeLighting('day')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              lightingPreset === 'day' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Daylight Lighting"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleChangeLighting('golden_hour')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              lightingPreset === 'golden_hour' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Golden Hour Sunset Lighting"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleChangeLighting('night')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              lightingPreset === 'night' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Evening Architectural Ambient"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gizmo Tools */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800/90 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
          <button
            onClick={() => onChangeTransformMode("translate")}
            className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              transformMode === "translate"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Translate / Move (W)"
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Move</span>
          </button>

          <button
            onClick={() => onChangeTransformMode("rotate")}
            className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              transformMode === "rotate"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Rotate (E)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rotate</span>
          </button>

          <button
            onClick={() => onChangeTransformMode("scale")}
            className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              transformMode === "scale"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Scale (R)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scale</span>
          </button>

          {selectedObj && (
            <>
              <div className="h-4 w-px bg-slate-800 mx-1" />
              <button
                onClick={() => handleSnapToFloor(selectedObj.id)}
                className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all flex items-center gap-1"
                title="Snap to Floor (F)"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Floor (F)</span>
              </button>
              <button
                onClick={() => onDuplicateObject(selectedObj.id)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteObject(selectedObj.id)}
                className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                title="Delete (Del)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Camera View Modes (Bottom Left) */}
      <div className="absolute bottom-5 left-5 flex items-center gap-1 bg-slate-950/90 border border-slate-800/90 p-1.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto">
        <button
          onClick={() => onChangeViewMode("perspective")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "perspective"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>3D Orbit</span>
        </button>

        <button
          onClick={() => onChangeViewMode("robot_fpv")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "robot_fpv"
              ? "bg-emerald-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Walkthrough (WASD)</span>
        </button>

        <button
          onClick={() => onChangeViewMode("topdown")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "topdown"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>2D Floorplan</span>
        </button>

        <button
          onClick={() => onChangeViewMode("wireframe_physics")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "wireframe_physics"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Physics Geoms</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={() => setShowWorldLabs3D(!showWorldLabs3D)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            showWorldLabs3D
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          title="Toggle World Labs 3D Foundation Mesh"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>World Labs 3D</span>
        </button>
      </div>

      {/* First-Person Walkthrough HUD Tooltip */}
      {viewMode === "robot_fpv" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-950/90 border border-slate-800 rounded-xl backdrop-blur-md text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-2xl">
          <Footprints className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Walkthrough Active: Use <strong>W/A/S/D</strong> or Arrow keys to walk through the real estate interior</span>
        </div>
      )}
    </div>
  );
};
