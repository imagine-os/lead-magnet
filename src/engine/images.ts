import type { Prospect } from './types';
import type { AssetRow } from '../data/schema/core';
import { industry } from './catalog/industries';

export type ImagePrompt = Pick<AssetRow, 'kind' | 'prompt'> & { aspect: string; notes: string };
/** Asset prompts for the image generator (provider not wired yet, T40). Every prompt carries the palette, motifs and the prospect's world. */
export function imagePrompts(p: Prospect): ImagePrompt[] {
  const ind = industry(p.industry);
  const pal = p.style.palette;
  const style = `${p.style.tone} tone, palette primary ${pal.primary} accent ${pal.accent} background ${pal.bg}, ${p.style.imagery.join(', ')}, photoreal, soft depth of field, no text, no logos`;
  const world = `${p.business_name}, a ${ind.label.en.toLowerCase()} in ${p.city}`;
  const ui = `a clean operations dashboard UI themed in ${pal.primary} with ${pal.accent} accents showing ${ind.kpis.map((k) => k.label.en).join(', ')}`;
  return [
    { kind: 'hero', aspect: '16:9', prompt: `Cinematic hero image for ${world}: ${ind.motifs[0]}, ${style}`, notes: 'Behind the reveal headline; darkened 30% for contrast' },
    { kind: 'device_phone', aspect: '9:19.5', prompt: `Phone screen mockup of ${ui}, mobile layout, role: ${p.business_roles[0] ?? 'owner'}, ${style}`, notes: 'Slotted into DeviceMockup phone; CSS frame' },
    { kind: 'device_laptop', aspect: '16:10', prompt: `Laptop screen mockup of ${ui}, desktop layout with sidebar, ${style}`, notes: 'DeviceMockup laptop' },
    { kind: 'device_tv', aspect: '16:9', prompt: `Wall-mounted TV in the ${ind.motifs[1] ?? 'back office'} of ${world} showing ${ui} at 10-foot legibility, ${style}`, notes: 'DeviceMockup tv' },
    ...[...p.business_roles.slice(0, 3), ...p.life_roles.slice(0, 2)].map((r) => ({ kind: 'role_card' as const, aspect: '4:5', prompt: `Portrait-orientation card for the "${r}" role at ${world}: ${r} in their environment glancing at a phone, ${style}`, notes: `RoleViews card for ${r}` })),
    { kind: 'og_image', aspect: '1.91:1', prompt: `Social preview: ${p.business_name} wordmark space left, phone + laptop mockups right, ${style}`, notes: 'Open Graph; leave the left third empty for the title overlay' },
    { kind: 'video_frames', aspect: '16:9', prompt: `48-frame sequence: the ${ind.motifs[0]} slowly morphs into ${ui} on a phone, laptop and TV, camera pushes in, ${style}`, notes: 'Video-on-scroll frame sequence (T41), 48 JPEGs' },
  ];
}
