// DreamOS — useDreams hook

import { useState } from 'react';

export function useDreams(init) {
  const [dreams, setDreams] = useState(init);

  const tl  = id => setDreams(ds => ds.map(d => d.id === id
    ? { ...d, liked: !d.liked, likes: d.liked ? d.likes - 1 : d.likes + 1 }
    : d));

  const tr  = id => setDreams(ds => ds.map(d => d.id === id
    ? { ...d, redreamed: true, redreams: d.redreams + 1 }
    : d));

  const tur = id => setDreams(ds => ds.map(d => d.id === id
    ? { ...d, redreamed: false, redreams: Math.max(0, d.redreams - 1) }
    : d));

  const tq  = id => setDreams(ds => ds.map(d => d.id === id
    ? { ...d, quoted: true, quotes: (d.quotes || 0) + 1 }
    : d));

  const tuq = id => setDreams(ds => ds.map(d => d.id === id
    ? { ...d, quoted: false, quotes: Math.max(0, (d.quotes || 1) - 1) }
    : d));

  const tb  = id => setDreams(ds => ds.map(d => d.id === id
    ? { ...d, bookmarked: !d.bookmarked }
    : d));

  const tc  = id => setDreams(ds => ds.map(d => d.id === id
    ? { ...d, comments: d.comments + 1 }
    : d));

  return { dreams, setDreams, tl, tr, tur, tq, tuq, tb, tc };
}
