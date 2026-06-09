// DreamOS — Discover Page
import React, { useState } from 'react';
import { USERS, GROUPS, TRENDING, DREAMS_INIT } from '../data/mockData.js';
import { Av } from '../components/Shared.jsx';
import { Ic } from '../components/Icons.jsx';

export function DiscoverPage({ navigate, cherryCtx }) {
  const [q, setQ]     = useState('');
  const [tab, setTab] = useState('trending');
  const tabs = q ? ['dreamors', 'dreams', 'circles'] : ['trending', 'dreamors', 'circles'];

  return (
    <div className="pg">
      <div className="hdr">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 16px 0' }}>
          <span className="htit">Discover</span>
          {cherryCtx && (
            <button
              className="cherry-ctx-btn"
              onClick={() => cherryCtx.openCherry("What is trending right now?")}
              aria-label="Ask Cherry what is trending,"
            >
              <span aria-hidden="true">🍒 Trending</span>
            </button>
          )}
        </div>
        <div style={{ padding: '10px 16px' }}>
          <input
            className="inp"
            style={{ fontSize: 14 }}
            placeholder="Search Dreamors, Dreams, #topics…"
            value={q}
            onChange={e => { setQ(e.target.value); if (e.target.value) setTab('dreamors'); }}
            aria-label="Search DreamOS,"
          />
        </div>
        <div className="tabrow" role="tablist" aria-label="Discover tabs">
          {tabs.map(t => (
            <button
              key={t}
              className={`tb${tab === t ? ' on' : ''}`}
              onClick={() => setTab(t)}
              style={{ textTransform: 'capitalize' }}
              role="tab"
              aria-selected={tab === t}
              aria-label={`${t.charAt(0).toUpperCase() + t.slice(1)},`}
            >
              <span aria-hidden="true">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      {tab === 'trending' && TRENDING.map(t => (
        <div
          key={t.tag}
          className="trtg"
          role="button"
          tabIndex={0}
          onClick={() => { setQ('#' + t.tag); setTab('dreams'); }}
          onKeyDown={e => e.key === 'Enter' && setQ('#' + t.tag)}
          aria-label={`${t.tag} trending in ${t.cat}, ${t.count},`}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{t.cat} · Trending</div>
            <div style={{ fontSize: 14, fontWeight: 700, margin: '2px 0' }}>#{t.tag}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{t.count}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {cherryCtx && (
              <button
                className="cherry-ctx-btn"
                onClick={e => { e.stopPropagation(); cherryCtx.openCherry(`Draft a Dream about #${t.tag}`); }}
                aria-label={`Ask Cherry to draft about #${t.tag},`}
              >
                <span aria-hidden="true">🍒 Draft</span>
              </button>
            )}
            <Ic.Chv style={{ width: 14, height: 14, color: 'var(--tx3)' }} aria-hidden="true" />
          </div>
        </div>
      ))}

      {/* Dreamors */}
      {tab === 'dreamors' && USERS
        .filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.handle.includes(q))
        .map(u => (
          <div
            key={u.id}
            className="ci"
            onClick={() => navigate('dp', u)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate('dp', u)}
            aria-label={`${u.name} ${u.handle},`}
          >
            <Av user={u} size={44} />
            <div className="cif">
              <div className="cnm">
                {u.name}
                {u.verified && <span style={{ color: 'var(--ac2)', fontSize: 11 }} aria-label="Verified"> ✓</span>}
              </div>
              <div className="cpv">{u.handle} · {(u.followers / 1000).toFixed(1)}K followers</div>
            </div>
            <button
              className="btn bp"
              style={{ padding: '7px 14px', fontSize: 12 }}
              onClick={e => e.stopPropagation()}
              aria-label={`Follow ${u.name},`}
            >
              <span aria-hidden="true">Follow</span>
            </button>
          </div>
        ))}

      {/* Circles */}
      {tab === 'circles' && GROUPS
        .filter(g => !q || g.name.toLowerCase().includes(q.toLowerCase()))
        .map(g => (
          <div key={g.id} className="ci" aria-label={`${g.name}, ${g.members.toLocaleString()} Dreamors,`}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }} aria-hidden="true">
              {g.emoji}
            </div>
            <div className="cif">
              <div className="cnm">{g.name}</div>
              <div className="cpv">{g.members.toLocaleString()} Dreamors</div>
            </div>
            <button
              className="btn bgb"
              style={{ fontSize: 12 }}
              aria-label={`Join ${g.name},`}
            >
              <span aria-hidden="true">Join</span>
            </button>
          </div>
        ))}

      {/* Dreams search results */}
      {tab === 'dreams' && DREAMS_INIT
        .filter(d => !q || d.text.toLowerCase().includes(q.toLowerCase()))
        .map(d => (
          <div key={d.id} style={{ borderBottom: '1px solid var(--bd)', padding: '11px 14px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <Av user={d.user} size={28} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>{d.user.name}</span>
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{d.user.handle}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--tx2)', lineHeight: 1.6 }}>{d.text}</p>
          </div>
        ))}
    </div>
  );
}
