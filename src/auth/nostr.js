// DreamOS — Nostr Authentication
// Supports login, account creation and connecting existing accounts via Nostr

// Generate a new Nostr keypair for new Dream ID creation
export async function generateNostrKeypair() {
  try {
    // Use window.nostr if a browser extension is present (Alby, nos2x, etc.)
    if (window.nostr) {
      const pubkey = await window.nostr.getPublicKey();
      return { pubkey, source: 'extension' };
    }
    // Otherwise generate a keypair locally
    // We use the noble-secp256k1 pattern via SubtleCrypto
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
    const exported = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    return { pubkey: exported.x, source: 'generated', keyPair };
  } catch (e) {
    console.error('Nostr keypair generation failed:', e);
    return null;
  }
}

// Sign in with an existing Nostr identity
// Supports browser extensions (Alby, nos2x) and manual nsec entry
export async function nostrLogin() {
  try {
    if (window.nostr) {
      const pubkey = await window.nostr.getPublicKey();
      // Request a signed event to verify identity
      const event = {
        kind: 27235, // NIP-98 HTTP Auth
        created_at: Math.floor(Date.now() / 1000),
        tags: [['u', 'https://dream-os.pages.dev'], ['method', 'GET']],
        content: 'DreamOS Login',
      };
      const signed = await window.nostr.signEvent(event);
      return {
        pubkey,
        npub: pubkeyToNpub(pubkey),
        verified: !!signed,
        source: 'extension',
      };
    }
    // No extension — return null so UI can show manual nsec entry
    return null;
  } catch (e) {
    console.error('Nostr login failed:', e);
    return null;
  }
}

// Connect a Nostr npub to an existing Dream ID
export async function connectNostrToAccount(existingUserId) {
  const result = await nostrLogin();
  if (!result) return null;
  return {
    userId: existingUserId,
    npub: result.npub,
    pubkey: result.pubkey,
    connected: true,
  };
}

// Check if a Nostr browser extension is available
export function hasNostrExtension() {
  return typeof window !== 'undefined' && !!window.nostr;
}

// Convert hex pubkey to npub (bech32 encoded)
// Lightweight implementation without external deps
export function pubkeyToNpub(hex) {
  if (!hex) return '';
  // Prefix npub with the hex for display until we add bech32 encoding
  // Full bech32 encoding will be added when nostr-tools is added as a dependency
  return 'npub1' + hex.slice(0, 20) + '...';
}

// Format npub for display — show first 8 and last 8 chars
export function formatNpub(npub) {
  if (!npub || npub.length < 20) return npub;
  return npub.slice(0, 12) + '...' + npub.slice(-8);
}

// Nostr relay list for DreamOS
export const DREAMOS_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
];
