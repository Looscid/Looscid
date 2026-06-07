import React, { useState, useEffect } from 'react';
import { WelcomePage } from './pages/Welcome.jsx';
import { FeedPage } from './pages/Feed.jsx';
import { DiscoverPage } from './pages/Discover.jsx';
import { AppsPage } from './pages/Apps.jsx';
import { DAW } from './components/DAW.jsx';
import Ic from './components/Icons.jsx';

export default function App() {
  const [userKey, setUserKey] = useState(localStorage.getItem('dream_user_key'));
  const [page, setPage] = useState('feed');
  const [showDAW, setShowDAW] = useState(false);

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
        {page === 'feed' && <FeedPage navigate={navigate} />}
        {page === 'discover' && <DiscoverPage navigate={navigate} />}
        {page === 'apps' && <AppsPage onOpenDAW={() => setShowDAW(true)} />}
        
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
          className={`nb ${page === 'apps' ? 'on' : ''}`} 
          onClick={() => setPage('apps')}
          aria-label="Apps,"
          aria-current={page === 'apps' ? 'page' : undefined}
        >
          <span style={{ fontSize: '20px' }}>🧩</span>
          <span>Apps</span>
        </button>
        <button 
          className="nb" 
          onClick={handleLogout}
          aria-label="Logout,"
        >
          <span style={{ fontSize: '20px' }}>🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
