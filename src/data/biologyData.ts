/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrganelleInfo, NucleotideBase, MoleculeData } from '../types';

export const ORGANELLES: OrganelleInfo[] = [
  {
    id: 'yadro',
    nomi: 'Yadro',
    ilmiyNomi: 'Nucleus',
    vazifasi: 'Irsiy axborotni (DNK) saqlash, himoyalash va hujayraning barcha faoliyatini boshqarish.',
    tuzilishi: 'Ikki qavatli yadro membranasi, yadro teshikchalari, xromatin tolalari va yadrochadan iborat.',
    energiyaHissasi: 'Boshqaruvchi markaz (15%)',
    olchami: '5 - 10 mkm',
    rang: '#38bdf8', // Light Cyan
  },
  {
    id: 'mitoxondriya',
    nomi: 'Mitoxondriya',
    ilmiyNomi: 'Mitochondrion',
    vazifasi: 'Hujayraning quvvat manbai. Kislorodli nafas olish orqali ATF (adenozintrifosfat) energiyasini sintezlaydi.',
    tuzilishi: 'Tashqi silliq membrana, ichki burmali kristalar va fermentlarga boy matriks.',
    energiyaHissasi: 'Asosiy ATF ishlab chiqaruvchi (80%)',
    olchami: '0.5 - 2 mkm',
    rang: '#f43f5e', // Rose
  },
  {
    id: 'sitoplazma',
    nomi: 'Sitoplazma',
    ilmiyNomi: 'Cytoplasma',
    vazifasi: 'Hujayraning ichki muhiti. Organoidlarni o‘zaro bog‘laydi va moddalar almashinuvini ta’minlaydi.',
    tuzilishi: 'Gialoplazma (suyuq qism) va sitoskelet oqsil mikroipchalari to‘ri.',
    energiyaHissasi: 'Glikoliz orqali boshlang‘ich energiya (5%)',
    olchami: 'Hujayra hajmining 70% qismi',
    rang: '#06b6d4', // Cyan
  },
  {
    id: 'ribosoma',
    nomi: 'Ribosoma',
    ilmiyNomi: 'Ribosome',
    vazifasi: 'Genetik kod asosida oqsillar sintezini (translyatsiya) amalga oshiradi.',
    tuzilishi: 'Katta va kichik ribosomal subbirliklar, rRNK va oqsillardan tashkil topgan.',
    energiyaHissasi: 'Oqsil hosil qilishda ATF sarflaydi',
    olchami: '20 - 30 nm',
    rang: '#eab308', // Amber
  },
  {
    id: 'membrana',
    nomi: 'Hujayra membranasi',
    ilmiyNomi: 'Membrana cellularis',
    vazifasi: 'Hujayrani tashqi muhitdan ajratish, selektiv o‘tkazuvchanlik va retseptorlik signallarini qabul qilish.',
    tuzilishi: 'Fosfolipid qo‘shqavati va unga kirib turgan integral oqsillar mozaikasi.',
    energiyaHissasi: 'Ion gradienti potentsiali',
    olchami: '7 - 10 nm qalinlik',
    rang: '#10b981', // Emerald
  },
  {
    id: 'golji',
    nomi: 'Golji majmuasi',
    ilmiyNomi: 'Apparatus Golgensis',
    vazifasi: 'Oqsillarni yakuniy modifikatsiyalash, saralash va pufakchalar orqali tashqi muhitga eksport qilish.',
    tuzilishi: 'Yassi membranali sisternalar to‘plami va sekretsiya vakuolalari.',
    energiyaHissasi: 'Vezikulyar transport',
    olchami: '1 - 3 mkm',
    rang: '#a855f7', // Purple
  },
  {
    id: 'lizosoma',
    nomi: 'Lizosoma',
    ilmiyNomi: 'Lysosoma',
    vazifasi: 'Hujayra ichidagi eskirgan tuzilmalar va begona zarrachalarni gidrolitik fermentlar bilan parchalash.',
    tuzilishi: 'Bir qavatli membrana va ichida 50 dan ortiq hazm qilish kislotali fermentlari.',
    energiyaHissasi: 'Organik moddalarni qayta ishlash',
    olchami: '0.2 - 0.5 mkm',
    rang: '#fb923c', // Orange
  },
];

