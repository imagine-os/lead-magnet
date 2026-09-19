/**
 * Turning a clicked element into something we can find again after a reload (T49).
 * The selector is deliberately short and boring: it stops at the nearest id, or at a `data-component` root when that
 * root is the only one of its kind on the page, skips state classes (`is-*`, `has-*`) and hashed build classes, and
 * falls back to `:nth-of-type` only when it has to. Every library component root carries `data-component="<Name>"`
 * (see `componentAttr` in src/design/meta.ts), so `component` is exact, never a class-name guess.
 */
export { componentAttr } from '../../../design/meta';

const STATE = /^(is|has|was)-/;
const stableClasses = (el: Element): string[] => [...el.classList].filter((c) => !STATE.test(c) && !/\d{4,}|^_/.test(c)).slice(0, 2);

const escId = (id: string) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/[^\w-]/g, '\\$&'));

/** `:nth-of-type(n)` when siblings of the same tag also match `sel`. */
function disambiguate(el: Element, sel: string): string {
  const parent = el.parentElement;
  if (!parent) return sel;
  const twins = [...parent.children].filter((c) => c.matches(sel));
  return twins.length > 1 ? `${sel}:nth-of-type(${[...parent.children].filter((c) => c.tagName === el.tagName).indexOf(el) + 1})` : sel;
}

function segment(el: Element): { sel: string; anchor: boolean } {
  if (el.id) return { sel: `#${escId(el.id)}`, anchor: true };
  const tag = el.tagName.toLowerCase();
  const comp = el.getAttribute('data-component');
  if (comp) {
    // A component root anchors the path only when it is unique on the page (one DataTable, one Sidebar); the third
    // Button of a row keeps climbing so the selector stays exact.
    const sel = `${tag}[data-component="${comp}"]`;
    let unique = false;
    try { unique = document.querySelectorAll(sel).length === 1; } catch { /* keep climbing */ }
    return { sel: unique ? sel : disambiguate(el, sel), anchor: unique };
  }
  const classes = stableClasses(el);
  return { sel: disambiguate(el, tag + classes.map((c) => `.${c}`).join('')), anchor: false };
}

/** A selector that finds this element again on the next render of the same page. Never throws. */
export function stableSelector(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  for (let depth = 0; node && depth < 8 && node !== document.body; depth++) {
    const { sel, anchor } = segment(node);
    parts.unshift(sel);
    if (anchor) return parts.join(' > ');
    node = node.parentElement;
  }
  return parts.join(' > ');
}

/** The library component this element belongs to: its own `data-component` or the nearest one above it; the tag name when it sits in module markup. */
export function nearestComponent(el: Element): string {
  const withAttr = el.closest('[data-component]');
  if (withAttr) return withAttr.getAttribute('data-component') || withAttr.tagName.toLowerCase();
  return el.tagName.toLowerCase();
}

/** Finds the element a pin is anchored to, or null when the page no longer has it. Bad selectors never throw. */
export function resolveElement(selector: string | null | undefined): Element | null {
  if (!selector) return null;
  try { return document.querySelector(selector); } catch { return null; }
}

/** A short human label for a pin ("Card > h3.mn-index-title" -> "h3.mn-index-title"). */
export const lastSegment = (selector: string): string => selector.split('>').pop()?.trim() ?? selector;
