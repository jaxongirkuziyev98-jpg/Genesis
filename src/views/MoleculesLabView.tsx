/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MOLECULES } from '../data/biologyData';
import { MoleculeData, CameraState } from '../types';
import { BottomDock } from '../components/BottomDock';
import { soundFX } from '../utils/audio';
import { 
  Atom, 
  Layers, 
  Flame, 
  Activity, 
  Check, 
  X, 
  Sparkles,
  Info
} from 'lucide-react';

interface MoleculesLabViewProps {
  cameraState: CameraState;
  onSelectObject: (nomi: string, roli?: string) => void;
  onToast: (text: string, type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot') => void;
}

export const MoleculesLabView: React.FC<MoleculesLabViewProps> = ({
  cameraState,
  onSelectObject,
  onToast,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedMolecule, setSelectedMolecule] = useState<MoleculeData>(MOLECULES[0]);
  const [modelStyle, setModelStyle] = useState<'sharlar' | 'fazo' | 'valentlik'>('sharlar');
  const [thermalVibration, setThermalVibration] = useState<number>(0.2);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const atomObjectsRef = useRef<THREE.Mesh[]>([]);

  // Atom colors (CPK standard)
  const CPK = {
    H: 0xf8fafc, // Hydrogen (White)
    C: 0x334155, // Carbon (Dark Grey)
    O: 0xef4444, // Oxygen (Red)
    N: 0x3b82f6, // Nitrogen (Blue)
    P: 0xf97316, // Phosphorus (Orange)
  };

  // Build Procedural 3D Molecule
  const buildMolecule = useCallback(() => {
    if (!moleculeGroupRef.current) return;
    const group = moleculeGroupRef.current;

    // Clear old meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    atomObjectsRef.current = [];

    const isSpaceFill = modelStyle === 'fazo';
    const isWire = modelStyle === 'valentlik';
    const scaleFactor = isSpaceFill ? 1.6 : 1.0;

    // Helper to add atom
    const addAtom = (
      element: keyof typeof CPK,
      pos: THREE.Vector3,
      name: string,
      radius = 0.8
    ) => {
      const geo = new THREE.SphereGeometry(radius * scaleFactor, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: CPK[element],
        roughness: isWire ? 0.8 : 0.25,
        metalness: 0.1,
        wireframe: isWire,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { element, name, initialPos: pos.clone() };
      group.add(mesh);
      atomObjectsRef.current.push(mesh);
      return mesh;
    };

    // Helper to add bond cylinder
    const addBond = (p1: THREE.Vector3, p2: THREE.Vector3, double = false) => {
      if (isSpaceFill) return; // In space filling, atoms touch directly

      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      if (double) {
        // Double bond: two parallel cylinders
        const offset = new THREE.Vector3(0.18, 0, 0);
        [offset.clone().negate(), offset].forEach((off) => {
          const geo = new THREE.CylinderGeometry(0.1, 0.1, len, 12);
          const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3 });
          const cyl = new THREE.Mesh(geo, mat);
          cyl.position.copy(mid).add(off);
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
          group.add(cyl);
        });
      } else {
        const geo = new THREE.CylinderGeometry(0.14, 0.14, len, 12);
        const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3 });
        const cyl = new THREE.Mesh(geo, mat);
        cyl.position.copy(mid);
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        group.add(cyl);
      }
    };

    if (selectedMolecule.id === 'h2o') {
      // Water molecule: O at center, 2 H at 104.5 degrees
      const oPos = new THREE.Vector3(0, 0, 0);
      const h1Pos = new THREE.Vector3(1.8 * Math.sin(0.91), 1.8 * Math.cos(0.91), 0);
      const h2Pos = new THREE.Vector3(-1.8 * Math.sin(0.91), 1.8 * Math.cos(0.91), 0);

      addAtom('O', oPos, 'Kislorod (O)', 1.2);
      addAtom('H', h1Pos, 'Vodorod-1 (H)', 0.7);
      addAtom('H', h2Pos, 'Vodorod-2 (H)', 0.7);

      addBond(oPos, h1Pos);
      addBond(oPos, h2Pos);

    } else if (selectedMolecule.id === 'co2') {
      // Carbon dioxide: Linear O=C=O
      const cPos = new THREE.Vector3(0, 0, 0);
      const o1Pos = new THREE.Vector3(-2.6, 0, 0);
      const o2Pos = new THREE.Vector3(2.6, 0, 0);

      addAtom('C', cPos, 'Uglerod (C)', 1.0);
      addAtom('O', o1Pos, 'Kislorod-1 (O)', 1.15);
      addAtom('O', o2Pos, 'Kislorod-2 (O)', 1.15);

      addBond(cPos, o1Pos, true);
      addBond(cPos, o2Pos, true);

    } else if (selectedMolecule.id === 'glucose') {
      // Hexagonal pyranose ring of glucose
      const r = 3.0;
      const ringPositions: THREE.Vector3[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const p = new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, (i % 2 === 0 ? 0.4 : -0.4));
        ringPositions.push(p);

        if (i === 0) {
          addAtom('O', p, 'Halqa Kislorodi', 1.1);
        } else {
          addAtom('C', p, `Uglerod C${i}`, 0.95);
          // Add outward OH group
          const ohDir = p.clone().normalize().multiplyScalar(1.9);
          const ohPos = p.clone().add(ohDir);
          addAtom('O', ohPos, `Gidroksil Guruhi (OH) C${i}`, 0.85);
          addBond(p, ohPos);
        }
      }

