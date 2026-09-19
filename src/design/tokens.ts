/**
 * The single source of truth for every design value in Lead Magnet.
 * src/styles/tokens.css is GENERATED from this file (npm run tokens) and imported once in main.tsx.
 *
 * Brand "Imagine": ink (#141A33 deep navy) + electric (#5B7CFF) with a lime accent (#B8F25B). Light + dark via
 * data-theme on <html>. Prospect pages (L-, C-, B-, R-) override `--lp-*` custom properties on their own root so every
 * landing page and OS demo is themed to the prospect without touching these tokens (see prospectStyle()).
 *
 * 10-foot legibility (P-01): `--scale` steps up at >= 1920 / 2560 / 3840 and every type / spacing token multiplies by it.
 */

export type ThemeName = 'light' | 'dark';

export const brand = {
  label: 'Imagine ink / electric',
  ink900: '#0B0F1F', ink800: '#141A33', ink700: '#1E2647', ink600: '#2B3560',
  electric700: '#3450D6', electric600: '#4A66F0', electric500: '#5B7CFF', electric400: '#7F98FF', electric200: '#C9D4FF', electric100: '#E4EAFF', electric50: '#F2F5FF',
  lime500: '#B8F25B', lime600: '#8FD22E', lime100: '#EEFAD6',
  electricOnDark: '#8FA6FF', electricOnDarkHover: '#A8BAFF',
} as const;

export const neutrals = {
  'n-0': '#FFFFFF', 'n-25': '#FAFBFD', 'n-50': '#F5F7FB', 'n-100': '#EDF0F6', 'n-150': '#E3E7EF', 'n-200': '#D7DCE7', 'n-300': '#C3CAD8',
  'n-400': '#A2ABBF', 'n-500': '#7F899E', 'n-600': '#616B80', 'n-700': '#48506A', 'n-800': '#2F3550', 'n-850': '#1F2438', 'n-900': '#161A2B', 'n-950': '#0E1120', 'n-1000': '#000000',
} as const;

/** Every fg sits at >= 4.5:1 on its own bg and on white (WCAG 2.1 AA for badge-sized text): success 5.9, warn 5.3, danger 5.6, info 5.8. */
export const status = {
  light: { success: '#0F6B3C', successBg: '#E3F6EB', warn: '#9A5200', warnBg: '#FEF3E2', danger: '#B91C1C', dangerBg: '#FDEBEB', info: '#1D4ED8', infoBg: '#E7EEFD' },
  dark: { success: '#5FD68F', successBg: '#12321F', warn: '#F5A94B', warnBg: '#3B2A0E', danger: '#FF7B7B', dangerBg: '#4A1B1B', info: '#7DA0FF', infoBg: '#17245A' },
} as const;

/** Plan / task lifecycle hues (K- module) and page status hues (draft/live/expired). One vocabulary. */
export const lifecycleHues = {
  backlog: { fg: '#616B80', bg: '#EDF0F6' }, doing: { fg: '#1D4ED8', bg: '#E7EEFD' }, done: { fg: '#0F6B3C', bg: '#E3F6EB' }, blocked: { fg: '#B91C1C', bg: '#FDEBEB' }, awaiting_justin: { fg: '#9A5200', bg: '#FEF3E2' },
  draft: { fg: '#616B80', bg: '#EDF0F6' }, live: { fg: '#0F6B3C', bg: '#E3F6EB' }, expired: { fg: '#616B80', bg: '#F5F7FB' },
  built: { fg: '#0F6B3C', bg: '#E3F6EB' }, stub: { fg: '#9A5200', bg: '#FEF3E2' },
} as const;

