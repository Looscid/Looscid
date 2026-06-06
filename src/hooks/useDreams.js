
import { useState } from 'react';

export function useDreams(initialDreams) {
  const [dreams, setDreams] = useState(initialDreams);

  const tl = (id) => {
    setDreams(prev => prev.map(d => d.id === id ? { ...d, liked: !d.liked, likes: d.liked ? d.likes - 1 : d.likes + 1 } : d));
  };

  const tr = (id) => {
    setDreams(prev => prev.map(d => d.id === id ? { ...d, redreamed: true, redreams: d.redreams + 1 } : d));
  };

  const tur = (id) => {
    setDreams(prev => prev.map(d => d.id === id ? { ...d, redreamed: false, redreams: d.redreams - 1 } : d));
  };

  const tq = (id) => {
    setDreams(prev => prev.map(d => d.id === id ? { ...d, quoted: true, redreams: d.redreams + 1 } : d));
  };

  const tuq = (id) => {
    setDreams(prev => prev.map(d => d.id === id ? { ...d, quoted: false, redreams: d.redreams - 1 } : d));
  };

  const tb = (id) => {
    setDreams(prev => prev.map(d => d.id === id ? { ...d, bookmarked: !d.bookmarked } : d));
  };

  const tc = (id) => {
    // Comment logic would go here
  };

  return { dreams, tl, tr, tur, tq, tuq, tb, tc };
}
