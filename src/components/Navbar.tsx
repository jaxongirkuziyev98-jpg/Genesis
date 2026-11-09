/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  NavigationTab, 
  CameraState 
} from '../types';
import { 
  Dna, 
  Atom, 
  Activity, 
  Sparkles, 
  Settings, 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX,
  Compass,
  Zap,
  Globe2
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  cameraState: CameraState;
  onToggleCamera: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  cameraState,
  onToggleCamera,
  soundEnabled,
  onToggleSound,
}) => {
  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode }> = [
    { id: 'bosh_sahifa', label: 'Bosh sahifa', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'hujayra', label: 'Hujayra tadqiqotchisi', icon: <Activity className="w-4 h-4" /> },
    { id: 'dnk', label: 'DNK laboratoriyasi', icon: <Dna className="w-4 h-4" /> },
    { id: 'molekulalar', label: 'Molekulalar laboratoriyasi', icon: <Atom className="w-4 h-4" /> },
    { id: 'hayot_yaratuvchisi', label: 'Hayot yaratuvchisi', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'zarrachalar', label: 'Zarrachalar olami', icon: <Zap className="w-4 h-4" /> },
    { id: 'sozlamalar', label: 'Sozlamalar', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-cyan-900/40 px-3 py-2.5 shadow-2xl shadow-cyan-950/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div 
          onClick={() => {
            soundFX.playClick();
            onTabChange('bosh_sahifa');
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                GENESIS
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/60 font-mono">
                BIO-3D
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider hidden sm:block">
              Interaktiv Bio-Laboratoriya
            </p>
          </div>
        </div>

        {/* Navigation Tabs in Uzbek */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-2xl">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFX.playClick();
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? "Ovozni o‘chirish" : "Ovozni yoqish"}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-700/60 transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Camera Gestures Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleCamera();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              cameraState.isActive
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/50 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/90 border-slate-700/70 text-slate-300 hover:border-cyan-600 hover:text-cyan-300'
            }`}
          >
            {cameraState.isActive ? (
              <>
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Kamerani o‘chirish</span>
                <span className="sm:hidden">Kamera</span>
              </>
            ) : (
              <>
                <CameraOff className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Kamerani yoqish</span>
                <span className="sm:hidden">Kamera</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
