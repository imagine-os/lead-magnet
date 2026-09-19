import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { componentAttr } from '../../../design/meta';
import './Button.css';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonTone = 'default' | 'prospect';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; size?: ButtonSize; icon?: IconName; iconRight?: IconName; loading?: boolean; block?: boolean; children?: ReactNode; /** `prospect` colours every variant from the page's --lp-* properties (set by prospectStyle()), falling back to the --color-* tokens. */ tone?: ButtonTone }
/** The one button. Heights 44 / 48 / 56 (never under the 44 px touch floor). `accent` = lime CTA on landing pages. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', size = 'md', icon, iconRight, loading = false, block = false, className = '', children, disabled, type = 'button', tone = 'default', ...rest }, ref) {
  return (<button ref={ref} type={type} {...componentAttr('Button')} className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${loading ? 'is-loading' : ''} ${tone === 'prospect' ? 'btn-prospect' : ''} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
    {loading ? <span className="btn-spinner" aria-hidden /> : icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
    {children && <span className="btn-label">{children}</span>}
    {iconRight && !loading && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
  </button>);
});
