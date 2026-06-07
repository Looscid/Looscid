import React, { useState, useRef, useEffect } from 'react';
import { Ic } from '../components/Icons.jsx';

/**
 * DreamOS Apps Page
 * List of decentralized tools with Chronicle styling.
 * Supports adding custom apps via ZapStore or APK upload.
 */
export function AppsPage({ onOpenDAW, user }) {
  const [apps, setApps] = useState([
    {
      id: 'daw',
      title: 'Audio Synth DAW',
      desc: 'Web Audio API standalone synthesizer.',
      icon: '🎹',
      type: 'native',
      action: onOpenDAW,
      label: 'Open Audio Synth DAW,'
    },
    {
      id: 'nests',
      title: 'Nostr Nests Audio',
      desc: 'Decentralized audio spaces.',
      icon: '🎙️',
      type: 'native',
      action: () => alert('Nostr Nests coming soon,'),
      label: 'Open Nostr Nests Audio,'
    },
    {
      id: 'quic',
      title: 'Media over QUIC Collab',
      desc: 'Low-latency real-time collaboration.',
      icon: '⚡',
      type: 'native',
      action: () => alert('QUIC Collab coming soon,'),
      label: 'Open Media over QUIC Collab,'
    }
  ]);

  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  
  // Store Form State
  const [source, setSource] = useState('zapstore');
  const [link, setLink] = useState('');
  const [apkFile, setApkFile] = useState(null);

  const getButtonRef = useRef(null);
  const storeDialogRef = useRef(null);
  const appViewportRef = useRef(null);

  const isReadOnly = user?.isReadOnly;

  // Focus management for Store Dialog
  useEffect(() => {
    if (isStoreOpen && storeDialogRef.current) {
      storeDialogRef.current.focus();
    } else if (!isStoreOpen && getButtonRef.current) {
      getButtonRef.current.focus();
    }
  }, [isStoreOpen]);

  // Focus management for App Viewport
  useEffect(() => {
    if (activeApp && appViewportRef.current) {
      appViewportRef.current.focus();
    }
  }, [activeApp]);

  const handleAddApp = () => {
    if (isReadOnly) return;
    if (!link && !apkFile) return;
    
    const newApp = {
      id: Date.now().toString(),
      title: apkFile ? apkFile.name : (link.split('/').pop() || 'Custom App'),
      desc: apkFile ? 'Uploaded APK Package' : `Source: ${source}`,
      icon: apkFile ? '📦' : '🌐',
      type: 'custom',
      source: apkFile ? apkFile.name : link,
      label: `Launch ${apkFile ? apkFile.name : link},`
    };

    setApps([...apps, newApp]);
    setIsStoreOpen(false);
    setLink('');
    setApkFile(null);
  };

  return (
    <div className="pg">
      <header className="hdr" style={{ padding: '48px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="htit font-cinzel" style={{ margin: 0 }}>DECENTRALIZED APPS</h1>
        <button 
          ref={getButtonRef}
          className="btn bp border-2" 
          style={{ 
            boxShadow: '4px 4px 0px var(--tx)',
            padding: '4px 16px',
            fontSize: '14px',
            opacity: isReadOnly ? 0.5 : 1,
            cursor: isReadOnly ? 'not-allowed' : 'pointer'
          }}
          onClick={() => !isReadOnly && setIsStoreOpen(true)}
          disabled={isReadOnly}
          aria-label="Open App Store dialog,"
        >
          GET
        </button>
      </header>

      <main style={{ padding: '16px', display: 'grid', gap: '20px' }}>
        {apps.map(app => (
          <div key={app.id} className="chronicle-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }} aria-hidden="true">{app.icon}</span>
              <div>
                <h3 className="font-cinzel" style={{ fontSize: '20px', margin: 0 }}>{app.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--tx3)', margin: '4px 0 0' }}>{app.desc}</p>
              </div>
            </div>
            <button 
              className="btn bp border-2" 
              style={{ width: '100%', marginTop: '8px' }}
              onClick={app.type === 'native' ? app.action : () => setActiveApp(app)}
              aria-label={app.label}
            >
              Launch App
            </button>
          </div>
        ))}
      </main>

      {/* App Store Dialog */}
      {isStoreOpen && (
        <div className="ov" onClick={(e) => e.target === e.currentTarget && setIsStoreOpen(false)}>
          <div 
            ref={storeDialogRef}
            className="msh chronicle-card" 
            role="dialog" 
            aria-modal="true" 
            tabIndex="-1"
            style={{ 
              padding: '24px', 
              width: '90%', 
              maxWidth: '400px',
              outline: 'none'
            }}
          >
            <h2 className="font-cinzel" style={{ marginTop: 0 }}>APP STORE</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label className="slbl" htmlFor="store-source">Source Provider:</label>
              <select 
                id="store-source"
                className="inp border-2"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                aria-label="Select app store source,"
                style={{ marginTop: '8px' }}
              >
                <option value="zapstore">ZapStore (Nostr)</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="slbl" htmlFor="app-link">Project Link:</label>
              <input 
                id="app-link"
                type="text"
                className="inp border-2"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                aria-label="Enter app source link,"
                style={{ marginTop: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="slbl" htmlFor="apk-upload">Upload APK:</label>
              <input 
                id="apk-upload"
                type="file"
                accept=".apk"
                className="inp border-2"
                onChange={(e) => setApkFile(e.target.files[0])}
                aria-label="Upload APK file,"
                style={{ marginTop: '8px', padding: '8px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                className="btn bp border-2"
                onClick={handleAddApp}
                aria-label="Fetch and render app,"
              >
                Fetch
              </button>
              <button 
                className="btn bgb border-2"
                onClick={() => setIsStoreOpen(false)}
                aria-label="Cancel and close dialog,"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Launch Viewport (Terminal Emulator) */}
      {activeApp && (
        <div className="ov" style={{ zIndex: 100 }}>
          <div 
            ref={appViewportRef}
            className="msh chronicle-card" 
            role="dialog" 
            aria-modal="true" 
            tabIndex="-1"
            style={{ 
              width: '95%', 
              height: '90%', 
              background: '#000', 
              color: '#0f0', 
              fontFamily: 'monospace',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              outline: 'none'
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f0', paddingBottom: '10px', marginBottom: '10px' }}>
              <span className="font-cinzel" style={{ color: '#0f0' }}>RUNTIME VIEWPORT: {activeApp.title}</span>
              <button 
                onClick={() => setActiveApp(null)}
                style={{ background: 'none', border: '1px solid #0f0', color: '#0f0', cursor: 'pointer' }}
                aria-label="Close app viewport,"
              >
                [X] EXIT
              </button>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', fontSize: '14px', lineHeight: '1.4' }}>
              <p>{`> Initializing DreamOS Sandboxed Runtime...`}</p>
              <p>{`> Loading manifest from ${activeApp.source}...`}</p>
              <p style={{ color: '#fff' }}>{`[MANIFEST]`}</p>
              <p style={{ color: '#fff' }}>{`  name: ${activeApp.title}`}</p>
              <p style={{ color: '#fff' }}>{`  version: 1.0.0-stable`}</p>
              <p style={{ color: '#fff' }}>{`  permissions: [network, audio, nostr]`}</p>
              <p>{`> Attaching accessible virtual DOM...`}</p>
              <p>{`> App is now interactive.`}</p>
              
              <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #0f0' }}>
                <h2 className="font-cinzel" style={{ color: '#0f0', fontSize: '18px' }}>SANDBOXED UI CONTROLS</h2>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn border-2" style={{ borderColor: '#0f0', background: 'transparent', color: '#0f0' }} aria-label="Execute app debug check,">DEBUG</button>
                  <button className="btn border-2" style={{ borderColor: '#0f0', background: 'transparent', color: '#0f0' }} aria-label="Clear app cache,">FLUSH</button>
                </div>
              </div>
            </div>

            <footer style={{ borderTop: '1px solid #0f0', paddingTop: '10px', marginTop: '10px', fontSize: '12px' }}>
              STATUS: RUNNING | SOURCE: {activeApp.source}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
