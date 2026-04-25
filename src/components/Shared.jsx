// DreamOS — Shared UI components
import React from 'react';
import { Ic } from './Icons.jsx';

// Avatar
export function Av({ user, size = 40 }) {
  return (
    <div
      className="av"
      style={{
        width: size, height: size,
        fontSize: size * 0.35,
        background: `linear-gradient(135deg,${user.color || '#6d28d9'},#a855f7)`,
      }}
      aria-hidden="true"
    >
      {user.initials}
    </div>
  );
}

// Checkbox checkmark
export function ChkMark() {
  return (
    <svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true">
      <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Checkbox toggle (settings)
export function Cbx({ on, onToggle, label }) {
  return (
    <button
      className={`cbx${on ? ' on' : ''}`}
      onClick={onToggle}
      aria-checked={on}
      role="checkbox"
      aria-label={label}
    >
      {on && <ChkMark />}
    </button>
  );
}

// Back header
export function BackHeader({ title, onBack, right }) {
  return (
    <div className="hdr">
      <div className="hdr-row">
        <button className="bi" onClick={onBack} aria-label="Go back,">
          <Ic.Bck style={{ width: 21, height: 21 }} />
        </button>
        <span className="hdr-title">{title}</span>
        {right}
      </div>
    </div>
  );
}

// Bottom sheet modal
export function Modal({ onClose, title, subtitle, children }) {
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="msh" role="dialog" aria-label={title || 'Menu'}>
        <div className="mhd" />
        <div className="min">
          {title && <div className="mtt">{title}</div>}
          {subtitle && <div className="msb">{subtitle}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

// Fullscreen bottom menu — used for all option menus and More buttons
// Collapses and expands like a More button pattern
export function BottomMenu({ onClose, items, title }) {
  return (
    <div
      className="ov"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Options menu'}
    >
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--bg)',
        borderRadius: '20px 20px 0 0',
        padding: '0 0 calc(env(safe-area-inset-bottom,0px) + 8px)',
        boxShadow: '0 -8px 40px rgba(0,0,0,.45)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '12px auto 4px' }} aria-hidden="true" />
        {title && (
          <div style={{ padding: '10px 20px 6px', fontSize: 11, fontWeight: 800, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.1em' }} role="heading" aria-level="3">
            {title}
          </div>
        )}
        {items.map((x, i) =>
          x === '---'
            ? <div key={i} style={{ height: 1, background: 'var(--bd)', margin: '4px 0' }} aria-hidden="true" />
            : (
              <button
                key={x.l}
                onClick={x.a}
                aria-label={x.l}
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
          onClick={onClose}
          style={{ display: 'block', width: 'calc(100% - 28px)', margin: '6px 14px 4px', padding: '13px', background: 'var(--sf2)', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, color: 'var(--tx3)', cursor: 'pointer' }}
          aria-label="Cancel,"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Section label — renders as h2 for screen reader heading navigation
export function SectionLabel({ children, style }) {
  return (
    <h2 className="slbl" style={style} role="heading" aria-level="2">
      {children}
    </h2>
  );
}

// Empty state
export function EmptyState({ icon, label, sub }) {
  return (
    <div className="es">
      <div className="esi" aria-hidden="true">{icon}</div>
      <div className="esl">{label}</div>
      {sub && <p style={{ fontSize: 13, color: 'var(--tx3)', marginTop: 6, lineHeight: 1.6, maxWidth: 240, textAlign: 'center' }}>{sub}</p>}
    </div>
  );
}

// Format numbers
export function fmt(n) {
  if (n == null) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 10000) return n.toLocaleString();
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

// Settings row
export function SettingsRow({ title, desc, right, onClick }) {
  return (
    <div className="sr" style={onClick ? { cursor: 'pointer' } : {}} onClick={onClick}>
      <div>
        <div className="sr-title">{title}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 3, lineHeight: 1.45, maxWidth: 250 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );
}

// Settings nav button
export function SettingsNav({ icon, title, sub, color, onClick, badge }) {
  return (
    <button className="snav" onClick={onClick} aria-label={`${title},`}>
      <div className="snav-l">
        <div className="snav-ic" style={{ background: color + '22', fontSize: 17, position: 'relative' }}>
          {icon}
          {badge > 0 && (
            <div style={{ position: 'absolute', top: -4, right: -4, background: 'var(--rd)', color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
              {badge}
            </div>
          )}
        </div>
        <div>
          <div className="snav-title">{title}</div>
          {sub && <div className="snav-sub">{sub}</div>}
        </div>
      </div>
      <Ic.Chv style={{ width: 16, height: 16, color: 'var(--tx3)' }} aria-hidden="true" />
    </button>
  );
}
