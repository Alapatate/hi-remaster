/**
 * Map teacher `lang` (e.g. pt_PT, fr, en_GB) to a regional flag emoji.
 */
export function flagEmoji(lang: string): string {
  const normalized = (lang ?? '').replace('-', '_').trim();
  if (!normalized) return '';

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

function regionCodeToFlag(regionCode: string): string {
  const A = 0x41;
  const BASE = 0x1f1e6;
  const a = regionCode.charCodeAt(0) - A;
  const b = regionCode.charCodeAt(1) - A;
  if (a < 0 || a > 25 || b < 0 || b > 25) return '';
  return String.fromCodePoint(BASE + a, BASE + b);
}
