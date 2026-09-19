import { useEffect, useState } from 'react';
/** True when the viewport is at least `px` wide (matchMedia, live). Used for the 10-foot "TV mode" hint at >= 1920 (P-01, P-04). */
export function useViewportAtLeast(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}
