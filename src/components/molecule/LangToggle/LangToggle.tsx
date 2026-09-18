import { useI18n } from '../../../i18n/I18nProvider';
import './LangToggle.css';
/** EN / ES toggle (role=group with aria-pressed buttons). Present from the start on every surface (P-13). */
export function LangToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { lang, setLang } = useI18n();
  return (<div className={`langtoggle langtoggle-${size}`} role="group" aria-label="Language">
    {(['en', 'es'] as const).map((l) => <button key={l} type="button" aria-pressed={lang === l} className={`langtoggle-btn ${lang === l ? 'is-active' : ''}`} onClick={() => setLang(l)} lang={l}>{l.toUpperCase()}</button>)}
  </div>);
}
