import { useEffect, useRef, useState } from 'react';

type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

export default function useSpeech() {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    const updateVoices = () => setVoices(synth.getVoices() || []);

    // Initial populate + event
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);

    return () => {
      synth.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  const getPreferredVoice = (preferredLang?: string) => {
    const all = voices.length ? voices : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
    if (!all || all.length === 0) return undefined;

    // If a preferredLang provided, prefer voices that start with that lang code
    if (preferredLang) {
      const exact = all.find(v => v.lang && v.lang.toLowerCase().startsWith(preferredLang.toLowerCase()));
      if (exact) return exact;
    }

    // Prefer English voices (macOS has good English voices)
    const prefer = ['en-US', 'en-GB', 'en'];
    for (const p of prefer) {
      const v = all.find(voice => voice.lang && voice.lang.toLowerCase().startsWith(p.toLowerCase()));
      if (v) return v;
    }

    // Otherwise any English-like voice
    const en = all.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (en) return en;

    // Fallback to first voice
    return all[0];
  };

  const cancel = () => {
    try {
      if (utterRef.current) {
        utterRef.current.onend = null;
        utterRef.current.onerror = null;
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    utterRef.current = null;
    setSpeaking(false);
  };

  const speak = (text: string, opts: SpeakOptions = {}) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text || text.trim().length === 0) return;

    cancel(); // stop any previous utterance

    const u = new SpeechSynthesisUtterance(text);
    utterRef.current = u;

    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    u.volume = opts.volume ?? 1;
    if (opts.lang) u.lang = opts.lang;

    // choose voice: prefer the requested lang, otherwise prefer English voices
    const voice = getPreferredVoice(opts.lang);
    if (voice) u.voice = voice;

    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      utterRef.current = null;
    };
    u.onerror = () => {
      setSpeaking(false);
      utterRef.current = null;
    };

    try {
      window.speechSynthesis.speak(u);
    } catch {
      // Some environments may throw if called too quickly
      setSpeaking(false);
      utterRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { speak, cancel, speaking, voices } as const;
}
