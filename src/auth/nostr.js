// DreamOS Nostr Core — Your nsec key IS your Dream ID

export const DREAMOS_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://purplepag.es',
  'wss://relay.primal.net',
];

export const KINDS = {
  PROFILE: 0, DREAM: 1, CONTACTS: 3,
  DM: 13, GIFT_WRAP: 1059, REDREAM: 6,
  LIVE_EVENT: 30311, AUDIO_ROOM: 30312,
  LIVE_CHAT: 1311, PRESENCE: 10312,
  RELAY_LIST: 10002, AI_REQUEST: 5000, AI_RESULT: 6000,
};

export const hasNostrExtension = () =>
  typeof window !== 'undefined' && !!window.nostr;

export const getExtensionPubkey = async () => {
  if (!hasNostrExtension()) return null;
  try { return await window.nostr.getPublicKey(); } catch { return null; }
};

export const signWithExtension = async event => {
  if (!hasNostrExtension()) return null;
  try { return await window.nostr.signEvent(event); } catch { return null; }
};

export const buildAuthEvent = () => ({
  kind: 27235,
  created_at: Math.floor(Date.now() / 1000),
  tags: [['u', 'https://dream-os.pages.dev'], ['method', 'GET']],
  content: 'DreamOS Login',
});

export const buildDreamEvent = (content, tags = []) => ({
  kind: KINDS.DREAM,
  created_at: Math.floor(Date.now() / 1000),
  tags,
  content,
});

export const buildRedreamEvent = original => ({
  kind: KINDS.REDREAM,
  created_at: Math.floor(Date.now() / 1000),
  tags: [['e', original.id, '', 'mention'], ['p', original.pubkey]],
  content: JSON.stringify(original),
});

export const buildProfileEvent = profile => ({
  kind: KINDS.PROFILE,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: JSON.stringify({
    name: profile.displayName || '',
    about: profile.bio || '',
    picture: profile.avatar || '',
    website: profile.website || '',
  }),
});

export const formatNpub = npub =>
  (!npub || npub.length < 16) ? (npub || '')
  : npub.slice(0, 12) + '...' + npub.slice(-6);

export const pubkeyToDisplay = pubkey =>
  pubkey ? 'npub1' + pubkey.slice(0, 8) + '...' + pubkey.slice(-4) : '';

export const createGuestUser = () => ({
  uid: 'guest', pubkey: null, npub: 'npub1dreamos',
  displayName: 'Guest Dreamor', isGuest: true,
  isReadOnly: true, isNostr: true, source: 'guest',
  relays: DREAMOS_RELAYS,
});

export const buildNostrUser = (pubkey, source = 'extension') => ({
  uid: pubkey, pubkey,
  npub: pubkeyToDisplay(pubkey),
  displayName: formatNpub(pubkeyToDisplay(pubkey)),
  isNostr: true, isGuest: false, isReadOnly: false,
  source, relays: DREAMOS_RELAYS,
});
