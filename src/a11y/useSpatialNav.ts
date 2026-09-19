import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import { consumesArrows, firstByPosition, focusables, inOpenDialog, KEY_TO_DIRECTION, nearest, needsSyntheticActivation, parentPath, type Direction } from './spatial';

export interface SpatialNavOptions {
  enabled?: boolean;
  /** Backspace / Escape / gamepad B. Default: one hash level up (`/demo/x/comms` -> `/demo/x`). */
  onBack?: () => void;
}
/** The handlers a gamepad (useGamepadNav) or a future voice / remote adapter drives. */
export interface SpatialControls { move: (dir: Direction) => boolean; activate: () => boolean; back: () => boolean; rootRef: RefObject<HTMLElement | null> }

/**
 * Arrow keys move focus geometrically among the focusable elements inside `ref` (nearest in the arrow direction, no
 * wrap); Enter / Space activate; Backspace / Escape go up one nav level (P-04, T47). Active only while focus is inside the
 * container or nothing is focused; never for an arrow the focused control owns (all four inside selects, textareas, sliders,
 * combos, iframes or `[data-spatial="skip"]`; Left / Right inside a text field, tablist or radiogroup; Up / Down inside a listbox / menu / tree)
 * (the K-03 graph owns its arrows), and never while a modal dialog is open. Escape inside a select / text field parks focus
 * (blur) so the next arrow continues from that spot: a remote has no Tab key to leave a control. Native Tab order is untouched.
 */
export function useSpatialNav(ref: RefObject<HTMLElement | null>, opts: SpatialNavOptions = {}): SpatialControls {
  const { enabled = true, onBack } = opts;
  const backRef = useRef(onBack); backRef.current = onBack;
  /** Where focus was when Escape left an arrow-owning control (select, text field): the next arrow continues from there instead of the top-left. */
  const parked = useRef<DOMRect | null>(null);

  const eligible = useCallback((dir?: Direction): { root: HTMLElement; active: Element | null; inside: boolean } | null => {
    const root = ref.current;
    if (!enabled || !root || inOpenDialog()) return null;
    const active = document.activeElement;
    const inside = !!active && root.contains(active);
    const loose = !active || active === document.body || active === document.documentElement;
    if (!inside && !loose) return null;
    if (consumesArrows(active, dir)) return null;
    return { root, active, inside };
  }, [ref, enabled]);

  const move = useCallback((dir: Direction): boolean => {
    const e = eligible(dir); if (!e) return false;
    const cands = focusables(e.root).filter((c) => c.el !== e.active);
    const from = e.inside && e.active ? e.active.getBoundingClientRect() : parked.current;
    parked.current = null;
    const target = from ? nearest(from, cands, dir) ?? (e.inside ? null : firstByPosition(cands)) : firstByPosition(cands);
    if (!target) return false;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    return true;
  }, [eligible]);

  const activate = useCallback((): boolean => {
    const e = eligible(); if (!e || !e.inside || !e.active) return false;
    (e.active as HTMLElement).click();
    return true;
  }, [eligible]);

  const back = useCallback((): boolean => {
    const e = eligible(); if (!e) return false;
    if (backRef.current) { backRef.current(); return true; }
    const parent = parentPath(window.location.hash);
    if (parent === (window.location.hash.replace(/^#/, '').split('?')[0] || '/')) return false;
    window.location.hash = `#${parent}`;
    return true;
  }, [eligible]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      const dir = KEY_TO_DIRECTION[ev.key];
      if (dir) { if (move(dir)) ev.preventDefault(); return; }
      if (ev.key === 'Enter' || ev.key === ' ') {
        const e = eligible(); if (!e || !e.inside || !e.active || !needsSyntheticActivation(e.active, ev.key)) return;
        if (activate()) ev.preventDefault();
        return;
      }
      if (ev.key === 'Escape') {
        // Inside a select / text field the arrows belong to the control; Escape parks focus so the d-pad can leave it (a remote has no Tab).
        const root = ref.current; const active = document.activeElement as HTMLElement | null;
        if (root && active && active !== document.body && root.contains(active) && consumesArrows(active) && !active.closest('[data-spatial="skip"]') && !inOpenDialog()) { parked.current = active.getBoundingClientRect(); active.blur(); ev.preventDefault(); return; }
      }
      if (ev.key === 'Backspace' || ev.key === 'Escape') { if (back()) ev.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled, move, activate, back, eligible]);

  return useMemo(() => ({ move, activate, back, rootRef: ref }), [move, activate, back, ref]);
}
