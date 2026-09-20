// Looscid — Feed Page
import React, { useId, useState } from 'react';
import { useDreams } from '../hooks/useDreams.js';
import { DREAMS_INIT } from '../data/mockData.js';
import { fmt } from '../components/Shared.jsx';
import { Ic } from '../components/Icons.jsx';

const FEED_TABS = [
  { id: 'foryou', label: 'For You' },
  { id: 'friends', label: 'Friends' },
  { id: 'following', label: 'Following' },
  { id: 'local', label: 'Local' },
  { id: 'circles', label: 'Circles' },
];

const FEED_SOURCES = ['Nostr', 'Mastodon', 'Local'];

function sourceForDream(dream) {
  const source = String(dream.source || dream.platform || dream.network || 'Local').toLowerCase();
  return source.includes('nostr') ? 'Nostr' : source.includes('mastodon') ? 'Mastodon' : 'Local';
}

export function FeedPage({ navigate, prefs, cherryCtx }) {
  const [tab, setTab] = useState('foryou');
  const [sources, setSources] = useState(() => new Set(FEED_SOURCES));
  const { dreams, tl, tr, tur, tq, tuq, tb } = useDreams(cherryCtx ? cherryCtx.dreams : DREAMS_INIT);
  const [activeComment, setActiveComment] = useState(null);

  const toggleSource = source => setSources(current => {
    const next = new Set(current);
    next.has(source) ? next.delete(source) : next.add(source);
    return next;
  });

  const tabDreams = tab === 'friends'
    ? dreams.filter(d => [1, 2, 4].includes(d.user.id))
    : tab === 'following'
    ? dreams.filter((_, i) => i < 3)
    : tab === 'local'
    ? dreams.filter((_, i) => i > 1 && i < 4)
    : tab === 'circles'
    ? dreams.filter((_, i) => i === 0 || i === 4)
    : dreams;
  const visible = tabDreams.filter(dream => sources.has(sourceForDream(dream)));
  const friendsEmpty = tab === 'friends' && visible.length === 0;

  return (
    <div className="pg">
      <div className="hdr">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 16px 0' }}>
          <span className="htit">Looscid</span>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gr)', boxShadow: '0 0 8px var(--gr)' }} aria-hidden="true" />
        </div>
        <div className="ftabs" role="radiogroup" aria-label="Feed tabs">
          {FEED_TABS.map(t => (
            <button key={t.id} className={`ftab${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)} role="radio" aria-checked={tab === t.id} aria-label={`${t.label} feed`}>
              <span aria-hidden="true">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <fieldset className="feed-sources" role="group" aria-label="Feed sources">
        <legend>Feed sources</legend>
        {FEED_SOURCES.map(source => (
          <label key={source}>
            <input type="checkbox" checked={sources.has(source)} onChange={() => toggleSource(source)} />
            {source}
          </label>
        ))}
      </fieldset>

      {friendsEmpty && (
        <div className="es">
          <div className="esi" aria-hidden="true">🤝</div>
          <div className="esl">No Friends yet</div>
          <p style={{ fontSize: 13, color: 'var(--tx3)', marginTop: 6, lineHeight: 1.6, maxWidth: 240, textAlign: 'center' }}>Friends are Dreamors who follow each other.</p>
          {cherryCtx && <button className="cherry-ctx-btn" style={{ margin: '10px auto 0', display: 'flex' }} onClick={() => cherryCtx.openCherry('Who should I follow?')} aria-label="Ask Cherry to find Dreamors to follow"><span aria-hidden="true">🍒 Ask Cherry to find Dreamors</span></button>}
        </div>
      )}

      {visible.map(d => <DreamCard key={d.id} dream={d} onLike={tl} onRedream={tr} onUndoRedream={tur} onQuote={tq} onUndoQuote={tuq} onBookmark={tb} onComment={setActiveComment} navigate={navigate} cherryCtx={cherryCtx} />)}
    </div>
  );
}

function IxnCbx({ on, onToggle, label, activeClass, children }) {
  const hintId = useId();
  return (
    <button className={`cbx-wrap${on ? ` ${activeClass}` : ''}`} onClick={onToggle} role="checkbox" aria-checked={on} aria-label={label} aria-describedby={hintId}>
      <div className="cbx-box" aria-hidden="true">{on && <svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true"><polyline points="1,5 4.5,8.5 11,1" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div>
      <span aria-hidden="true">{children}</span>
      <span id={hintId} className="sr-only">{label}. Checked when active.</span>
    </button>
  );
}

export function DreamCard({ dream, onLike, onRedream, onUndoRedream, onQuote, onUndoQuote, onBookmark, onComment, navigate, cherryCtx }) {
  const [showRD, setShowRD] = useState(false);
  const rdTotal = dream.redreams + (dream.quotes || 0);
  const rdActive = dream.redreamed || dream.quoted;
  return (
    <>
      {dream.reddreamer && <div className="rd-source"><Ic.Rep style={{ width: 11, height: 11 }} aria-hidden="true" /><strong style={{ fontWeight: 600 }}>{dream.reddreamer.name}</strong> ReDreamed</div>}
      <article className="dc" aria-label={`Dream by ${dream.user.name}`}>
        <div className="dc-inner">
          <div className="dc-meta"><button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate('dp', dream.user)} aria-label={`View ${dream.user.name}'s profile`}><span className="dc-name">{dream.user.name}{dream.user.verified && <span style={{ color: 'var(--ac2)', marginLeft: 3, fontSize: 11 }} aria-label="Verified">✓</span>}</span></button><span className="dc-dot" aria-hidden="true">·</span><span className="dc-handle">{dream.user.handle}</span><span className="dc-dot" aria-hidden="true">·</span><span className="dc-time">{dream.time}</span></div>
          <p className="dc-body">{dream.text.split(' ').map((w, i) => w.startsWith('#') ? <span key={i}><span className="dc-tag">{w}</span>{' '}</span> : w + ' ')}</p>
        </div>
        <div className="ixn-row" role="group" aria-label="Dream actions">
          <button className="ixn-btn" onClick={() => onComment && onComment(dream)} aria-label={`${fmt(dream.comments)} comments`}><Ic.Cmt style={{ width: 15, height: 15 }} aria-hidden="true" /><span aria-hidden="true">{fmt(dream.comments)} Comments</span></button>
          <IxnCbx on={rdActive} onToggle={() => setShowRD(true)} label={`${fmt(rdTotal)} ReDreams. Checked when active`} activeClass="redd">{fmt(rdTotal)} ReDreams</IxnCbx>
          <IxnCbx on={dream.liked} onToggle={() => onLike(dream.id)} label={`Like, ${fmt(dream.likes)} likes. Checked when liked`} activeClass="liked">{fmt(dream.likes)} Likes</IxnCbx>
          <button className="ixn-btn" style={{ flex: '.5' }} onClick={() => onBookmark && onBookmark(dream.id)} aria-label="More Dream options" aria-haspopup="dialog"><Ic.Dots style={{ width: 15, height: 15 }} aria-hidden="true" /></button>
        </div>
      </article>
      {showRD && <div className="ov" onClick={e => e.target === e.currentTarget && setShowRD(false)}><div className="msh" role="dialog" aria-label="ReDream or Quote"><div className="mhd" aria-hidden="true" /><div className="min"><div className="mtt">ReDream or Quote</div><button className="osb" onClick={() => { dream.redreamed ? onUndoRedream(dream.id) : onRedream(dream.id); setShowRD(false); }} aria-label={dream.redreamed ? 'Undo ReDream' : 'ReDream'}><span style={{ color: 'var(--gr)' }} aria-hidden="true"><Ic.Rep style={{ width: 20, height: 20 }} /></span><div><div style={{ fontWeight: 700 }}>{dream.redreamed ? 'Undo ReDream' : 'ReDream'}</div><div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>Share to your followers instantly</div></div></button><button className="osb" onClick={() => setShowRD(false)} aria-label="Quote Dream"><span style={{ color: 'var(--ac3)' }} aria-hidden="true"><Ic.Bkm style={{ width: 20, height: 20 }} /></span><div><div style={{ fontWeight: 700 }}>Quote Dream</div><div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>Share with your own thoughts</div></div></button></div></div></div>}
    </>
  );
}
