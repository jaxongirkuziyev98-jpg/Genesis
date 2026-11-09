/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraState, SyntheticOrganism } from '../types';
import { BottomDock } from '../components/BottomDock';
import { soundFX } from '../utils/audio';
import { 
  Sparkles, 
  Dna, 
  Shield, 
  Zap, 
  Activity, 
  Play, 
  RefreshCw, 
  Layers, 
  Share2, 
  HeartHandshake
} from 'lucide-react';

interface LifeCreatorViewProps {
  cameraState: CameraState;
  onSelectObject: (nomi: string, roli?: string) => void;
  onToast: (text: string, type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot') => void;
}

export const LifeCreatorView: React.FC<LifeCreatorViewProps> = ({
  cameraState,
  onSelectObject,
  onToast,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Synthetic creation state
  const [membraneType, setMembraneType] = useState<'lipid' | 'oqsil' | 'suniy'>('lipid');
  const [geneticBasis, setGeneticBasis] = useState<'dnk' | 'rnk' | 'xna'>('dnk');
  const [energySource, setEnergySource] = useState<'atf' | 'xemo' | 'foto'>('atf');
  const [motility, setMotility] = useState<'xivchin' | 'amyoba' | 'passiv'>('xivchin');

  const [metabolismSpeed, setMetabolismSpeed] = useState<number>(65);
  const [vitality, setVitality] = useState<number>(88);
  const [population, setPopulation] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const organismGroupRef = useRef<THREE.Group | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const membraneMeshRef = useRef<THREE.Mesh | null>(null);
  const flagellaMeshesRef = useRef<THREE.Mesh[]>([]);

  // Calculate life status
  const getMembraneColor = () => {
    switch (membraneType) {
      case 'lipid': return 0x10b981; // Emerald
      case 'oqsil': return 0x3b82f6; // Blue
      case 'suniy': return 0xa855f7; // Purple
    }
  };

  const getCoreColor = () => {
    switch (energySource) {
      case 'atf': return 0xf43f5e; // Rose
      case 'xemo': return 0xf59e0b; // Amber
      case 'foto': return 0x06b6d4; // Cyan
    }
  };

  // Re-build 3D Organism
  const buildOrganism = () => {
    if (!organismGroupRef.current) return;
    const group = organismGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    flagellaMeshesRef.current = [];

    // Outer flexible membrane
    const memGeo = new THREE.IcosahedronGeometry(4.2, 4);
    const memMat = new THREE.MeshPhysicalMaterial({
      color: getMembraneColor(),
      transparent: true,
      opacity: 0.42,
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 0.6,
      depthWrite: false,
    });
    const membraneMesh = new THREE.Mesh(memGeo, memMat);
    group.add(membraneMesh);
    membraneMeshRef.current = membraneMesh;

    // Inner energetic core
    const coreGeo = new THREE.DodecahedronGeometry(2.1, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: getCoreColor(),
      emissive: getCoreColor(),
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Genetic helix / strands inside core
    const strandGeo = new THREE.TorusGeometry(2.6, 0.08, 16, 60);
    const strandMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const strand1 = new THREE.Mesh(strandGeo, strandMat);
    strand1.rotation.x = Math.PI / 3;
    group.add(strand1);

    const strand2 = new THREE.Mesh(strandGeo, strandMat);
    strand2.rotation.y = Math.PI / 3;
    group.add(strand2);

    // Motility: Flagella (xivchin) tentacles
    if (motility === 'xivchin') {
      for (let i = 0; i < 4; i++) {
        const curvePoints = [];
        for (let j = 0; j < 8; j++) {
          curvePoints.push(new THREE.Vector3(
            -4.0 - j * 1.1,
            Math.sin(j * 0.8 + i) * 0.8,
            Math.cos(j * 0.8 + i) * 0.8
          ));
        }
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.12, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: getMembraneColor(),
          roughness: 0.4,
        });
        const flagellum = new THREE.Mesh(tubeGeo, tubeMat);
        group.add(flagellum);
        flagellaMeshesRef.current.push(flagellum);
      }
    } else if (motility === 'amyoba') {
      // Pseudopods (protrusions)
      for (let i = 0; i < 5; i++) {
        const podGeo = new THREE.SphereGeometry(1.4, 16, 16);
        const podMat = new THREE.MeshPhysicalMaterial({
          color: getMembraneColor(),
          transparent: true,
          opacity: 0.35,
        });
        const pod = new THREE.Mesh(podGeo, podMat);
        const angle = (i * Math.PI * 2) / 5;
        pod.position.set(Math.cos(angle) * 4.2, Math.sin(angle) * 4.2, 0);
        group.add(pod);
      }
    }

    // Floating cellular nutrients / particles around
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 18;
      pos[i + 1] = (Math.random() - 0.5) * 18;
      pos[i + 2] = (Math.random() - 0.5) * 18;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.18,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);
  };

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
    camera.position.set(0, 0, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x022c22, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(12, 15, 12);
    scene.add(keyLight);

    const group = new THREE.Group();
    scene.add(group);
    organismGroupRef.current = group;

    buildOrganism();

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
      if (!isDragging || !organismGroupRef.current) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      organismGroupRef.current.rotation.y += dx * 0.008;
      organismGroupRef.current.rotation.x += dy * 0.008;
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
      const time = clock.getElapsedTime();

      if (isRunning && isAutoRotating && !isDragging && organismGroupRef.current) {
        organismGroupRef.current.rotation.y += delta * 0.3;
      }

      // Organic pulsation based on metabolism
      const speedFactor = metabolismSpeed / 50;
      const pulse = 1 + Math.sin(time * 3 * speedFactor) * 0.04;
      if (membraneMeshRef.current) {
        membraneMeshRef.current.scale.set(pulse, pulse, pulse);
      }
      if (coreMeshRef.current) {
        const corePulse = 1 + Math.sin(time * 5 * speedFactor) * 0.08;
        coreMeshRef.current.scale.set(corePulse, corePulse, corePulse);
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
  }, []);

