import { useState, useEffect, useMemo } from 'react';
import { Word } from '../types/vocabulary';

export type Mode = 'words' | 'phrases';

const loadDictionaries = async (): Promise<Map<string, Word[]>> => {
  const dictionaries = new Map<string, Word[]>();
  
  try {
    const modules = import.meta.glob<{ default: Word[] }>('../data/*.json', { eager: true });
    
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
const storageKeyForMode = (mode: Mode) => `selectedDictionary_${mode}`;

export const useDictionaries = () => {
  const [dictionaries, setDictionaries] = useState<Map<string, Word[]>>(new Map());
  const [selectedDictionary, setSelectedDictionary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('mode');
    return saved === 'words' || saved === 'phrases' ? saved : 'words';
  });

  const filteredDictionaries = useMemo(() => {
    const filtered = new Map<string, Word[]>();
    dictionaries.forEach((words, name) => {
      if (mode === 'phrases' ? isPhrasesFile(name) : isWordsFile(name)) {
        filtered.set(name, words);
      }
    });
    return filtered;
  }, [dictionaries, mode]);

  const sortedFilteredKeys = useMemo(() => {
    return Array.from(filteredDictionaries.keys()).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      if (numA && numB) return numA - numB;
      return a.localeCompare(b);
    });
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

    const keys = Array.from(dictionaries.keys())
      .filter(name => newMode === 'phrases' ? isPhrasesFile(name) : isWordsFile(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        if (numA && numB) return numA - numB;
        return a.localeCompare(b);
      });

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

  const getCurrentDictionary = (): Word[] => {
    return filteredDictionaries.get(selectedDictionary) || [];
  };

  const getDictionaryList = (): string[] => {
    return sortedFilteredKeys;
  };

  const getAllWords = (): Word[] => {
    const allWords: Word[] = [];
    const seenIds = new Set<string>();
    
    filteredDictionaries.forEach((words) => {
      words.forEach((word) => {
        if (!seenIds.has(word.id)) {
          allWords.push(word);
          seenIds.add(word.id);
        }
      });
    });
    
    return allWords;
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
