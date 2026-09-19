/**
 * Command palette store (T46). A module-level store, not a context, so the TopBar button, the hub buttons, the
 * `hub.openCommands` / `hub.voiceListen` action handlers and the global Ctrl/Cmd+K listener can all open the ONE palette
 * that `ControlBridge` mounts on every shell. `voice: true` asks the palette to start listening, which it only does when
 * the request also carries `fromGesture: true` - set by the visible buttons and Ctrl/Cmd+K handlers only, never by an
 * action handler (`hub.voiceListen` run by an agent, the CLI or a Routine opens the palette and focuses the microphone
 * button instead). `useVoice.start` keeps its own `navigator.userActivation` check as the second lock.
 */
import { useSyncExternalStore } from 'react';

export interface PaletteState { open: boolean; query: string; /** Start listening (gesture permitting) as soon as the palette is open. */ voice: boolean; /** The request came from a trusted UI event (button, shortcut): only then may the microphone start. */ fromGesture: boolean; /** Increments per open() so an already-open palette still reacts. */ seq: number }
let state: PaletteState = { open: false, query: '', voice: false, fromGesture: false, seq: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const get = () => state;

export function openPalette(req: { query?: string; voice?: boolean; fromGesture?: boolean } = {}): void { state = { open: true, query: req.query ?? '', voice: !!req.voice, fromGesture: !!req.fromGesture, seq: state.seq + 1 }; emit(); }
export function closePalette(): void { if (!state.open) return; state = { ...state, open: false, voice: false, fromGesture: false }; emit(); }
export function togglePalette(): void { if (state.open) closePalette(); else openPalette(); }
export const paletteOpen = (): boolean => state.open;
/** Subscribe a component to the palette state. */
export function usePaletteState(): PaletteState { return useSyncExternalStore(subscribe, get, get); }
/** Ctrl/Cmd+K anywhere (ignored inside text fields only when the key would type; Ctrl/Cmd+K never types, so it is taken everywhere). */
export const isPaletteShortcut = (e: KeyboardEvent): boolean => (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k';
