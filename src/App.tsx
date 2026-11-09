/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  NavigationTab, 
  CameraState, 
  GestureType, 
  AppSettings 
} from './types';
import { cameraGestureManager } from './utils/cameraGesture';
import { soundFX } from './utils/audio';
import { Navbar } from './components/Navbar';
import { DashboardHUD } from './components/DashboardHUD';
import { GestureControlPanel } from './components/GestureControlPanel';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { HomeView } from './views/HomeView';
import { CellExplorerView } from './views/CellExplorerView';
import { DnaLabView } from './views/DnaLabView';
import { MoleculesLabView } from './views/MoleculesLabView';
import { LifeCreatorView } from './views/LifeCreatorView';
import { ParticleWorldView } from './views/ParticleWorldView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('bosh_sahifa');
  const [cameraState, setCameraState] = useState<CameraState>(cameraGestureManager.getState());
  const [selectedObjectName, setSelectedObjectName] = useState<string>('Bio-Yadro Modeli');
  const [selectedObjectRole, setSelectedObjectRole] = useState<string>('Boshqaruv va energiya markazi');
  const [isGestureModalOpen, setIsGestureModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const prevGestureRef = useRef<GestureType>('yoq');

  const [settings, setSettings] = useState<AppSettings>({
    grafikaSifati: 'yuqori',
    ovozEffektlari: true,
    kameraSezgirligi: 7,
    avtoAylantirish: true,
    korsatmalarKorsatish: true,
    hologrammaEffekti: true,
  });

  // Add toast notification
  const addToast = useCallback((text: string, type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot' = 'malumot') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to camera gesture manager updates
  useEffect(() => {
    const unsub = cameraGestureManager.subscribe((st) => {
      setCameraState(st);

      // Handle gesture change toast
      if (
        st.isActive &&
        st.currentGesture !== 'yoq' &&
        st.currentGesture !== 'aniqlanmoqda' &&
        st.currentGesture !== prevGestureRef.current
      ) {
        prevGestureRef.current = st.currentGesture;
        soundFX.playScan();
        addToast('Qo‘l harakati aniqlandi.', 'muvaffaqiyat');
      }
    });

    // Startup notification
    addToast('Tizim muvaffaqiyatli ishga tushdi.', 'muvaffaqiyat');

    return () => {
      unsub();
      cameraGestureManager.stopCamera();
    };
  }, [addToast]);

  // Toggle Camera
  const handleToggleCamera = async () => {
    if (cameraState.isActive && !cameraState.isDemoMode) {
      cameraGestureManager.stopCamera();
      addToast('Kamera o‘chirildi.', 'malumot');
    } else {
      try {
        await cameraGestureManager.startCamera();
        addToast('Kamera muvaffaqiyatli yoqildi.', 'muvaffaqiyat');
      } catch {
        addToast('Kamera bilan bog‘lanib bo‘lmadi.', 'xato');
      }
    }
  };

  // Toggle Demo Mode
  const handleStartDemo = () => {
    cameraGestureManager.startDemoMode();
    addToast('Demo rejimi faollashtirildi.', 'ogohlantirish');
  };

  const handleSetDemoGesture = (gesture: GestureType) => {
    cameraGestureManager.setDemoGesture(gesture);
    addToast('Qo‘l harakati aniqlandi.', 'muvaffaqiyat');
  };

  const handleSelectObject = (nomi: string, roli?: string) => {
    setSelectedObjectName(nomi);
    if (roli) setSelectedObjectRole(roli);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleSound = () => {
    const nextVal = !settings.ovozEffektlari;
    soundFX.setEnabled(nextVal);
    setSettings((prev) => ({ ...prev, ovozEffektlari: nextVal }));
    addToast(nextVal ? 'Ovoz effektlari yoqildi.' : 'Ovoz effektlari o‘chirildi.', 'malumot');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navbar with main tabs in Uzbek */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          // Update selected object default based on tab
          switch (tab) {
            case 'bosh_sahifa':
              setSelectedObjectName('Bio-Yadro Modeli');
              break;
            case 'hujayra':
              setSelectedObjectName('Mitoxondriya');
              break;
            case 'dnk':
              setSelectedObjectName('Adenin — Timin juftligi');
              break;
            case 'molekulalar':
              setSelectedObjectName('Suv (H₂O)');
              break;
            case 'hayot_yaratuvchisi':
              setSelectedObjectName('Sintetik Proto-Hujayra');
              break;
            case 'zarrachalar':
              setSelectedObjectName('Uglerod Atomi (C)');
              break;
            case 'sozlamalar':
              setSelectedObjectName('Tizim konfiguratsiyasi');
              break;
          }
        }}
        cameraState={cameraState}
        onToggleCamera={handleToggleCamera}
        soundEnabled={settings.ovozEffektlari}
        onToggleSound={handleToggleSound}
      />

      {/* Dashboard HUD */}
      <DashboardHUD
        cameraState={cameraState}
        selectedObjectName={selectedObjectName}
        selectedObjectRole={selectedObjectRole}
        onOpenGestureModal={() => setIsGestureModalOpen(true)}
      />

      {/* Main Views Container */}
      <main className="flex-1 relative overflow-hidden">
        {currentTab === 'bosh_sahifa' && (
          <HomeView
            onNavigate={(tab) => setCurrentTab(tab)}
            cameraState={cameraState}
            onOpenGestureModal={() => setIsGestureModalOpen(true)}
          />
        )}

        {currentTab === 'hujayra' && (
          <CellExplorerView
            cameraState={cameraState}
            onSelectObject={handleSelectObject}
            onToast={addToast}
          />
        )}

        {currentTab === 'dnk' && (
          <DnaLabView
            cameraState={cameraState}
            onSelectObject={handleSelectObject}
            onToast={addToast}
          />
        )}

        {currentTab === 'molekulalar' && (
          <MoleculesLabView
            cameraState={cameraState}
            onSelectObject={handleSelectObject}
            onToast={addToast}
          />
        )}

        {currentTab === 'hayot_yaratuvchisi' && (
          <LifeCreatorView
            cameraState={cameraState}
            onSelectObject={handleSelectObject}
            onToast={addToast}
          />
        )}

        {currentTab === 'zarrachalar' && (
          <ParticleWorldView
            cameraState={cameraState}
            onSelectObject={handleSelectObject}
            onToast={addToast}
          />
        )}

        {currentTab === 'sozlamalar' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            cameraState={cameraState}
            onToggleCamera={handleToggleCamera}
            onStartDemo={handleStartDemo}
            onToast={addToast}
          />
        )}
      </main>

      {/* Hand Gesture Modal & Optical Video Feed */}
      <GestureControlPanel
        isOpen={isGestureModalOpen}
        onClose={() => setIsGestureModalOpen(false)}
        cameraState={cameraState}
        onToggleCamera={handleToggleCamera}
        onStartDemo={handleStartDemo}
        onSetDemoGesture={handleSetDemoGesture}
      />

      {/* Notification Toasts in Uzbek */}
      <NotificationToast
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}
