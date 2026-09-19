import { readableOn } from '../../../design/tokens';
import './Avatar.css';
export interface AvatarProps { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg'; color?: string }
/** Initials disc or image. `color` accepts a prospect palette colour; the initials pick white or ink by contrast (>= 4.5:1). */
export function Avatar({ name, src, size = 'md', color }: AvatarProps) {
  const initials = name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return src ? <img data-component="Avatar" className={`avatar avatar-${size}`} src={src} alt={name} /> : <span data-component="Avatar" className={`avatar avatar-${size}`} role="img" aria-label={name} style={color ? { background: color, color: readableOn(color) } : undefined}>{initials}</span>;
}
