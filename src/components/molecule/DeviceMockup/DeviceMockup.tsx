import type { CSSProperties, ReactNode } from 'react';
import './DeviceMockup.css';
export type DeviceKind = 'phone' | 'laptop' | 'tv';
export interface DeviceMockupProps { kind: DeviceKind; children?: ReactNode; src?: string; imageSrc?: string; title: string; className?: string; style?: CSSProperties }
/** CSS-only phone / laptop / TV frames for landing pages and the hub. Slot children, a same-origin iframe `src`, or an `imageSrc` (generated asset). */
export function DeviceMockup({ kind, children, src, imageSrc, title, className = '', style }: DeviceMockupProps) {
  const screen = imageSrc ? <img src={imageSrc} alt={title} className="device-img" /> : src ? <iframe src={src} title={title} className="device-iframe" loading="lazy" /> : children;
  return (<div className={`device device-${kind} ${className}`} role="group" aria-label={title} style={style}>
    {kind === 'phone' && <span className="device-notch" aria-hidden />}
    <div className="device-screen">{screen}</div>
    {kind === 'laptop' && <span className="device-base" aria-hidden />}
    {kind === 'tv' && <span className="device-stand" aria-hidden />}
  </div>);
}
