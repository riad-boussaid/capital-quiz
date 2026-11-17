import { useColorScheme } from 'react-native';

// Mirrors the CSS custom properties in src/global.css for the few places
// where a concrete color value is required (icon tints, SVG strokes) instead
// of a NativeWind className. Keep both lists in sync.
export interface UiColors {
  content: string;
  muted: string;
  element: string;
  edge: string;
  primary: string;
  correct: string;
  wrong: string;
  amber: string;
}

const PALETTES: Record<'light' | 'dark', UiColors> = {
  light: {
    content: '#0d0e12',
    muted: '#60646c',
    element: '#f0f0f3',
    edge: '#e4e6eb',
    primary: '#3b5bdb',
    correct: '#2f9e44',
    wrong: '#e5484d',
    amber: '#d97706',
  },
  dark: {
    content: '#ffffff',
    muted: '#b0b4ba',
    element: '#212225',
    edge: '#2e3135',
    primary: '#6c8cff',
    correct: '#30b555',
    wrong: '#f2555a',
    amber: '#f59e0b',
  },
};

export function useUiColors(): UiColors {
  const scheme = useColorScheme();
  return PALETTES[scheme === 'dark' ? 'dark' : 'light'];
}
