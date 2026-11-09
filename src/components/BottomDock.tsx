/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Rotate3d, 
  Save, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface BottomDockProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleRotate: () => void;
  isAutoRotating: boolean;
  onSave?: () => void;
  onClear?: () => void;
  explodedProgress?: number;
  onExplodedChange?: (val: number) => void;
  showExplodedSlider?: boolean;
  extraControls?: React.ReactNode;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  onZoomIn,
  onZoomOut,
  onToggleRotate,
  isAutoRotating,
  onSave,
  onClear,
  explodedProgress = 0,
  onExplodedChange,
  showExplodedSlider = false,
  extraControls,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-none select-none">
      {/* Collapse/Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => {
            soundFX.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-slate-900/90 border border-b-0 border-cyan-800/60 text-slate-300 hover:text-cyan-400 text-xs font-semibold shadow-lg backdrop-blur-md cursor-pointer transition-all"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Boshqaruv panelini ko‘rsatish</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Boshqaruv panelini yashirish</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock */}
      {!isCollapsed && (
        <div className="pointer-events-auto bg-slate-950/92 border border-cyan-700/50 rounded-2xl shadow-2xl shadow-cyan-950/60 backdrop-blur-xl p-3 text-xs transition-all">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Primary Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Play / Pause (Boshlash / To‘xtatish) */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onTogglePlay();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border ${
                  isRunning
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-900/70'
                    : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/70 shadow-sm shadow-emerald-500/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>To‘xtatish</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Boshlash</span>
                  </>
                )}
              </button>

              {/* Reset (Qayta tiklash) */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onReset();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta tiklash</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

              {/* Zoom In (Kattalashtirish) */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onZoomIn();
                }}
                title="Kattalashtirish"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Kattalashtirish</span>
              </button>

              {/* Zoom Out (Kichraytirish) */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onZoomOut();
                }}
                title="Kichraytirish"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Kichraytirish</span>
              </button>

              {/* Rotate (Aylantirish) */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onToggleRotate();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isAutoRotating
                    ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>Aylantirish</span>
              </button>
            </div>

            {/* Exploded View Slider (if applicable) */}
            {showExplodedSlider && onExplodedChange && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 min-w-[200px]">
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Qatlamli ajratish</span>
                    <span className="font-mono text-cyan-300">{(explodedProgress * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={explodedProgress}
                    onChange={(e) => onExplodedChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Extra context-specific tools */}
            {extraControls && (
              <div className="flex items-center gap-2">
                {extraControls}
              </div>
            )}

            {/* Secondary Actions: Save (Saqlash) & Clear (O‘chirish) */}
            <div className="flex items-center gap-1.5">
              {onSave && (
                <button
                  onClick={() => {
                    soundFX.playSuccess();
                    onSave();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 text-blue-300 transition-all cursor-pointer font-medium"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              )}

              {onClear && (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onClear();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>O‘chirish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
