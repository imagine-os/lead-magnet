/** English is primary. Spanish is filled in a pass (never a blocker) and falls back to English. */
export type Lang = 'en' | 'es';
export type StringEntry = string | { en: string; es?: string };
export type StringTable = Record<string, StringEntry>;
/** Bilingual copy object used by the engine (every section carries { en, es }). */
export interface Bi { en: string; es: string }
