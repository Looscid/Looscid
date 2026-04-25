// DreamOS — Storage utilities
// All localStorage access goes through here

import { KEYS } from '../data/config.js';

export function getDrafts() {
  try { return JSON.parse(localStorage.getItem(KEYS.DRAFTS) || '[]'); }
  catch { return []; }
}

export function saveDraftItem(draft) {
  try {
    const drafts = getDrafts().filter(d => d.id !== draft.id);
    drafts.unshift(draft);
    localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts.slice(0, 20)));
  } catch {}
}

export function deleteDraftItem(id) {
  try {
    localStorage.setItem(KEYS.DRAFTS, JSON.stringify(getDrafts().filter(d => d.id !== id)));
  } catch {}
}

export function getSavedTheme() {
  try { return localStorage.getItem(KEYS.THEME); } catch { return null; }
}

export function saveTheme(t) {
  try { localStorage.setItem(KEYS.THEME, t); } catch {}
}

export function getOnboardingSeen() {
  try { return localStorage.getItem(KEYS.ONBOARDING) === 'true'; } catch { return false; }
}

export function setOnboardingSeen() {
  try { localStorage.setItem(KEYS.ONBOARDING, 'true'); } catch {}
}

export function getWelcomeSeen() {
  try { return localStorage.getItem(KEYS.WELCOME) === 'true'; } catch { return false; }
}

export function setWelcomeSeen() {
  try { localStorage.setItem(KEYS.WELCOME, 'true'); } catch {}
}

export function shouldShowDigest() {
  try {
    const last = localStorage.getItem(KEYS.DIGEST);
    if (!last) return true;
    return Date.now() - parseInt(last) > 20 * 60 * 60 * 1000;
  } catch { return false; }
}

export function markDigestSeen() {
  try { localStorage.setItem(KEYS.DIGEST, String(Date.now())); } catch {}
}

export function getAnalyticsConsent() {
  try { return localStorage.getItem(KEYS.ANALYTICS); } catch { return null; }
}

export function setAnalyticsConsent(v) {
  try { localStorage.setItem(KEYS.ANALYTICS, v); } catch {}
}

export function getAIPrefs() {
  try { return JSON.parse(localStorage.getItem(KEYS.AI_PREFS) || '{}'); } catch { return {}; }
}

export function setAIPrefs(p) {
  try { localStorage.setItem(KEYS.AI_PREFS, JSON.stringify(p)); } catch {}
}

export function getActiveAI() {
  return getAIPrefs().active || 'cherry';
}

export function getHabits() {
  try { return JSON.parse(localStorage.getItem(KEYS.HABITS) || '{}'); } catch { return {}; }
}

export function recordHabit(action, meta) {
  try {
    const h = getHabits();
    if (!h[action]) h[action] = { count: 0, times: [], meta: [] };
    h[action].count++;
    h[action].times.push(Date.now());
    if (meta) h[action].meta.push(meta);
    if (h[action].times.length > 50) h[action].times = h[action].times.slice(-50);
    if (h[action].meta.length > 20) h[action].meta = h[action].meta.slice(-20);
    localStorage.setItem(KEYS.HABITS, JSON.stringify(h));
  } catch {}
}
