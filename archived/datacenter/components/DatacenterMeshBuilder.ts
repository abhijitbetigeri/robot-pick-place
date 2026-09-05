import * as THREE from 'three';
import { ServerRackDef, CableBundleDef, PortDef } from '../types';

// High-resolution PBR texture generator for server backplanes
function createServerBackplaneTexture(type: 'tor_switch' | 'gpu_hgx' | 'compute_node'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = type === 'gpu_hgx' ? 512 : type === 'compute_node' ? 256 : 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // Brushed dark anodized steel chassis base
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a2234');
  grad.addColorStop(0.3, '#0b0f19');
  grad.addColorStop(0.7, '#111827');
  grad.addColorStop(1, '#1a2234');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Micro brushed metallic grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 300; i++) {
    const y = Math.random() * h;
    ctx.fillRect(0, y, w, 1);
  }

  // Chassis perimeter bevel / edge highlight
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  if (type === 'gpu_hgx') {
    // 6 Large High-CFM Fan Exhausts with Concentric Wire Finger Guards
    const fanRadius = 58;
    for (let f = 0; f < 6; f++) {
      const cx = 110 + f * 158;
      const cy = h * 0.48;

      // Dark Fan Cavity
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.arc(cx, cy, fanRadius, 0, Math.PI * 2);
      ctx.fill();

      // Honeycomb perforated mesh inside fan
      ctx.fillStyle = '#1e293b';
      for (let r = -fanRadius + 12; r < fanRadius - 12; r += 10) {
        for (let c = -fanRadius + 12; c < fanRadius - 12; c += 10) {
          if (r * r + c * c < (fanRadius - 12) * (fanRadius - 12)) {
            ctx.beginPath();
            ctx.arc(cx + c, cy + r, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Concentric Circular Wire Finger Guards
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      for (let rad = 18; rad < fanRadius - 4; rad += 14) {
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Fan Hub
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // High Voltage / Fan Caution Warning Decal
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(30, 22, 120, 16);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('⚠ HIGH AIRFLOW', 38, 34);

    // Silkscreen Product Title & QR Code Tag
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('NVIDIA HGX H100 8-GPU 3.2Tbps CLUSTER NODE', 165, 34);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('8x 400G OSFP BACKEND INTERCONNECT [RAILS 01-08] • 4x 3000W TITANIUM PSUs', 30, h - 22);

    // Asset Tag Barcode Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w - 140, 20, 110, 24);
    ctx.fillStyle = '#000000';
    ctx.font = '10px monospace';
    ctx.fillText('|||| ||| ||||| ||', w - 130, 36);
  } else if (type === 'tor_switch') {
    // Top-of-Rack Switch Cages Silkscreen
    ctx.fillStyle = '#030712';
    ctx.fillRect(35, 28, w - 320, h - 56);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 28, w - 320, h - 56);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('QUANTUM-2 400Gb/s IB / 64-PORT SPECTRUM-4 TOR SWITCH', 45, 20);

    // Numbered Port Silkscreen
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    for (let p = 1; p <= 32; p++) {
      const px = 48 + (p - 1) * 20.5;
      ctx.fillText(p < 10 ? `0${p}` : `${p}`, px, h - 10);
    }

    // Dual redundant fan modules on right side of switch
    const fanRad = 20;
    for (let f = 0; f < 2; f++) {
      const fcx = w - 180 + f * 55;
      const fcy = h * 0.5;
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.arc(fcx, fcy, fanRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();
    }
  } else {
    // 2U Compute Node Dual Fans + PCIe slot brackets
    const fanRadius = 42;
    for (let f = 0; f < 3; f++) {
      const cx = 360 + f * 115;
      const cy = h * 0.52;
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.arc(cx, cy, fanRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Wire guard
      ctx.strokeStyle = '#64748b';
      for (let r = 14; r < fanRadius; r += 12) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('DELL POWEREDGE R760 2U DUAL-XEON PLATINUM • 1600W REDUNDANT PSU', 30, 26);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('QUAD 10GBASE-T RJ45 • DUAL 25GbE SFP28 • iDRAC9 DEDICATED MGMT', 30, h - 18);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function buildDatacenter3DScene(
  scene: THREE.Scene,
  racks: ServerRackDef[],
  cables: CableBundleDef[],
  onPortMeshCreated?: (port: PortDef, mesh: THREE.Object3D) => void
) {
  // Pre-generate rich textures
  const switchTex = createServerBackplaneTexture('tor_switch');
  const gpuTex = createServerBackplaneTexture('gpu_hgx');
  const computeTex = createServerBackplaneTexture('compute_node');

  // Photorealistic PBR Materials
  const rackFrameMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.25,
    metalness: 0.9,
  });

  const rackRailMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.2,
    metalness: 0.95,
  });

  const serverChassisMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.9,
  });

  const psuMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.15,
    metalness: 0.95,
  });

  const rj45MetalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.1,
    metalness: 0.98,
  });

  const qsfpCageMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.95,
  });

  const meshDoorMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.8,
    wireframe: true,
  });

  const pduFeedAMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Feed A Amber / Red
    roughness: 0.3,
    metalness: 0.7,
  });

  const pduFeedBMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Feed B Blue
    roughness: 0.3,
    metalness: 0.7,
  });

  const fiberPullTabMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const ledAmberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const ledOffMat = new THREE.MeshBasicMaterial({ color: 0x334155 });

  const fiberRunnerMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.25,
    metalness: 0.2,
  });

  const wireMeshTrayMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: true,
  });

  const sprinklerPipeMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.3,
    metalness: 0.7,
  });

  // 1. World Labs Photorealistic Environment Backdrop
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    '/assets/datacenter_marble_preview.webp',
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      // Curved cylinder backdrop at the aisle ends
      const bgGeo = new THREE.CylinderGeometry(8.5, 8.5, 6, 32, 1, true);
      const bgMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
      });
      const bgMesh = new THREE.Mesh(bgGeo, bgMat);
      bgMesh.position.set(0, 1.8, 0);
      scene.add(bgMesh);
    },
    undefined,
    () => {
      // Graceful fallback if preview not loaded
    }
  );

  // 2. Raised Access Floor Tiles (Tate ConCore 600x600mm)
  const floorTileMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.6,
  });
  const ventTileMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
    metalness: 0.8,
    wireframe: true,
  });

  for (let fx = -4; fx <= 4; fx++) {
    for (let fz = -4; fz <= 4; fz++) {
      const isVentTile = (Math.abs(fx) + Math.abs(fz)) % 3 === 0 && Math.abs(fz) <= 2;
      const tileGeo = new THREE.BoxGeometry(0.58, 0.02, 0.58);
      const tile = new THREE.Mesh(tileGeo, isVentTile ? ventTileMat : floorTileMat);
      tile.position.set(fx * 0.60, -0.01, fz * 0.60);
      scene.add(tile);
    }
  }

  // 3. Overhead Hot Aisle Ceiling Containment (Matte & Non-Glaring)
  const ceilingGeo = new THREE.BoxGeometry(4.2, 0.04, 1.8);
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.3,
  });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.position.set(0, 2.10, 0);
  scene.add(ceiling);

  // Recessed Industrial Troffer Housings (Matte Brushed Steel Bezel, No Blinding Glow)
  const trofferMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.5,
  });
  const diffuserMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.9,
    metalness: 0.1,
  });

  for (let lx = -1.2; lx <= 1.2; lx += 1.2) {
    const lightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.18), trofferMat);
    lightFrame.position.set(lx, 2.08, 0);
    scene.add(lightFrame);

    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.01, 0.14), diffuserMat);
    diffuser.position.set(lx, 2.07, 0);
    scene.add(diffuser);
  }

  // Fire Suppression Sprinkler Piping (Red)
  const pipeGeo = new THREE.CylinderGeometry(0.018, 0.018, 4.2, 16);
  const pipe = new THREE.Mesh(pipeGeo, sprinklerPipeMat);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0, 2.25, 0.4);
  scene.add(pipe);

  // 4. Overhead Panduit FiberRunner & Wire Mesh Cable Trays
  const racewayGeo = new THREE.BoxGeometry(4.2, 0.08, 0.22);
  const raceway = new THREE.Mesh(racewayGeo, fiberRunnerMat);
  raceway.position.set(0, 2.20, 0);
  scene.add(raceway);

  const wireTrayGeo = new THREE.BoxGeometry(4.2, 0.06, 0.30);
  const wireTray = new THREE.Mesh(wireTrayGeo, wireMeshTrayMat);
  wireTray.position.set(0, 2.22, -0.45);
  scene.add(wireTray);

  // 5. Build Server Racks & Hardware
  racks.forEach((rack) => {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(rack.position.x, rack.position.y, rack.position.z);
    const isRowA = rack.row === 'A';

    // 4-Post Steel Frame
    const postGeo = new THREE.BoxGeometry(0.045, rack.height, 0.045);
    const postPositions = [
      [-rack.width * 0.5 + 0.022, rack.height * 0.5, -rack.depth * 0.5 + 0.022],
      [rack.width * 0.5 - 0.022, rack.height * 0.5, -rack.depth * 0.5 + 0.022],
      [-rack.width * 0.5 + 0.022, rack.height * 0.5, rack.depth * 0.5 - 0.022],
      [rack.width * 0.5 - 0.022, rack.height * 0.5, rack.depth * 0.5 - 0.022],
    ];
    postPositions.forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeo, rackFrameMat);
      post.position.set(px, py, pz);
      rackGroup.add(post);
    });

    // Vertical 19" EIA-310 Mounting Rails with Stamped Holes
    const railGeo = new THREE.BoxGeometry(0.015, rack.height - 0.1, 0.02);
    const railLeft = new THREE.Mesh(railGeo, rackRailMat);
    railLeft.position.set(-rack.width * 0.5 + 0.05, rack.height * 0.5, (isRowA ? 1 : -1) * (rack.depth * 0.5 - 0.06));
    rackGroup.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, rackRailMat);
    railRight.position.set(rack.width * 0.5 - 0.05, rack.height * 0.5, (isRowA ? 1 : -1) * (rack.depth * 0.5 - 0.06));
    rackGroup.add(railRight);

    // Top and Bottom Roof Caps
    const capGeo = new THREE.BoxGeometry(rack.width, 0.04, rack.depth);
    const topCap = new THREE.Mesh(capGeo, rackFrameMat);
    topCap.position.set(0, rack.height, 0);
    rackGroup.add(topCap);

    const bottomCap = new THREE.Mesh(capGeo, rackFrameMat);
    bottomCap.position.set(0, 0.02, 0);
    rackGroup.add(bottomCap);

    // Side Solid Divider Panels
    const sideGeo = new THREE.BoxGeometry(0.015, rack.height - 0.08, rack.depth - 0.08);
    const leftSide = new THREE.Mesh(sideGeo, rackFrameMat);
    leftSide.position.set(-rack.width * 0.5 + 0.008, rack.height * 0.5, 0);
    rackGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, rackFrameMat);
    rightSide.position.set(rack.width * 0.5 - 0.008, rack.height * 0.5, 0);
    rackGroup.add(rightSide);

    // Rear Split Perforated Mesh Doors (Swung Open 80° for Robot / Wiring Access)
    const doorGeo = new THREE.BoxGeometry(rack.width * 0.48, rack.height - 0.10, 0.012);
    const doorLeft = new THREE.Mesh(doorGeo, meshDoorMat);
    doorLeft.position.set(-rack.width * 0.5, rack.height * 0.5, (isRowA ? 1 : -1) * (rack.depth * 0.5 + 0.15));
    doorLeft.rotation.y = isRowA ? -Math.PI * 0.45 : Math.PI * 0.45;
    rackGroup.add(doorLeft);

    const doorRight = new THREE.Mesh(doorGeo, meshDoorMat);
    doorRight.position.set(rack.width * 0.5, rack.height * 0.5, (isRowA ? 1 : -1) * (rack.depth * 0.5 + 0.15));
    doorRight.rotation.y = isRowA ? Math.PI * 0.45 : -Math.PI * 0.45;
    rackGroup.add(doorRight);

    // Dual Vertical 0U PDUs (Left: Feed A Amber/Red, Right: Feed B Blue)
    const pduGeo = new THREE.BoxGeometry(0.04, rack.height - 0.15, 0.03);
    const pduLeft = new THREE.Mesh(pduGeo, pduFeedAMat);
    pduLeft.position.set(-rack.width * 0.5 + 0.03, rack.height * 0.5, (isRowA ? 1 : -1) * (rack.depth * 0.5 - 0.03));
    rackGroup.add(pduLeft);

    const pduRight = new THREE.Mesh(pduGeo, pduFeedBMat);
    pduRight.position.set(rack.width * 0.5 - 0.03, rack.height * 0.5, (isRowA ? 1 : -1) * (rack.depth * 0.5 - 0.03));
    rackGroup.add(pduRight);

    // Populate Server Units inside Rack
    rack.units.forEach((unit) => {
      const uY = (unit.uPosition - 1) * 0.04445 + 0.12;
      const uHeightMeters = unit.uHeight * 0.04445 - 0.003;

      // Server Chassis Metal Enclosure
      const serverGeo = new THREE.BoxGeometry(rack.width - 0.10, uHeightMeters, rack.depth - 0.10);
      const serverMesh = new THREE.Mesh(serverGeo, serverChassisMat);
      serverMesh.position.set(0, uY + uHeightMeters * 0.5, 0);
      rackGroup.add(serverMesh);

      // Chassis Backplane Face with Procedural Silkscreen Textures
      const rearZLocal = isRowA ? rack.depth * 0.5 - 0.048 : -rack.depth * 0.5 + 0.048;
      const chosenTex = unit.type === 'tor_switch' ? switchTex : unit.type === 'gpu_hgx' ? gpuTex : computeTex;
      const backplaneMat = new THREE.MeshStandardMaterial({
        map: chosenTex,
        roughness: 0.3,
        metalness: 0.85,
      });

      const backplaneGeo = new THREE.BoxGeometry(rack.width - 0.11, uHeightMeters * 0.96, 0.008);
      const backplaneMesh = new THREE.Mesh(backplaneGeo, backplaneMat);
      backplaneMesh.position.set(0, uY + uHeightMeters * 0.5, rearZLocal);
      if (!isRowA) backplaneMesh.rotation.y = Math.PI;
      rackGroup.add(backplaneMesh);

      // Render Hardware Ports
      unit.ports.forEach((port) => {
        const portGroup = new THREE.Group();
        portGroup.position.set(
          port.position.x - rack.position.x,
          port.position.y,
          port.position.z - rack.position.z
        );

        let portMesh: THREE.Object3D;

        if (port.type === 'QSFP_DD_400G' || port.type === 'QSFP28_100G') {
          const cageGeo = new THREE.BoxGeometry(0.019, 0.013, 0.028);
          portMesh = new THREE.Mesh(cageGeo, qsfpCageMat);
          portGroup.add(portMesh);

          // Optical Pull Tab
          const tabGeo = new THREE.BoxGeometry(0.014, 0.004, 0.016);
          const tab = new THREE.Mesh(tabGeo, fiberPullTabMat);
          tab.position.set(0, 0.009, 0.014 * (isRowA ? 1 : -1));
          portGroup.add(tab);
        } else if (port.type === 'RJ45_10GbE' || port.type === 'IPMI_Management') {
          const rjGeo = new THREE.BoxGeometry(0.016, 0.014, 0.022);
          portMesh = new THREE.Mesh(rjGeo, rj45MetalMat);
          portGroup.add(portMesh);
        } else if (port.type === 'PSU_C14' || port.type === 'PSU_C20') {
          const psuGeo = new THREE.BoxGeometry(0.038, 0.038, 0.032);
          portMesh = new THREE.Mesh(psuGeo, psuMetalMat);
          portGroup.add(portMesh);

          const latchGeo = new THREE.BoxGeometry(0.009, 0.028, 0.012);
          const latchMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
          const latch = new THREE.Mesh(latchGeo, latchMat);
          latch.position.set(0.016, 0, 0.016 * (isRowA ? 1 : -1));
          portGroup.add(latch);
        } else {
          const defaultGeo = new THREE.BoxGeometry(0.016, 0.016, 0.016);
          portMesh = new THREE.Mesh(defaultGeo, psuMetalMat);
          portGroup.add(portMesh);
        }

        // Port Status LED
        const ledGeo = new THREE.SphereGeometry(0.0028, 8, 8);
        let ledMat = ledGreenMat;
        if (port.ledStatus === 'amber') ledMat = ledAmberMat;
        if (port.ledStatus === 'off') ledMat = ledOffMat;

        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0.010, 0.012 * (isRowA ? 1 : -1));
        portGroup.add(led);

        rackGroup.add(portGroup);

        if (onPortMeshCreated) {
          onPortMeshCreated(port, portGroup);
        }
      });
    });

    scene.add(rackGroup);
  });

  // 6. Build High-Density Intertwined 3D Bézier Cable Harnesses
  cables.forEach((cable) => {
    const points = cable.curvePoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    if (points.length < 2) return;

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 28, cable.thickness * 0.5, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cable.color),
      roughness: 0.25,
      metalness: 0.4,
    });
    const cableMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(cableMesh);
  });

  // 7. Vertical Velcro Straps & Side D-Ring Bundles
  for (let x of [-0.90, -0.30, 0.30, 0.90]) {
    for (let side of [-0.27, 0.27]) {
      const strapGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 12);
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

      // Row A Vertical Channel
      const strapA = new THREE.Mesh(strapGeo, strapMat);
      strapA.position.set(x + side, 1.05, -0.55);
      scene.add(strapA);

      // Row B Vertical Channel
      const strapB = new THREE.Mesh(strapGeo, strapMat);
      strapB.position.set(x + side, 1.05, 0.55);
      scene.add(strapB);
    }
  }
}

