import { OFFICIAL_MEB_LOGO } from './mebLogoData';

export interface PresetLogo {
  id: string;
  name: string;
  dataUrl: string;
}

// Clean embedded SVGs for instant crisp printing without external image dependencies
export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'meb',
    name: 'T.C. Millî Eğitim Bakanlığı Arma Logosu',
    dataUrl: OFFICIAL_MEB_LOGO
  },
  {
    id: 'ay-yildiz',
    name: 'Ay-Yıldız Amblemi',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="48" fill="%23dc2626"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="%23ffffff" stroke-width="2"/>
      <!-- Crescent -->
      <path d="M46 26 A 24 24 0 1 0 46 74 A 19 19 0 1 1 46 26 Z" fill="%23ffffff"/>
      <!-- Star -->
      <polygon points="58,40 60.5,47 68,47 62,51.5 64.5,58.5 58,54 51.5,58.5 54,51.5 48,47 55.5,47" fill="%23ffffff"/>
    </svg>`
  },
  {
    id: 'science-tree',
    name: 'Bilim & Eğitim Çelengi',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="48" fill="%231e3a8a"/>
      <circle cx="50" cy="50" r="43" fill="none" stroke="%2393c5fd" stroke-width="1.5"/>
      <path d="M50 25 L50 48" stroke="%23ffffff" stroke-width="3" stroke-linecap="round"/>
      <polygon points="50,20 44,32 56,32" fill="%23fbbf24"/>
      <!-- Laurel leaves -->
      <path d="M30 65 C25 50 35 35 45 32 C40 42 38 55 45 65 Z" fill="%2393c5fd" opacity="0.8"/>
      <path d="M70 65 C75 50 65 35 55 32 C60 42 62 55 55 65 Z" fill="%2393c5fd" opacity="0.8"/>
      <rect x="34" y="66" width="32" height="6" rx="2" fill="%23ffffff"/>
      <rect x="38" y="74" width="24" height="5" rx="1.5" fill="%23ffffff"/>
    </svg>`
  },
  {
    id: 'none',
    name: 'Logo Yok (Boş)',
    dataUrl: ''
  }
];
