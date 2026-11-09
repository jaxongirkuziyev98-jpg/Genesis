/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ORGANELLES } from '../data/biologyData';
import { OrganelleInfo, CameraState } from '../types';
import { BottomDock } from '../components/BottomDock';
import { soundFX } from '../utils/audio';
import { 
  Zap, 
  Layers, 
  Info, 
  X, 
  Check, 
  Sliders, 
  Eye, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface CellExplorerViewProps {
  cameraState: CameraState;
  onSelectObject: (nomi: string, roli?: string) => void;
  onToast: (text: string, type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot') => void;
}

export const CellExplorerView: React.FC<CellExplorerViewProps> = ({
  cameraState,
  onSelectObject,
  onToast,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleInfo | null>(ORGANELLES[0]);
  const [isRunning, setIsRunning] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [explodedProgress, setExplodedProgress] = useState(0);
  const [cutawayMode, setCutawayMode] = useState(true); // Cutaway shows interior
  const [atpProduction, setAtpProduction] = useState(1420); // ATP Molecules/sec

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const organelleMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const initialPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const cellGroupRef = useRef<THREE.Group | null>(null);
  const membraneMeshRef = useRef<THREE.Mesh | null>(null);

  // Set selected organelle update
  const handleSelect = useCallback((org: OrganelleInfo) => {
    setSelectedOrganelle(org);
    onSelectObject(org.nomi, org.vazifasi);
    soundFX.playClick();
  }, [onSelectObject]);

  // Respond to camera gestures
  useEffect(() => {
    if (!cameraState.isActive) return;

    if (cameraState.currentGesture === 'musht') {
      // Rotate cell
      if (cellGroupRef.current) {
        cellGroupRef.current.rotation.y += 0.05;
        cellGroupRef.current.rotation.x += 0.02;
      }
    } else if (cameraState.currentGesture === 'chimchish') {
      // Zoom
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(10, cameraRef.current.position.z - 0.2);
      }
    } else if (cameraState.currentGesture === 'ochiq_kaft') {
      // Reset view / center
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 3, 22);
      }
    } else if (cameraState.currentGesture === 'korsatkich') {
      // Cycle organelle
      const currentIdx = ORGANELLES.findIndex(o => o.id === selectedOrganelle?.id);
      const nextOrg = ORGANELLES[(currentIdx + 1) % ORGANELLES.length];
      handleSelect(nextOrg);
    }
  }, [cameraState.currentGesture, cameraState.isActive, handleSelect, selectedOrganelle]);

  // Setup Three.js 3D Cell Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x030712, 0.018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 24);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(15, 20, 15);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    fillLight.position.set(-15, -10, -10);
    scene.add(fillLight);

    // Cell Master Group
    const cellGroup = new THREE.Group();
    scene.add(cellGroup);
    cellGroupRef.current = cellGroup;

    // 1. Outer Cell Membrane (Cutaway half-sphere / sliced sphere)
    const membraneGeo = new THREE.SphereGeometry(
      8.5, 
      48, 
      48, 
      0, 
      Math.PI * 2, 
      0, 
      cutawayMode ? Math.PI * 0.72 : Math.PI
    );
    const membraneMat = new THREE.MeshPhysicalMaterial({
      color: 0x059669,
      transparent: true,
      opacity: 0.38,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
    membraneMesh.userData = { id: 'membrana' };
    cellGroup.add(membraneMesh);
    membraneMeshRef.current = membraneMesh;
    organelleMeshesRef.current.set('membrana', membraneMesh);
    initialPositionsRef.current.set('membrana', membraneMesh.position.clone());

    // 2. Sitoplazma (Translucent interior volume)
    const cytoGeo = new THREE.SphereGeometry(8.1, 32, 32);
    const cytoMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    });
    const cytoMesh = new THREE.Mesh(cytoGeo, cytoMat);
    cytoMesh.userData = { id: 'sitoplazma' };
    cellGroup.add(cytoMesh);
    organelleMeshesRef.current.set('sitoplazma', cytoMesh);
    initialPositionsRef.current.set('sitoplazma', cytoMesh.position.clone());

    // 3. Nucleus (Yadro) with nuclear envelope and inner nucleolus
    const nucleusGroup = new THREE.Group();
    nucleusGroup.userData = { id: 'yadro' };
    nucleusGroup.position.set(0, 0, 0);

    const nucOuterGeo = new THREE.SphereGeometry(3.2, 32, 32);
    const nucOuterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      roughness: 0.35,
      metalness: 0.2,
    });
    const nucOuter = new THREE.Mesh(nucOuterGeo, nucOuterMat);
    nucleusGroup.add(nucOuter);

    // Inner Nucleolus
    const nucleolusGeo = new THREE.SphereGeometry(1.4, 20, 20);
    const nucleolusMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
    });
    const nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    nucleolusMesh.position.set(0.6, 0.4, 0.5);
    nucleusGroup.add(nucleolusMesh);

    cellGroup.add(nucleusGroup);
    organelleMeshesRef.current.set('yadro', nucleusGroup);
    initialPositionsRef.current.set('yadro', nucleusGroup.position.clone());

    // 4. Mitochondria (Mitoxondriya) - 4 procedural capsules with cristae
    const mitoPositions = [
      new THREE.Vector3(4.5, 2.2, 2.0),
      new THREE.Vector3(-4.2, -1.8, 3.0),
      new THREE.Vector3(2.5, -4.0, 1.5),
      new THREE.Vector3(-3.5, 3.8, -1.0),
    ];

    const mitoMasterGroup = new THREE.Group();
    mitoMasterGroup.userData = { id: 'mitoxondriya' };

    mitoPositions.forEach((pos, idx) => {
      const singleMito = new THREE.Group();
      singleMito.position.copy(pos);
      singleMito.rotation.set(idx * 0.8, idx * 1.2, idx * 0.5);

      // Capsule shape for mitochondrion
      const mitoBodyGeo = new THREE.CapsuleGeometry(0.7, 1.8, 12, 16);
      const mitoBodyMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0x881337,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.2,
      });
      const mitoBody = new THREE.Mesh(mitoBodyGeo, mitoBodyMat);
      singleMito.add(mitoBody);

      // Inner glowing energy core
      const glowGeo = new THREE.TorusGeometry(0.8, 0.08, 8, 24);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfecdd3 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.x = Math.PI / 2;
      singleMito.add(glow);

      mitoMasterGroup.add(singleMito);
    });

    cellGroup.add(mitoMasterGroup);
    organelleMeshesRef.current.set('mitoxondriya', mitoMasterGroup);
    initialPositionsRef.current.set('mitoxondriya', mitoMasterGroup.position.clone());

    // 5. Ribosomes (Ribosoma) - scattered glowing particles
    const riboCount = 180;
    const riboPositions = new Float32Array(riboCount * 3);
    for (let i = 0; i < riboCount * 3; i += 3) {
      const radius = 3.6 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      riboPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      riboPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      riboPositions[i + 2] = radius * Math.cos(phi);
    }
    const riboGeo = new THREE.BufferGeometry();
    riboGeo.setAttribute('position', new THREE.BufferAttribute(riboPositions, 3));
    const riboMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.28,
      transparent: true,
      opacity: 0.9,
    });
    const riboMesh = new THREE.Points(riboGeo, riboMat);
    riboMesh.userData = { id: 'ribosoma' };
    cellGroup.add(riboMesh);
    organelleMeshesRef.current.set('ribosoma', riboMesh);
    initialPositionsRef.current.set('ribosoma', riboMesh.position.clone());

    // 6. Golgi Apparatus (Golji majmuasi) - stacked curved ribbons
    const golgiGroup = new THREE.Group();
    golgiGroup.userData = { id: 'golji' };
    golgiGroup.position.set(-3.8, 2.5, 3.2);
    golgiGroup.rotation.set(0.4, -0.6, 0.3);

    for (let i = 0; i < 5; i++) {
      const curveGeo = new THREE.TorusGeometry(1.6 + i * 0.25, 0.2, 12, 32, Math.PI * 0.8);
      const curveMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x581c87,
        emissiveIntensity: 0.3,
        roughness: 0.4,
      });
      const cistern = new THREE.Mesh(curveGeo, curveMat);
      cistern.position.z = i * 0.35;
      golgiGroup.add(cistern);
    }
    cellGroup.add(golgiGroup);
    organelleMeshesRef.current.set('golji', golgiGroup);
    initialPositionsRef.current.set('golji', golgiGroup.position.clone());

    // 7. Lysosomes (Lizosoma) - small round digestive vesicles
    const lysoGroup = new THREE.Group();
    lysoGroup.userData = { id: 'lizosoma' };
    const lysoPositions = [
      new THREE.Vector3(3.2, -3.2, 3.8),
      new THREE.Vector3(-4.8, 1.2, 2.8),
      new THREE.Vector3(1.5, 4.2, 2.5),
    ];
    lysoPositions.forEach((pos) => {
      const lysoGeo = new THREE.SphereGeometry(0.85, 16, 16);
      const lysoMat = new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0x7c2d12,
        emissiveIntensity: 0.4,
        roughness: 0.3,
      });
      const m = new THREE.Mesh(lysoGeo, lysoMat);
      m.position.copy(pos);
      lysoGroup.add(m);
    });
    cellGroup.add(lysoGroup);
    organelleMeshesRef.current.set('lizosoma', lysoGroup);
    initialPositionsRef.current.set('lizosoma', lysoGroup.position.clone());

    // Interactive Raycasting for mouse/touch clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cellGroup.children, true);

      if (intersects.length > 0) {
        // Find topmost object with userData.id
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && curr !== cellGroup) {
          const orgId = curr.userData?.id;
          if (orgId) {
            const org = ORGANELLES.find(o => o.id === orgId);
            if (org) {
              handleSelect(org);
              break;
            }
          }
          curr = curr.parent;
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cellGroup) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      cellGroup.rotation.y += dx * 0.008;
      cellGroup.rotation.x += dy * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRunning && isAutoRotating && !isDragging) {
        cellGroup.rotation.y += delta * 0.2;
      }

      // Gentle internal organic respiration
      const time = clock.getElapsedTime();
      const pulse = 1 + Math.sin(time * 2.5) * 0.02;
      nucleusGroup.scale.set(pulse, pulse, pulse);

      // Ribosomes subtle twinkle
      riboMesh.rotation.y += delta * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cutawayMode, handleSelect, isAutoRotating, isRunning]);

  // Handle Exploded view slider adjustment
  useEffect(() => {
    organelleMeshesRef.current.forEach((obj, id) => {
      const orig = initialPositionsRef.current.get(id);
      if (!orig) return;

      if (id === 'yadro') {
        obj.position.copy(orig);
      } else {
        const dir = orig.clone().normalize();
        if (dir.length() < 0.1) dir.set(1, 0, 0);
        obj.position.copy(orig.clone().add(dir.multiplyScalar(explodedProgress * 8)));
      }
    });
  }, [explodedProgress]);

  // ATP simulation tick
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setAtpProduction((prev) => 1400 + Math.floor(Math.random() * 80));
    }, 1500);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Dock Actions
  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 3, 24);
    }
    if (cellGroupRef.current) {
      cellGroupRef.current.rotation.set(0, 0, 0);
    }
    setExplodedProgress(0);
    soundFX.playSuccess();
    onToast('Hujayra ko‘rinishi boshlang‘ich holatga qaytarildi.', 'muvaffaqiyat');
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(8, cameraRef.current.position.z - 3);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(45, cameraRef.current.position.z + 3);
    }
  };

  const handleToggleRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const handleSave = () => {
    onToast(`Tanlangan organoid ma'lumotlari saqlandi: ${selectedOrganelle?.nomi}`, 'muvaffaqiyat');
  };

  const handleClear = () => {
    setSelectedOrganelle(null);
    onSelectObject('Umumiy ko‘rinish');
    onToast('Tanlov bekor qilindi.', 'malumot');
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Organelle Selector Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 max-w-xl pointer-events-auto">
        {ORGANELLES.map((org) => {
          const isSel = selectedOrganelle?.id === org.id;
          return (
            <button
              key={org.id}
              onClick={() => handleSelect(org)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md border ${
                isSel
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/70 hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: org.rang }}></span>
              <span>{org.nomi}</span>
            </button>
          );
        })}
      </div>

      {/* Top Right: Cutaway toggle & ATP Live counter */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => {
            soundFX.playClick();
            setCutawayMode(!cutawayMode);
            onToast(
              !cutawayMode ? 'Ichki kesim ko‘rinishi yoqildi.' : 'To‘liq sfera ko‘rinishi yoqildi.', 
              'malumot'
            );
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer ${
            cutawayMode
              ? 'bg-emerald-950/90 border-emerald-500/70 text-emerald-300'
              : 'bg-slate-900/80 border-slate-700 text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{cutawayMode ? 'Ichki kesim: Faol' : 'To‘liq membrana'}</span>
        </button>

        {/* Live ATP Counter badge */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md flex items-center gap-2 text-xs">
          <Zap className="w-4 h-4 text-rose-400 animate-bounce" />
          <div>
            <div className="text-[10px] text-slate-400">ATF ISHLAB CHIQARISH</div>
            <div className="font-mono font-bold text-white">
              {isRunning ? `${atpProduction} molekula/s` : 'To‘xtatilgan'}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out / Bottom-left Organelle Details Card */}
      {selectedOrganelle && (
        <div className="absolute bottom-24 left-4 z-20 w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/92 border border-cyan-800/60 shadow-2xl backdrop-blur-xl pointer-events-auto animate-in slide-in-from-left duration-200">
          <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedOrganelle.rang }}></span>
                <h3 className="font-orbitron font-bold text-base text-white">
                  {selectedOrganelle.nomi}
                </h3>
              </div>
              <p className="text-xs text-cyan-400 font-mono italic">
                {selectedOrganelle.ilmiyNomi}
              </p>
            </div>
            <button
              onClick={() => setSelectedOrganelle(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 max-h-56 overflow-y-auto pr-1">
            <div>
              <span className="text-[10px] text-slate-400 font-rajdhani uppercase font-semibold block">
                Asosiy vazifasi:
              </span>
              <p className="leading-relaxed mt-0.5">{selectedOrganelle.vazifasi}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-rajdhani uppercase font-semibold block">
                Tuzilishi:
              </span>
              <p className="leading-relaxed mt-0.5">{selectedOrganelle.tuzilishi}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-rajdhani">Energiya hissasi</div>
                <div className="font-semibold text-rose-300 text-[11px] truncate">{selectedOrganelle.energiyaHissasi}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-rajdhani">O‘lchami</div>
                <div className="font-semibold text-cyan-300 text-[11px] font-mono">{selectedOrganelle.olchami}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Bottom Dock */}
      <BottomDock
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleRotate={handleToggleRotate}
        isAutoRotating={isAutoRotating}
        onSave={handleSave}
        onClear={handleClear}
        showExplodedSlider={true}
        explodedProgress={explodedProgress}
        onExplodedChange={setExplodedProgress}
      />
    </div>
  );
};
