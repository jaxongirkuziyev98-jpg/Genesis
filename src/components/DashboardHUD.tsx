/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CameraState, GestureType } from '../types';
import { 
  Cpu, 
  Video, 
  Hand, 
  Target, 
  Gauge, 
  Eye, 
  Sparkles 
} from 'lucide-react';

interface DashboardHUDProps {
  cameraState: CameraState;
  selectedObjectName: string;
  selectedObjectRole?: string;
  onOpenGestureModal?: () => void;
}

export const DashboardHUD: React.FC<DashboardHUDProps> = ({
  cameraState,
  selectedObjectName,
  selectedObjectRole,
  onOpenGestureModal,
}) => {
  const getGestureNameInUzbek = (g: GestureType): { label: string; action: string; color: string } => {
    switch (g) {
      case 'musht':
        return { label: 'Musht', action: 'Aylantirish', color: 'text-amber-400 bg-amber-950/60 border-amber-600/40' };
      case 'chimchish':
        return { label: 'Chimchish', action: 'Kattalashtirish va kichraytirish', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-600/40' };
      case 'ochiq_kaft':
        return { label: 'Ochiq kaft', action: 'Panorama / Tinch', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-600/40' };
      case 'korsatkich':
        return { label: 'Ko‘rsatkich barmoq', action: 'Obyektni tanlash', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-600/40' };
      case 'aniqlanmoqda':
        return { label: 'Qo‘l harakatlari aniqlanmoqda', action: 'Kameraga qarating', color: 'text-sky-400 bg-sky-950/60 border-sky-600/40' };
      default:
        return { label: 'Kutilmoqda', action: 'Faollashtiring', color: 'text-slate-400 bg-slate-900/60 border-slate-700/40' };
    }
  };

  const gestureInfo = getGestureNameInUzbek(cameraState.currentGesture);

  return (
    <div className="w-full bg-slate-950/90 border-b border-cyan-950/60 px-3 py-2 text-xs select-none backdrop-blur-md">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        {/* 1. Tizim holati */}
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider">Tizim holati</div>
            <div className="font-semibold text-emerald-400 truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              Optimal
            </div>
          </div>
        </div>

        {/* 2. Kamera holati */}
        <div 
          onClick={onOpenGestureModal}
          className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80 cursor-pointer hover:border-cyan-700/60 transition-colors"
          title="Qo‘l harakatlari panelini ochish"
        >
          <div className={`p-1 rounded ${cameraState.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            <Video className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider">Kamera holati</div>
            <div className="font-semibold truncate">
              {cameraState.isDemoMode ? (
                <span className="text-amber-300">Demo rejimi</span>
              ) : cameraState.isActive ? (
                <span className="text-emerald-300">Faol / Ulangan</span>
              ) : (
                <span className="text-slate-400">O‘chirilgan</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Qo‘l harakatlari aniqlanmoqda */}
        <div 
          onClick={onOpenGestureModal}
          className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer transition-all ${gestureInfo.color}`}
          title="Qo‘l harakatlari ma'lumotlari"
        >
          <div className="p-1 rounded bg-black/30">
            <Hand className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-300 font-rajdhani uppercase tracking-wider">Qo‘l harakati</div>
            <div className="font-semibold truncate">
              {gestureInfo.label}
            </div>
          </div>
        </div>

        {/* 4. Kuzatuv aniqligi */}
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
          <div className="p-1 rounded bg-sky-500/10 text-sky-400">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider">Kuzatuv aniqligi</div>
            <div className="font-semibold text-sky-300 font-mono">
              {cameraState.isActive ? `${cameraState.trackingAccuracy.toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>

        {/* 5. Kadrlar tezligi */}
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider">Kadrlar tezligi</div>
            <div className="font-semibold text-indigo-300 font-mono">
              {cameraState.isActive ? `${cameraState.fps} FPS` : '60 FPS'}
            </div>
          </div>
        </div>

        {/* 6. Tanlangan obyekt */}
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/70 border border-cyan-800/40">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-cyan-400 font-rajdhani uppercase tracking-wider">Tanlangan obyekt</div>
            <div className="font-bold text-white truncate text-xs" title={selectedObjectName}>
              {selectedObjectName || 'Umumiy ko‘rinish'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
