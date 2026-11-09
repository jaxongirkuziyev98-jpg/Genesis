/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { NavigationTab, CameraState } from '../types';
import { 
  Activity, 
  Dna, 
  Atom, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Hand, 
  Cpu, 
  Play
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface HomeViewProps {
  onNavigate: (tab: NavigationTab) => void;
  cameraState: CameraState;
  onOpenGestureModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  cameraState,
  onOpenGestureModal,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Biolab Core: Multi-layered Hologram Sphere & Orbital Rings
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Central biological core
    const coreGeo = new THREE.IcosahedronGeometry(4.2, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // 2. Inner pulsating energy nucleus
    const nucGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const nucMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false,
    });
    const nucMesh = new THREE.Mesh(nucGeo, nucMat);
    coreGroup.add(nucMesh);

    // 3. Orbital rings
    const ring1Geo = new THREE.TorusGeometry(6.5, 0.08, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(7.8, 0.06, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.6 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 4. Floating bio-particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 24;
      positions[i + 1] = (Math.random() - 0.5) * 24;
      positions[i + 2] = (Math.random() - 0.5) * 24;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2.5, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      coreGroup.rotation.y += delta * 0.25;
      coreGroup.rotation.x += delta * 0.12;
      ring1.rotation.z += delta * 0.3;
      ring2.rotation.x -= delta * 0.2;

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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      nucGeo.dispose();
      nucMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  const modules = [
    {
      tab: 'hujayra' as NavigationTab,
      nomi: 'Hujayra tadqiqotchisi',
      kichikSarlavha: '3D Eukariot hujayra va organoidlar',
      tavsif: 'Yadro, mitoxondriya, membranalar va ATF ishlab chiqaruvchi organoidlarni mikroskopik darajada ko‘zdan kechiring.',
      icon: <Activity className="w-6 h-6 text-cyan-400" />,
      rang: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 hover:border-cyan-400',
    },
    {
      tab: 'dnk' as NavigationTab,
      nomi: 'DNK laboratoriyasi',
      kichikSarlavha: 'Genetik kod va mutatsiyalar',
      tavsif: 'Qo‘sh spiral tuzilishi, A-T va G-C nukleotidlar komplementarligi, mRNK transkripsiyasi va genetik tahrirlash.',
      icon: <Dna className="w-6 h-6 text-rose-400" />,
      rang: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 hover:border-rose-400',
    },
    {
      tab: 'molekulalar' as NavigationTab,
      nomi: 'Molekulalar laboratoriyasi',
      kichikSarlavha: '3D atom bog‘lanishlari va birikmalar',
      tavsif: 'Suv (H₂O), Glyukoza, ATF va aminokislotalarning 3D fazoviy tuzilishi hamda valentlik burchaklarini tadqiq qiling.',
      icon: <Atom className="w-6 h-6 text-amber-400" />,
      rang: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400',
    },
    {
      tab: 'hayot_yaratuvchisi' as NavigationTab,
      nomi: 'Hayot yaratuvchisi',
      kichikSarlavha: 'Sintetik biologiya va proto-hujayralar',
      tavsif: 'Sun’iy hayot shakllarini yaratish: lipid membranalar, fermentativ metabolizm va populyatsiya ko‘payishini simulyatsiya qiling.',
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      rang: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
    },
    {
      tab: 'zarrachalar' as NavigationTab,
      nomi: 'Zarrachalar olami',
      kichikSarlavha: 'Subatom tuzilishi va kvant kuchlari',
      tavsif: 'Protonlar, neytronlar, elektron bulutlari, zarrachalar tezlatgichi va elektromagnit maydon simulyatori.',
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      rang: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 hover:border-indigo-400',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-105px)] overflow-y-auto pb-16 px-4 pt-6 cyber-grid select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-cyan-800/40 p-6 md:p-10 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headlines & Call-to-actions */}
            <div className="lg:col-span-7 space-y-5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                GENESIS BIO-ENGINEERING TIZIMI FAOL
              </div>

              <h1 className="font-orbitron font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
                Hayotning Chuqur <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                  Molekulyar Koinotiga
                </span> Sayohat
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Mikroskopik hujayralardan tortib subatom zarrachalargacha bo‘lgan barcha biologik va kimyoviy jarayonlarni 3D fazoda o‘rganing. Veb-kamera orqali qo‘l harakatlari yordamida modellarni to‘g‘ridan-to‘g‘ri boshqaring.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onNavigate('hujayra');
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Laboratoriyani boshlash</span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    onOpenGestureModal();
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Hand className="w-4 h-4 text-cyan-400" />
                  <span>Qo‘l harakatlari sozlamasi</span>
                </button>
              </div>

              {/* Quick Specs / Indicators */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 max-w-md text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">3D RUXSAT</div>
                  <div className="font-bold text-white font-mono">PBR Ultra HD</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">OPTIK KUZATUV</div>
                  <div className="font-bold text-emerald-400 font-mono">Faol (60 FPS)</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">INTERFEYS TILI</div>
                  <div className="font-bold text-cyan-300 font-mono">O‘zbek tili</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Holographic Canvas Showcase */}
            <div className="lg:col-span-5 h-72 sm:h-80 md:h-96 relative flex items-center justify-center">
              <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />
              <div className="absolute bottom-2 text-center text-[11px] text-cyan-400/80 font-mono pointer-events-none">
                [ 3D Holografik Bio-Yadro Model ]
              </div>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-orbitron font-bold text-xl text-white">
                Ilmiy Laboratoriyalar va Tadqiqot Bo‘limlari
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                O‘rganish uchun kerakli ilmiy modulni tanlang
              </p>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">
              Jami 5 ta asosiy bo‘lim
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.tab}
                onClick={() => {
                  soundFX.playClick();
                  onNavigate(mod.tab);
                }}
                className={`p-5 rounded-xl bg-gradient-to-br ${mod.rang} border backdrop-blur-md cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      {mod.icon}
                    </div>
                    <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold">
                      Kirish <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="font-orbitron font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                    {mod.nomi}
                  </h3>
                  <div className="text-xs text-cyan-400/80 font-medium mt-0.5 mb-2 font-rajdhani">
                    {mod.kichikSarlavha}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.tavsif}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    3D Interaktiv
                  </span>
                  <span className="text-cyan-400 font-medium">Boshlash &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 shrink-0">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-1">Kontaktsiz Qo‘l Boshqaruvi</div>
              <p className="text-slate-400 leading-relaxed">
                Veb-kamera orqali musht, chimchish va ochiq kaft harakatlari bilan modellarni aylantiring va yaqinlashtiring.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-1">Haqiqiy Ilmiy Terminologiya</div>
              <p className="text-slate-400 leading-relaxed">
                Barcha organoidlar, nukleotidlar va kimyoviy birikmalar O‘zbekiston Fanlar akademiyasi biologik standartlariga muvofiq.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-1">Haqiqiy Vaqt Simulyatsiyasi</div>
              <p className="text-slate-400 leading-relaxed">
                Nukleotidlar transkripsiyasi, ATF sintezi va sun'iy hayot shakllarining metabolik hayotiylik darajasini tekshiring.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
