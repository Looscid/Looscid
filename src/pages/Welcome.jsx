import React, { useState } from 'react';

/**
 * DreamOS Welcome Page
 * Chronicle Neo-Brutalist design for Nostr-first onboarding.
 */
export function WelcomePage({ onLogin }) {
  const [nsec, setNsec] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showLegacy, setShowLegacy] = useState(false);

  const handleNsecLogin = (e) => {
    e.preventDefault();
    if (nsec.startsWith('nsec1') && nsec.length > 50) {
      onLogin(nsec);
    } else {
      setError('Invalid NSEC format,');
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      const sanitizedEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '-');
      onLogin(`email-${sanitizedEmail}`);
    } else {
      setError('Invalid email address,');
    }
  };

  const handleExtensionLogin = async () => {
    try {
      if (window.nostr) {
        const pubkey = await window.nostr.getPublicKey();
        onLogin(pubkey);
      } else {
        setError('NIP-07 extension not found,');
      }
    } catch (err) {
      setError('Extension login failed,');
    }
  };

  return (
    <div className="pg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="font-cinzel" style={{ fontSize: '48px', marginBottom: '8px' }}>DREAMOS</h1>
        <p style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>We're powered by NOSTR</p>
      </header>

      <main className="chronicle-card" style={{ padding: '24px' }}>
        <h2 className="font-cinzel" style={{ fontSize: '24px', marginBottom: '20px' }}>Login to the Feed</h2>
        
        <form onSubmit={handleNsecLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="nsec-input" className="slbl" style={{ display: 'block', marginBottom: '8px' }}>Enter your NSEC key</label>
            <input
              id="nsec-input"
              type="password"
              className="inp border-2"
              placeholder="nsec1..."
              value={nsec}
              onChange={(e) => setNsec(e.target.value)}
              aria-label="Nostr private key input,"
            />
          </div>
          
          {error && <p role="alert" style={{ color: 'var(--rd)', fontWeight: 700, marginBottom: '16px' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn bp border-2" 
            style={{ width: '100%', height: '54px', marginBottom: '12px' }}
            aria-label="Login with secret key,"
          >
            Access Feed
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button 
            onClick={handleExtensionLogin} 
            className="btn bgb border-2" 
            style={{ flex: 1 }}
            aria-label="Login with Browser Extension,"
          >
            Use Extension
          </button>
          <button 
            onClick={() => onLogin('guest-' + Date.now())} 
            className="btn bgb border-2" 
            style={{ flex: 1 }}
            aria-label="Enter as guest,"
          >
            Guest Bypass
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <button 
            onClick={() => setShowLegacy(!showLegacy)}
            className="btn border-2"
            style={{ width: '100%', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}
            aria-label="Toggle legacy login options,"
            aria-expanded={showLegacy}
          >
            {showLegacy ? 'Hide' : 'Show'} Legacy Login
          </button>

          {showLegacy && (
            <div className="border-2" style={{ marginTop: '12px', padding: '16px', background: 'var(--bg2)' }}>
              <form onSubmit={handleEmailLogin}>
                <label htmlFor="email-input" className="slbl" style={{ display: 'block', marginBottom: '8px' }}>Legacy Email</label>
                <input
                  id="email-input"
                  type="email"
                  className="inp border-2"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ marginBottom: '12px' }}
                  aria-label="Legacy email input,"
                />
                <button 
                  type="submit" 
                  className="btn bgb border-2" 
                  style={{ width: '100%' }}
                  aria-label="Login with email address,"
                >
                  Email Access
                </button>
              </form>
            </div>
          )}
        </div>

        <footer style={{ textAlign: 'center', borderTop: '2px solid var(--borderColor)', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--tx3)' }}>
            New to Nostr? <a href="https://nostr.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tx)', fontWeight: 700 }}>Get started here</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
