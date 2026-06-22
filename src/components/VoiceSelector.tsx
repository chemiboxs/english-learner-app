import React, { useMemo, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { Button } from './Button';

const SAMPLE_TEXT = 'This is a pronunciation test.';

export const VoiceSelector: React.FC = () => {
  const { voices, selectedVoiceURI, setSelectedVoice, lastSelection, speak, cancel } = useSpeech();
  const [localSelection, setLocalSelection] = useState<string | null>(selectedVoiceURI || null);
  const [playingSample, setPlayingSample] = useState(false);

  // Build display list: sort by friendly name, then lang
const voiceOptions = useMemo(() => englishVoices.map((v) => ({
  label: `${v.name} — ${v.lang}`,
  uri: v.voiceURI || v.name,
  name: v.name,
  lang: v.lang,
})), [englishVoices]);

  const onPick = (uri: string | null) => {
    setLocalSelection(uri);
    setSelectedVoice(uri);
  };

  const playSample = async (uri?: string | null) => {
    try {
      setPlayingSample(true);
      // If URI provided, temporarily set override, play sample, then restore previous override
      const prev = selectedVoiceURI;
      if (uri) {
        setSelectedVoice(uri);
      }
      // speak from hook; speak will pick selectedVoiceURI if set
      speak(SAMPLE_TEXT, { lang: 'en-US', rate: 0.95 });
      // We don't await; use speaking state if you want to toggle UI when ended
    } finally {
      // leave selection as user set it (do not auto-revert)
      setPlayingSample(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-on-surface-variant" style={{ fontFamily: 'Quicksand' }}>
        Voice:
      </label>

      <select
        value={localSelection ?? ''}
        onChange={(e) => onPick(e.target.value || null)}
        className="px-3 py-1 rounded-lg bg-surface-container text-on-surface border border-outline"
        style={{ fontFamily: 'Quicksand' }}
      >
        <option value="">Auto (best match)</option>
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
          // clear override and let auto-selection happen
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
            <div>Using: {lastSelection.voice?.name ?? '—' } ({lastSelection.voice?.lang ?? '—'})</div>
            <div className="text-xs opacity-80">Reason: {lastSelection.reason}</div>
          </>
        ) : (
          <div className="opacity-80">No voice selected yet</div>
        )}
      </div>
    </div>
  );
};