export const NUCLEOTIDES: NucleotideBase[] = [
  { id: 'A', tur: 'A', nomi: 'Adenin', komplementar: 'T', rang: '#3b82f6' }, // Blue
  { id: 'T', tur: 'T', nomi: 'Timin', komplementar: 'A', rang: '#ef4444' }, // Red
  { id: 'G', tur: 'G', nomi: 'Guanin', komplementar: 'C', rang: '#10b981' }, // Green
  { id: 'C', tur: 'C', nomi: 'Sitozin', komplementar: 'G', rang: '#f59e0b' }, // Yellow/Orange
];

export const INITIAL_DNA_CHAIN: Array<{ id: string; base: 'A' | 'T' | 'G' | 'C' }> = [
  { id: '1', base: 'A' },
  { id: '2', base: 'T' },
  { id: '3', base: 'G' },
  { id: '4', base: 'C' },
  { id: '5', base: 'T' },
  { id: '6', base: 'A' },
  { id: '7', base: 'C' },
  { id: '8', base: 'G' },
  { id: '9', base: 'A' },
  { id: '10', base: 'A' },
  { id: '11', base: 'T' },
  { id: '12', base: 'C' },
];

export const MOLECULES: MoleculeData[] = [
  {
    id: 'h2o',
    nomi: 'Suv (H₂O)',
    kimyoviyFormula: 'H₂O',
    tavsif: 'Barcha tirik organizmlarning asosiy erituvchisi va biokimyoviy reaksiyalar muhiti.',
    molekulyarOgirlik: '18.015 g/mol',
    biologikRoli: 'Gidratatsiya, haroratni termoregulyatsiya qilish va fotosintezda elektron manbai.',
    atomlarSoni: 3,
    boglanishlarSoni: 2,
    rang: '#38bdf8',
  },
  {
    id: 'glucose',
    nomi: 'Glyukoza (C₆H₁₂O₆)',
    kimyoviyFormula: 'C₆H₁₂O₆',
    tavsif: 'Hujayralar uchun universal birlamchi kimyoviy energiya manbai hisoblangan monosaxarid.',
    molekulyarOgirlik: '180.156 g/mol',
    biologikRoli: 'Hujayra nafas olishida parchalanib ATF sintezi uchun substrat beradi.',
    atomlarSoni: 24,
    boglanishlarSoni: 24,
    rang: '#fbbf24',
  },
  {
    id: 'atp',
    nomi: 'ATF (Adenozintrifosfat)',
    kimyoviyFormula: 'C₁₀H₁₆N₅O₁₃P₃',
    tavsif: 'Biologik tizimlarning universal universal energiya valyutasi bo‘lgan makroergik birikma.',
    molekulyarOgirlik: '507.18 g/mol',
    biologikRoli: 'Fosfat bog‘larining uzilishi natijasida 30.6 kJ/mol foydali erkin energiya ajratadi.',
    atomlarSoni: 47,
    boglanishlarSoni: 49,
    rang: '#f43f5e',
  },
  {
    id: 'alanine',
    nomi: 'Alanin (Aminokislota)',
    kimyoviyFormula: 'C₃H₇NO₂',
    tavsif: 'Oqsillar polimer zanjirini tuzishda ishtirok etuvchi alifatik aminokislota.',
    molekulyarOgirlik: '89.09 g/mol',
    biologikRoli: 'Oqsil sintezi va jigar-mushak glyukoza-alanin siklida muhim qatnashchi.',
    atomlarSoni: 13,
    boglanishlarSoni: 12,
    rang: '#34d399',
  },
  {
    id: 'co2',
    nomi: 'Karbonat angidrid (CO₂)',
    kimyoviyFormula: 'CO₂',
    tavsif: 'Hujayra nafas olishining oxirgi mahsuloti va fotosintezning asosiy xomashyosi.',
    molekulyarOgirlik: '44.01 g/mol',
    biologikRoli: 'O‘simliklar tomonidan Kalvin siklida organik moddaga biriktiriladi.',
    atomlarSoni: 3,
    boglanishlarSoni: 2,
    rang: '#94a3b8',
  },
];
