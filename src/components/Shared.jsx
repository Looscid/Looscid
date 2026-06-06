import React from 'react';

/**
 * Shared Components and Utilities for DreamOS
 */

/**
 * Avatar Component
 * Renders a user's profile picture or a placeholder.
 */
export function Av({ user, size = 40 }) {
  const src = user?.avatar || user?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.handle || 'guest'}`;
  
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        overflow: 'hidden', 
        flexShrink: 0,
        background: 'var(--sf2)',
        border: '1px solid var(--bd)'
      }}
    >
      <img
        src={src}
        alt=""
        aria-label={`${user?.name || 'User'} Avatar,`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

/**
 * Engagement Count Formatter
 * Converts numbers to human-readable strings (e.g., 1500 -> 1.5K).
 */
export function fmt(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
