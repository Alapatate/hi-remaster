/**
 * Concrete colour values for the reminder sheet. Most of the sheet is styled
 * with nativewind classes, but the sheet chrome and the wheel fade gradients
 * need real values rather than class names.
 */
export const SHEET_THEME = {
  light: {
    bg: '#f9f4ea',
    handle: '#c9bfa6',
    accent: '#bf6e1a',
    icon: '#8a8178',
  },
  dark: {
    bg: '#29241f',
    handle: '#5a5148',
    accent: '#d9832a',
    icon: '#a29888',
  },
} as const;

export type SheetPalette = (typeof SHEET_THEME)['light'];
