// DreamOS — Feed Page
import React, { useState } from 'react';
import { useDreams } from '../hooks/useDreams.js';
import { DREAMS_INIT } from '../data/mockData.js';
import { fmt } from '../components/Shared.jsx';
import { Ic } from '../components/Icons.jsx';

// Feed tabs — using radiogroup pattern for VoiceOver
const FEED_TABS = [
  { id: 'foryou',    label: 'For You' },
  { id: 'friends',   label: 'Friends' },
  { id: 'following', label: 'Following' },
  { id: 'local',     label: 'Local' },
  { id: 'circles',   label: 'Circles' },
];

export function FeedPage({ navigate, prefs, cherryCtx }) {
  const [tab, setTab] = useState('foryou');
  const { dreams, tl, tr, tur, tq, tuq, tb, tc } = useDreams(
    cherryCtx ? cherryCtx.dreams : DREAMS_INIT
  );
  const [activeComment, setActiveComment] = useState(null);

  const visible = tab === 'friends'
    ? dreams.filter(d => [1, 2, 4].includes(d.user.id))
    : tab === 'following'
    ? dreams.filter((_, i) => i < 3)
    : tab === 'local'
    ? dreams.filter((_, i) => i > 1 && i < 4)
    : tab === 'circles'
    ? dreams.filter((_, i) => i === 0 || i === 4)
    : dreams;

  const friendsEmpty = tab === 'friends' && visible.length === 0;

  return (
    <div className="pg">
      <div className="hdr">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 16px 0' }}>
          <span className="htit">DreamOS</span>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gr)', boxShadow: '0 0 8px var(--gr)' }} aria-hidden="true" />
        </div>
        {/* Feed tabs — radiogroup for VoiceOver */}
        <div
          className="ftabs"
          role="radiogroup"
          aria-label="Feed tabs"
        >
          {FEED_TABS.map(t => (
            <button
              key={t.id}
              className={`ftab${tab === t.id ? ' on' : ''}`}
              onClick={() => setTab(t.id)}
              role="radio"
              aria-checked={tab === t.id}
              aria-label={`${t.label} feed,`}
            >
              <span aria-hidden="true">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {friendsEmpty && (
        <div className="es">
          <div className="esi" aria-hidden="true">🤝</div>
          <div className="esl">No Friends yet</div>
          <p style={{ fontSize: 13, color: 'var(--tx3)', marginTop: 6, lineHeight: 1.6, maxWidth: 240, textAlign: 'center' }}>
            Friends are Dreamors who follow each other.
          </p>
          {cherryCtx && (
            <button
              className="cherry-ctx-btn"
              style={{ margin: '10px auto 0', display: 'flex' }}
              onClick={() => cherryCtx.openCherry('Who should I follow?')}
              aria-label="Ask Cherry to find Dreamors to follow,"
            >
              <span aria-hidden="true">🍒 Ask Cherry to find Dreamors</span>
            </button>
          )}
        </div>
      )}

      {visible.map((d, idx) => (
        <DreamCard
          key={d.id}
          dream={d}
          onLike={tl}
          onRedream={tr}
          onUndoRedream={tur}
          onQuote={tq}
          onUndoQuote={tuq}
          onBookmark={tb}
          onComment={d => setActiveComment(d)}
          navigate={navigate}
          cherryCtx={cherryCtx}
        />
      ))}
    </div>
  );
}

// Dream card interaction checkbox
function IxnCbx({ on, onToggle, label, activeClass, children }) {
  return (
    <button
      className={`cbx-wrap${on ? ` ${activeClass}` : ''}`}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={on}
    >
      <div className="cbx-box" aria-hidden="true">
        {on && (
          <svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true">
            <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

// Dream card
export function DreamCard({ dream, onLike, onRedream, onUndoRedream, onQuote, onUndoQuote, onBookmark, onComment, navigate, cherryCtx }) {
  const [showOpts, setShowOpts] = useState(false);
  const [showRD, setShowRD]     = useState(false);
  const rdTotal  = dream.redreams + (dream.quotes || 0);
  const rdActive = dream.redreamed || dream.quoted;

  // Dream options — Report and Block live here, not in a separate More Actions
  const dreamOpts = [
    { ic: dream.bookmarked ? '🔖' : '🔖', l: dream.bookmarked ? 'Unsave Dream' : 'Save Dream', sub: dream.bookmarked ? 'Remove from saved' : 'Save this Dream', a: () => { onBookmark && onBookmark(dream.id); setShowOpts(false); } },
    { ic: '📤', l: 'Share Dream', sub: 'Share outside DreamOS', a: () => setShowOpts(false) },
    { ic: '👤', l: `View @${dream.user.handle.replace('@', '')}'s Profile`, a: () => { setShowOpts(false); navigate('dp', dream.user); } },
    '---',
    { ic: '🔇', l: `Mute @${dream.user.handle.replace('@', '')}`, sub: 'Stop seeing their Dreams', a: () => setShowOpts(false) },
    { ic: '🚫', l: `Block @${dream.user.handle.replace('@', '')}`, sub: 'Block this Dreamor', a: () => setShowOpts(false), danger: true },
    { ic: '🚩', l: 'Report Dream', sub: 'Flag for review', a: () => setShowOpts(false), danger: true },
    ...(cherryCtx ? [{ ic: '🍒', l: 'Ask Cherry about this', sub: 'Get AI insights', a: () => { setShowOpts(false); cherryCtx.openCherry('Tell me about this Dream: ' + dream.text.slice(0, 200)); } }] : []),
  ];

  return (
    <>
      {dream.reddreamer && (
        <div className="rd-source">
          <Ic.Rep style={{ width: 11, height: 11 }} aria-hidden="true" />
          <strong style={{ fontWeight: 600 }}>{dream.reddreamer.name}</strong> ReDreamed
        </div>
      )}
      <article className="dc" aria-label={`Dream by ${dream.user.name}`}>
        <div className="dc-inner">
          <div className="dc-meta">
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => navigate('dp', dream.user)}
              aria-label={`View ${dream.user.name}'s profile,`}
            >
              <span className="dc-name">
                {dream.user.name}
                {dream.user.verified && <span style={{ color: 'var(--ac2)', marginLeft: 3, fontSize: 11 }} aria-label="Verified">✓</span>}
              </span>
            </button>
            <span className="dc-dot" aria-hidden="true">·</span>
            <span className="dc-handle">{dream.user.handle}</span>
            <span className="dc-dot" aria-hidden="true">·</span>
            <span className="dc-time">{dream.time}</span>
          </div>

          <p className="dc-body">
            {dream.text.split(' ').map((w, i) =>
              w.startsWith('#')
                ? <span key={i}><span className="dc-tag">{w}</span>{' '}</span>
                : w + ' '
            )}
          </p>
        </div>

        {/* Interaction row */}
        <div className="ixn-row" role="group" aria-label="Dream actions">
          <button
            className="ixn-btn"
            onClick={() => onComment && onComment(dream)}
            aria-label={`${fmt(dream.comments)} comments,`}
          >
            <Ic.Cmt style={{ width: 15, height: 15 }} aria-hidden="true" />
            <span aria-hidden="true">{fmt(dream.comments)} Comments</span>
          </button>

          <IxnCbx
            on={rdActive}
            onToggle={() => setShowRD(true)}
            label={`${fmt(rdTotal)} ReDreams,`}
            activeClass="redd"
          >
            {fmt(rdTotal)} ReDreams
          </IxnCbx>

          <IxnCbx
            on={dream.liked}
            onToggle={() => onLike(dream.id)}
            label={`${fmt(dream.likes)} likes,`}
            activeClass="liked"
          >
            {fmt(dream.likes)} Likes
          </IxnCbx>

          {/* More button — opens collapsible options */}
          <button
            className="ixn-btn"
            style={{ flex: '.5' }}
            onClick={() => setShowOpts(true)}
            aria-label="More Dream options,"
            aria-haspopup="dialog"
          >
            <Ic.Dots style={{ width: 15, height: 15 }} aria-hidden="true" />
          </button>
        </div>
      </article>

      {/* ReDream modal */}
      {showRD && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setShowRD(false)}>
          <div className="msh" role="dialog" aria-label="ReDream or Quote">
            <div className="mhd" aria-hidden="true" />
            <div className="min">
              <div className="mtt">ReDream or Quote</div>
              <button
                className="osb"
                onClick={() => { dream.redreamed ? onUndoRedream(dream.id) : onRedream(dream.id); setShowRD(false); }}
                aria-label={dream.redreamed ? 'Undo ReDream,' : 'ReDream,'}
              >
                <span style={{ color: 'var(--gr)' }} aria-hidden="true"><Ic.Rep style={{ width: 20, height: 20 }} /></span>
                <div>
                  <div style={{ fontWeight: 700 }}>{dream.redreamed ? 'Undo ReDream' : 'ReDream'}</div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>Share to your followers instantly</div>
                </div>
              </button>
              <button
                className="osb"
                onClick={() => setShowRD(false)}
                aria-label="Quote Dream,"
              >
                <span style={{ color: 'var(--ac3)' }} aria-hidden="true"><Ic.Bkm style={{ width: 20, height: 20 }} /></span>
                <div>
                  <div style={{ fontWeight: 700 }}>Quote Dream</div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>Share with your own thoughts</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dream options — fullscreen, includes Report and Block */}
      {showOpts && (
        <div
          className="ov"
          onClick={e => e.target === e.currentTarget && setShowOpts(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Dream options"
        >
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderRadius: '20px 20px 0 0', padding: '0 0 calc(env(safe-area-inset-bottom,0px) + 8px)', boxShadow: '0 -8px 40px rgba(0,0,0,.45)' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '12px auto 4px' }} aria-hidden="true" />
            <div style={{ padding: '10px 20px 6px', fontSize: 11, fontWeight: 800, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.1em' }} role="heading" aria-level="3">
              Dream options
            </div>
            {dreamOpts.map((x, i) =>
              x === '---'
                ? <div key={i} style={{ height: 1, background: 'var(--bd)', margin: '4px 0' }} aria-hidden="true" />
                : (
                  <button
                    key={x.l}
                    onClick={x.a}
                    aria-label={`${x.l},`}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: 22, width: 28, textAlign: 'center', flexShrink: 0 }} aria-hidden="true">{x.ic}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: x.danger ? 600 : 500, color: x.danger ? 'var(--rd)' : 'var(--tx)' }}>{x.l}</div>
                      {x.sub && <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>{x.sub}</div>}
                    </div>
                  </button>
                )
            )}
            <button
              onClick={() => setShowOpts(false)}
              style={{ display: 'block', width: 'calc(100% - 28px)', margin: '6px 14px 4px', padding: '13px', background: 'var(--sf2)', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, color: 'var(--tx3)', cursor: 'pointer' }}
              aria-label="Cancel,"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
