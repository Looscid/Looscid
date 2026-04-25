// DreamOS — Configuration
// All sensitive values come from environment variables
// Never hardcode keys here

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || '';
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

// App constants
export const APP_NAME = 'DreamOS';
export const APP_URL = 'https://dream-os.pages.dev';
export const APP_HANDLE = '@DreamOSFree';

// Navigation
export const NAV_ITEMS = [
  { id: 'feed',     label: 'Feed',     icon: 'Home',  badge: 0 },
  { id: 'discover', label: 'Discover', icon: 'Srch',  badge: 0 },
  { id: 'create',   label: 'Create',   icon: 'Pls',   isCreate: true },
  { id: 'cherry',   label: 'Cherry',   icon: 'Cherry', badge: 0 },
  { id: 'alerts',   label: 'Alerts',   icon: 'Bell',  badge: 0 },
  { id: 'more',     label: 'More',     icon: 'Dots',  badge: 0 },
];

// Storage keys — all in one place so nothing is hardcoded twice
export const KEYS = {
  DRAFTS:      'dbm_drafts',
  THEME:       'dbm_theme',
  DIGEST:      'dbm_last_digest',
  ONBOARDING:  'dbm_onboarding_seen',
  WELCOME:     'dbm_welcome_seen',
  ANALYTICS:   'dbm_analytics_consent',
  AI_PREFS:    'dbm_ai_prefs',
  HABITS:      'dbm_habits',
  SYM_FAVS:    'dbm_sym_favs',
  SYM_RECENT:  'dbm_sym_recent',
  DREAMLABS:   'dbm_dreamlabs',
  ATTRIB:      'dbm_cherry_attrib',
};

// Terminology — enforce everywhere
export const TERMS = {
  DREAM:    'Dream',
  DREAMS:   'Dreams',
  DREAMOR:  'Dreamor',
  DREAMORS: 'Dreamors',
  REDREAM:  'ReDream',
  REDREAMS: 'ReDreams',
  CIRCLE:   'Circle',
  CIRCLES:  'Circles',
  DREAM_ID: 'Dream ID',
  FEED:     'Feed',
  ALERTS:   'Alerts',
  LOGIN:    'Login',
};
