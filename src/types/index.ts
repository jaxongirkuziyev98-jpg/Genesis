/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NavigationTab = 
  | 'bosh_sahifa'
  | 'hujayra'
  | 'dnk'
  | 'molekulalar'
  | 'hayot_yaratuvchisi'
  | 'zarrachalar'
  | 'sozlamalar';

export type GestureType = 
  | 'aniqlanmoqda'
  | 'musht'          // Fist -> Aylantirish / Usulash
  | 'chimchish'      // Pinch -> Kattalashtirish / Masshtab
  | 'ochiq_kaft'     // Open Palm -> Panorama / Tinchlantirish
  | 'korsatkich'     // Point -> Tanlash
  | 'yoq';

export interface CameraState {
  isActive: boolean;
  isPermissionGranted: boolean;
  isDetecting: boolean;
  currentGesture: GestureType;
  trackingAccuracy: number; // e.g. 98.4%
  fps: number;
  isDemoMode: boolean;
  error: string | null;
}

export interface OrganelleInfo {
  id: string;
  nomi: string;
  ilmiyNomi: string;
  vazifasi: string;
  tuzilishi: string;
  energiyaHissasi: string;
  olchami: string;
  rang: string;
}

export interface NucleotideBase {
  id: string;
  tur: 'A' | 'T' | 'G' | 'C';
  nomi: string;
  komplementar: 'A' | 'T' | 'G' | 'C';
  rang: string;
}

export interface MoleculeData {
  id: string;
  nomi: string;
  kimyoviyFormula: string;
  tavsif: string;
  molekulyarOgirlik: string;
  biologikRoli: string;
  atomlarSoni: number;
  boglanishlarSoni: number;
  rang: string;
}

export interface SyntheticOrganism {
  id: string;
  nomi: string;
  membranaTuri: 'lipid' | 'oqsil' | 'suniy';
  genetikKod: string;
  metabolizmTezligi: number; // 1-100
  chidamlikDarajasi: number; // 1-100
  hayotiylikKorsatkichi: number; // Vitality score 0-100%
  populyatsiya: number;
  rang: string;
}

export interface ParticleConfig {
  protonlar: number;
  neytronlar: number;
  elektronlar: number;
  zaryad: number;
  harorat: number;
  elektromagnitMaydon: boolean;
  tortishishKuchi: number;
}

export interface AppSettings {
  grafikaSifati: 'yuqori' | 'orta' | 'tejamkor';
  ovozEffektlari: boolean;
  kameraSezgirligi: number; // 1-10
  avtoAylantirish: boolean;
  korsatmalarKorsatish: boolean;
  hologrammaEffekti: boolean;
}
