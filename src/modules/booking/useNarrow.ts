import { useEffect, useState } from 'react';
/** Local media-query hook for the booking pages (public chrome, no shell to ask). */
export function useNarrow(bp = 900): boolean {
  const [narrow, set] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${bp}px)`).matches : false));
  useEffect(() => { const mq = window.matchMedia(`(max-width: ${bp}px)`); const h = () => set(mq.matches); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, [bp]);
  return narrow;
}
