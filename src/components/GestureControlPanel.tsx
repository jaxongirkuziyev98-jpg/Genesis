/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { CameraState, GestureType } from '../types';
import { 
  Camera, 
  CameraOff, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Hand, 
  ZoomIn, 
  Rotate3d, 
  MousePointer, 
  Sliders
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface GestureControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cameraState: CameraState;
  onToggleCamera: () => void;
  onStartDemo: () => void;
  onSetDemoGesture: (gesture: GestureType) => void;
}

export const GestureControlPanel: React.FC<GestureControlPanelProps> = ({
  isOpen,
  onClose,
  cameraState,
  onToggleCamera,
  onStartDemo,
  onSetDemoGesture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // When panel is opened and camera is active
    if (isOpen && cameraState.isActive && !cameraState.isDemoMode) {
      navigator.mediaDevices?.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }).catch(() => {});
    }
  }, [isOpen, cameraState.isActive, cameraState.isDemoMode]);

  if (!isOpen) return null;

  const gesturesGuide: Array<{
    type: GestureType;
    nomi: string;
    amali: string;
    icon: React.ReactNode;
    tavsif: string;
  }> = [
    {
      type: 'musht',
      nomi: 'Musht (Siqilgan qo‘l)',
      amali: 'Aylantirish',
      icon: <Rotate3d className="w-5 h-5 text-amber-400" />,
      tavsif: 'Qo‘lni musht qilib havoda burang: 3D biologik model sizning harakatingizga mos ravishda barcha o‘qlarda aylanadi.',
    },
    {
      type: 'chimchish',
      nomi: 'Chimchish (Bosh va ko‘rsatkich barmoq)',
      amali: 'Kattalashtirish / Kichraytirish',
      icon: <ZoomIn className="w-5 h-5 text-cyan-400" />,
      tavsif: 'Barmoqlarni yaqinlashtiring yoki uzoqlashtiring: mikroskop masshtabi moslashadi.',
    },
    {
      type: 'ochiq_kaft',
      nomi: 'Ochiq kaft',
      amali: 'Panorama va harakatlanish',
      icon: <Hand className="w-5 h-5 text-emerald-400" />,
      tavsif: 'Kaftingizni ochgan holda kameraga ko‘rsating: kamera burchagi markazlashtiriladi.',
    },
    {
      type: 'korsatkich',
      nomi: 'Ko‘rsatkich barmoq',
      amali: 'Tanlash',
      icon: <MousePointer className="w-5 h-5 text-indigo-400" />,
      tavsif: 'Barmoq bilan ekrandagi organoid, molekula yoki zarrachani ko‘rsating va tanlang.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                Qo‘l Harakatlari Boshqaruv Markazi
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Veb-kamera va kompyuter nigohi orqali 3D fazoni kontaktsiz boshqarish
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Status & Live Preview Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camera View Box */}
            <div className="relative aspect-video bg-black/90 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
              {cameraState.isActive && !cameraState.isDemoMode ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                    {cameraState.isDemoMode ? (
                      <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                    ) : (
                      <CameraOff className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    {cameraState.isDemoMode
                      ? 'Demo rejimi faollashtirildi'
                      : 'Kamera o‘chirilgan'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {cameraState.isDemoMode
                      ? 'Virtual harakatlar simulyatsiyasi ishlamoqda'
                      : 'Kamerani yoqish tugmasini bosing'}
                  </p>
                </div>
              )}

              {/* Holographic targeting overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/20 m-2 rounded">
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-cyan-300 font-mono">
                  {cameraState.isActive ? 'OPTIK KUZATUV: FAOL' : 'KUZATUV: NOFAOL'}
                </div>
              </div>
            </div>

            {/* Quick Actions & State */}
            <div className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="text-slate-400 text-[11px]">Hozirgi aniqlangan harakat:</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    {cameraState.currentGesture === 'aniqlanmoqda'
                      ? 'Qo‘l harakatlari aniqlanmoqda...'
                      : cameraState.currentGesture === 'musht'
                      ? 'Musht (Aylantirish)'
                      : cameraState.currentGesture === 'chimchish'
                      ? 'Chimchish (Masshtab)'
                      : cameraState.currentGesture === 'ochiq_kaft'
                      ? 'Ochiq kaft (Panorama)'
                      : cameraState.currentGesture === 'korsatkich'
                      ? 'Ko‘rsatkich barmoq (Tanlash)'
                      : 'Harakat kutilmoqda'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Kuzatuv aniqligi</div>
                    <div className="text-white font-mono font-bold">
                      {cameraState.isActive ? `${cameraState.trackingAccuracy.toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Kadrlar tezligi</div>
                    <div className="text-white font-mono font-bold">
                      {cameraState.isActive ? `${cameraState.fps} FPS` : '0 FPS'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Camera Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onToggleCamera();
                  }}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    cameraState.isActive && !cameraState.isDemoMode
                      ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700/60'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold border border-cyan-400 shadow-lg shadow-cyan-600/30'
                  }`}
                >
                  {cameraState.isActive && !cameraState.isDemoMode ? (
                    <>
                      <CameraOff className="w-4 h-4" />
                      Kamerani o‘chirish
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Kamerani yoqish
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    onStartDemo();
                  }}
                  className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    cameraState.isDemoMode
                      ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {cameraState.isDemoMode ? 'Demo rejimi faollashtirildi' : 'Demo rejimini yoqish (Virtual)'}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Manual Gesture Trigger in Demo Mode */}
          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-cyan-900/50">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Qo‘l harakatlarini tezkor sinab ko‘rish:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gesturesGuide.map((g) => (
                <button
                  key={g.type}
                  onClick={() => {
                    soundFX.playClick();
                    onSetDemoGesture(g.type);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    cameraState.currentGesture === g.type
                      ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-300 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {g.icon}
                    {cameraState.currentGesture === g.type && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-white truncate">{g.amali}</div>
                  <div className="text-[9px] text-slate-500 truncate">{g.nomi}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Gesture Guide Cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-rajdhani">
              Harakatlar Bo‘yicha Qo‘llanma
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gesturesGuide.map((g) => (
                <div
                  key={g.type}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {g.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {g.nomi}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-medium mb-1">
                      Vazifasi: {g.amali}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {g.tavsif}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>GENESIS Optik Boshqaruv Dasturi v2.4</span>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
