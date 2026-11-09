/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppSettings, CameraState } from '../types';
import { soundFX } from '../utils/audio';
import { 
  Settings, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Camera, 
  Sparkles, 
  RotateCcw, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Layers 
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  cameraState: CameraState;
  onToggleCamera: () => void;
  onStartDemo: () => void;
  onToast: (text: string, type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  cameraState,
  onToggleCamera,
  onStartDemo,
  onToast,
}) => {
  const handleResetDefaults = () => {
    soundFX.playSuccess();
    onUpdateSettings({
      grafikaSifati: 'yuqori',
      ovozEffektlari: true,
      kameraSezgirligi: 7,
      avtoAylantirish: true,
      korsatmalarKorsatish: true,
      hologrammaEffekti: true,
    });
    onToast('Barcha tizim sozlamalari standart holatga qaytarildi.', 'muvaffaqiyat');
  };

  return (
    <div className="relative min-h-[calc(100vh-105px)] overflow-y-auto pb-16 px-4 pt-6 cyber-grid select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-xl text-white">
                Tizim va Laboratoriya Sozlamalari
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Grafika, optik kuzatuv va audio modullarini moslashtirish
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Standartga qaytarish</span>
          </button>
        </div>

        {/* 1. Grafika va Vizualizatsiya */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>3D Grafika va Render Sifati</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Vizual Sifat Darajasi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yuqori', label: 'Yuqori (PBR)' },
                  { id: 'orta', label: 'O‘rta' },
                  { id: 'tejamkor', label: 'Tejamkor' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      soundFX.playClick();
                      onUpdateSettings({ grafikaSifati: q.id as any });
                      onToast(`Grafika sifati: ${q.label} tanlandi.`, 'malumot');
                    }}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                      settings.grafikaSifati === q.id
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <div className="font-semibold text-white">Avtomatik Aylantirish</div>
                  <div className="text-[11px] text-slate-400">3D modellarni sekin aylanma harakati</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.avtoAylantirish}
                  onChange={(e) => {
                    soundFX.playClick();
                    onUpdateSettings({ avtoAylantirish: e.target.checked });
                  }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <div className="font-semibold text-white">Holografik Skaner Effekti</div>
                  <div className="text-[11px] text-slate-400">Futuristik laboratoriya to‘r chiziqlari</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hologrammaEffekti}
                  onChange={(e) => {
                    soundFX.playClick();
                    onUpdateSettings({ hologrammaEffekti: e.target.checked });
                  }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Kamera va Optik Boshqaruv */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Kamera va Optik Qo‘l Harakatlari</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <div className="font-semibold text-white">Kamera Holati</div>
                  <div className="text-[11px] text-slate-400">
                    {cameraState.isActive ? 'Kamera ulangan va faol' : 'Kamera o‘chirilgan'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onToggleCamera();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                    cameraState.isActive
                      ? 'bg-rose-950 border-rose-600 text-rose-300'
                      : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  }`}
                >
                  {cameraState.isActive ? 'O‘chirish' : 'Yoqish'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <div className="font-semibold text-white">Demo Simulyatsiya Rejimi</div>
                  <div className="text-[11px] text-slate-400">Kamerasiz virtual harakatlarni sinash</div>
                </div>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onStartDemo();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/80 border border-amber-600 text-amber-300 cursor-pointer"
                >
                  Demo yoqish
                </button>
              </div>
            </div>

            <div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Kamera Sezgirligi</span>
                  <span className="font-mono text-cyan-400 font-bold">{settings.kameraSezgirligi} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.kameraSezgirligi}
                  onChange={(e) => onUpdateSettings({ kameraSezgirligi: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Kamera optik kadrlari orqali musht, chimchish va ko‘rsatkich barmoq harakatlarini aniqlash intensivligi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Audio va Ovoz Effektlari */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Audio va Tovush Effektlari</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <div className="font-semibold text-white">Biolaboratoriya Sintezatori Ovoz Effektlari</div>
              <div className="text-[11px] text-slate-400">
                Web Audio API orqali generatsiya qilinadigan interfeys chertishlari, mutatsiya va skaner tovushlari
              </div>
            </div>
            <button
              onClick={() => {
                const nextVal = !settings.ovozEffektlari;
                soundFX.setEnabled(nextVal);
                if (nextVal) soundFX.playSuccess();
                onUpdateSettings({ ovozEffektlari: nextVal });
                onToast(nextVal ? 'Ovoz effektlari yoqildi.' : 'Ovoz effektlari o‘chirildi.', 'malumot');
              }}
              className={`p-2 rounded-xl border cursor-pointer transition-all ${
                settings.ovozEffektlari
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {settings.ovozEffektlari ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Til va Texnik Sertifikat */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Til va Standartlar</span>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white mb-1">
                To‘liq O‘zbek Tili Standarti (Lotin yozuvi)
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                GENESIS ilovasi 100% tabiiy va ilmiy jihatdan tekshirilgan o‘zbek tilida ishlaydi. Hujayra tuzilishi, DNK nukleotidlari, molekulalar va atom zarrachalari nomlari O‘zbekiston biologiya ta’lim standartlariga to‘liq mos keladi.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
