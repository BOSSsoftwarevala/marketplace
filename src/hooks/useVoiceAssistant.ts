import { useCallback, useEffect, useRef, useState } from 'react';

type Lang = { code: string; label: string };

export const VOICE_LANGS: Lang[] = [
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'pt-BR', label: 'Português' },
];

type Options = {
  onTranscript?: (text: string, isFinal: boolean) => void;
};

/**
 * Realtime voice I/O via the browser's Web Speech API.
 * - Continuous, interim-result speech recognition
 * - Speech synthesis with interrupt handling (any new utterance cancels prior)
 * - Auto-cancels TTS when user starts speaking (barge-in)
 */
export function useVoiceAssistant(opts: Options = {}) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lang, setLang] = useState<string>('en-US');
  const [transcript, setTranscript] = useState('');
  const recogRef = useRef<any>(null);
  const restartRef = useRef(false);
  const onTranscriptRef = useRef(opts.onTranscript);
  onTranscriptRef.current = opts.onTranscript;

  // init recognition
  useEffect(() => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || typeof window.speechSynthesis === 'undefined') {
      setSupported(false);
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;
    r.onresult = (e: any) => {
      let interim = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      const text = (finalText || interim).trim();
      setTranscript(text);
      // barge-in: cancel TTS as soon as user speaks
      if (text && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
      onTranscriptRef.current?.(text, Boolean(finalText));
    };
    r.onend = () => {
      setListening(false);
      if (restartRef.current) {
        try { r.start(); setListening(true); } catch {}
      }
    };
    r.onerror = () => setListening(false);
    recogRef.current = r;
    return () => {
      try { r.stop(); } catch {}
      window.speechSynthesis.cancel();
    };
  }, []);

  // update language live
  useEffect(() => {
    if (recogRef.current) recogRef.current.lang = lang;
  }, [lang]);

  const start = useCallback(() => {
    if (!recogRef.current) return;
    restartRef.current = true;
    try { recogRef.current.start(); setListening(true); } catch {}
  }, []);

  const stop = useCallback(() => {
    restartRef.current = false;
    try { recogRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || muted || !text) return;
      // interrupt prior speech
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 1;
      u.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === lang) || voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
      if (match) u.voice = match;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [lang, muted, supported]
  );

  const toggleListening = useCallback(() => {
    if (!enabled) {
      setEnabled(true);
      start();
    } else {
      setEnabled(false);
      stop();
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [enabled, start, stop]);

  return {
    supported,
    enabled,
    listening,
    speaking,
    muted,
    setMuted,
    lang,
    setLang,
    transcript,
    speak,
    toggleListening,
    stop,
    langs: VOICE_LANGS,
  };
}