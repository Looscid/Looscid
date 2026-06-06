import React, { useState } from 'react';
import { FeedPage } from './pages/Feed.jsx';
import { DiscoverPage } from './pages/Discover.jsx';
import { DAW } from './components/DAW.jsx';
import { Ic } from './components/Icons.jsx';

export default function App() {
  const [page, setPage] = useState('feed');
  const [showDAW, setShowDAW] = useState(false);

  const navigate = (to) => setPage(to);

  return (
    <div className="app">
      {/* Skip Link for Braille/Screen Reader users */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      <main id="main-content" className="pg" style={{ paddingBottom: '80px' }}>
        {page === 'feed' && <FeedPage navigate={navigate} />}
        {page === 'discover' && <DiscoverPage navigate={navigate} />}
        
        {/* DAW Trigger - Fixed button for easy access */}
        <button 
          className="cherry-orb-fab"
          onClick={() => setShowDAW(true)}
          aria-label="Open DAW Audio Preview,"
          aria-haspopup="dialog"
          style={{ bottom: '90px' }}
        >
          <span aria-hidden="true">🎵</span>
        </button>

        {showDAW && <DAW onClose={() => setShowDAW(false)} />}
      </main>

      <nav className="bnav" role="navigation" aria-label="Main Navigation">
        <button 
          className={`nb ${page === 'feed' ? 'on' : ''}`} 
          onClick={() => setPage('feed')}
          aria-label="Feed,"
          aria-current={page === 'feed' ? 'page' : undefined}
        >
          <Ic.Home style={{ width: 20, height: 20 }} />
          <span>Feed</span>
        </button>
        <button 
          className={`nb ${page === 'discover' ? 'on' : ''}`} 
          onClick={() => setPage('discover')}
          aria-label="Discover,"
          aria-current={page === 'discover' ? 'page' : undefined}
        >
          <Ic.Srch style={{ width: 20, height: 20 }} />
          <span>Discover</span>
        </button>
        <button 
          className="nb" 
          onClick={() => setShowDAW(true)}
          aria-label="Open DAW,"
        >
          <span style={{ fontSize: '20px' }}>🎹</span>
          <span>DAW</span>
        </button>
      </nav>
    </div>
  );
}