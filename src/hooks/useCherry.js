// DreamOS — useCherry hook
// Cherry's state and actions, available everywhere in the app

import { useState } from 'react';
import { recordHabit } from '../utils/storage.js';

export function useCherry(appDreams, setAppDreams, USERS, GROUPS) {
  const [appFollowing, setAppFollowing] = useState(new Set());
  const [appGroups, setAppGroups]       = useState(GROUPS);
  const [appNotifs, setAppNotifs]       = useState([]);
  const [cherryOpen, setCherryOpen]     = useState(false);
  const [cherryInitMsg, setCherryInitMsg] = useState(null);
  const [cherryLog, setCherryLog]       = useState([]);
  const [cherryOnboarded, setCherryOnboarded] = useState(false);

  const addLog = (ic, text, undoFn = null) => {
    setCherryLog(l => [
      { id: Date.now(), ic, text, undoFn, ...(undoFn ? { undone: false } : {}) },
      ...l,
    ].slice(0, 20));
  };

  const likeDream = id => {
    recordHabit('likeDream');
    setAppDreams(ds => ds.map(d => d.id === id
      ? { ...d, liked: !d.liked, likes: d.liked ? d.likes - 1 : d.likes + 1 }
      : d));
    const d = appDreams.find(x => x.id === id);
    if (d) addLog('❤️', 'Liked ' + d.user.name + "'s Dream",
      () => setAppDreams(ds => ds.map(x => x.id === id
        ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 }
        : x)));
  };

  const saveDream = id => {
    setAppDreams(ds => ds.map(d => d.id === id ? { ...d, bookmarked: !d.bookmarked } : d));
    const d = appDreams.find(x => x.id === id);
    if (d) addLog('🔖', 'Saved ' + d.user.name + "'s Dream");
  };

  const postDream = text => {
    const id = Date.now();
    const ME = { id: 0, name: 'You', handle: '@you', initials: 'YO', color: '#6d28d9' };
    setAppDreams(ds => [{
      id, user: ME, time: 'just now', text,
      likes: 0, comments: 0, redreams: 0, quotes: 0,
      liked: false, redreamed: false, quoted: false, bookmarked: false,
    }, ...ds]);
    addLog('✏️', 'Posted Dream: ' + text.slice(0, 40) + '…',
      () => setAppDreams(ds => ds.filter(d => d.id !== id)));
  };

  const followUser = id => {
    setAppFollowing(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const u = USERS.find(x => x.id === id);
    if (u) addLog('👥', 'Followed ' + u.name,
      () => setAppFollowing(s => { const n = new Set(s); n.delete(id); return n; }));
  };

  const joinGroup = id => {
    setAppGroups(gs => gs.map(g => g.id === id ? { ...g, joined: !g.joined } : g));
    const g = GROUPS.find(x => x.id === id);
    if (g) addLog('🏘️', 'Joined ' + g.name,
      () => setAppGroups(gs => gs.map(x => x.id === id ? { ...x, joined: false } : x)));
  };

  const markNotifsRead = () => {
    setAppNotifs(ns => ns.map(n => ({ ...n, unread: false })));
    addLog('🔔', 'Marked all notifications read');
  };

  const openCherry = msg => {
    setCherryInitMsg(msg || null);
    setCherryOpen(true);
  };

  return {
    appFollowing, setAppFollowing,
    appGroups, setAppGroups,
    appNotifs, setAppNotifs,
    cherryOpen, setCherryOpen,
    cherryInitMsg, setCherryInitMsg,
    cherryLog, setCherryLog,
    cherryOnboarded, setCherryOnboarded,
    // Actions
    likeDream, saveDream, postDream, followUser, joinGroup, markNotifsRead, openCherry,
    // Context object passed to components
    get ctx() {
      return {
        dreams: appDreams,
        following: appFollowing,
        groups: appGroups,
        notifs: appNotifs,
        cherryLog,
        cherryOnboarded,
        setCherryOnboarded,
        likeDream, saveDream, postDream, followUser, joinGroup, markNotifsRead, openCherry,
      };
    },
  };
}
