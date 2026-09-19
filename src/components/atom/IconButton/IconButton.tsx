import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './IconButton.css';
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; label: string; variant?: 'ghost' | 'outline' | 'primary'; size?: 'sm' | 'md' }
/** Square icon-only button with a mandatory accessible label (also the tooltip). 44 / 48 px. */
export function IconButton({ icon, label, variant = 'ghost', size = 'md', className = '', type = 'button', ...rest }: IconButtonProps) {
  return <button type={type} data-component="IconButton" className={`iconbtn iconbtn-${variant} iconbtn-${size} ${className}`} aria-label={label} title={label} {...rest}><Icon name={icon} size={size === 'sm' ? 18 : 20} /></button>;
}
