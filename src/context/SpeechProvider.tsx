import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type SpeakOptions = { lang?: string; rate?: number; pitch?: number; volume?: number; };
type SelectionLog = { voice?: SpeechSynthesisVoice | null; reason: string; timestamp: number; };
const STORAGE_KEY = 'speech.selectedVoiceURI';
const SERIOUS_ONLY_KEY = 'speech.seriousOnly';

function isEnglishVoiceCandidate(v: SpeechSynthesisVoice) {
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  if (lang.startsWith('en')) return true;
  // Some environments omit lang, infer from name tokens
  return ['english','en-us','en-gb','alex','samantha','daniel','siri'].some(t => name.includes(t));
}

// WHITELIST: only keep voices containing these tokens (case-insensitive)
const WHITELIST_TOKENS = [
  'google us english',
  'google uk english',
  'samantha',
  'daniel',
  'karen',
];

function isWhitelistedVoice(v: SpeechSynthesisVoice) {
  const name = (v.name || '').toLowerCase();
  const uri = (v.voiceURI || '').toLowerCase();
  return WHITELIST_TOKENS.some(token => name.includes(token) || uri.includes(token));
}

function isSeriousEnglishVoice(v: SpeechSynthesisVoice) {
  // English-like and on the explicit whitelist
  return isEnglishVoiceCandidate(v) && isWhitelistedVoice(v);
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
  englishVoices: SpeechSynthesisVoice[];    // all English-like (unfiltered)
  seriousVoices: SpeechSynthesisVoice[];     // english & whitelisted
  speaking: boolean;
  selectedVoiceURI: string | null;
  seriousOnly: boolean;
  setSeriousOnly: (on: boolean) => void;
  lastSelection: SelectionLog | null;
  setSelectedVoice: (uri: string | null) => void;
  speak: (text: string, opts?: SpeakOptions) => void;
  cancel: () => void;
  excludedVoices: SpeechSynthesisVoice[];    // list of English voices not in whitelist
};

const SpeechContext = createContext<SpeechState | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => {
    try { return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null; } catch { return null; }
  });
  const [seriousOnly, setSeriousOnlyState] = useState<boolean>(() => {
    try { const v = typeof window !== 'undefined' ? localStorage.getItem(SERIOUS_ONLY_KEY) : null; return v === null ? true : v === 'true'; } catch { return true; }
  });
  const [lastSelection, setLastSelection] = useState<SelectionLog | null>(null);

  // load voices
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
    const u = uri.toLowerCase();
    return voices.find(v => (v.voiceURI || '').toLowerCase() === u || (v.name || '').toLowerCase() === u);
  };

  // Pure function: pick best voice and reason from current voices (no state updates)
  const pickBestVoice = (preferredLang?: string) => {
    const all = voices.length ? voices : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
    if (!all || all.length === 0) return { voice: undefined as SpeechSynthesisVoice | undefined, reason: 'no-voices' };

    // Build english-like list
    const englishAll = all.filter(isEnglishVoiceCandidate);
    // Build whitelist candidates (only whitelisted English voices)
    const whitelisted = englishAll.filter(isWhitelistedVoice);

    // If seriousOnly is true, only use whitelisted voices; otherwise fallback to englishAll
    const candidates = (seriousOnly && whitelisted.length > 0) ? whitelisted : (englishAll.length > 0 ? englishAll : all);

    // optional additional filtering by preferredLang
    let shortlist = candidates;
    if (preferredLang) {
      const pref = preferredLang.toLowerCase();
      const matched = candidates.filter(v => (v.lang || '').toLowerCase().startsWith(pref));
      if (matched.length > 0) shortlist = matched;
    }

    const scored = shortlist.map(v => ({ v, score: scoreVoice(v, preferredLang) }));
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0]?.v;
    const reason = best ? `auto-select (${preferredLang ?? 'en-prefer'}) best=${scored[0]?.score ?? 0}` : 'no-candidate';
    return { voice: best, reason };
  };

  const setSeriousOnly = (on: boolean) => {
    setSeriousOnlyState(on);
    try { localStorage.setItem(SERIOUS_ONLY_KEY, String(on)); } catch {}
    // lastSelection will be updated by useEffect watching [voices, seriousOnly]
  };

  const setSelectedVoice = (uri: string | null) => {
    if (uri) {
      const v = getVoiceByURI(uri);
      if (!v || !isEnglishVoiceCandidate(v) || (seriousOnly && !isSeriousEnglishVoice(v))) {
        console.warn('[SpeechProvider] attempted to set invalid/non-serious voice - ignored', uri);
        return;
      }
    }
    setSelectedVoiceURI(uri);
    try { if (uri) localStorage.setItem(STORAGE_KEY, uri); else localStorage.removeItem(STORAGE_KEY); } catch {}

    // update lastSelection to reflect this user choice
    const voice = uri ? getVoiceByURI(uri) : pickBestVoice().voice;
    setLastSelection({ voice: voice || null, reason: uri ? 'user-selected' : 'auto', timestamp: Date.now() });
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

    const userVoice = selectedVoiceURI ? getVoiceByURI(selectedVoiceURI) : undefined;
    const chosen = userVoice || pickBestVoice(opts.lang).voice;
    if (chosen) u.voice = chosen;

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

  // Validate stored selection and set initial selection when voices change or seriousOnly toggles
  useEffect(() => {
    if (!voices || voices.length === 0) return;

    // If stored selectedVoiceURI is present but no longer available or filtered out, clear it
    if (selectedVoiceURI) {
      const persisted = getVoiceByURI(selectedVoiceURI);
      if (!persisted || !isEnglishVoiceCandidate(persisted) || (seriousOnly && !isSeriousEnglishVoice(persisted))) {
        console.info('[SpeechProvider] clearing invalid/filtered persisted voice:', selectedVoiceURI);
        try { localStorage.removeItem(STORAGE_KEY); } catch {};
        setSelectedVoiceURI(null);
      } else {
        // persisted selection is valid — reflect it in lastSelection
        setLastSelection({ voice: persisted, reason: 'user-selected', timestamp: Date.now() });
        return;
      }
    }

    // No valid persisted selection — compute best available voice
    const { voice: best, reason } = pickBestVoice();
    const prevURI = lastSelection?.voice?.voiceURI ?? lastSelection?.voice?.name ?? null;
    const bestURI = best ? (best.voiceURI ?? best.name) : null;
    if (bestURI !== prevURI) {
      setLastSelection({ voice: best || null, reason, timestamp: Date.now() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices, seriousOnly]);

  const englishVoices = voices.filter(isEnglishVoiceCandidate);
  const seriousVoices = englishVoices.filter(isSeriousEnglishVoice);
  const excludedVoices = englishVoices.filter(v => !isSeriousEnglishVoice(v));

  const value: SpeechState = {
    voices,
    englishVoices,
    seriousVoices,
    speaking,
    selectedVoiceURI,
    seriousOnly,
    setSeriousOnly,
    lastSelection,
    setSelectedVoice,
    speak,
    cancel,
    excludedVoices,
  };

  // Log excluded voices once for diagnostics
  useEffect(() => {
    if (!voices || voices.length === 0) return;
    if (excludedVoices.length > 0) {
      console.info('[SpeechProvider] excluded (non-whitelisted) voices:', excludedVoices.map(v => ({ name: v.name, lang: v.lang, uri: v.voiceURI })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices, seriousOnly]);

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
};

export function useSpeechContext() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeechContext must be used inside SpeechProvider');
  return ctx;
}
