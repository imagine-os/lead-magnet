import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VoiceLang } from './voice';

/** Minimal Web Speech API surface (not in lib.dom yet); feature-detected at runtime, never assumed. */
interface RecognitionResultLike { isFinal: boolean; 0: { transcript: string; confidence: number } }
interface RecognitionEventLike { resultIndex: number; results: ArrayLike<RecognitionResultLike> }
interface RecognitionLike {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: RecognitionEventLike) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; onstart: (() => void) | null;
}
type RecognitionCtor = new () => RecognitionLike;
const ctor = (): RecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};
export const voiceSupported = (): boolean => ctor() != null;
const BCP47: Record<VoiceLang, string> = { en: 'en-US', es: 'es-US' };

export type VoiceState = 'idle' | 'listening' | 'unsupported' | 'denied';
export interface VoiceOptions {
  lang: VoiceLang;
  /** Interim results arrive with `final = false`; the utterance ends with one `final = true` call. */
  onResult: (transcript: string, final: boolean) => void;
  onError?: (code: string) => void;
}
export interface VoiceControls {
  state: VoiceState; supported: boolean;
  /** Starts listening. Must be called from a user gesture: returns false (and does nothing) when unsupported, denied, already listening, or when the browser reports no transient user activation. */
  start: () => boolean;
  stop: () => void;
  /** Last transcript heard (interim or final). */
  transcript: string;
  error: string | null;
}

/**
 * `useVoice` wraps the Web Speech API for the command palette (T46, P-04). Feature-detected (`SpeechRecognition` /
 * `webkitSpeechRecognition`); `start()` only runs inside a user gesture (`navigator.userActivation.isActive` when the
 * browser exposes it) and NOTHING here starts listening on mount or on state change: the microphone is the person's
 * decision every time. One utterance per start (`continuous = false`), interim results on, language from the i18n provider.
 */
export function useVoice({ lang, onResult, onError }: VoiceOptions): VoiceControls {
  const supported = useMemo(voiceSupported, []);
  const [state, setState] = useState<VoiceState>(supported ? 'idle' : 'unsupported');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<RecognitionLike | null>(null);
  const cb = useRef({ onResult, onError }); cb.current = { onResult, onError };

  useEffect(() => () => { rec.current?.abort(); rec.current = null; }, []);

  const start = useCallback((): boolean => {
    const C = ctor(); if (!C || state === 'listening' || state === 'denied') return false;
    const activation = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
    if (activation && !activation.isActive) return false; // never auto-listen: no gesture, no microphone
    rec.current?.abort();
    const r = new C(); rec.current = r;
    r.lang = BCP47[lang]; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    r.onstart = () => { setError(null); setTranscript(''); setState('listening'); };
    r.onresult = (e) => {
      let text = ''; let final = false;
      for (let i = e.resultIndex; i < e.results.length; i++) { text += e.results[i][0].transcript; if (e.results[i].isFinal) final = true; }
      text = text.trim(); setTranscript(text); cb.current.onResult(text, final);
    };
    r.onerror = (e) => { const denied = e.error === 'not-allowed' || e.error === 'service-not-allowed'; setError(e.error); setState(denied ? 'denied' : 'idle'); cb.current.onError?.(e.error); };
    r.onend = () => { setState((s) => (s === 'denied' ? s : 'idle')); rec.current = null; };
    try { r.start(); return true; } catch (e) { setError(String((e as Error).message ?? e)); setState('idle'); return false; }
  }, [lang, state]);

  const stop = useCallback(() => { rec.current?.stop(); }, []);
  return useMemo(() => ({ state, supported, start, stop, transcript, error }), [state, supported, start, stop, transcript, error]);
}
