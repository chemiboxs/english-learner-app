import React, { useEffect, useMemo, useState } from 'react';
import useSpeech from '../hooks/useSpeech';

export const VoiceSelector: React.FC = () => {
  const { seriousVoices = [], selectedVoiceURI, setSelectedVoice } = useSpeech();

  const [localSelected, setLocalSelected] = useState<string | null>(
    selectedVoiceURI ?? null
  );

  useEffect(() => {
    setLocalSelected(selectedVoiceURI ?? null);
  }, [selectedVoiceURI]);

  const options = useMemo(() => {
    const list = seriousVoices?.length ? seriousVoices : [];

    return list.map(v => ({
      label: `${v.name} — ${v.lang}`,
      uri: v.voiceURI || v.name,
    }));
  }, [seriousVoices]);

  const onPick = (uri: string | null) => {
    setLocalSelected(uri);
    setSelectedVoice(uri);
  };

  return (
    <div
      className="flex items-center"
    >
      <select
        value={localSelected ?? ''}
        onChange={(e) => onPick(e.target.value || null)}
        className="
          h-10
          min-w-[180px]
          px-3
          rounded-lg
          bg-surface-container
          text-on-surface
          border border-outline
          text-sm
          font-medium
        "
      >
        <option value="">
          Auto (best English)
        </option>

        {options.map(o => (
          <option key={o.uri} value={o.uri}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};
