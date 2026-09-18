import type { ReactNode } from 'react';
import './PhoneFrame.css';
export interface PhoneFrameProps { children?: ReactNode; src?: string; width?: number; height?: number; title?: string; scale?: number }
/** Decorative 390 x 844 phone frame for hub previews; either children or a same-origin iframe src, scaled. */
export function PhoneFrame({ children, src, width = 390, height = 844, title = 'Phone preview', scale = 1 }: PhoneFrameProps) {
  return (<div className="phoneframe-wrap" style={{ width: width * scale + 24, height: height * scale + 24 }}>
    <div className="phoneframe" style={{ width: width + 24, height: height + 24, transform: `scale(${scale})` }} role="group" aria-label={title}><div className="phoneframe-notch" aria-hidden /><div className="phoneframe-screen" style={{ width, height }}>{src ? <iframe src={src} title={title} className="phoneframe-iframe" loading="lazy" /> : children}</div></div>
  </div>);
}
