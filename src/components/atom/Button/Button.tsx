import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './Button.css';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; size?: ButtonSize; icon?: IconName; iconRight?: IconName; loading?: boolean; block?: boolean; children?: ReactNode }
/** The one button. Heights 44 / 48 / 56 (never under the 44 px touch floor). `accent` = lime CTA on landing pages. */
export function Button({ variant = 'primary', size = 'md', icon, iconRight, loading = false, block = false, className = '', children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (<button type={type} data-component="Button" className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${loading ? 'is-loading' : ''} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
    {loading ? <span className="btn-spinner" aria-hidden /> : icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
    {children && <span className="btn-label">{children}</span>}
    {iconRight && !loading && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
  </button>);
}
