import './Avatar.css';
export interface AvatarProps { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg'; color?: string }
/** Initials disc or image. `color` accepts a prospect palette colour. */
export function Avatar({ name, src, size = 'md', color }: AvatarProps) {
  const initials = name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return src ? <img className={`avatar avatar-${size}`} src={src} alt={name} /> : <span className={`avatar avatar-${size}`} role="img" aria-label={name} style={color ? { background: color, color: '#fff' } : undefined}>{initials}</span>;
}
