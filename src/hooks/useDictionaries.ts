import { useState, useEffect } from 'react';
import { Word } from '../types/vocabulary';

// Імпортуємо всі словники
import wordsData from '../data/words.json';

export interface DictionaryInfo {
  name: string;
  path: string;
  words: Word[];
}

const loadDictionaries = async (): Promise<Map<string, Word[]>> => {
  const dictionaries = new Map<string, Word[]>();
  
  try {
    // Основний словник
    const words = Array.isArray(wordsData) ? wordsData : (wordsData as any).default;
    dictionaries.set('words', words);
    
    // Спробуємо завантажити динамічно всі .json файли з data папки
    // Це працює з Vite glob import
    const modules = import.meta.glob<{ default: Word[] }>('../data/*.json', { eager: true });
    
    Object.entries(modules).forEach(([path, module]) => {
      const fileName = path.split('/').pop()?.replace('.json', '') || '';
      if (fileName && fileName !== 'words') {
        const data = module.default;
        if (Array.isArray(data)) {
          dictionaries.set(fileName, data);
        }
      }
    });
  } catch (error) {
    console.error('Error loading dictionaries:', error);
    // Повертаємо хоча б основний словник
    const words = Array.isArray(wordsData) ? wordsData : (wordsData as any).default;
    dictionaries.set('words', words);
  }
  
  return dictionaries;
};

export const useDictionaries = () => {
  const [dictionaries, setDictionaries] = useState<Map<string, Word[]>>(new Map());
  const [selectedDictionary, setSelectedDictionary] = useState<string>('words');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAsync = async () => {
      setIsLoading(true);
      try {
        const dicts = await loadDictionaries();
        setDictionaries(dicts);
        
        console.log('Available dictionaries:', Array.from(dicts.keys()));
        
        // Завантажуємо виб or зі localStorage
        const savedDict = localStorage.getItem('selectedDictionary');
        if (savedDict && dicts.has(savedDict)) {
          setSelectedDictionary(savedDict);
        } else if (dicts.size > 0) {
          // Встановлюємо першу доступну словник
          const firstKey = Array.from(dicts.keys())[0];
          setSelectedDictionary(firstKey);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAsync();
  }, []);

  const switchDictionary = (name: string) => {
    if (dictionaries.has(name)) {
      setSelectedDictionary(name);
      localStorage.setItem('selectedDictionary', name);
    }
  };

  const getCurrentDictionary = (): Word[] => {
    return dictionaries.get(selectedDictionary) || [];
  };

  const getDictionaryList = (): string[] => {
    return Array.from(dictionaries.keys()).sort();
  };

  const getAllWords = (): Word[] => {
    const allWords: Word[] = [];
    const seenIds = new Set<string>();
    
    // Iterate through all dictionaries and collect unique words
    dictionaries.forEach((words) => {
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
    switchDictionary,
    getCurrentDictionary,
    getDictionaryList,
    getAllWords,
  };
};
