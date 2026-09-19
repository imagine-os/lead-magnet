import './SpecChip.css';
export interface SpecChipProps { code: string; name: string; completeness: number; onClick?: () => void }
/** Floating chip in dev mode: code, name, spec completeness. Click opens the inspector (Ctrl+.). */
export function SpecChip({ code, name, completeness, onClick }: SpecChipProps) {
  return <button type="button" data-component="SpecChip" className="specchip" onClick={onClick} title="Open the spec inspector (Ctrl+.)"><code>{code}</code><span className="specchip-name">{name}</span><span className={`specchip-pct ${completeness >= 80 ? 'is-good' : completeness >= 50 ? 'is-mid' : 'is-low'}`}>{completeness}%</span></button>;
}
