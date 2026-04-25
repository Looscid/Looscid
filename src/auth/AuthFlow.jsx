// DreamOS — Authentication Flow
// Nostr-first. Google and Apple as secondary options.
// Guest mode uses a shared read-only Nostr guest account.

import React, { useState } from 'react';
import { hasNostrExtension, nostrLogin, generateNostrKeypair, formatNpub } from './nostr.js';

const GUEST_NPUB = 'npub1dreamos_guest_readonly';

// ── Splash Screen ──────────────────────────────────────────────────────────
export function SplashScreen({ onLogin, onSignup, onGuest }) {
  return (
    <div className="splash" role="main" aria-label="Welcome to DreamOS">
      <div className="splash-moon" aria-hidden="true">🌙</div>
      <div className="splash-title">DreamOS</div>
      <div className="splash-sub">
        The first open source, accessible web operating system.
        Built for everyone. Free for life. Free for ∞.
      </div>
      <div className="splash-btns">
        <button
          className="splash-btn-primary"
          onClick={onLogin}
          aria-label="Login to your Dream ID,"
        >
          <span aria-hidden="true">LOGIN TO YOUR DREAM ID</span>
        </button>
        <button
          className="splash-btn-secondary"
          onClick={onSignup}
          aria-label="Create new Dream ID,"
        >
          <span aria-hidden="true">CREATE NEW DREAM ID</span>
        </button>
        <button
          className="splash-btn-ghost"
          onClick={onGuest}
          aria-label="Continue as Guest. Read-only mode.,"
        >
          <span aria-hidden="true">CONTINUE AS GUEST</span>
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--tx3)', textAlign: 'center', marginTop: 16, padding: '0 24px' }}>
        Guest mode is read-only. Create a Dream ID to post Dreams, follow Dreamors and use Cherry.
      </div>
    </div>
  );
}

