/**
 * The easter-egg language. A teacher tagged with it only exists while cat mode
 * is on, and flies a cat instead of a flag.
 */
export const CAT_LANG = 'miau';

/** Whether a teacher `lang` code is the easter-egg one. */
export function isCatLanguage(lang?: string): boolean {
  return languageBase(lang ?? '') === CAT_LANG;
}

/**
 * Map teacher `lang` (e.g. pt_PT, fr, en_GB) to a regional flag emoji.
 */
export function flagEmoji(lang: string): string {
  const normalized = (lang ?? '').replace('-', '_').trim();
  if (!normalized) return '';
  if (isCatLanguage(normalized)) return '🐱';

  const parts = normalized.split('_').filter(Boolean);
  const regionFromSuffix = (parts[1] ?? '').toUpperCase();
  if (regionFromSuffix.length === 2) return regionCodeToFlag(regionFromSuffix);

  const languageOnly = (parts[0] ?? '').toLowerCase();
  const langToRegion: Record<string, string> = {
    en: 'GB',
    fr: 'FR',
    es: 'ES',
    de: 'DE',
    it: 'IT',
    pt: 'PT',
    nl: 'NL',
    pl: 'PL',
    ru: 'RU',
    uk: 'UA',
    ar: 'SA',
    zh: 'CN',
    ja: 'JP',
    ko: 'KR',
    vi: 'VN',
    tr: 'TR',
    sv: 'SE',
    da: 'DK',
    no: 'NO',
    fi: 'FI',
    id: 'ID',
    th: 'TH',
    he: 'IL',
    el: 'GR',
    cs: 'CZ',
    hu: 'HU',
    ro: 'RO',
    bg: 'BG',
  };
  const region = langToRegion[languageOnly];
  if (region && region.length === 2) return regionCodeToFlag(region);

  const code = languageOnly.toUpperCase();
  if (code.length === 2) return regionCodeToFlag(code);

  return '';
}

/** Native (autonym) name for a language, keyed by its base code. */
const LANGUAGE_NAMES: Record<string, string> = {
  [CAT_LANG]: 'Miau',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  ru: 'Русский',
  uk: 'Українська',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  vi: 'Tiếng Việt',
  tr: 'Türkçe',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
  fi: 'Suomi',
  id: 'Bahasa Indonesia',
  th: 'ไทย',
  he: 'עברית',
  el: 'Ελληνικά',
  cs: 'Čeština',
  hu: 'Magyar',
  ro: 'Română',
  bg: 'Български',
};

/**
 * Human-readable language name from a teacher `lang` code (e.g. `pt_PT` → `Português`).
 * The region suffix is dropped — the flag emoji already conveys the region.
 */
export function languageName(lang: string): string {
  const base = (lang ?? '').replace('-', '_').split('_')[0].trim().toLowerCase();
  if (!base) return '';
  return LANGUAGE_NAMES[base] ?? base.toUpperCase();
}

/** Base language code (region stripped), used for grouping/filtering. e.g. `pt_PT` → `pt`. */
export function languageBase(lang: string): string {
  return (lang ?? '').replace('-', '_').split('_')[0].trim().toLowerCase();
}

function regionCodeToFlag(regionCode: string): string {
  const A = 0x41;
  const BASE = 0x1f1e6;
  const a = regionCode.charCodeAt(0) - A;
  const b = regionCode.charCodeAt(1) - A;
  if (a < 0 || a > 25 || b < 0 || b > 25) return '';
  return String.fromCodePoint(BASE + a, BASE + b);
}