  // Re-build on component configuration change
  useEffect(() => {
    buildOrganism();
  }, [membraneType, geneticBasis, energySource, motility]);

  // Camera gestures reaction
  useEffect(() => {
    if (!cameraState.isActive) return;

    if (cameraState.currentGesture === 'musht') {
      if (organismGroupRef.current) {
        organismGroupRef.current.rotation.y += 0.06;
      }
    } else if (cameraState.currentGesture === 'chimchish') {
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(10, cameraRef.current.position.z - 0.25);
      }
    } else if (cameraState.currentGesture === 'ochiq_kaft') {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 20);
      }
    }
  }, [cameraState.currentGesture, cameraState.isActive]);

  // Trigger cellular division / mitosis
  const handleCellDivision = () => {
    soundFX.playSuccess();
    setPopulation((prev) => prev * 2);
    setVitality((prev) => Math.min(100, prev + 5));
    onToast(`Hujayra mitoz bo‘linishi muvaffaqiyatli yakunlandi! Yangi populyatsiya: ${population * 2}`, 'muvaffaqiyat');
  };

  // Inject mutation
  const handleInjectMutation = () => {
    soundFX.playMutation();
    const newVitality = Math.max(40, Math.min(99, vitality + (Math.random() > 0.4 ? 6 : -8)));
    setVitality(newVitality);
    onToast(`Genetik mutatsiya sintezlandi. Hayotiylik ko‘rsatkichi: ${newVitality}%`, 'ogohlantirish');
  };

  const handleSynthesize = () => {
    soundFX.playSuccess();
    buildOrganism();
    onSelectObject('Sintetik Proto-Hujayra', 'Yangi sun’iy biologik organizm');
    onToast('Yangi sun’iy hayot shakli muvaffaqiyatli sintezlandi!', 'muvaffaqiyat');
  };

  const handleReset = () => {
    setMembraneType('lipid');
    setGeneticBasis('dnk');
    setEnergySource('atf');
    setMotility('xivchin');
    setMetabolismSpeed(65);
    setVitality(88);
    setPopulation(1);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 20);
    }
    soundFX.playSuccess();
    onToast('Sintetik parametrlar boshlang‘ich holatga qaytarildi.', 'muvaffaqiyat');
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(8, cameraRef.current.position.z - 2.5);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(35, cameraRef.current.position.z + 2.5);
    }
  };

  const handleSave = () => {
    onToast(`Sintetik organizm genotipi saqlandi: Populyatsiya ${population} ta`, 'muvaffaqiyat');
  };

  const handleClear = () => {
    setPopulation(1);
    onToast('Populyatsiya tozalandi (1 ta hujayraga qaytarildi).', 'malumot');
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] overflow-hidden bg-slate-950 select-none">
      {/* 3D Canvas */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Biological Component Selector Tabs */}
      <div className="absolute top-4 left-4 z-20 w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/92 border border-cyan-800/60 shadow-2xl backdrop-blur-xl pointer-events-auto max-h-[calc(100vh-220px)] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-orbitron font-bold text-xs text-white">
              Sintetik Hayot Konstruktori
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">FAOL</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* 1. Membrana turi */}
          <div>
            <label className="text-slate-400 text-[10px] uppercase font-semibold font-rajdhani block mb-1">
              Hujayra Membranasi Turi:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'lipid', label: 'Lipid qavati' },
                { id: 'oqsil', label: 'Oqsil qobig‘i' },
                { id: 'suniy', label: 'Nanokapsula' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    soundFX.playClick();
                    setMembraneType(m.id as any);
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer text-[11px] ${
                    membraneType === m.id
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 font-semibold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Genetik asos */}
          <div>
            <label className="text-slate-400 text-[10px] uppercase font-semibold font-rajdhani block mb-1">
              Genetik Baza:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'dnk', label: 'DNK (Qo‘sh)' },
                { id: 'rnk', label: 'RNK (Katalitik)' },
                { id: 'xna', label: 'XNA (Sintetik)' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    soundFX.playClick();
                    setGeneticBasis(g.id as any);
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer text-[11px] ${
                    geneticBasis === g.id
                      ? 'bg-blue-950/90 border-blue-400 text-blue-300 font-semibold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Energiya manbai */}
          <div>
            <label className="text-slate-400 text-[10px] uppercase font-semibold font-rajdhani block mb-1">
              Energiya Manbai:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'atf', label: 'ATF Sintaza' },
                { id: 'xemo', label: 'Xemosintez' },
                { id: 'foto', label: 'Fototrop' },
              ].map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    soundFX.playClick();
                    setEnergySource(e.id as any);
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer text-[11px] ${
                    energySource === e.id
                      ? 'bg-rose-950/90 border-rose-400 text-rose-300 font-semibold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Harakatlanish */}
          <div>
            <label className="text-slate-400 text-[10px] uppercase font-semibold font-rajdhani block mb-1">
              Harakatlanish Tizimi:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'xivchin', label: 'Xivchinlar' },
                { id: 'amyoba', label: 'Soxta oyoq' },
                { id: 'passiv', label: 'Passiv' },
              ].map((mot) => (
                <button
                  key={mot.id}
                  onClick={() => {
                    soundFX.playClick();
                    setMotility(mot.id as any);
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer text-[11px] ${
                    motility === mot.id
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 font-semibold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metabolism Speed Slider */}
          <div className="pt-1">
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>Metabolizm tezligi</span>
              <span className="font-mono text-cyan-300 font-bold">{metabolismSpeed}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={metabolismSpeed}
              onChange={(e) => setMetabolismSpeed(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Synthesize Button */}
          <button
            onClick={handleSynthesize}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Sintetik Organoidni Yaratish</span>
          </button>
        </div>
      </div>

      {/* Top Right: Vitality & Population Metrics + Action triggers */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* Vitality Card */}
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-4 text-xs">
          <div>
            <div className="text-[10px] text-slate-400 font-rajdhani uppercase">HAYOTIYLIK DARAJASI</div>
            <div className="font-bold text-lg font-mono text-emerald-400">
              {vitality}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-400 font-rajdhani uppercase">POPULYATSIYA SONI</div>
            <div className="font-bold text-lg font-mono text-white">
              {population} ta
            </div>
          </div>
        </div>

        {/* Action Triggers: Mitosis & Mutation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCellDivision}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-700/60 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Hujayra bo‘linishi (Mitoz)</span>
          </button>

          <button
            onClick={handleInjectMutation}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-700/60 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Mutatsiya kiritish</span>
          </button>
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