/** Semantic roles per theme. `{p}` placeholders resolve from brand / neutrals at generation time. */
export const semantic: Record<ThemeName, Record<string, string>> = {
  light: {
    'color-bg': '{n-50}', 'color-surface': '{n-0}', 'color-surface-2': '{n-50}', 'color-surface-3': '{n-100}',
    'color-surface-tint': '{electric50}', 'color-surface-tint-2': '{electric100}', 'color-sidebar': '{n-0}',
    // Text ladder on white: secondary 8.0, muted 6.0, label 5.35, faint 4.9 (>= 4.5:1 also on surface-2; faint is the floor, never lighter).
    'color-text': '{n-900}', 'color-heading': '{ink800}', 'color-text-secondary': '{n-700}', 'color-text-muted': '#5B6579', 'color-label': '{n-600}', 'color-text-faint': '#66708A',
    'color-text-on-primary': '{n-0}', 'color-primary': '{electric600}', 'color-primary-hover': '{electric700}', 'color-primary-soft': '{electric100}', 'color-primary-text': '{electric700}',
    'color-accent': '{lime500}', 'color-accent-text': '{ink800}', 'color-accent-soft': '{lime100}',
    'color-ink': '{ink800}', 'color-ink-text': '{n-0}',
    'color-border': '{n-200}', 'color-border-strong': '{n-300}', 'color-border-subtle': '{n-150}', 'color-border-primary': '{electric500}',
    'color-table-head': '{n-100}', 'color-table-head-text': '{ink800}', 'color-table-zebra': 'rgba(20,26,51,.03)',
    'color-focus': '{electric500}', 'color-scrim': 'rgba(11,15,31,.62)', 'color-placeholder': '{n-300}',
    'shadow-color': '20,26,51',
  },
  dark: {
    'color-bg': '{n-950}', 'color-surface': '{n-900}', 'color-surface-2': '{n-850}', 'color-surface-3': '{n-800}',
    'color-surface-tint': 'rgba(143,166,255,.12)', 'color-surface-tint-2': 'rgba(143,166,255,.20)', 'color-sidebar': '{n-950}',
    // Dark ladder on n-900: secondary 9.6, muted 7.5, label 6.0, faint 5.8 (n-500 was 4.4 on surface-2).
    'color-text': '{n-100}', 'color-heading': '{n-0}', 'color-text-secondary': '#C3CAD8', 'color-text-muted': '#A2ABBF', 'color-label': '#8F98AD', 'color-text-faint': '#8C96AB',
    'color-text-on-primary': '{n-0}', 'color-primary': '{electricOnDark}', 'color-primary-hover': '{electricOnDarkHover}', 'color-primary-soft': 'rgba(143,166,255,.20)', 'color-primary-text': '{electricOnDark}',
    'color-accent': '{lime500}', 'color-accent-text': '{ink900}', 'color-accent-soft': 'rgba(184,242,91,.16)',
    'color-ink': '{n-0}', 'color-ink-text': '{ink900}',
    'color-border': 'rgba(255,255,255,.12)', 'color-border-strong': 'rgba(255,255,255,.26)', 'color-border-subtle': 'rgba(255,255,255,.08)', 'color-border-primary': '{electricOnDark}',
    'color-table-head': '{n-850}', 'color-table-head-text': '{n-0}', 'color-table-zebra': 'rgba(255,255,255,.04)',
    'color-focus': '{lime500}', 'color-scrim': 'rgba(0,0,0,.72)', 'color-placeholder': '{n-700}',
    'shadow-color': '0,0,0',
  },
};

/** Typography. Bricolage Grotesque display + Inter body (@fontsource, bundled, offline). 12 px floor. Every size multiplies by --scale. */
export const type = {
  'font-sans': "'Inter', 'Inter Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  'font-display': "'Bricolage Grotesque', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  'font-mono': "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  'fs-2xs': 'calc(12px * var(--scale))', 'fs-xs': 'calc(12px * var(--scale))', 'fs-sm': 'calc(14px * var(--scale))', 'fs-md': 'calc(16px * var(--scale))', 'fs-lg-2': 'calc(18px * var(--scale))',
  'fs-lg': 'calc(20px * var(--scale))', 'fs-xl-2': 'calc(22px * var(--scale))', 'fs-xl': 'calc(24px * var(--scale))', 'fs-2xl': 'calc(32px * var(--scale))', 'fs-3xl': 'calc(40px * var(--scale))',
  'fs-display': 'clamp(32px, 5vw, calc(64px * var(--scale)))',
  'lh-tight': '1.1', 'lh-title': '1.3', 'lh-base': '1.5',
  'fw-regular': '400', 'fw-medium': '500', 'fw-semibold': '600', 'fw-bold': '700',
  'ls-eyebrow': '0.08em', 'ls-tight': '-0.02em',
} as const;

