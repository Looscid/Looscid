// DreamOS — Supabase client
// Keys come from environment variables only

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../data/config.js';

let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (typeof window === 'undefined') return null;
  try {
    const { createClient } = window.supabase || {};
    if (!createClient) return null;
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
  } catch { return null; }
}

export function sanitizeInput(str, maxLen = 500) {
  if (!str) return '';
  return String(str).trim().slice(0, maxLen);
}
