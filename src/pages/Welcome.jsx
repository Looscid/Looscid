import React, { useState, useEffect, useRef } from 'react';

/**
 * DreamOS Welcome Page
 * Chronicle Neo-Brutalist design for Nostr-first onboarding.
 */
export function WelcomePage({ onLogin }) {
  const [nsec, setNsec] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showLegacy, setShowLegacy] = useState(false);
  const [logs, setLogs] = useState(['DreamOS Initializing...', 'Terminal Node Online...']);
  const logEndRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleNsecLogin = (e) => {
    e.preventDefault();
    addLog('Processing NSEC login');
    if (nsec.startsWith('nsec1') && nsec.length > 50) {
      addLog('NSEC validation successful');
      onLogin(nsec);
    } else {
      const errMsg = 'Invalid NSEC format';
      setError(errMsg);
      addLog(`Error: ${errMsg}`);
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    addLog('Processing legacy email login');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      addLog('Email validation successful');
      const sanitizedEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '-');
      onLogin(`email-${sanitizedEmail}`);
    } else {
      const errMsg = 'Invalid email address';
      setError(errMsg);
      addLog(`Error: ${errMsg}`);
    }
  };

  const handleExtensionLogin = async () => {
    addLog('Requesting NIP-07 extension');
    try {
      if (window.nostr) {
        const pubkey = await window.nostr.getPublicKey();
        addLog('Extension access granted');
        onLogin(pubkey);
      } else {
        const errMsg = 'NIP-07 extension not found';
        setError(errMsg);
        addLog(`Error: ${errMsg}`);
      }
    } catch (err) {
      const errMsg = 'Extension login failed';
      setError(errMsg);
      addLog(`Error: ${errMsg}`);
    }
  };

  const handleGuestLogin = () => {
    addLog('Bypassing with guest identity');
    onLogin('guest-' + Date.now());
  };

  const toggleLegacy = () => {
    const newState = !showLegacy;
    setShowLegacy(newState);
    addLog(newState ? 'Legacy login enabled' : 'Legacy login disabled');
  };

  return (
    <div className="pg min-h-screen p-6 flex flex-col items-center justify-center">
      <header className="mb-10 text-center">
        <h1 className="font-cinzel text-5xl mb-2">DREAMOS</h1>
        <p className="font-extrabold uppercase tracking-widest">Powered by NOSTR</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {/* Left Side: Terminal Node Status */}
        <section 
          className="bg-black text-[#00ff00] border-2 border-[var(--borderColor)] shadow-[4px_4px_0px_var(--borderColor)] font-mono p-4 rounded-none h-[400px] flex flex-col"
          aria-label="Terminal Node Status"
        >
          <div className="flex justify-between border-b border-[#00ff00] mb-2 pb-1 uppercase text-xs font-bold">
            <span>Node Diagnostics</span>
            <span>Status: Online</span>
          </div>
          <div 
            className="overflow-y-auto flex-1 text-sm" 
            role="status" 
            aria-live="polite"
            aria-label="Diagnostic log stream"
          >
            {logs.map((log, i) => (
              <div key={i} className="mb-1 leading-tight">{`> ${log}`}</div>
            ))}
            <div ref={logEndRef} />
          </div>
        </section>

        {/* Right Side: Authentication Gateway */}
        <main 
          className="border-2 border-[var(--borderColor)] shadow-[4px_4px_0px_var(--borderColor)] bg-[var(--bg2)] text-[var(--tx)] p-6 rounded-none"
          aria-label="Authentication Gateway"
        >
          <h2 className="font-cinzel text-2xl mb-6 uppercase">Gateway Access</h2>
          
          <form onSubmit={handleNsecLogin}>
            <div className="mb-4">
              <label htmlFor="nsec-input" className="slbl block mb-2 font-bold uppercase text-xs">Secret Key (NSEC)</label>
              <input
                id="nsec-input"
                type="password"
                className="inp border-2 w-full p-3 bg-white text-black"
                placeholder="nsec1..."
                value={nsec}
                onChange={(e) => {
                  setNsec(e.target.value);
                  if (e.target.value.length % 5 === 0) addLog('Updating nsec buffer');
                }}
                aria-label="Nostr private key input"
              />
            </div>
            
            {error && <p role="alert" className="text-[var(--rd)] font-bold mb-4 uppercase text-xs">{error}</p>}

            <button 
              type="submit" 
              className="btn bp border-2 w-full h-14 mb-3 font-bold uppercase" 
              aria-label="Login with secret key"
            >
              Access Feed
            </button>
          </form>

          <div className="flex gap-3 mb-6">
            <button 
              onClick={handleExtensionLogin} 
              className="btn bgb border-2 flex-1 p-3 font-bold uppercase text-xs" 
              aria-label="Login with Browser Extension"
            >
              Extension
            </button>
            <button 
              onClick={handleGuestLogin} 
              className="btn bgb border-2 flex-1 p-3 font-bold uppercase text-xs" 
              aria-label="Enter as guest"
            >
              Guest Bypass
            </button>
          </div>

          <div className="mb-6">
            <button 
              onClick={toggleLegacy}
              className="btn border-2 w-full p-2 text-[10px] font-black uppercase tracking-tighter"
              aria-label="Toggle legacy login options"
              aria-expanded={showLegacy}
            >
              Legacy Login
            </button>

            {showLegacy && (
              <div className="border-2 mt-3 p-4 bg-[var(--bg)] shadow-[2px_2px_0px_var(--borderColor)]">
                <form onSubmit={handleEmailLogin}>
                  <label htmlFor="email-input" className="slbl block mb-2 font-bold uppercase text-xs">Email Identity</label>
                  <input
                    id="email-input"
                    type="email"
                    className="inp border-2 w-full p-2 mb-3 bg-white text-black"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value.length % 5 === 0) addLog('Updating email buffer');
                    }}
                    aria-label="Legacy email input"
                  />
                  <button 
                    type="submit" 
                    className="btn bgb border-2 w-full p-2 font-bold uppercase text-xs" 
                    aria-label="Login with email address"
                  >
                    Email Access
                  </button>
                </form>
              </div>
            )}
          </div>

          <footer className="text-center border-t-2 border-[var(--borderColor)] pt-6 mt-4">
            <p className="text-[10px] uppercase font-bold text-[var(--tx3)]">
              Protocol: NOSTR | <a href="https://nostr.com" target="_blank" rel="noopener noreferrer" className="text-[var(--tx)] underline" aria-label="Learn about Nostr protocol">Documentation</a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
