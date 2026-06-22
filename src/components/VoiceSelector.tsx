import React, { useMemo, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { Button } from './Button';

const SAMPLE_TEXT = 'This is a pronunciation test.';

export const VoiceSelector: React.FC = () => {
  const {
    // use the english-only list exposed by the hook
    englishVoices,
    selectedVoiceURI,
    setSelectedVoice,
    lastSelection,
    speak,
    cancel,
  } = useSpeech();

  const [localSelection, setLocalSelection] = useState<string | null>(selectedVoiceURI || null);
  const [playingSample, setPlayingSample] = useState(false);

  // Build display list from englishVoices
  const voiceOptions = useMemo(() => {
    return englishVoices.map((v) => ({
      label: `${v.name} — ${v.lang}`,
      uri: v.voiceURI || v.name,
      name: v.name,
      lang: v.lang,
    }));
  }, [englishVoices]);

  const onPick = (uri: string | null) => {
    setLocalSelection(uri);
    setSelectedVoice(uri);
  };

  const playSample = (uri?: string | null) => {
    // Play a sample using the currently selected or provided URI
    try {
      setPlayingSample(true);
      // If a specific uri is given, set it as override temporarily (persisted)
      if (uri) {
        setSelectedVoice(uri);
      }
      // speak sample slightly slower to improve clarity
      speak(SAMPLE_TEXT, { lang: 'en-US', rate: 0.95 });
    } finally {
      // setPlayingSample will be toggled by speaking state if needed;
      // we clear here after a short delay for basic UX (not required)
      setTimeout(() => setPlayingSample(false), 1000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-on-surface-variant" style={{ fontFamily: 'Quicksand' }}>
        English voice:
      </label>

      <select
        value={localSelection ?? ''}
        onChange={(e) => onPick(e.target.value || null)}
        className="px-3 py-1 rounded-lg bg-surface-container text-on-surface border border-outline"
        style={{ fontFamily: 'Quicksand' }}
      >
        <option value="">Auto (best English)</option>
        {voiceOptions.map((v) => (
          <option key={v.uri} value={v.uri}>
            {v.label}
          </option>
        ))}
      </select>

      <Button
        onClick={() => playSample(localSelection ?? selectedVoiceURI ?? undefined)}
        variant="secondary"
        size="sm"
        className="flex items-center gap-2"
      >
        ▶ Play
      </Button>

      <Button
        onClick={() => {
          setLocalSelection(null);
          setSelectedVoice(null);
        }}
        variant="tertiary"
        size="sm"
        className="flex items-center gap-2"
      >
        Auto
      </Button>

      <div className="text-xs text-on-surface-variant ml-2" style={{ fontFamily: 'Quicksand' }}>
        {lastSelection ? (
          <>
            <div>Using: {lastSelection.voice?.name ?? '—'} ({lastSelection.voice?.lang ?? '—'})</div>
            <div className="text-xs opacity-80">Reason: {lastSelection.reason}</div>
          </>
        ) : (
          <div className="opacity-80">No voice selected yet</div>
        )}
      </div>
    </div>
  );
};
