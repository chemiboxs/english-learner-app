import React, { useEffect, useMemo, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { Button } from './Button';

export const VoiceSelector: React.FC = () => {
  const {
    seriousVoices = [],
    excludedVoices = [],
    selectedVoiceURI,
    setSelectedVoice,
    lastSelection,
    speak,
    seriousOnly,
    setSeriousOnly,
  } = useSpeech();

  const [showExcluded, setShowExcluded] = useState(false);
  const [localSelected, setLocalSelected] = useState<string | null>(selectedVoiceURI ?? null);

  useEffect(() => {
    setLocalSelected(selectedVoiceURI ?? null);
  }, [selectedVoiceURI]);

  const options = useMemo(() => {
    const list = (seriousVoices && seriousVoices.length > 0) ? seriousVoices : [];
    return list.map(v => ({ label: `${v.name} — ${v.lang}`, uri: v.voiceURI || v.name }));
  }, [seriousVoices]);

  const onPick = (uri: string | null) => {
    setLocalSelected(uri);
    setSelectedVoice(uri);
  };

  const playSample = (uri?: string | null) => {
    if (uri) setSelectedVoice(uri);
    speak('This is a pronunciation test.', { lang: 'en-US', rate: 0.95 });
  };

  return (
    <div className="flex flex-col gap-2" style={{ fontFamily: 'Quicksand' }}>
      <div className="flex items-center gap-3">
        <label className="text-sm text-on-surface-variant">English voice:</label>

        <select
          value={localSelected ?? ''}
          onChange={(e) => onPick(e.target.value || null)}
          className="px-3 py-1 rounded-lg bg-surface-container text-on-surface border border-outline"
        >
          <option value="">Auto (best serious English)</option>
          {options.map(o => <option key={o.uri} value={o.uri}>{o.label}</option>)}
        </select>

        <Button
          onClick={() => playSample(localSelected ?? selectedVoiceURI ?? undefined)}
          variant="secondary"
          size="sm"
        >
          ▶ Play
        </Button>

        <Button
          onClick={() => { setLocalSelected(null); setSelectedVoice(null); }}
          variant="tertiary"
          size="sm"
        >
          Auto
        </Button>

        <label className="ml-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showExcluded}
            onChange={() => setShowExcluded(v => !v)}
            className="accent-primary"
          />
          Show novelty voices
        </label>
      </div>

      <div className="text-xs text-on-surface-variant">
        {lastSelection ? (
          <>Using: {lastSelection.voice?.name ?? '—'} ({lastSelection.voice?.lang ?? '—'}) — {lastSelection.reason}</>
        ) : (
          <>No voice selected yet (voices may still be loading)</>
        )}
      </div>

      {showExcluded && (
        <div className="mt-2 space-y-2">
          <div className="text-sm font-medium">Excluded / novelty voices</div>
          <div className="grid grid-cols-1 gap-2">
            {excludedVoices.length === 0 ? (
              <div className="text-on-surface-variant">No excluded voices detected</div>
            ) : excludedVoices.map(v => (
              <div key={v.voiceURI || v.name} className="flex items-center justify-between gap-2 bg-surface-container-lowest p-2 rounded">
                <div className="text-sm">{v.name} — {v.lang}</div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => { setLocalSelected(v.voiceURI || v.name); setSelectedVoice(v.voiceURI || v.name); }}
                    variant="tertiary"
                    size="sm"
                  >
                    Select
                  </Button>
                  <Button
                    onClick={() => playSample(v.voiceURI || v.name)}
                    variant="secondary"
                    size="sm"
                  >
                    ▶ Play
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
