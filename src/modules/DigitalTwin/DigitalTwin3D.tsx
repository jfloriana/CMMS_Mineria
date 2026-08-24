import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';
import { ComponentItem } from '../../types';
import { 
  Activity, 
  Flame, 
  Layers, 
  Maximize2, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Wrench, 
  Zap,
  Cpu,
  Thermometer,
  Gauge
} from 'lucide-react';

export const DigitalTwin3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { 
    selectedEquipment, 
    selectedComponent, 
    setSelectedComponent, 
    openCreateTicketWithComponent,
    isSimulatingTelemetry,
    liveTick
  } = useApp();

  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<'shovel' | 'truck'>('shovel');
  const [hoveredMeshName, setHoveredMeshName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [cameraView, setCameraView] = useState<'iso' | 'top' | 'side' | 'front'>('iso');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesMapRef = useRef<{ [key: string]: THREE.Mesh | THREE.Group }>({});
  const animationFrameId = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const modelGroupRef = useRef<THREE.Group | null>(null);

  // Sync active model with selected equipment type
  useEffect(() => {
    if (selectedEquipment.type === 'Camión de Acarreo') {
      setActiveModel('truck');
    } else {
      setActiveModel('shovel');
    }
  }, [selectedEquipment.type]);

  // Color mapper based on temperature & health
  const getComponentColor = (cmp?: ComponentItem) => {
    if (!cmp) return 0x475569;
    if (cmp.temperatureC > 92 || cmp.vibrationMmS > 9.0) return 0xef4444; // Red Alert
    if (cmp.temperatureC > 80 || cmp.vibrationMmS > 6.0) return 0xf97316; // Orange Warning
    if (cmp.temperatureC > 65 || cmp.vibrationMmS > 4.5) return 0xeab308; // Yellow Caution
    return 0x10b981; // Green Healthy
  };

  // Build 3D procedural models
  useEffect(() => {
    if (!mountRef.current) return;

    // Clean previous
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050505); // High Density pitch black canvas

    // Fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.025);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(18, 14, 22);
    camera.lookAt(0, 3, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(40, 40, 0xffd700, 0x2a2a2a);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(20, 30, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.6); // Mining cyan accent rim
    dirLight2.position.set(-20, 10, -20);
    scene.add(dirLight2);

    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);
    meshesMapRef.current = {};

    if (activeModel === 'shovel') {
      // ==========================================
      // P&H 4100XPC Procedural Electric Shovel 3D
      // ==========================================

      // 1. Crawler Tracks (Tren de rodaje)
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
      const leftTrack = new THREE.Mesh(new THREE.BoxGeometry(10, 1.8, 2.2), trackMat);
      leftTrack.position.set(0, 0.9, -3.2);
      leftTrack.castShadow = true;
      leftTrack.name = 'tracks';
      modelGroup.add(leftTrack);
      meshesMapRef.current['tracks'] = leftTrack;

      const rightTrack = new THREE.Mesh(new THREE.BoxGeometry(10, 1.8, 2.2), trackMat);
      rightTrack.position.set(0, 0.9, 3.2);
      rightTrack.castShadow = true;
      modelGroup.add(rightTrack);

      // 2. Carbody & Central Pin
      const carbody = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 5), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      carbody.position.set(0, 1.5, 0);
      modelGroup.add(carbody);

      // 3. Revolving Frame / Upper Deck (Giro 360)
      const deckMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.3, roughness: 0.5 }); // P&H Safety Yellow
      const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(11, 3.5, 7.5), deckMat);
      upperDeck.position.set(-1, 3.8, 0);
      upperDeck.castShadow = true;
      upperDeck.name = 'swing_gear';
      modelGroup.add(upperDeck);
      meshesMapRef.current['swing_gear'] = upperDeck;

      // 4. Operator Cabin
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      const cab = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 2.4), cabMat);
      cab.position.set(3, 6.2, 2.4);
      modelGroup.add(cab);

      // Cabin Glass
      const glass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 2.2), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }));
      glass.position.set(4.0, 6.2, 2.4);
      modelGroup.add(glass);

      // 5. Machinery House / Hydraulic Unit (Bomba Principal)
      const hydroColor = getComponentColor(selectedEquipment.components?.find(c => c.meshId === 'hydraulic_unit' || c.meshId === 'main_pump'));
      const hydroMat = new THREE.MeshStandardMaterial({ 
        color: hydroColor, 
        emissive: hydroColor === 0xef4444 ? 0x7f1d1d : 0x000000,
        metalness: 0.6, 
        roughness: 0.3 
      });
      const hydroUnit = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 3.2, 16), hydroMat);
      hydroUnit.rotation.z = Math.PI / 2;
      hydroUnit.position.set(-3.5, 4.2, 0);
      hydroUnit.name = 'main_pump';
      modelGroup.add(hydroUnit);
      meshesMapRef.current['main_pump'] = hydroUnit;
      meshesMapRef.current['hydraulic_unit'] = hydroUnit;

      // 6. Hoist Drum Machinery
      const hoistMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
      const hoistDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 4.5, 24), hoistMat);
      hoistDrum.position.set(-1.5, 4.5, 0);
      hoistDrum.name = 'hoist_drum';
      modelGroup.add(hoistDrum);
      meshesMapRef.current['hoist_drum'] = hoistDrum;

      // 7. Boom (Pluma Principal de 20 metros)
      const boomGroup = new THREE.Group();
      boomGroup.position.set(3.5, 3.2, 0);
      boomGroup.rotation.z = -Math.PI / 5;

      const boomBeam1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 0.8), deckMat);
      boomBeam1.position.set(7, 0, 1.8);
      boomGroup.add(boomBeam1);

      const boomBeam2 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 0.8), deckMat);
      boomBeam2.position.set(7, 0, -1.8);
      boomGroup.add(boomBeam2);

      // Boom cross bracing
      for (let b = 2; b < 13; b += 2.2) {
        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 3.6), deckMat);
        brace.position.set(b, 0, 0);
        boomGroup.add(brace);
      }

      boomGroup.name = 'boom_dipper';
      modelGroup.add(boomGroup);
      meshesMapRef.current['boom_dipper'] = boomGroup;

      // 8. Dipper Stick & Huge Bucket (Balde de 115 Toneladas)
      const bucketMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });
      const bucket = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 4.0), bucketMat);
      bucket.position.set(11, 4.5, 0);
      bucket.castShadow = true;
      bucket.name = 'bucket';
      modelGroup.add(bucket);

      // Bucket Teeth
      for (let t = -1.6; t <= 1.6; t += 0.8) {
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 4), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
        tooth.rotation.z = -Math.PI / 2;
        tooth.position.set(13.2, 3.2, t);
        modelGroup.add(tooth);
      }

    } else {
      // ==========================================
      // Caterpillar 797F Ultra-Class Haul Truck 3D
      // ==========================================
      const truckYellow = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.4, roughness: 0.4 });
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

      // 6 Huge 4-meter Tires (59/80R63)
      const tireGeom = new THREE.CylinderGeometry(2.4, 2.4, 1.8, 24);
      
      const frontLeftTire = new THREE.Mesh(tireGeom, tireMat);
      frontLeftTire.rotation.x = Math.PI / 2;
      frontLeftTire.position.set(5.5, 2.4, 3.8);
      modelGroup.add(frontLeftTire);

      const frontRightTire = new THREE.Mesh(tireGeom, tireMat);
      frontRightTire.rotation.x = Math.PI / 2;
      frontRightTire.position.set(5.5, 2.4, -3.8);
      modelGroup.add(frontRightTire);

      const rearLeftTire1 = new THREE.Mesh(tireGeom, tireMat);
      rearLeftTire1.rotation.x = Math.PI / 2;
      rearLeftTire1.position.set(-4.5, 2.4, 3.2);
      modelGroup.add(rearLeftTire1);

      const rearLeftTire2 = new THREE.Mesh(tireGeom, tireMat);
      rearLeftTire2.rotation.x = Math.PI / 2;
      rearLeftTire2.position.set(-4.5, 2.4, 4.8);
      modelGroup.add(rearLeftTire2);

      const rearRightTire1 = new THREE.Mesh(tireGeom, tireMat);
      rearRightTire1.rotation.x = Math.PI / 2;
      rearRightTire1.position.set(-4.5, 2.4, -3.2);
      modelGroup.add(rearRightTire1);

      const rearRightTire2 = new THREE.Mesh(tireGeom, tireMat);
      rearRightTire2.rotation.x = Math.PI / 2;
      rearRightTire2.position.set(-4.5, 2.4, -4.8);
      modelGroup.add(rearRightTire2);

      // Chassis frame
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(14, 1.5, 4.5), frameMat);
      chassis.position.set(0, 3.2, 0);
      modelGroup.add(chassis);

      // Engine Compartment
      const engine = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 4.2), truckYellow);
      engine.position.set(4.5, 4.8, 0);
      engine.name = 'engine_block';
      modelGroup.add(engine);
      meshesMapRef.current['engine_block'] = engine;

      // Radiator Grill
      const grill = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), new THREE.MeshStandardMaterial({ color: 0x020617 }));
      grill.rotation.y = Math.PI / 2;
      grill.position.set(6.8, 4.8, 0);
      modelGroup.add(grill);

      // Operator Cab
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.2), truckYellow);
      cab.position.set(4.5, 7.2, 2.0);
      modelGroup.add(cab);

      // Dump Body (Tolva de 400 Toneladas)
      const dumpBody = new THREE.Mesh(new THREE.BoxGeometry(12, 4.2, 7.0), truckYellow);
      dumpBody.position.set(-2.0, 6.2, 0);
      dumpBody.rotation.z = 0.08;
      dumpBody.name = 'dump_body';
      modelGroup.add(dumpBody);
      meshesMapRef.current['dump_body'] = dumpBody;

      // Hydraulic Hoist Cylinders (Cilindros de Levante)
      const hydroCylMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
      const cylLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4.2, 16), hydroCylMat);
      cylLeft.position.set(1.0, 4.6, 2.4);
      cylLeft.rotation.z = -0.3;
      cylLeft.name = 'main_pump';
      modelGroup.add(cylLeft);
      meshesMapRef.current['main_pump'] = cylLeft;
    }

    // Drag rotate controls
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current && modelGroupRef.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        modelGroupRef.current.rotation.y += deltaX * 0.008;
        modelGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, modelGroupRef.current.rotation.x + deltaY * 0.008));

        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }

      // Raycasting for hover
      if (rendererRef.current && cameraRef.current && mountRef.current) {
        const rect = mountRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
        const intersects = raycaster.intersectObjects(modelGroup.children, true);

        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          let hitName = hitObj.name || hitObj.parent?.name;
          if (hitName) {
            setHoveredMeshName(hitName);
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          } else {
            setHoveredMeshName(null);
            setTooltipPos(null);
          }
        } else {
          setHoveredMeshName(null);
          setTooltipPos(null);
        }
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(10, Math.min(50, cameraRef.current.position.z + e.deltaY * 0.04));
      }
    };

    const onClick = (e: MouseEvent) => {
      if (rendererRef.current && cameraRef.current && mountRef.current) {
        const rect = mountRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
        const intersects = raycaster.intersectObjects(modelGroup.children, true);

        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          const hitName = hitObj.name || hitObj.parent?.name;
          
          if (hitName && selectedEquipment.components) {
            const matchedCmp = selectedEquipment.components.find(c => c.meshId === hitName) ||
              selectedEquipment.components.find(c => c.name.toLowerCase().includes(hitName.toLowerCase()));
            if (matchedCmp) {
              setSelectedComponent(matchedCmp);
            }
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsating alert animation on critical pump / component
      const pumpMesh = meshesMapRef.current['main_pump'] as THREE.Mesh;
      if (pumpMesh && pumpMesh.material) {
        const mat = pumpMesh.material as THREE.MeshStandardMaterial;
        const pulse = Math.sin(elapsedTime * 6) * 0.5 + 0.5;
        mat.emissive = new THREE.Color(0xef4444);
        mat.emissiveIntensity = pulse * 0.8;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [activeModel, selectedEquipment.id]);

  // Wireframe toggle effect
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => {
              if ('wireframe' in m) (m as any).wireframe = isWireframe;
            });
          } else if (mesh.material && 'wireframe' in mesh.material) {
            (mesh.material as any).wireframe = isWireframe;
          }
        }
      });
    }
  }, [isWireframe]);

  const setView = (view: 'iso' | 'top' | 'side' | 'front') => {
    setCameraView(view);
    if (!cameraRef.current) return;
    if (view === 'iso') {
      cameraRef.current.position.set(18, 14, 22);
      cameraRef.current.lookAt(0, 3, 0);
    } else if (view === 'top') {
      cameraRef.current.position.set(0, 32, 0.1);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (view === 'side') {
      cameraRef.current.position.set(0, 4, 26);
      cameraRef.current.lookAt(0, 3, 0);
    } else if (view === 'front') {
      cameraRef.current.position.set(26, 4, 0);
      cameraRef.current.lookAt(0, 3, 0);
    }
  };

  const matchedHoveredCmp = selectedEquipment.components?.find(c => c.meshId === hoveredMeshName) || selectedComponent;

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">
      {/* 3D Canvas Viewport */}
      <div className="relative flex-1 bg-[#050505] border border-[#2A2A2A] rounded overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
        {/* Top Control Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-[#0A0A0A]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#2A2A2A] shadow-lg text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-white">[{selectedEquipment.tag}]</span>
            <span className="text-[#888] font-mono">{selectedEquipment.name}</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#1A1A1A] text-[#FFD700] border border-[#2A2A2A]">
              {selectedEquipment.location.pitBench}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto bg-[#0A0A0A]/90 backdrop-blur-md p-1 rounded border border-[#2A2A2A] shadow-lg text-xs font-mono">
            {/* View presets */}
            <button
              onClick={() => setView('iso')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-bold ${cameraView === 'iso' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:bg-[#1A1A1A] hover:text-white'}`}
            >
              ISO 3D
            </button>
            <button
              onClick={() => setView('top')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-bold ${cameraView === 'top' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:bg-[#1A1A1A] hover:text-white'}`}
            >
              PLANTA
            </button>
            <button
              onClick={() => setView('front')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-bold ${cameraView === 'front' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:bg-[#1A1A1A] hover:text-white'}`}
            >
              FRONTAL
            </button>
            <button
              onClick={() => setIsWireframe(!isWireframe)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors text-[11px] ${isWireframe ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300' : 'border-[#2A2A2A] text-[#888] hover:bg-[#1A1A1A]'}`}
              title="Modo Rayos X / Corte Estructural"
            >
              <Layers className="w-3 h-3" />
              WIREFRAME
            </button>
          </div>
        </div>

        {/* 3D Canvas Mount Point */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing flex-1" />

        {/* Heatmap Legend & Live Telemetry Rate */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-[#0A0A0A]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#2A2A2A] text-[10px] font-mono flex items-center gap-3 text-[#D1D1D1] pointer-events-auto">
            <span className="text-[#888] font-bold">HEATMAP:</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>&lt;65°C NORMAL</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
              <span>65-80°C CAUTION</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>80-92°C ALERTA</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>&gt;92°C CRÍTICO</span>
            </div>
          </div>
        </div>

        {/* Floating Tooltip during Mesh Hover */}
        {hoveredMeshName && tooltipPos && (
          <div 
            className="absolute z-20 pointer-events-none bg-[#0A0A0A]/95 border border-[#FFD700] rounded p-2 shadow-2xl backdrop-blur-md text-xs transform -translate-x-1/2 -translate-y-full font-mono"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
          >
            <div className="font-bold text-[#FFD700] flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3" />
              {matchedHoveredCmp ? matchedHoveredCmp.name : hoveredMeshName}
            </div>
            {matchedHoveredCmp && (
              <div className="mt-1 text-[#D1D1D1] grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                <span>Temp: <strong className="text-white">{matchedHoveredCmp.temperatureC}°C</strong></span>
                <span>Vib: <strong className="text-white">{matchedHoveredCmp.vibrationMmS} mm/s</strong></span>
                <span>Salud: <strong className="text-emerald-400">{matchedHoveredCmp.healthScore}%</strong></span>
                <span>RUL: <strong className="text-cyan-400">{matchedHoveredCmp.currentRULCycles} ciclos</strong></span>
              </div>
            )}
            <div className="text-[9px] text-[#888] mt-1 font-semibold">Clic para inspeccionar componente</div>
          </div>
        )}
      </div>

      {/* Lateral Detail Panel (Métricas en Tiempo Real & CMMS Quick Action) */}
      <div className="w-full lg:w-96 bg-[#0A0A0A] border border-[#2A2A2A] rounded p-4 flex flex-col gap-3 shadow-xl">
        <div className="border-b border-[#2A2A2A] pb-2.5 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFD700] font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              TELEMETRÍA DIGITAL TWIN
            </div>
            <h3 className="font-bold text-white text-sm mt-0.5">
              {selectedComponent ? selectedComponent.name : 'Selecciona un Componente'}
            </h3>
            <p className="text-[11px] text-[#888] font-mono mt-0.5">
              [{selectedEquipment.tag}] {selectedEquipment.name}
            </p>
          </div>
          {selectedComponent && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
              selectedComponent.status === 'Crítico' 
                ? 'bg-red-950/80 text-red-400 border-red-800 animate-pulse'
                : selectedComponent.status === 'Advertencia'
                ? 'bg-amber-950/80 text-[#FFD700] border-amber-800'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
            }`}>
              {selectedComponent.status}
            </span>
          )}
        </div>

        {selectedComponent ? (
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
            {/* Live Sensor KPI Gauges */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#080808] p-2.5 rounded border border-[#1A1A1A]">
                <div className="text-[#888] text-[10px] font-mono flex items-center gap-1 mb-1">
                  <Thermometer className="w-3 h-3 text-rose-400" />
                  TEMPERATURA
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {selectedComponent.temperatureC} <span className="text-xs text-[#888]">°C</span>
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${selectedComponent.temperatureC > 90 ? 'bg-red-500' : selectedComponent.temperatureC > 75 ? 'bg-[#FFD700]' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (selectedComponent.temperatureC / 120) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#080808] p-2.5 rounded border border-[#1A1A1A]">
                <div className="text-[#888] text-[10px] font-mono flex items-center gap-1 mb-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  VIBRACIÓN RMS
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {selectedComponent.vibrationMmS} <span className="text-xs text-[#888]">mm/s</span>
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${selectedComponent.vibrationMmS > 8 ? 'bg-red-500' : selectedComponent.vibrationMmS > 5 ? 'bg-[#FFD700]' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (selectedComponent.vibrationMmS / 15) * 100)}%` }}
                  />
                </div>
              </div>

              {selectedComponent.pressureBar !== undefined && (
                <div className="bg-[#080808] p-2.5 rounded border border-[#1A1A1A] col-span-2">
                  <div className="text-[#888] text-[10px] font-mono flex items-center gap-1 mb-1">
                    <Gauge className="w-3 h-3 text-[#FFD700]" />
                    PRESIÓN CIRCUITO HIDRÁULICO
                  </div>
                  <div className="text-xl font-mono font-bold text-white flex items-center justify-between">
                    <span>{selectedComponent.pressureBar} <span className="text-xs text-[#888]">Bar</span></span>
                    <span className="text-[10px] font-mono font-normal text-[#FFD700]">MÁX NOMINAL: 350 BAR</span>
                  </div>
                </div>
              )}
            </div>

            {/* Health Score & RUL Prediction Box */}
            <div className="bg-[#080808] p-3 rounded border border-[#1A1A1A] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#888]">HEALTH SCORE:</span>
                <span className="text-sm font-bold text-emerald-400">{selectedComponent.healthScore} / 100</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#888]">RUL REMANENTE:</span>
                <span className="text-sm font-bold text-cyan-400">
                  {selectedComponent.currentRULCycles} ciclos (~{Math.round(selectedComponent.currentRULCycles * 0.4)} hrs)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#888]">HORÓMETRO:</span>
                <span className="text-[#D1D1D1]">{selectedComponent.currentHours} / {selectedComponent.expectedLifeHours} hrs</span>
              </div>
            </div>

            {/* AI Warning Callout if Critical */}
            {selectedComponent.status === 'Crítico' && (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded text-xs flex items-start gap-2 text-red-200 font-mono">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-300 block mb-0.5 text-[11px]">ALERTA DE FALLA INMINENTE</strong>
                  Riesgo severo de cavitación y degradación en &lt;38 ciclos. Parada no programada: ~$2.1M USD/hr.
                </div>
              </div>
            )}

            {/* Actions: Open Ticket CMMS or AI Root Cause */}
            <div className="mt-auto flex flex-col gap-2 pt-1">
              <button
                onClick={() => openCreateTicketWithComponent(selectedEquipment, selectedComponent)}
                className="w-full py-2 px-3 rounded bg-[#FFD700] hover:bg-[#ffe135] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 fill-black" />
                GENERAR TICKET CMMS
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#666] text-xs font-mono">
            <Zap className="w-8 h-8 text-[#FFD700]/30 mb-2" />
            <p>Haz clic en cualquier componente del modelo 3D para visualizar su telemetría en tiempo real y RUL predictivo.</p>
          </div>
        )}
      </div>
    </div>
  );
};
