// src/context/SpeechProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type SpeakOptions = { lang?: string; rate?: number; pitch?: number; volume?: number; };
type SelectionLog = { voice?: SpeechSynthesisVoice | null; reason: string; timestamp: number; };
const STORAGE_KEY = 'speech.selectedVoiceURI';

function isEnglishVoice(v: SpeechSynthesisVoice) {
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  if (lang.startsWith('en')) return true;
  // infer English from name tokens if lang missing
  return ['english','en-us','en-gb','alex','samantha','daniel','siri'].some(t => name.includes(t));
}

function scoreVoice(v: SpeechSynthesisVoice, preferredLang?: string) {
  let score = 0;
  const name = (v.name || '').toLowerCase();
  const uri = (v.voiceURI || '').toLowerCase();
  const lang = (v.lang || '').toLowerCase();
  if (preferredLang && lang.startsWith(preferredLang.toLowerCase())) score += 120;
  if (!preferredLang && lang.startsWith('en')) score += 60;
  if (uri.includes('com.apple') || name.includes('apple')) score += 50;
  if (name.includes('neural') || name.includes('enhanced') || name.includes('premium')) score += 80;
  if (['alex','samantha','siri','daniel'].some(n => name.includes(n))) score += 70;
  // @ts-ignore
  if ((v as any).default) score += 10;
  return score;
}

type SpeechState = {
  voices: SpeechSynthesisVoice[];
  englishVoices: SpeechSynthesisVoice[];
  speaking: boolean;
  selectedVoiceURI: string | null;
  lastSelection: SelectionLog | null;
  setSelectedVoice: (uri: string | null) => void;
  speak: (text: string, opts?: SpeakOptions) => void;
  cancel: () => void;
};

const SpeechContext = createContext<SpeechState | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => {
    try { return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null; } catch { return null; }
  });
  const [lastSelection, setLastSelection] = useState<SelectionLog | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const update = () => {
      const v = synth.getVoices() || [];
      setVoices(v);
    };
    update();
    synth.addEventListener('voiceschanged', update);
    return () => synth.removeEventListener('voiceschanged', update);
  }, []);

  const getVoiceByURI = (uri?: string) => {
    if (!uri) return undefined;
    return voices.find(v => (v.voiceURI || '').toLowerCase() === uri.toLowerCase() || (v.name || '').toLowerCase() === uri.toLowerCase());
  };

  const chooseVoice = (preferredLang?: string) => {
    // honor user override if present and english-like
    if (selectedVoiceURI) {
      const user = getVoiceByURI(selectedVoiceURI);
      if (user && isEnglishVoice(user)) {
        const log = { voice: user, reason: 'user-selected', timestamp: Date.now() };
        setLastSelection(log);
        console.info('[SpeechProvider] using user-selected voice', user.name);
        return user;
      }
      // invalid stored selection
      try { localStorage.removeItem(STORAGE_KEY); } catch {} 
      setSelectedVoiceURI(null);
    }

    const all = voices.length ? voices : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
    if (!all || all.length === 0) return undefined;

    // filter to English-like voices, but if none, fallback to all to keep working
    const englishAll = all.filter(isEnglishVoice);
    const candidates = englishAll.length ? englishAll : all;

    // if requested, restrict more strictly to preferredLang
    let shortlist = candidates;
    if (preferredLang) {
      const pref = preferredLang.toLowerCase();
      const matched = candidates.filter(v => (v.lang || '').toLowerCase().startsWith(pref));
      if (matched.length) shortlist = matched;
    }

    // compute scores and pick top
    const scored = shortlist.map(v => ({ v, score: scoreVoice(v, preferredLang) }));
    scored.sort((a,b) => b.score - a.score);
    console.info('[SpeechProvider] voice candidates scored:', scored.map(s => ({name: s.v.name, lang: s.v.lang, score: s.score})));
    const best = scored[0]?.v;
    const reason = `auto-select (${preferredLang ?? 'en-prefer'}) best=${scored[0]?.score ?? 0}`;
    setLastSelection({ voice: best || null, reason, timestamp: Date.now() });
    console.info('[SpeechProvider] selected voice:', best?.name, best?.lang, reason);
    return best;
  };

  const setSelectedVoice = (uri: string | null) => {
    if (uri) {
      const v = getVoiceByURI(uri);
      if (!v || !isEnglishVoice(v)) {
        console.warn('[SpeechProvider] attempted to set non-English voice - ignored', uri);
        return;
      }
    }
    setSelectedVoiceURI(uri);
    try { if (uri) localStorage.setItem(STORAGE_KEY, uri); else localStorage.removeItem(STORAGE_KEY); } catch {}
    // update selection log immediately
    const chosen = uri ? getVoiceByURI(uri) : chooseVoice();
    setLastSelection({ voice: chosen || null, reason: uri ? 'user-selected' : 'auto', timestamp: Date.now() });
  };

  const cancel = () => {
    try {
      if (utterRef.current) {
        utterRef.current.onend = null;
        utterRef.current.onerror = null;
      }
    } catch {}
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    utterRef.current = null;
    setSpeaking(false);
  };

  const speak = (text: string, opts: SpeakOptions = {}) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text || !text.trim()) return;
    cancel();
    const u = new SpeechSynthesisUtterance(text);
    utterRef.current = u;
    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    u.volume = opts.volume ?? 1;
    if (opts.lang) u.lang = opts.lang;

    const v = selectedVoiceURI ? getVoiceByURI(selectedVoiceURI) : chooseVoice(opts.lang);
    if (v) u.voice = v;

    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); utterRef.current = null; };
    u.onerror = () => { setSpeaking(false); utterRef.current = null; };
    try {
      window.speechSynthesis.speak(u);
      console.info('[SpeechProvider] speaking with voice:', u.voice?.name, u.voice?.lang, 'rate:', u.rate);
    } catch (err) {
      console.warn('[SpeechProvider] speak error', err);
      setSpeaking(false);
      utterRef.current = null;
    }
  };

  // when voices array changes we compute the auto-selection once
  useEffect(() => {
    if (!voices || voices.length === 0) return;
    const best = chooseVoice();
    if (best) {
      setLastSelection({ voice: best, reason: 'auto-initial-select', timestamp: Date.now() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices]);

  const englishVoices = voices.filter(isEnglishVoice);

  const value: SpeechState = {
    voices,
    englishVoices,
    speaking,
    selectedVoiceURI,
    lastSelection,
    setSelectedVoice,
    speak,
    cancel,
  };

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
};

export function useSpeechContext() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeechContext must be used inside SpeechProvider');
  return ctx;
}
