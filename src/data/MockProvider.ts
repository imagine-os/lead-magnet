import type { BaseRow } from './schema/types';
import { tableNames } from './schema';
import { applyQuery, type ChangeEvent, type DataProvider, type Query } from './provider';
import { buildSeed } from './seed';

export const DB_KEY = 'leadmagnet.db.v1';
/** Bump when the seed shape changes so stale browsers reseed. 2: `recommendations` table + `bookings` contact columns (2026-09-19). */
export const SEED_VERSION = 3;
type Db = Record<string, BaseRow[]>;
export const newId = (prefix = 'row'): string => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

/** In-browser database: seeded from src/data/seed, persisted to localStorage, emits change events (realtime-shaped). Writes replace the table array so subscribers get a new reference. */
export class MockProvider implements DataProvider {
  readonly name = 'mock';
  private db: Db;
  private listeners = new Map<string, Set<(e: ChangeEvent) => void>>();
  constructor() {
    this.db = this.load();
    if (typeof window !== 'undefined') window.addEventListener('storage', (e) => this.onStorage(e));
  }
  private onStorage(e: StorageEvent) {
    if (e.key !== DB_KEY || !e.newValue) return;
    try { const parsed = JSON.parse(e.newValue) as { db: Db }; if (!tableNames.every((t) => Array.isArray(parsed.db[t]))) return; this.db = parsed.db; for (const t of Object.keys(this.db)) this.emit({ table: t, type: 'reset' }); } catch { /* ignore */ }
  }
  private load(): Db {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) { const parsed = JSON.parse(raw) as { version?: number; db: Db }; if (parsed.version === SEED_VERSION && tableNames.every((t) => Array.isArray(parsed.db[t]))) return parsed.db; }
    } catch { /* reseed */ }
    const db = buildSeed();
    this.carryOver(db);
    this.persist(db);
    return db;
  }
  /** Keep rows a person created (runtime ids) when the seed version changes. */
  private carryOver(db: Db) {
    try {
      const raw = localStorage.getItem(DB_KEY); if (!raw) return;
      const old = (JSON.parse(raw) as { db?: Db }).db; if (!old) return;
      for (const t of tableNames) { const seeded = new Set((db[t] ?? []).map((r) => r.id)); const extra = (old[t] ?? []).filter((r) => r && typeof r.id === 'string' && !seeded.has(r.id) && /^[a-z]{1,4}_[a-z0-9]{8}$/.test(r.id)); if (extra.length) db[t] = [...(db[t] ?? []), ...extra]; }
    } catch { /* ignore */ }
  }
  private persist(db = this.db) { try { localStorage.setItem(DB_KEY, JSON.stringify({ version: SEED_VERSION, db })); } catch { /* quota */ } }
  private emit(e: ChangeEvent) { this.listeners.get(e.table)?.forEach((cb) => cb(e)); this.listeners.get('*')?.forEach((cb) => cb(e)); }
  private rows(table: string): BaseRow[] { if (!this.db[table]) this.db[table] = []; return this.db[table]; }
  peek<T extends BaseRow>(table: string, query?: Query): T[] { return applyQuery(this.rows(table) as T[], query); }
  async list<T extends BaseRow>(table: string, query?: Query): Promise<T[]> { return this.peek<T>(table, query); }
  async get<T extends BaseRow>(table: string, id: string): Promise<T | null> { return (this.rows(table).find((r) => r.id === id) as T) ?? null; }
  async insert<T extends BaseRow>(table: string, row: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const full = { id: newId(table.slice(0, 3)), created_at: now, updated_at: now, ...row } as T;
    this.db[table] = [...this.rows(table), full]; this.persist(); this.emit({ table, type: 'insert', row: full }); return full;
  }
  async update<T extends BaseRow>(table: string, id: string, patch: Partial<T>): Promise<T> {
    const rows = this.rows(table); const i = rows.findIndex((r) => r.id === id); if (i < 0) throw new Error(`${table}/${id} not found`);
    const next = { ...rows[i], ...patch, updated_at: new Date().toISOString() } as T;
    this.db[table] = [...rows.slice(0, i), next, ...rows.slice(i + 1)]; this.persist(); this.emit({ table, type: 'update', row: next, id }); return next;
  }
  async remove(table: string, id: string): Promise<void> { this.db[table] = this.rows(table).filter((r) => r.id !== id); this.persist(); this.emit({ table, type: 'remove', id }); }
  subscribe(table: string, cb: (e: ChangeEvent) => void): () => void { if (!this.listeners.has(table)) this.listeners.set(table, new Set()); this.listeners.get(table)!.add(cb); return () => { this.listeners.get(table)?.delete(cb); }; }
  async reset(): Promise<void> { this.db = buildSeed(); this.persist(); for (const t of Object.keys(this.db)) this.emit({ table: t, type: 'reset' }); }
}
