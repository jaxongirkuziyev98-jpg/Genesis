/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { NUCLEOTIDES, INITIAL_DNA_CHAIN } from '../data/biologyData';
import { CameraState } from '../types';
import { BottomDock } from '../components/BottomDock';
import { soundFX } from '../utils/audio';
import { 
  Dna, 
  Sparkles, 
  FileText, 
  Play, 
  RotateCcw, 
  Plus, 
  RefreshCw, 
  Zap, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface DnaLabViewProps {
  cameraState: CameraState;
  onSelectObject: (nomi: string, roli?: string) => void;
  onToast: (text: string, type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot') => void;
}

export const DnaLabView: React.FC<DnaLabViewProps> = ({
  cameraState,
  onSelectObject,
  onToast,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [dnaChain, setDnaChain] = useState<Array<{ id: string; base: 'A' | 'T' | 'G' | 'C' }>>(INITIAL_DNA_CHAIN);
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [transcriptionActive, setTranscriptionActive] = useState<boolean>(false);
  const [mrnaSequence, setMrnaSequence] = useState<string>('');
  const [translatedProtein, setTranslatedProtein] = useState<string>('');

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dnaGroupRef = useRef<THREE.Group | null>(null);

  // Helper: Get complementary base
  const getComplement = (base: 'A' | 'T' | 'G' | 'C'): 'A' | 'T' | 'G' | 'C' => {
    switch (base) {
      case 'A': return 'T';
      case 'T': return 'A';
      case 'G': return 'C';
      case 'C': return 'G';
    }
  };

  const getBaseColor = (base: string): number => {
    switch (base) {
      case 'A': return 0x3b82f6; // Adenin (Ko‘k)
      case 'T': return 0xef4444; // Timin (Qizil)
      case 'G': return 0x10b981; // Guanin (Yashil)
      case 'C': return 0xf59e0b; // Sitozin (Sariq)
      default: return 0x94a3b8;
    }
  };

  // Re-build 3D Helix whenever dnaChain changes
  const buildHelixGeometry = useCallback(() => {
    if (!dnaGroupRef.current) return;
    const group = dnaGroupRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const totalSteps = dnaChain.length;
    const stepHeight = 1.35;
    const radius = 3.6;
    const twistPerStep = 0.52; // ~30 degrees per base pair (10.5 bp per turn)

    // Strand 1 and Strand 2 curve points
    const pointsStrand1: THREE.Vector3[] = [];
    const pointsStrand2: THREE.Vector3[] = [];

    dnaChain.forEach((item, i) => {
      const angle = i * twistPerStep;
      const y = (i - totalSteps / 2) * stepHeight;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      const p1 = new THREE.Vector3(x1, y, z1);
      const p2 = new THREE.Vector3(x2, y, z2);

      pointsStrand1.push(p1);
      pointsStrand2.push(p2);

      // Pair connector bar (Base 1 + Base 2)
      const base1 = item.base;
      const base2 = getComplement(base1);

      const midPoint = new THREE.Vector3(0, y, 0);

      // Half-rung 1
      const rung1Dir = new THREE.Vector3().subVectors(midPoint, p1);
      const rung1Len = rung1Dir.length();
      const rung1Geo = new THREE.CylinderGeometry(0.22, 0.22, rung1Len, 12);
      const rung1Mat = new THREE.MeshStandardMaterial({
        color: getBaseColor(base1),
        emissive: getBaseColor(base1),
        emissiveIntensity: selectedPairIndex === i ? 0.6 : 0.2,
        roughness: 0.3,
      });
      const rung1Mesh = new THREE.Mesh(rung1Geo, rung1Mat);
      rung1Mesh.position.copy(p1).add(rung1Dir.clone().multiplyScalar(0.5));
      rung1Mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rung1Dir.clone().normalize());
      group.add(rung1Mesh);

      // Half-rung 2
      const rung2Dir = new THREE.Vector3().subVectors(p2, midPoint);
      const rung2Len = rung2Dir.length();
      const rung2Geo = new THREE.CylinderGeometry(0.22, 0.22, rung2Len, 12);
      const rung2Mat = new THREE.MeshStandardMaterial({
        color: getBaseColor(base2),
        emissive: getBaseColor(base2),
        emissiveIntensity: selectedPairIndex === i ? 0.6 : 0.2,
        roughness: 0.3,
      });
      const rung2Mesh = new THREE.Mesh(rung2Geo, rung2Mat);
      rung2Mesh.position.copy(midPoint).add(rung2Dir.clone().multiplyScalar(0.5));
      rung2Mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rung2Dir.clone().normalize());
      group.add(rung2Mesh);

      // Hydrogen bond marker in center
      const hBondGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const hBondMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hBond = new THREE.Mesh(hBondGeo, hBondMat);
      hBond.position.copy(midPoint);
      group.add(hBond);

      // Nucleotide spheres on the outside backbone
      const sphereGeo = new THREE.SphereGeometry(0.52, 16, 16);
      const sphere1 = new THREE.Mesh(sphereGeo, rung1Mat);
      sphere1.position.copy(p1);
      group.add(sphere1);

      const sphere2 = new THREE.Mesh(sphereGeo, rung2Mat);
      sphere2.position.copy(p2);
      group.add(sphere2);
    });

    // Create smooth continuous sugar-phosphate backbone tubes
    if (pointsStrand1.length > 1) {
      const curve1 = new THREE.CatmullRomCurve3(pointsStrand1);
      const tubeGeo1 = new THREE.TubeGeometry(curve1, totalSteps * 4, 0.18, 12, false);
      const tubeMat1 = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.2,
        metalness: 0.6,
      });
      const tubeMesh1 = new THREE.Mesh(tubeGeo1, tubeMat1);
      group.add(tubeMesh1);

      const curve2 = new THREE.CatmullRomCurve3(pointsStrand2);
      const tubeGeo2 = new THREE.TubeGeometry(curve2, totalSteps * 4, 0.18, 12, false);
      const tubeMat2 = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.2,
        metalness: 0.6,
      });
      const tubeMesh2 = new THREE.Mesh(tubeGeo2, tubeMat2);
      group.add(tubeMesh2);
    }
  }, [dnaChain, selectedPairIndex]);

  // Three.js Mount & Animation
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 26);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 1.2);
    dirLight2.position.set(-15, -15, -10);
    scene.add(dirLight2);

    const group = new THREE.Group();
    scene.add(group);
    dnaGroupRef.current = group;

    buildHelixGeometry();

    // Mouse drag rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dnaGroupRef.current) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      dnaGroupRef.current.rotation.y += dx * 0.008;
      dnaGroupRef.current.rotation.x += dy * 0.008;
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

      if (isRunning && isAutoRotating && !isDragging && dnaGroupRef.current) {
        dnaGroupRef.current.rotation.y += delta * 0.35;
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
  }, [buildHelixGeometry, isAutoRotating, isRunning]);

  // Trigger rebuild when helix changes
  useEffect(() => {
    buildHelixGeometry();
  }, [dnaChain, selectedPairIndex, buildHelixGeometry]);

  // Camera gesture reaction
  useEffect(() => {
    if (!cameraState.isActive) return;

    if (cameraState.currentGesture === 'musht') {
      if (dnaGroupRef.current) {
        dnaGroupRef.current.rotation.y += 0.06;
      }
    } else if (cameraState.currentGesture === 'chimchish') {
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(12, cameraRef.current.position.z - 0.3);
      }
    } else if (cameraState.currentGesture === 'ochiq_kaft') {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 26);
      }
    }
  }, [cameraState.currentGesture, cameraState.isActive]);

  // Nucleotide mutation action
  const handleMutateBase = (idx: number, newBase: 'A' | 'T' | 'G' | 'C') => {
    soundFX.playMutation();
    const updated = [...dnaChain];
    updated[idx] = { ...updated[idx], base: newBase };
    setDnaChain(updated);
    setSelectedPairIndex(idx);
    onSelectObject(
      `Nukleotid: ${newBase} — ${getComplement(newBase)}`,
      `DNK zanjiridagi ${idx + 1}-juftlik mutatsiyalandi`
    );
    onToast(`${idx + 1}-juftlik muvaffaqiyatli mutatsiyalandi: ${newBase} — ${getComplement(newBase)}`, 'muvaffaqiyat');
  };

  // Add new base pair
  const handleAddBasePair = () => {
    soundFX.playClick();
    const bases: ('A' | 'T' | 'G' | 'C')[] = ['A', 'T', 'G', 'C'];
    const randomBase = bases[Math.floor(Math.random() * bases.length)];
    const newItem = {
      id: String(Date.now()),
      base: randomBase,
    };
    setDnaChain([...dnaChain, newItem]);
    onToast(`Yangi nukleotid juftligi qo‘shildi: ${randomBase} — ${getComplement(randomBase)}`, 'muvaffaqiyat');
  };

  // Transcription simulation (DNA -> mRNA with Uracil)
  const handleTranscribe = () => {
    soundFX.playSuccess();
    setTranscriptionActive(true);
    // Transcription: A -> U, T -> A, G -> C, C -> G
    const mrna = dnaChain.map(item => {
      switch (item.base) {
        case 'A': return 'U';
        case 'T': return 'A';
        case 'G': return 'C';
        case 'C': return 'G';
      }
    }).join(' ');

    setMrnaSequence(mrna);

    // Simple peptide translation
    const aminoMap: Record<string, string> = {
      'AUG': 'Met (Boshlash)',
      'GUA': 'Val',
      'UAC': 'Tir',
      'CGA': 'Arg',
      'AGC': 'Ser',
      'UGG': 'Trp',
      'UAA': 'To‘xtash',
    };
    const codons = mrna.replace(/\s+/g, '').match(/.{1,3}/g) || [];
    const translated = codons.map(c => aminoMap[c] || 'Ala/Glitsin').join(' - ');
    setTranslatedProtein(translated);

    onToast('mRNK transkripsiyasi va oqsil translyatsiyasi yakunlandi!', 'muvaffaqiyat');
  };

  const handleReset = () => {
    setDnaChain(INITIAL_DNA_CHAIN);
    setSelectedPairIndex(0);
    setTranscriptionActive(false);
    setMrnaSequence('');
    setTranslatedProtein('');
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 26);
    }
    if (dnaGroupRef.current) {
      dnaGroupRef.current.rotation.set(0, 0, 0);
    }
    soundFX.playSuccess();
    onToast('DNK zanjiri asl holatiga qaytarildi.', 'muvaffaqiyat');
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(10, cameraRef.current.position.z - 3);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(48, cameraRef.current.position.z + 3);
    }
  };

  const handleSave = () => {
    onToast(`DNK ketma-ketligi saqlandi: ${dnaChain.length} ta nukleotid juftligi`, 'muvaffaqiyat');
  };

  const handleClear = () => {
    if (dnaChain.length > 4) {
      setDnaChain(dnaChain.slice(0, 4));
      onToast('DNK zanjiri qisqartirildi.', 'malumot');
    }
  };

  const currentPair = dnaChain[selectedPairIndex];

  return (
    <div className="relative w-full h-[calc(100vh-105px)] overflow-hidden bg-slate-950 select-none">
      {/* 3D Canvas */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Legend for Nucleotides */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="text-[10px] text-slate-400 font-rajdhani uppercase font-semibold mb-2">
            Nukleotidlar Komplementarligi
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-white font-medium">Adenin (A)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-white font-medium">Timin (T)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-white font-medium">Guanin (G)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-white font-medium">Sitozin (C)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Transcription Action Button */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={handleTranscribe}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>mRNK Transkripsiyasi</span>
        </button>

        <button
          onClick={handleAddBasePair}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Yangi juftlik qo‘shish</span>
        </button>
      </div>

      {/* Center-Top: Transcription & Translation Result Banner */}
      {transcriptionActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto animate-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <FileText className="w-3.5 h-3.5" />
                <span>Transkripsiya va Translyatsiya Natijasi</span>
              </div>
              <button
                onClick={() => setTranscriptionActive(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Yopish
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">mRNK KETMA-KETLIGI (A &rarr; U, T &rarr; A, G &rarr; C, C &rarr; G):</span>
                <div className="font-mono text-cyan-300 font-bold tracking-widest break-all bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                  {mrnaSequence}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-mono">SINTEZLANADIGAN POLIPEPTID ZANJIRI:</span>
                <div className="font-mono text-emerald-300 font-semibold text-[11px] bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                  {translatedProtein}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Bottom: Interactive Sequence Navigator & Mutator */}
      <div className="absolute bottom-24 left-4 z-20 w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/92 border border-cyan-800/60 shadow-2xl backdrop-blur-xl pointer-events-auto">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-cyan-400" />
            <h4 className="font-orbitron font-bold text-xs text-white">
              Nukleotidlar Tahrirlovchisi
            </h4>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            Jami: {dnaChain.length} juftlik
          </span>
        </div>

        {/* Horizontal scrollable sequence strip */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {dnaChain.map((item, idx) => {
            const isSel = selectedPairIndex === idx;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedPairIndex(idx);
                  onSelectObject(`Juftlik #${idx + 1}: ${item.base} — ${getComplement(item.base)}`);
                }}
                className={`p-1.5 rounded-lg border text-center min-w-[36px] transition-all cursor-pointer ${
                  isSel
                    ? 'bg-cyan-950/90 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[9px] text-slate-500 font-mono">#{idx + 1}</div>
                <div className="font-bold text-xs font-mono" style={{ color: item.base === 'A' ? '#3b82f6' : item.base === 'T' ? '#ef4444' : item.base === 'G' ? '#10b981' : '#f59e0b' }}>
                  {item.base}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {getComplement(item.base)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pair Mutation Buttons */}
        {currentPair && (
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="text-[11px] text-slate-400 mb-1.5 flex justify-between">
              <span>Tanlangan #{selectedPairIndex + 1}-juftlikni almashtirish:</span>
              <span className="font-mono font-bold text-cyan-400">{currentPair.base} = {getComplement(currentPair.base)}</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['A', 'T', 'G', 'C'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => handleMutateBase(selectedPairIndex, b)}
                  className={`py-1.5 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                    currentPair.base === b
                      ? 'bg-cyan-900/60 border-cyan-400 text-white'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}
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