/** 4-pt grid. Multiplied by --scale on TV bands. */
export const spacing = {
  'sp-0': '0', 'sp-1': 'calc(4px * var(--scale))', 'sp-2': 'calc(8px * var(--scale))', 'sp-3': 'calc(12px * var(--scale))', 'sp-4': 'calc(16px * var(--scale))', 'sp-5': 'calc(20px * var(--scale))',
  'sp-6': 'calc(24px * var(--scale))', 'sp-8': 'calc(32px * var(--scale))', 'sp-10': 'calc(40px * var(--scale))', 'sp-12': 'calc(48px * var(--scale))', 'sp-16': 'calc(64px * var(--scale))', 'sp-20': 'calc(80px * var(--scale))',
} as const;

export const radii = { 'r-xs': '2px', 'r-sm': '4px', 'r-input': '6px', 'r-md': '8px', 'r-card': '12px', 'r-lg': '16px', 'r-xl': '24px', 'r-pill': '999px', 'r-round': '50%', 'r-phone': '44px' } as const;

export const shadows = {
  'shadow-sm': '0 1px 2px rgba(var(--shadow-color),.06)',
  'shadow-md': '0 2px 4px -2px rgba(var(--shadow-color),.08), 0 6px 12px -4px rgba(var(--shadow-color),.10)',
  'shadow-lg': '0 12px 32px -12px rgba(var(--shadow-color),.24), 0 2px 6px rgba(var(--shadow-color),.08)',
  'shadow-xl': '0 28px 72px -24px rgba(var(--shadow-color),.40), 0 4px 12px rgba(var(--shadow-color),.12)',
  'shadow-focus': '0 0 0 3px color-mix(in srgb, var(--color-focus) 40%, transparent)',
} as const;

export const motion = {
  'dur-fast': '120ms', 'dur-base': '200ms', 'dur-slow': '360ms', 'dur-reveal': '900ms',
  'ease-out': 'cubic-bezier(.2,.7,.2,1)', 'ease-in-out': 'cubic-bezier(.65,0,.35,1)', 'ease-spring': 'cubic-bezier(.34,1.4,.64,1)',
} as const;

/** Layout sizes. 44 px rows and 48 px controls are the touch floor (P-03); breakpoints 600 / 900 / 1280. */
export const layoutTokens = {
  'w-phone': '390px', 'w-phone-max': '430px', 'w-content': '1280px', 'w-content-wide': '1680px', 'w-sidebar': '256px', 'w-rail': '72px',
  'h-topbar': 'calc(64px * var(--scale))', 'h-row': 'calc(44px * var(--scale))', 'h-thead': 'calc(48px * var(--scale))', 'h-control': 'calc(48px * var(--scale))', 'h-control-sm': 'calc(44px * var(--scale))', 'h-control-xs': 'calc(32px * var(--scale))',
  'bp-phone': '600px', 'bp-tablet': '900px', 'bp-desktop': '1280px',
  'ring': '3px',
} as const;

export const tokens = { brand, neutrals, status, lifecycleHues, semantic, type, spacing, radii, shadows, motion, layout: layoutTokens };

function vars(obj: Record<string, string>): string { return Object.entries(obj).map(([k, v]) => `  --${k}: ${v};`).join('\n'); }

function resolve(value: string): string {
  return value.replace(/\{(\w[\w-]*)\}/g, (_, key: string) => {
    if (key in brand) return (brand as unknown as Record<string, string>)[key];
    if (key in neutrals) return (neutrals as Record<string, string>)[key];
    throw new Error(`unknown token placeholder {${key}}`);
  });
}

