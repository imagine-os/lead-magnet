import { useEffect } from 'react';
import type { SpatialControls } from './useSpatialNav';
import type { Direction } from './spatial';

/** Standard-mapping indices: d-pad 12..15, A = 0, B = 1; left stick axes 0 / 1. */
const DPAD: Record<number, Direction> = { 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
const STICK_DEADZONE = 0.6;
const REPEAT_MS = 220;

/**
 * Maps a connected gamepad's d-pad / left stick onto `move`, A onto `activate` and B onto `back` (P-04). Polls
 * `navigator.getGamepads()` on animation frames ONLY while at least one gamepad is connected and the document has focus;
 * edge-triggered buttons, held stick repeats every 220 ms. Feature-detected: no Gamepad API, no listeners.
 */
export function useGamepadNav(controls: SpatialControls, enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return;
    let connected = 0; let raf = 0;
    const pressed = new Map<string, number>(); // key -> last time acted (0 = held, edge consumed)
    const act = (key: string, on: boolean, fn: () => void, repeat: boolean) => {
      const now = performance.now(); const last = pressed.get(key);
      if (!on) { pressed.delete(key); return; }
      if (last == null) { pressed.set(key, now); fn(); return; }
      if (repeat && now - last >= REPEAT_MS) { pressed.set(key, now); fn(); }
    };
    const poll = () => {
      if (connected <= 0) { raf = 0; return; }
      if (document.hasFocus()) for (const gp of navigator.getGamepads()) {
        if (!gp) continue;
        for (const [i, dir] of Object.entries(DPAD)) act(`${gp.index}:b${i}`, !!gp.buttons[Number(i)]?.pressed, () => controls.move(dir), true);
        const [x = 0, y = 0] = gp.axes;
        act(`${gp.index}:ax-`, x < -STICK_DEADZONE, () => controls.move('left'), true); act(`${gp.index}:ax+`, x > STICK_DEADZONE, () => controls.move('right'), true);
        act(`${gp.index}:ay-`, y < -STICK_DEADZONE, () => controls.move('up'), true); act(`${gp.index}:ay+`, y > STICK_DEADZONE, () => controls.move('down'), true);
        act(`${gp.index}:A`, !!gp.buttons[0]?.pressed, () => controls.activate(), false);
        act(`${gp.index}:B`, !!gp.buttons[1]?.pressed, () => controls.back(), false);
      }
      raf = requestAnimationFrame(poll);
    };
    const recount = () => { connected = [...navigator.getGamepads()].filter(Boolean).length; if (connected > 0 && !raf) raf = requestAnimationFrame(poll); };
    window.addEventListener('gamepadconnected', recount); window.addEventListener('gamepaddisconnected', recount);
    recount();
    return () => { window.removeEventListener('gamepadconnected', recount); window.removeEventListener('gamepaddisconnected', recount); if (raf) cancelAnimationFrame(raf); };
  }, [controls, enabled]);
}