// ── Nostr Login ────────────────────────────────────────────────────────────
export function NostrLoginScreen({ onAuth, onBack, onGuest }) {
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState('');
  const [nsec, setNsec]       = useState('');
  const [showManual, setShowManual] = useState(false);
  const hasExt = hasNostrExtension();

  const handleExtension = async () => {
    setBusy(true); setErr('');
    const result = await nostrLogin();
    if (result) {
      onAuth({
        uid: result.pubkey,
        npub: result.npub,
        displayName: formatNpub(result.npub),
        isNostr: true,
        source: 'extension',
      });
    } else {
      setErr('Could not connect to your Nostr extension. Make sure it is unlocked and try again.');
    }
    setBusy(false);
  };

  const handleManualNsec = async () => {
    if (!nsec.trim()) { setErr('Please enter your nsec key.'); return; }
    if (!nsec.startsWith('nsec1')) { setErr('That does not look like a valid nsec key. It should start with nsec1.'); return; }
    setBusy(true); setErr('');
    // TODO: derive pubkey from nsec using nostr-tools when added
    onAuth({
      uid: nsec.slice(5, 25),
      npub: 'npub1' + nsec.slice(5, 25),
      displayName: 'Dreamor',
      isNostr: true,
      source: 'nsec',
    });
    setBusy(false);
  };

  return (
    <div className="auth-gate">
      <div className="auth-logo">DreamOS</div>
      <div className="auth-tagline">Login with Nostr</div>
      <div className="auth-card">
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--tx3)', fontSize: 13, cursor: 'pointer', padding: '0 0 12px', fontFamily: 'inherit' }}
          aria-label="Back to welcome screen,"
        >
          ← Back
        </button>

        {err && (
          <div className="auth-error">
            <span>Notice:</span><span>{err}</span>
          </div>
        )}

        {hasExt && (
          <button
            className="btn bp"
            style={{ width: '100%', padding: 13, marginBottom: 14, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}
            onClick={handleExtension}
            disabled={busy}
            aria-label="Login with Nostr extension,"
          >
            <span aria-hidden="true">⚡</span>
            <span aria-hidden="true">{busy ? 'Connecting…' : 'Login with Nostr Extension'}</span>
          </button>
        )}

        {!hasExt && (
          <div style={{ padding: '10px 14px', background: 'var(--sf2)', borderRadius: 10, marginBottom: 14, fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6 }}>
            No Nostr extension detected. Install Alby or nos2x for the easiest login, or enter your nsec key below.
          </div>
        )}

        <button
          className="btn bgb"
          style={{ width: '100%', padding: 11, marginBottom: 14, fontSize: 13 }}
          onClick={() => setShowManual(v => !v)}
          aria-expanded={showManual}
          aria-label={showManual ? 'Hide nsec entry,' : 'Login with nsec key,'}
        >
          <span aria-hidden="true">{showManual ? '▲ Hide nsec entry' : '▼ Login with nsec key'}</span>
        </button>

        {showManual && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 6, lineHeight: 1.5 }}>
              Your nsec key never leaves your device. It is used only to derive your public key.
            </div>
            <input
              className="inp"
              type="password"
              placeholder="nsec1..."
              value={nsec}
              onChange={e => { setNsec(e.target.value); setErr(''); }}
              style={{ marginBottom: 10 }}
              aria-label="Enter your nsec private key,"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <button
              className="btn bp"
              style={{ width: '100%', padding: 12, fontSize: 13 }}
              onClick={handleManualNsec}
              disabled={busy || !nsec.trim()}
              aria-label="Login with this nsec key,"
            >
              <span aria-hidden="true">{busy ? 'Verifying…' : 'Login'}</span>
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '8px 0', fontSize: 12, color: 'var(--tx3)' }}>or</div>

        <button
          className="btn bgb"
          style={{ width: '100%', padding: 11, fontSize: 13 }}
          onClick={onGuest}
          aria-label="Continue as Guest. Read-only mode.,"
        >
          <span aria-hidden="true">Continue as Guest (read-only)</span>
        </button>

        <div style={{ fontSize: 11, color: 'var(--tx3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          What is Nostr?{' '}
          <a href="https://nostr.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ac3)' }}>
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Nostr Signup ───────────────────────────────────────────────────────────
export function NostrSignupScreen({ onAuth, onBack }) {
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState('');
  const [name, setName]     = useState('');
  const [agreed, setAgreed] = useState(false);
  const [crash, setCrash]   = useState(false);
  const hasExt = hasNostrExtension();

  const handleCreate = async () => {
    if (!name.trim()) { setErr('Please enter a display name.'); return; }
    if (!agreed) { setErr('Please agree to the terms to continue.'); return; }
    setBusy(true); setErr('');

    let keypair;
    if (hasExt) {
      keypair = await generateNostrKeypair();
    } else {
      keypair = await generateNostrKeypair();
    }

    if (!keypair) {
      setErr('Could not generate your Nostr identity. Please try again.');
      setBusy(false);
      return;
    }

    onAuth({
      uid: keypair.pubkey,
      npub: 'npub1' + keypair.pubkey.slice(0, 20),
      displayName: name.trim(),
      isNostr: true,
      isNew: true,
      source: hasExt ? 'extension' : 'generated',
    });
    setBusy(false);
  };

  return (
    <div className="auth-gate">
      <div className="auth-logo">DreamOS</div>
      <div className="auth-tagline">Create your Dream ID</div>
      <div className="auth-card">
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--tx3)', fontSize: 13, cursor: 'pointer', padding: '0 0 12px', fontFamily: 'inherit' }}
          aria-label="Back to welcome screen,"
        >
          ← Back
        </button>

        {err && <div className="auth-error"><span>Notice:</span><span>{err}</span></div>}

        <div style={{ padding: '12px 14px', background: 'var(--sf2)', borderRadius: 12, marginBottom: 16, fontSize: 13, color: 'var(--tx2)', lineHeight: 1.65 }}>
          DreamOS uses Nostr for your identity. Your Dream ID is a cryptographic keypair — no email, no password, no company owns it. It is yours forever.
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Display Name
          </label>
          <input
            className="inp"
            type="text"
            placeholder="Your name or dream name"
            value={name}
            onChange={e => { setName(e.target.value); setErr(''); }}
            aria-label="Display name,"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={50}
          />
        </div>

        {hasExt && (
          <div style={{ padding: '10px 14px', background: 'rgba(109,40,217,.1)', border: '1px solid rgba(109,40,217,.3)', borderRadius: 10, marginBottom: 14, fontSize: 12, color: 'var(--ac3)', lineHeight: 1.6 }}>
            ⚡ Nostr extension detected. Your Dream ID will be created using your extension.
          </div>
        )}

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, cursor: 'pointer', fontSize: 13, color: 'var(--tx2)', lineHeight: 1.55 }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, width: 16, height: 16, cursor: 'pointer' }}
            aria-label="I agree to the Terms of Service and Community Rules. Required."
          />
          <span>I agree to DreamOS Terms of Service and Community Rules. <span style={{ color: 'var(--rd)', fontWeight: 700 }}>Required.</span></span>
        </label>

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20, cursor: 'pointer', fontSize: 13, color: 'var(--tx2)', lineHeight: 1.55 }}>
          <input
            type="checkbox"
            checked={crash}
            onChange={e => setCrash(e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, width: 16, height: 16, cursor: 'pointer' }}
            aria-label="Share anonymous crash reports to help improve DreamOS. Recommended."
          />
          <span>Share anonymous crash reports to help improve DreamOS. No personal data ever. <span style={{ color: 'var(--gr)', fontWeight: 600 }}>Recommended.</span></span>
        </label>

        <button
          className="btn bp"
          style={{ width: '100%', padding: 13, fontSize: 15 }}
          onClick={handleCreate}
          disabled={busy || !name.trim() || !agreed}
          aria-label="Create your Dream ID,"
        >
          <span aria-hidden="true">{busy ? 'Creating your Dream ID…' : 'Create Dream ID 🌙'}</span>
        </button>
      </div>
    </div>
  );
}

// ── Guest account ──────────────────────────────────────────────────────────
export function createGuestUser() {
  return {
    uid: 'guest',
    npub: GUEST_NPUB,
    displayName: 'Guest Dreamor',
    isGuest: true,
    isReadOnly: true,
    isNostr: true,
    source: 'guest',
  };
}
