import React, { useState, useEffect, useMemo } from 'react';
import { WelcomePage } from './pages/Welcome.jsx';
import { FeedPage } from './pages/Feed.jsx';
import { DiscoverPage } from './pages/Discover.jsx';
import { AppsPage } from './pages/Apps.jsx';
import { DAW } from './components/DAW.jsx';
import { Ic } from './components/Icons.jsx';
import { buildNostrUser, createGuestUser, buildEmailUser } from './auth/nostr.js';

export default function App() {
  const [userKey, setUserKey] = useState(localStorage.getItem('dream_user_key'));
  const [page, setPage] = useState('feed');
  const [showDAW, setShowDAW] = useState(false);

  // Derive user object from userKey
  const user = useMemo(() => {
    if (!userKey) return null;
    if (userKey.startsWith('email-')) return buildEmailUser(userKey);
    if (userKey.startsWith('guest-')) return createGuestUser();
    return buildNostrUser(userKey);
  }, [userKey]);

  useEffect(() => {
    if (userKey) {
      localStorage.setItem('dream_user_key', userKey);
    } else {
      localStorage.removeItem('dream_user_key');
    }
  }, [userKey]);

  const handleLogin = (key) => setUserKey(key);
  const handleLogout = () => {
    setUserKey(null);
    setPage('feed');
  };

  const navigate = (to) => setPage(to);

  if (!userKey) {
    return <WelcomePage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <main id="main-content" className="pg" style={{ paddingBottom: '80px' }}>
        {page === 'feed' && <FeedPage navigate={navigate} user={user} />}
        {page === 'discover' && <DiscoverPage navigate={navigate} user={user} />}
        {page === 'apps' && <AppsPage onOpenDAW={() => setShowDAW(true)} user={user} />}
        
        {showDAW && <DAW onClose={() => setShowDAW(false)} />}
      </main>

      <nav className="bnav" role="navigation" aria-label="Main Navigation,">
        <div
          className="ftabs"
          role="radiogroup"
          aria-label="Navigation tabs,"
        >
          <button 
            className={`nb ${page === 'feed' ? 'on' : ''}`} 
            onClick={() => setPage('feed')}
            role="radio"
            aria-checked={page === 'feed'}
            aria-label="Feed,"
          >
            <Ic.Home style={{ width: 20, height: 20 }} />
            <span>Feed</span>
          </button>
          <button 
            className={`nb ${page === 'discover' ? 'on' : ''}`} 
            onClick={() => setPage('discover')}
            role="radio"
            aria-checked={page === 'discover'}
            aria-label="Discover,"
          >
            <Ic.Srch style={{ width: 20, height: 20 }} />
            <span>Discover</span>
          </button>
          <button 
            className={`nb ${page === 'apps' ? 'on' : ''}`} 
            onClick={() => setPage('apps')}
            role="radio"
            aria-checked={page === 'apps'}
            aria-label="Apps,"
          >
            <span style={{ fontSize: '20px' }}>🧩</span>
            <span>Apps</span>
          </button>
          <button 
            className="nb" 
            onClick={handleLogout}
            role="radio"
            aria-checked={false}
            aria-label="Logout,"
          >
            <span style={{ fontSize: '20px' }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
