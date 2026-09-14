import { useColorScheme } from 'nativewind';

/**
 * A bottom sheet's background is a real colour value rather than a class, so it
 * has to follow the colour scheme by hand. Left alone, a dark-mode sheet keeps
 * its cream background while every `text-foreground` label inside it turns
 * cream too — and the content disappears.
 *
 * The dark values are the reminder sheet's, which was already themed, so every
 * sheet in the app reads the same at night. `lightBg` stays per-sheet: the
 * light theme is the design reference and is left exactly as it was.
 */
const DARK_BG = '#29241f';
const DARK_HANDLE = '#5a5148';
const LIGHT_HANDLE = '#c9bfa6';

export function useSheetChrome(lightBg: string) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  return {
    backgroundStyle: { backgroundColor: dark ? DARK_BG : lightBg },
    handleIndicatorStyle: { backgroundColor: dark ? DARK_HANDLE : LIGHT_HANDLE },
  };
}