      // Connect ring bonds
      for (let i = 0; i < 6; i++) {
        addBond(ringPositions[i], ringPositions[(i + 1) % 6]);
      }

    } else if (selectedMolecule.id === 'atp') {
      // ATP: Adenine (ring) + Ribose + 3 Phosphates
      // 3 High-energy phosphate chain
      const p1 = new THREE.Vector3(-4.0, 0, 0);
      const p2 = new THREE.Vector3(-1.8, 0, 0);
      const p3 = new THREE.Vector3(0.4, 0, 0);

      addAtom('P', p1, 'Gamma Fosfat (Makroergik)', 1.25);
      addAtom('P', p2, 'Beta Fosfat (Makroergik)', 1.25);
      addAtom('P', p3, 'Alfa Fosfat', 1.25);

      addBond(p1, p2);
      addBond(p2, p3);

      // Ribose sugar
      const ribosePos = new THREE.Vector3(2.6, 0.8, 0);
      addAtom('C', ribosePos, 'Riboza Qandi', 1.1);
      addBond(p3, ribosePos);

      // Adenine nitrogenous base
      const adenPos = new THREE.Vector3(5.0, 1.6, 0);
      addAtom('N', adenPos, 'Adenin Asosi', 1.3);
      addBond(ribosePos, adenPos);

      // Surrounding oxygens
      [-1, 1].forEach((dir) => {
        const oGamma = new THREE.Vector3(-4.0, dir * 1.6, 0);
        addAtom('O', oGamma, 'Fosfat Kislorodi', 0.85);
        addBond(p1, oGamma);
      });

    } else if (selectedMolecule.id === 'alanine') {
      // Amino acid: Central Alpha Carbon + NH2 + COOH + CH3
      const cAlpha = new THREE.Vector3(0, 0, 0);
      const aminoN = new THREE.Vector3(-2.2, 0.8, 0);
      const carboxylC = new THREE.Vector3(2.2, 0.8, 0);
      const methylC = new THREE.Vector3(0, -2.2, 0.5);

      addAtom('C', cAlpha, 'Alfa Uglerod (Cα)', 1.0);
      addAtom('N', aminoN, 'Amino Guruhi (-NH₂)', 1.15);
      addAtom('C', carboxylC, 'Karboksil Guruhi (-COOH)', 1.05);
      addAtom('C', methylC, 'Metil Yon Zanjiri (-CH₃)', 0.95);

      addBond(cAlpha, aminoN);
      addBond(cAlpha, carboxylC);
      addBond(cAlpha, methylC);

      // Oxygen in carboxyl
      const oxy1 = new THREE.Vector3(3.6, 0.3, 0);
      addAtom('O', oxy1, 'Karboksil Kislorodi (=O)', 1.0);
      addBond(carboxylC, oxy1, true);
    }
  }, [modelStyle, selectedMolecule]);

  // Three.js Mount
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    keyLight.position.set(12, 15, 15);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf43f5e, 1.2);
    fillLight.position.set(-12, -15, -10);
    scene.add(fillLight);

    const group = new THREE.Group();
    scene.add(group);
    moleculeGroupRef.current = group;

    buildMolecule();

    // Mouse drag
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !moleculeGroupRef.current) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      moleculeGroupRef.current.rotation.y += dx * 0.008;
      moleculeGroupRef.current.rotation.x += dy * 0.008;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Raycast atom click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(atomObjectsRef.current);

      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        if (obj.userData && obj.userData.name) {
          soundFX.playClick();
          setSelectedAtom(obj.userData.name);
          onSelectObject(obj.userData.name, `Element: ${obj.userData.element}`);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (isRunning && isAutoRotating && !isDragging && moleculeGroupRef.current) {
        moleculeGroupRef.current.rotation.y += delta * 0.3;
      }

      // Thermal vibration simulation
      if (isRunning && thermalVibration > 0) {
        atomObjectsRef.current.forEach((mesh, idx) => {
          const init = mesh.userData.initialPos as THREE.Vector3;
          if (init) {
            const vibX = Math.sin(time * 12 + idx) * thermalVibration * 0.15;
            const vibY = Math.cos(time * 14 + idx) * thermalVibration * 0.15;
            const vibZ = Math.sin(time * 10 + idx) * thermalVibration * 0.15;
            mesh.position.set(init.x + vibX, init.y + vibY, init.z + vibZ);
          }
        });
      }

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
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [buildMolecule, isAutoRotating, isRunning, onSelectObject, thermalVibration]);

  // Rebuild on dependency changes
  useEffect(() => {
    buildMolecule();
  }, [selectedMolecule, modelStyle, buildMolecule]);

  // Camera gestures reaction
  useEffect(() => {
    if (!cameraState.isActive) return;

    if (cameraState.currentGesture === 'musht') {
      if (moleculeGroupRef.current) {
        moleculeGroupRef.current.rotation.y += 0.06;
      }
    } else if (cameraState.currentGesture === 'chimchish') {
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(8, cameraRef.current.position.z - 0.25);
      }
    } else if (cameraState.currentGesture === 'ochiq_kaft') {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 16);
      }
    }
  }, [cameraState.currentGesture, cameraState.isActive]);

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 16);
    }
    if (moleculeGroupRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
    setThermalVibration(0.2);
    soundFX.playSuccess();
    onToast('Molekulyar ko‘rinish qayta tiklandi.', 'muvaffaqiyat');
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(6, cameraRef.current.position.z - 2.5);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(35, cameraRef.current.position.z + 2.5);
    }
  };

  const handleSave = () => {
    onToast(`${selectedMolecule.nomi} koordinatalari va valentlik konfiguratsiyasi saqlandi.`, 'muvaffaqiyat');
  };

  const handleClear = () => {
    setSelectedAtom(null);
    onSelectObject(selectedMolecule.nomi);
    onToast('Tanlangan atom bekor qilindi.', 'malumot');
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] overflow-hidden bg-slate-950 select-none">
      {/* 3D Canvas */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Molecule Tabs */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 max-w-xl pointer-events-auto">
        {MOLECULES.map((mol) => {
          const isSel = selectedMolecule.id === mol.id;
          return (
            <button
              key={mol.id}
              onClick={() => {
                soundFX.playClick();
                setSelectedMolecule(mol);
                setSelectedAtom(null);
                onSelectObject(mol.nomi, mol.biologikRoli);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md border ${
                isSel
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/70 hover:bg-slate-800'
              }`}
            >
              <Atom className="w-3.5 h-3.5" style={{ color: mol.rang }} />
              <span>{mol.nomi}</span>
            </button>
          );
        })}
      </div>

      {/* Top Right: Model Visual Style & Thermal Slider */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Style selector */}
        <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1 text-xs backdrop-blur-md">
          <button
            onClick={() => {
              soundFX.playClick();
              setModelStyle('sharlar');
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelStyle === 'sharlar' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Shar va tayoqcha
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setModelStyle('fazo');
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelStyle === 'fazo' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fazo to‘ldiruvchi
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setModelStyle('valentlik');
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelStyle === 'valentlik' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Valentlik to‘ri
          </button>
        </div>

        {/* Thermal Vibration Slider */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex items-center gap-3 text-xs w-64">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Issiqlik tebranishi (T)</span>
              <span className="font-mono text-amber-300">{(thermalVibration * 100).toFixed(0)} K</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={thermalVibration}
              onChange={(e) => setThermalVibration(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Bottom Left: Molecule Specs Card */}
      <div className="absolute bottom-24 left-4 z-20 w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/92 border border-cyan-800/60 shadow-2xl backdrop-blur-xl pointer-events-auto">
        <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-800">
          <div>
            <h3 className="font-orbitron font-bold text-base text-white">
              {selectedMolecule.nomi}
            </h3>
            <span className="text-xs text-cyan-400 font-mono font-bold">
              Formula: {selectedMolecule.kimyoviyFormula}
            </span>
          </div>
          {selectedAtom && (
            <div className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-[10px] text-cyan-300 font-mono">
              Tanlandi: {selectedAtom}
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <p className="leading-relaxed text-slate-400">{selectedMolecule.tavsif}</p>

          <div>
            <span className="text-[10px] text-slate-400 font-rajdhani uppercase font-semibold block">
              Biologik ahamiyati:
            </span>
            <p className="leading-relaxed mt-0.5 text-slate-300">{selectedMolecule.biologikRoli}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-rajdhani">Molekulyar og‘irlik</div>
              <div className="font-semibold text-white font-mono text-[11px]">{selectedMolecule.molekulyarOgirlik}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-rajdhani">Atomlar soni</div>
              <div className="font-semibold text-cyan-300 font-mono text-[11px]">{selectedMolecule.atomlarSoni} ta atom</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Bottom Dock */}
      <BottomDock
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleRotate={() => setIsAutoRotating(!isAutoRotating)}
        isAutoRotating={isAutoRotating}
        onSave={handleSave}
        onClear={handleClear}
      />
    </div>
  );
};
