import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useToast } from '../../molecule/Toast/Toast';
import { Button, type ButtonProps } from '../Button/Button';
import './Placeholder.css';

export interface PlaceholderProps { /** What it will do, e.g. "publish this page to a live URL" */ will: string; /** Module / task that builds the real thing */ by?: string; children?: ReactNode; /** Render as a Button with these props when no children are given */ button?: ButtonProps & { label: string }; block?: boolean }
/**
 * P-09: any control that does not work yet. Tooltip on hover AND focus ("Not wired yet: <will>"), toast on activation,
 * dashed outline + badge always visible in devMode, data-placeholder attribute so D-01 / QA can count them.
 * Wrap any element: its onClick is replaced by the toast. Or pass `button` to render a Button.
 */
export function Placeholder({ will, by, children, button, block }: PlaceholderProps) {
  const { devMode } = useSession();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const tipId = useId();
  const text = `Not wired yet: ${will}${by ? ` (${by})` : ''}`;
  const fire = () => toast.push({ tone: 'info', title: 'Not wired yet', body: `${will}${by ? ` · ${by}` : ''}` });
  const handlers = { onMouseEnter: () => setShow(true), onMouseLeave: () => setShow(false), onFocus: () => setShow(true), onBlur: () => setShow(false), 'aria-describedby': tipId };
  const inner = children && isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, { ...handlers, onClick: (e: Event) => { e.preventDefault?.(); fire(); }, 'data-placeholder': will })
    : (() => { const { label, ...btn } = button ?? { label: will }; return <Button {...btn} {...handlers} onClick={fire} data-placeholder={will}>{label}</Button>; })();
  return (<span className={`placeholder ${devMode ? 'is-dev' : ''} ${block ? 'is-block' : ''}`} data-placeholder-wrap>
    {inner}
    {devMode && <span className="placeholder-badge" aria-hidden>not wired</span>}
    <span role="tooltip" id={tipId} className={`placeholder-tip ${show ? 'is-show' : ''}`}>{text}</span>
  </span>);
}
