/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CameraState } from '../types';
import { BottomDock } from '../components/BottomDock';
import { soundFX } from '../utils/audio';
import { 
  Zap, 
  Orbit, 
  Flame, 
  ShieldAlert, 
  Plus, 
  Minus, 
  Sparkles, 
  RefreshCw,
  Compass
} from 'lucide-react';

interface ParticleWorldViewProps {
  cameraState: CameraState;
  onSelectObject: (nomi: string, roli?: string) => void;
  onToast: (text: string, type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot') => void;
}

export const ParticleWorldView: React.FC<ParticleWorldViewProps> = ({
  cameraState,
  onSelectObject,
  onToast,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Atom state
  const [protons, setProtons] = useState<number>(6); // Carbon default
  const [neutrons, setNeutrons] = useState<number>(6);
  const [electrons, setElectrons] = useState<number>(6);
  const [emField, setEmField] = useState<boolean>(true);
  const [colliderActive, setColliderActive] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const atomGroupRef = useRef<THREE.Group | null>(null);
  const electronOrbitsRef = useRef<THREE.Group[]>([]);
  const sparkParticlesRef = useRef<THREE.Points | null>(null);

  // Element name based on protons
  const getElementName = (z: number): { name: string; symbol: string } => {
    switch (z) {
      case 1: return { name: 'Vodorod', symbol: 'H' };
      case 2: return { name: 'Geliy', symbol: 'He' };
      case 3: return { name: 'Litiy', symbol: 'Li' };
      case 4: return { name: 'Berilliy', symbol: 'Be' };
      case 5: return { name: 'Bor', symbol: 'B' };
      case 6: return { name: 'Uglerod', symbol: 'C' };
      case 7: return { name: 'Azot', symbol: 'N' };
      case 8: return { name: 'Kislorod', symbol: 'O' };
      case 9: return { name: 'Ftor', symbol: 'F' };
      case 10: return { name: 'Neon', symbol: 'Ne' };
      default: return { name: `Element #${z}`, symbol: `E${z}` };
    }
  };

  const elementInfo = getElementName(protons);

  // Build 3D Atom
  const buildAtom = useCallback(() => {
    if (!atomGroupRef.current) return;
    const group = atomGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    electronOrbitsRef.current = [];

    // 1. Central Nucleus (Protons & Neutrons clustered together)
    const nucleusGroup = new THREE.Group();
    group.add(nucleusGroup);

    // Add Protons (Red/Orange)
    for (let i = 0; i < protons; i++) {
      const pGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.2,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      // Random cluster within sphere
      const r = (Math.cbrt(Math.random()) * 1.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      pMesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      nucleusGroup.add(pMesh);
    }

    // Add Neutrons (Slate/Blue)
    for (let i = 0; i < neutrons; i++) {
      const nGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const nMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.4,
        metalness: 0.1,
      });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      const r = (Math.cbrt(Math.random()) * 1.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      nMesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      nucleusGroup.add(nMesh);
    }

    // 2. Electron Orbits and orbiting electrons
    // Shell 1 (K-qavat): max 2 electrons
    // Shell 2 (L-qavat): max 8 electrons
    const shellCounts = [
      Math.min(2, electrons),
      Math.min(8, Math.max(0, electrons - 2)),
    ];
    const shellRadii = [4.5, 7.5];

    shellCounts.forEach((count, sIdx) => {
      if (count <= 0) return;
      const radius = shellRadii[sIdx];

      // Orbital guide ring
      const ringGeo = new THREE.TorusGeometry(radius, 0.04, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: emField ? 0x06b6d4 : 0x334155,
        transparent: true,
        opacity: emField ? 0.4 : 0.15,
      });

      // Distribute electron orbits in varying 3D inclinations
      for (let e = 0; e < count; e++) {
        const orbitGroup = new THREE.Group();
        orbitGroup.rotation.x = (e * Math.PI) / count + (sIdx * 0.5);
        orbitGroup.rotation.y = (e * Math.PI * 0.7);

        const ring = new THREE.Mesh(ringGeo, ringMat);
        orbitGroup.add(ring);

        // Orbiting electron sphere
        const eGeo = new THREE.SphereGeometry(0.28, 16, 16);
        const eMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const eMesh = new THREE.Mesh(eGeo, eMat);
        eMesh.position.set(radius, 0, 0);
        orbitGroup.add(eMesh);

        group.add(orbitGroup);
        electronOrbitsRef.current.push(orbitGroup);
      }
    });

    // 3. Electromagnetic Field Lines (glow lines if active)
    if (emField) {
      const fieldGeo = new THREE.BufferGeometry();
      const fieldCount = 100;
      const pos = new Float32Array(fieldCount * 3);
      for (let i = 0; i < fieldCount * 3; i += 3) {
        const rad = 3.5 + Math.random() * 5.5;
        const ang = Math.random() * Math.PI * 2;
        pos[i] = Math.cos(ang) * rad;
        pos[i + 1] = (Math.random() - 0.5) * 8;
        pos[i + 2] = Math.sin(ang) * rad;
      }
      fieldGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const fieldMat = new THREE.PointsMaterial({
        color: 0x818cf8,
        size: 0.15,
        transparent: true,
        opacity: 0.5,
      });
      const fieldPoints = new THREE.Points(fieldGeo, fieldMat);
      group.add(fieldPoints);
    }
  }, [electrons, emField, neutrons, protons]);

  // Mount 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);
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

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(12, 15, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 1.2);
    dirLight2.position.set(-12, -15, -10);
    scene.add(dirLight2);

    const group = new THREE.Group();
    scene.add(group);
    atomGroupRef.current = group;

    buildAtom();

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
      if (!isDragging || !atomGroupRef.current) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      atomGroupRef.current.rotation.y += dx * 0.008;
      atomGroupRef.current.rotation.x += dy * 0.008;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRunning && isAutoRotating && !isDragging && atomGroupRef.current) {
        atomGroupRef.current.rotation.y += delta * 0.2;
      }

