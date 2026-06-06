import React from 'react';
import { Ic } from '../components/Icons.jsx';

/**
 * DreamOS Apps Page
 * List of decentralized tools with Chronicle styling.
 */
export function AppsPage({ onOpenDAW }) {
  const apps = [
    {
      id: 'daw',
      title: 'Audio Synth DAW',
      desc: 'Web Audio API standalone synthesizer.',
      icon: '🎹',
      action: onOpenDAW,
      label: 'Open Audio Synth DAW,'
    },
    {
      id: 'nests',
      title: 'Nostr Nests Audio',
      desc: 'Decentralized audio spaces.',
      icon: '🎙️',
      action: () => alert('Nostr Nests coming soon,'),
      label: 'Open Nostr Nests Audio,'
    },
    {
      id: 'quic',
      title: 'Media over QUIC Collab',
      desc: 'Low-latency real-time collaboration.',
      icon: '⚡',
      action: () => alert('QUIC Collab coming soon,'),
      label: 'Open Media over QUIC Collab,'
    }
  ];

  return (
    <div className="pg">
      <header className="hdr" style={{ padding: '48px 16px 16px' }}>
        <h1 className="htit font-cinzel">DECENTRALIZED APPS</h1>
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
              onClick={app.action}
              aria-label={app.label}
            >
              Launch App
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
