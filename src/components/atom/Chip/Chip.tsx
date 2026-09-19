import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './Chip.css';
export interface ChipProps { children?: ReactNode; selected?: boolean; onClick?: () => void; onRemove?: () => void; removeLabel?: string; className?: string }
/** Filter / tag chip. Clickable chips are buttons with aria-pressed; removable chips carry a labelled remove button. */
export function Chip({ children, selected, onClick, onRemove, removeLabel = 'Remove', className = '' }: ChipProps) {
  const inner = <>{children}{onRemove && <button type="button" className="chip-x" aria-label={removeLabel} onClick={(e) => { e.stopPropagation(); onRemove(); }}><Icon name="close" size={14} /></button>}</>;
  if (onClick) return <button type="button" data-component="Chip" className={`chip ${selected ? 'is-selected' : ''} ${className}`} aria-pressed={selected} onClick={onClick}>{inner}</button>;
  return <span data-component="Chip" className={`chip ${selected ? 'is-selected' : ''} ${className}`}>{inner}</span>;
}
