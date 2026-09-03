import { useState, useEffect, useMemo } from 'react';
import { Word } from '../types/vocabulary';

export type Mode = 'words' | 'phrases' | 'irregular';

const loadDictionaries = async (): Promise<Map<string, unknown[]>> => {
  const dictionaries = new Map<string, unknown[]>();

  try {
    const modules = import.meta.glob<{ default: unknown[] }>('../data/*.json', { eager: true });

    Object.entries(modules).forEach(([path, module]) => {
      const fileName = path.split('/').pop()?.replace('.json', '') || '';
      if (!fileName) return;
      const data = module.default;
      if (Array.isArray(data) && data.length > 0) {
        dictionaries.set(fileName, data);
      }
    });
  } catch (error) {
    console.error('Error loading dictionaries:', error);
  }

  return dictionaries;
};

const isWordsFile = (name: string) => name.includes('vocabulary');
const isPhrasesFile = (name: string) => name.includes('.phrases');
const isIrregularFile = (name: string) => name.includes('.irreg');
const storageKeyForMode = (mode: Mode) => `selectedDictionary_${mode}`;

const filterByMode = (dictionaries: Map<string, unknown[]>, mode: Mode) => {
  const filtered = new Map<string, unknown[]>();
  dictionaries.forEach((data, name) => {
    const matches =
      mode === 'words' ? isWordsFile(name) :
      mode === 'phrases' ? isPhrasesFile(name) :
      isIrregularFile(name);
    if (matches) {
      filtered.set(name, data);
    }
  });
  return filtered;
};

const sortKeys = (keys: string[]) => {
  return keys.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
    if (numA && numB) return numA - numB;
    return a.localeCompare(b);
  });
};

export const useDictionaries = () => {
  const [dictionaries, setDictionaries] = useState<Map<string, unknown[]>>(new Map());
  const [selectedDictionary, setSelectedDictionary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('mode');
    return saved === 'words' || saved === 'phrases' || saved === 'irregular' ? saved : 'words';
  });

  const filteredDictionaries = useMemo(() => {
    return filterByMode(dictionaries, mode);
  }, [dictionaries, mode]);

  const sortedFilteredKeys = useMemo(() => {
    return sortKeys(Array.from(filteredDictionaries.keys()));
  }, [filteredDictionaries]);

  useEffect(() => {
    if (sortedFilteredKeys.length > 0 && !sortedFilteredKeys.includes(selectedDictionary)) {
      setSelectedDictionary(sortedFilteredKeys[0]);
    }
  }, [sortedFilteredKeys, selectedDictionary]);

  useEffect(() => {
    const loadAsync = async () => {
      setIsLoading(true);
      try {
        const dicts = await loadDictionaries();
        setDictionaries(dicts);

        const saved = localStorage.getItem(storageKeyForMode(mode));
        if (saved && dicts.has(saved)) {
          setSelectedDictionary(saved);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (newMode: Mode) => {
    if (selectedDictionary) {
      localStorage.setItem(storageKeyForMode(mode), selectedDictionary);
    }

    const filtered = filterByMode(dictionaries, newMode);
    const keys = sortKeys(Array.from(filtered.keys()));

    const saved = localStorage.getItem(storageKeyForMode(newMode));

    setMode(newMode);
    if (saved && keys.includes(saved)) {
      setSelectedDictionary(saved);
    } else if (keys.length > 0) {
      setSelectedDictionary(keys[0]);
    }
    localStorage.setItem('mode', newMode);
  };

  const switchDictionary = (name: string) => {
    if (filteredDictionaries.has(name)) {
      setSelectedDictionary(name);
      localStorage.setItem(storageKeyForMode(mode), name);
    }
  };

  const getCurrentDictionary = <T = Word,>(): T[] => {
    return (filteredDictionaries.get(selectedDictionary) || []) as T[];
  };

  const getDictionaryList = (): string[] => {
    return sortedFilteredKeys;
  };

  const getAllWords = <T = Word,>(): T[] => {
    const all: T[] = [];
    const seenIds = new Set<string>();

    filteredDictionaries.forEach((items, dictName) => {
      (items as T[]).forEach((item) => {
        const id = (item as Record<string, string>).id;
        if (id && !seenIds.has(id)) {
          all.push({ ...item, source: dictName } as T);
          seenIds.add(id);
        }
      });
    });

    return all;
  };

  return {
    dictionaries,
    selectedDictionary,
    isLoading,
    mode,
    switchMode,
    switchDictionary,
    getCurrentDictionary,
    getDictionaryList,
    getAllWords,
  };
};
