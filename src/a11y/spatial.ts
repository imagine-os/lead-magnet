/**
 * Pure geometry for d-pad / remote spatial navigation (P-04, T47). No React here so it can be unit-checked.
 * Focus moves to the nearest focusable element in the arrow's direction; nothing wraps (an edge stays put).
 */
export type Direction = 'up' | 'down' | 'left' | 'right';
export const KEY_TO_DIRECTION: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
export const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]';
/** Elements that own the arrow keys themselves: the hook never hijacks arrows inside them (nor inside `[data-spatial="skip"]`). */
const ARROW_OWNERS = 'input, select, textarea, [contenteditable="true"], [role="slider"], [role="listbox"], [role="combobox"], [role="menu"], [role="menubar"], [role="grid"], [role="tree"], [role="tablist"], [role="radiogroup"], [role="spinbutton"], iframe, [data-spatial="skip"]';
/** Composite widgets that own ONE axis: the other axis is free for the d-pad to leave them (a tablist you could enter but never exit is a trap, P-04). */
const HORIZONTAL_OWNERS = '[role="tablist"], [role="radiogroup"], [role="menubar"]';
const VERTICAL_OWNERS = '[role="listbox"], [role="menu"], [role="tree"]';
const NON_TEXT_INPUTS = new Set(['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'image', 'color']);
const isHorizontal = (dir?: Direction) => dir === 'left' || dir === 'right';

/**
 * Does `el` (or an ancestor) own the arrow key `dir`? Text fields own Left / Right (caret) but not Up / Down (a single-line input
 * does nothing with them); textareas, selects, sliders, combos, grids, iframes and `[data-spatial="skip"]` own all four;
 * horizontal composites (tablist, radiogroup, menubar) own Left / Right only, vertical ones (listbox, menu, tree) Up / Down only.
 * Without `dir` (Enter / Space / Backspace) any owner counts.
 */
export function consumesArrows(el: Element | null, dir?: Direction): boolean {
  if (!el || el === document.body || el === document.documentElement) return false;
  const owner = el.closest(ARROW_OWNERS);
  if (!owner) return false;
  if (dir == null) return !(el instanceof HTMLInputElement && NON_TEXT_INPUTS.has(el.type) && !el.closest('[data-spatial="skip"], [role="radiogroup"]'));
  if (el instanceof HTMLInputElement) {
    if (NON_TEXT_INPUTS.has(el.type)) return !!el.closest('[data-spatial="skip"]') || (!!el.closest('[role="radiogroup"]') && isHorizontal(dir));
    if (el.closest('[data-spatial="skip"]')) return true;
    return isHorizontal(dir); // single-line text field: Up / Down leave it
  }
  if (owner.matches(HORIZONTAL_OWNERS) && !owner.closest('[data-spatial="skip"]') && !el.closest('select, textarea, [contenteditable="true"], iframe')) return isHorizontal(dir);
  if (owner.matches(VERTICAL_OWNERS) && !owner.closest('[data-spatial="skip"]') && !el.closest('select, textarea, [contenteditable="true"], iframe')) return !isHorizontal(dir);
  return true;
}
/** A modal is open: an `<dialog>` that is actually `open`, or a non-dialog element with role dialog / alertdialog that is rendered. `Modal` keeps its `<dialog role="dialog" aria-modal="true">` in the DOM while closed, so the attribute alone is not evidence. */
export function inOpenDialog(): boolean {
  for (const el of document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"], [role="alertdialog"], dialog[open]')) {
    if (el instanceof HTMLDialogElement) { if (el.open) return true; continue; }
    const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return true;
  }
  return false;
}

const visible = (el: HTMLElement, rect: DOMRect) => rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[hidden], [aria-hidden="true"], [inert]');
export interface Candidate { el: HTMLElement; rect: DOMRect }
/** Focusable, visible, enabled elements inside `root`, minus anything under `[data-spatial="skip"]` and iframes. */
export function focusables(root: HTMLElement): Candidate[] {
  const out: Candidate[] = [];
  for (const el of root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) {
    if (el.tabIndex < 0 || (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') continue;
    if (el.tagName === 'IFRAME' || el.closest('[data-spatial="skip"]')) continue;
    const rect = el.getBoundingClientRect();
    if (visible(el, rect)) out.push({ el, rect });
  }
  return out;
}

const gap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => (bStart >= aEnd ? bStart - aEnd : aStart >= bEnd ? aStart - bEnd : 0);
/**
 * Nearest candidate in `dir`: it must lie beyond the current element on that axis; the score is the distance along the
 * axis plus twice the orthogonal gap (elements in the same row / column win), with the centre offset as tie-breaker.
 */
export function nearest(from: DOMRect, candidates: Candidate[], dir: Direction): HTMLElement | null {
  const fcx = from.left + from.width / 2, fcy = from.top + from.height / 2;
  let best: { el: HTMLElement; score: number } | null = null;
  for (const { el, rect: r } of candidates) {
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let primary: number, orth: number, tie: number;
    switch (dir) {
      case 'right': if (!(cx > fcx + 1 && r.right > from.right)) continue; primary = Math.max(0, r.left - from.right); orth = gap(from.top, from.bottom, r.top, r.bottom); tie = Math.abs(cy - fcy); break;
      case 'left': if (!(cx < fcx - 1 && r.left < from.left)) continue; primary = Math.max(0, from.left - r.right); orth = gap(from.top, from.bottom, r.top, r.bottom); tie = Math.abs(cy - fcy); break;
      case 'down': if (!(cy > fcy + 1 && r.bottom > from.bottom)) continue; primary = Math.max(0, r.top - from.bottom); orth = gap(from.left, from.right, r.left, r.right); tie = Math.abs(cx - fcx); break;
      default: if (!(cy < fcy - 1 && r.top < from.top)) continue; primary = Math.max(0, from.top - r.bottom); orth = gap(from.left, from.right, r.left, r.right); tie = Math.abs(cx - fcx);
    }
    const score = primary + orth * 2 + tie * 0.05;
    if (!best || score < best.score) best = { el, score };
  }
  return best?.el ?? null;
}

/** First element by reading order (top-left) - where focus lands when an arrow is pressed with nothing focused. */
export function firstByPosition(candidates: Candidate[]): HTMLElement | null {
  let best: Candidate | null = null;
  for (const c of candidates) if (!best || c.rect.top < best.rect.top - 4 || (Math.abs(c.rect.top - best.rect.top) <= 4 && c.rect.left < best.rect.left)) best = c;
  return best?.el ?? null;
}

/** Native activation covers buttons, links (Enter) and form controls; everything else focusable gets a synthetic click. */
export function needsSyntheticActivation(el: Element, key: string): boolean {
  const tag = el.tagName;
  if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'SUMMARY') return false;
  if (tag === 'A') return key === ' '; // Space does not activate links natively
  return true;
}

/** One hash level up: '#/demo/pro_maya/comms' -> '/demo/pro_maya'; '/' stays. */
export function parentPath(hash: string): string {
  const path = hash.replace(/^#/, '').split('?')[0] || '/';
  if (path === '/') return '/';
  const parts = path.split('/').filter(Boolean); parts.pop();
  return parts.length ? `/${parts.join('/')}` : '/';
}
