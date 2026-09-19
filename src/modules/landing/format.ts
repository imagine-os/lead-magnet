import type { Lang } from '../../i18n/types';
/** Money in the viewer's language, always whole dollars (the numbers are estimates, cents would be a lie). */
export const usd = (n: number, lang: Lang = 'en') => `$${Math.round(n).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US')}`;
export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