      // Rotate electron orbits around different axes
      if (isRunning) {
        electronOrbitsRef.current.forEach((orb, i) => {
          orb.rotation.z += delta * (1.8 + i * 0.4);
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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [buildAtom, isAutoRotating, isRunning]);

  // Rebuild on atomic parameter change
  useEffect(() => {
    buildAtom();
  }, [protons, neutrons, electrons, emField, buildAtom]);

  // Camera gestures reaction
  useEffect(() => {
    if (!cameraState.isActive) return;

    if (cameraState.currentGesture === 'musht') {
      if (atomGroupRef.current) {
        atomGroupRef.current.rotation.y += 0.06;
      }
    } else if (cameraState.currentGesture === 'chimchish') {
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(10, cameraRef.current.position.z - 0.25);
      }
    } else if (cameraState.currentGesture === 'ochiq_kaft') {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 24);
      }
    }
  }, [cameraState.currentGesture, cameraState.isActive]);

  // Collider collision simulation
  const handleColliderSmash = () => {
    soundFX.playMutation();
    setColliderActive(true);
    onToast('Zarrachalar tezlatgichida to‘qnashuv yuz berdi! Kvarklar va bozonlar ajraldi.', 'ogohlantirish');
    setTimeout(() => {
      setColliderActive(false);
    }, 2500);
  };

  const handleReset = () => {
    setProtons(6);
    setNeutrons(6);
    setElectrons(6);
    setEmField(true);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 24);
    }
    soundFX.playSuccess();
    onToast('Atom konfiguratsiyasi Uglerod (C) holatiga qaytarildi.', 'muvaffaqiyat');
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(8, cameraRef.current.position.z - 2.5);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(40, cameraRef.current.position.z + 2.5);
    }
  };

  const handleSave = () => {
    onToast(`Atom tuzilishi saqlandi: ${elementInfo.name} (${elementInfo.symbol})`, 'muvaffaqiyat');
  };

  const handleClear = () => {
    setProtons(1);
    setNeutrons(0);
    setElectrons(1);
    onToast('Vodorod (H) holatiga o‘tkazildi.', 'malumot');
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] overflow-hidden bg-slate-950 select-none">
      {/* 3D Canvas */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Subatomic Particle Controls */}
      <div className="absolute top-4 left-4 z-20 w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/92 border border-cyan-800/60 shadow-2xl backdrop-blur-xl pointer-events-auto">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div>
            <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              {elementInfo.name} ({elementInfo.symbol})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Atom raqami: Z={protons} | Massa: A={protons + neutrons}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center font-orbitron font-bold text-cyan-300 text-sm">
            {elementInfo.symbol}
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {/* Protons Control */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <div>
                <div className="font-bold text-white">Protonlar (p⁺)</div>
                <div className="text-[10px] text-slate-400">Yadro zaryadi</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  if (protons > 1) setProtons(protons - 1);
                }}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-mono font-bold text-white">{protons}</span>
              <button
                onClick={() => {
                  soundFX.playClick();
                  if (protons < 10) setProtons(protons + 1);
                }}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Neutrons Control */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400"></span>
              <div>
                <div className="font-bold text-white">Neytronlar (n⁰)</div>
                <div className="text-[10px] text-slate-400">Izotop barqarorligi</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  if (neutrons > 0) setNeutrons(neutrons - 1);
                }}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-mono font-bold text-white">{neutrons}</span>
              <button
                onClick={() => {
                  soundFX.playClick();
                  if (neutrons < 12) setNeutrons(neutrons + 1);
                }}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Electrons Control */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
              <div>
                <div className="font-bold text-white">Elektronlar (e⁻)</div>
                <div className="text-[10px] text-slate-400">
                  {protons === electrons ? 'Neytral atom' : protons > electrons ? 'Kation (+)' : 'Anion (-)'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  if (electrons > 1) setElectrons(electrons - 1);
                }}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-mono font-bold text-white">{electrons}</span>
              <button
                onClick={() => {
                  soundFX.playClick();
                  if (electrons < 10) setElectrons(electrons + 1);
                }}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* EM Field Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              setEmField(!emField);
            }}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              emField
                ? 'bg-indigo-950/80 border-indigo-500/70 text-indigo-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            <Orbit className="w-4 h-4" />
            <span>{emField ? 'Elektromagnit maydon: Faol' : 'Maydon o‘chirilgan'}</span>
          </button>
        </div>
      </div>

      {/* Top Right: Particle Collider Trigger */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-auto">
        <button
          onClick={handleColliderSmash}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl backdrop-blur-md cursor-pointer transition-all border ${
            colliderActive
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40 animate-pulse'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-indigo-400/50 shadow-indigo-600/30'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{colliderActive ? 'Zarrachalar to‘qnashmoqda...' : 'Zarrachalar to‘qnashuvi (Tezlatgich)'}</span>
        </button>

        {/* Quark structure card */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs w-64 backdrop-blur-md">
          <div className="text-[10px] text-slate-400 font-rajdhani uppercase font-semibold mb-1">
            Ichki Kvark Tarkibi
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-red-400">Proton:</span>
              <span className="font-mono font-bold text-white">2 Up + 1 Down (uud)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Neytron:</span>
              <span className="font-mono font-bold text-white">1 Up + 2 Down (udd)</span>
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