function themeBlock(theme: ThemeName): string {
  const sem = Object.fromEntries(Object.entries(semantic[theme]).map(([k, v]) => [k, resolve(v)]));
  const st = status[theme];
  const stVars = { 'color-success': st.success, 'color-success-bg': st.successBg, 'color-warn': st.warn, 'color-warn-bg': st.warnBg, 'color-danger': st.danger, 'color-danger-bg': st.dangerBg, 'color-info': st.info, 'color-info-bg': st.infoBg };
  return `${vars(sem)}\n${vars(stVars)}\n  color-scheme: ${theme};`;
}

/** Builds the full tokens stylesheet: static scales on :root, --scale bands, light block, dark block. */
export function buildTokensCss(): string {
  const ramp = vars({ 'ink-900': brand.ink900, 'ink-800': brand.ink800, 'ink-700': brand.ink700, 'ink-600': brand.ink600, 'electric-700': brand.electric700, 'electric-600': brand.electric600, 'electric-500': brand.electric500, 'electric-400': brand.electric400, 'electric-200': brand.electric200, 'electric-100': brand.electric100, 'electric-50': brand.electric50, 'lime-500': brand.lime500, 'lime-600': brand.lime600, 'lime-100': brand.lime100 });
  const hues = Object.entries(lifecycleHues).flatMap(([k, h]) => [[`status-${k}-fg`, h.fg], [`status-${k}-bg`, h.bg]]);
  let css = `/* GENERATED from src/design/tokens.ts by scripts/gen-tokens.mjs - do not edit by hand */\n:root {\n  --scale: 1;\n${ramp}\n${vars(neutrals)}\n${vars(type)}\n${vars(spacing)}\n${vars(radii)}\n${vars(motion)}\n${vars(layoutTokens)}\n${vars(Object.fromEntries(hues))}\n${vars(shadows)}\n}\n`;
  css += `/* 10-foot bands (P-01): type and spacing scale up per width band, never per page. */\n@media (min-width: 1920px) { :root { --scale: 1.125; } }\n@media (min-width: 2560px) { :root { --scale: 1.5; } }\n@media (min-width: 3840px) { :root { --scale: 2.25; } }\n`;
  css += `:root, :root[data-theme="light"] {\n${themeBlock('light')}\n}\n`;
  css += `:root[data-theme="dark"] {\n${themeBlock('dark')}\n}\n`;
  return css;
}

/** Prospect palette -> CSS custom properties for a landing page / demo root. Pages spread this into `style`. */
export interface ProspectPalette { primary: string; accent: string; bg: string; surface: string; text: string }
/** WCAG relative luminance of a #rgb / #rrggbb colour (0..1). Non-hex input counts as mid grey so nothing throws. */
export function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  const ch = (i: number) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}
/** WCAG contrast ratio between two colours (1..21). */
export function contrastRatio(a: string, b: string): number { const la = luminance(a); const lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
/** The readable text colour on `bg`: white when it clears 4.5:1, otherwise `dark` (the prospect's text colour or our ink). Prospect palettes are theirs, so the text on their buttons is computed, never assumed. */
export function readableOn(bg: string, dark: string = brand.ink800): string { return contrastRatio('#FFFFFF', bg) >= 4.5 || contrastRatio('#FFFFFF', bg) >= contrastRatio(dark, bg) ? '#FFFFFF' : dark; }

export function prospectStyle(p: ProspectPalette, font: 'display' | 'humanist' | 'serif' | 'mono' = 'display'): Record<string, string> {
  const fonts = { display: type['font-display'], humanist: type['font-sans'], serif: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif", mono: type['font-mono'] };
  return {
    '--lp-primary': p.primary, '--lp-accent': p.accent, '--lp-bg': p.bg, '--lp-surface': p.surface, '--lp-text': p.text,
    '--lp-on-primary': readableOn(p.primary, p.text), '--lp-on-accent': readableOn(p.accent, p.text),
    '--lp-font-display': fonts[font], '--lp-font-body': font === 'mono' ? fonts.mono : type['font-sans'],
  };
}
