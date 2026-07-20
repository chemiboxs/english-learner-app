import React, { useEffect, useMemo, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { Select } from './Select';

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

    const items = list.map(v => ({
      value: v.voiceURI || v.name,
      label: `${v.name} — ${v.lang}`,
    }));

    return [{ value: '', label: 'Auto (best English)' }, ...items];
  }, [seriousVoices]);

  const onPick = (value: string) => {
    const uri = value || null;
    setLocalSelected(uri);
    setSelectedVoice(uri);
  };

  return (
    <div className="flex items-center">
      <Select
        value={localSelected ?? ''}
        onChange={onPick}
        options={options}
        className="min-w-0 lg:min-w-[180px] w-full"
      />
    </div>
  );
};
