import { cloneElement, isValidElement, useId, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useToast } from '../../molecule/Toast/Toast';
import { componentAttr } from '../../../design/meta';
import { Button, type ButtonProps } from '../Button/Button';
import './Placeholder.css';

export interface PlaceholderProps { /** What it will do, e.g. "publish this page to a live URL" */ will: string; /** Module / task that builds the real thing */ by?: string; children?: ReactNode; /** Render as a Button with these props when no children are given */ button?: ButtonProps & { label: string }; block?: boolean }
/**
 * P-09: any control that does not work yet. Tooltip on hover AND focus ("Not wired yet: <will>"), toast on activation,
 * dashed outline + badge always visible in devMode, data-placeholder attribute so D-01 / QA can count them.
 * Wrap any element: its onClick is replaced by the toast. A `Link` / `<a>` child stays a focusable link (href intact for
 * the tooltip and the a11y tree) but activation is cancelled before navigation. Or pass `button` to render a Button.
 */
export function Placeholder({ will, by, children, button, block }: PlaceholderProps) {
  const { devMode } = useSession();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const tipId = useId();
  const text = `Not wired yet: ${will}${by ? ` (${by})` : ''}`;
  const fire = () => toast.push({ tone: 'info', title: 'Not wired yet', body: `${will}${by ? ` · ${by}` : ''}` });
  const handlers = { onMouseEnter: () => setShow(true), onMouseLeave: () => setShow(false), onFocus: () => setShow(true), onBlur: () => setShow(false), 'aria-describedby': tipId };
  const el = isValidElement(children) ? (children as ReactElement<Record<string, unknown>>) : null;
  const isLink = !!el && ('to' in el.props || 'href' in el.props);
  const inner = el
    ? cloneElement(el, {
      ...handlers,
      // A router Link only navigates when the event is not defaultPrevented; stopPropagation keeps a wrapping row link or card from firing too.
      onClick: (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); fire(); },
      onKeyDown: isLink ? (e: React.KeyboardEvent) => { if (e.key === ' ') { e.preventDefault(); fire(); } } : el.props.onKeyDown,
      'data-placeholder': will,
      ...(isLink ? { role: el.props.role ?? 'link', 'aria-disabled': undefined } : {}),
    })
    : (() => { const { label, ...btn } = button ?? { label: will }; return <Button {...btn} {...handlers} onClick={fire} data-placeholder={will}>{label}</Button>; })();
  return (<span {...componentAttr('Placeholder')} className={`placeholder ${devMode ? 'is-dev' : ''} ${block ? 'is-block' : ''} ${isLink ? 'is-link' : ''}`} data-placeholder-wrap>
    {inner}
    {devMode && <span className="placeholder-badge" aria-hidden>not wired</span>}
    <span role="tooltip" id={tipId} className={`placeholder-tip ${show ? 'is-show' : ''}`}>{text}</span>
  </span>);
}
