import { useI18n } from '../../../i18n/I18nProvider';
import './LangToggle.css';
export interface LangToggleProps { size?: 'sm' | 'md'; /** One 44 px button showing the language it switches TO (phone chrome); default is the EN | ES group. */ compact?: boolean }
/** EN / ES toggle (role=group with aria-pressed buttons). Present from the start on every surface (P-13). */
export function LangToggle({ size = 'md', compact = false }: LangToggleProps) {
  const { lang, setLang } = useI18n();
  if (compact) {
    const other = lang === 'en' ? 'es' : 'en';
    // The label is written in the language it switches to, as language switchers should be.
    return <button type="button" data-component="LangToggle" className={`langtoggle langtoggle-compact langtoggle-${size}`} lang={other} aria-label={other === 'es' ? 'Cambiar a español' : 'Switch to English'} title={other === 'es' ? 'Español' : 'English'} onClick={() => setLang(other)}>{other.toUpperCase()}</button>;
  }
  return (<div data-component="LangToggle" className={`langtoggle langtoggle-${size}`} role="group" aria-label="Language">
    {(['en', 'es'] as const).map((l) => <button key={l} type="button" aria-pressed={lang === l} className={`langtoggle-btn ${lang === l ? 'is-active' : ''}`} onClick={() => setLang(l)} lang={l}>{l.toUpperCase()}</button>)}
  </div>);
}
