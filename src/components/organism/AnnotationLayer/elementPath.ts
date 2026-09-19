/**
 * Turning a clicked element into something we can find again after a reload (T49).
 * The selector is deliberately short and boring: it stops at the nearest id or `data-component`, skips state classes
 * (`is-*`, `has-*`) and hashed build classes, and falls back to `:nth-of-type` only when it has to.
 */

/** Root class -> library component, for the components that do not carry `data-component` yet (requested of foundation). */
export const COMPONENT_CLASS_HINTS: [string, string][] = [
  ['dt-wrap', 'DataTable'], ['dt', 'DataTable'], ['card', 'Card'], ['btn', 'Button'], ['iconbtn', 'IconButton'],
  ['badge', 'Badge'], ['chip', 'Chip'], ['stat', 'Stat'], ['tab', 'Tabs'], ['modal', 'Modal'], ['drawer', 'Drawer'],
  ['field', 'Field'], ['input', 'Input'], ['select', 'Select'], ['textarea', 'Textarea'], ['toggle', 'Toggle'],
  ['avatar', 'Avatar'], ['progress', 'ProgressBar'], ['placeholder', 'Placeholder'], ['tip', 'Tooltip'],
  ['empty', 'EmptyState'], ['sidebar', 'Sidebar'], ['topbar', 'TopBar'], ['seg', 'SegmentedControl'],
  ['langtoggle', 'LangToggle'], ['roleswitch', 'RoleSwitcher'], ['phoneframe', 'PhoneFrame'], ['insp', 'InspectorPanel'],
  ['toast', 'Toast'], ['device', 'DeviceMockup'], ['funnel-mark', 'FunnelChart'], ['icon', 'Icon'],
];

const STATE = /^(is|has|was)-/;
const stableClasses = (el: Element): string[] => [...el.classList].filter((c) => !STATE.test(c) && !/\d{4,}|^_/.test(c)).slice(0, 2);

const escId = (id: string) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/[^\w-]/g, '\\$&'));

function segment(el: Element): { sel: string; anchor: boolean } {
  const comp = el.getAttribute('data-component');
  if (comp) return { sel: `[data-component="${comp}"]`, anchor: true };
  if (el.id) return { sel: `#${escId(el.id)}`, anchor: true };
  const tag = el.tagName.toLowerCase();
  const classes = stableClasses(el);
  let sel = tag + classes.map((c) => `.${c}`).join('');
  const parent = el.parentElement;
  if (parent) {
    const twins = [...parent.children].filter((c) => c.matches(sel));
    if (twins.length > 1) sel += `:nth-of-type(${[...parent.children].filter((c) => c.tagName === el.tagName).indexOf(el) + 1})`;
  }
  return { sel, anchor: false };
}

/** A selector that finds this element again on the next render of the same page. Never throws. */
export function stableSelector(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  for (let depth = 0; node && depth < 6 && node !== document.body; depth++) {
    const { sel, anchor } = segment(node);
    parts.unshift(sel);
    if (anchor) return parts.join(' > ');
    node = node.parentElement;
  }
  return parts.join(' > ');
}

/** The library component this element belongs to: its own `data-component`, the nearest one above it, or a class hint. */
export function nearestComponent(el: Element): string {
  const withAttr = el.closest('[data-component]');
  if (withAttr) return withAttr.getAttribute('data-component') || withAttr.tagName.toLowerCase();
  let node: Element | null = el;
  for (let depth = 0; node && depth < 6; depth++) {
    for (const [cls, name] of COMPONENT_CLASS_HINTS) if (node.classList.contains(cls)) return name;
    node = node.parentElement;
  }
  return el.tagName.toLowerCase();
}

/** Finds the element a pin is anchored to, or null when the page no longer has it. Bad selectors never throw. */
export function resolveElement(selector: string | null | undefined): Element | null {
  if (!selector) return null;
  try { return document.querySelector(selector); } catch { return null; }
}

/** A short human label for a pin ("Card > h3.mn-index-title" -> "h3.mn-index-title"). */
export const lastSegment = (selector: string): string => selector.split('>').pop()?.trim() ?? selector;

/** Spread onto a NEW component's root so pins name it: `<div {...componentAttr('MyThing')}>`. */
export const componentAttr = (name: string): { 'data-component': string } => ({ 'data-component': name });
