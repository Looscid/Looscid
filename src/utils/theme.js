// DreamOS — Theme utilities

export const PALETTES = {
  dark: {
    '--bg': '#07050f', '--sf': '#100d1e', '--sf2': '#161228', '--sf3': '#1d1730',
    '--bd': 'rgba(255,255,255,0.07)', '--bd2': 'rgba(255,255,255,0.13)',
    '--ac': '#6d28d9', '--ac2': '#9333ea', '--ac3': '#c084fc', '--ac4': '#e9d5ff',
    '--gr': '#34d399', '--rd': '#f87171',
    '--tx': '#ede9fe', '--tx2': '#9d85c0', '--tx3': '#574d78',
  },
  light: {
    '--bg': '#f5f5f7', '--sf': '#ffffff', '--sf2': '#f0f0f5', '--sf3': '#e5e5ea',
    '--bd': '#d1d1d6', '--bd2': '#c7c7cc',
    '--ac': '#6d28d9', '--ac2': '#9333ea', '--ac3': '#7c3aed', '--ac4': '#4c1d95',
    '--gr': '#16a34a', '--rd': '#dc2626',
    '--tx': '#1c1c1e', '--tx2': '#3a3a3c', '--tx3': '#8e8e93',
  },
  midnight: {
    '--bg': '#000000', '--sf': '#0a0a0a', '--sf2': '#111111', '--sf3': '#1a1a1a',
    '--bd': 'rgba(255,255,255,0.05)', '--bd2': 'rgba(255,255,255,0.1)',
    '--ac': '#7c3aed', '--ac2': '#8b5cf6', '--ac3': '#a78bfa', '--ac4': '#ddd6fe',
    '--gr': '#34d399', '--rd': '#f87171',
    '--tx': '#f5f5f5', '--tx2': '#a0a0a0', '--tx3': '#555555',
  },
  cherry: {
    '--bg': '#1a0010', '--sf': '#2d0020', '--sf2': '#3d0030', '--sf3': '#4d0040',
    '--bd': 'rgba(255,100,150,0.1)', '--bd2': 'rgba(255,100,150,0.2)',
    '--ac': '#e11d48', '--ac2': '#f43f5e', '--ac3': '#fb7185', '--ac4': '#fecdd3',
    '--gr': '#34d399', '--rd': '#f87171',
    '--tx': '#fff0f5', '--tx2': '#fca5a5', '--tx3': '#9f1239',
  },
};

export function applyTheme(theme) {
  const root = document.documentElement;
  const palette = PALETTES[theme] || PALETTES.dark;
  Object.entries(palette).forEach(([k, v]) => root.style.setProperty(k, v));
}
