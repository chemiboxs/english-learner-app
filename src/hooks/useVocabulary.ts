import { useState, useCallback, useEffect } from 'react';
import { Word, VocabularyState } from '../types/vocabulary';

const VOCABULARY_DATA_KEY_PREFIX = 'vocabulary_data_';
const UI_PREFERENCES_KEY_PREFIX = 'vocabulary_ui_prefs_';

interface SavedVocabularyData {
  learnedWords: Word[];
  skippedWords: Word[];
  availableWords: Word[];
  isCompleted: boolean;
}

interface UIPreferences {
  useSkippedWordsMode: boolean;
  hidePhrases: boolean;
}

const getStorageKey = (wordIds: string[]): string => {
  const hash = wordIds.sort().join('|');
  return `${VOCABULARY_DATA_KEY_PREFIX}${hash}`;
};

const getUIPreferencesKey = (wordIds: string[]): string => {
  const hash = wordIds.sort().join('|');
  return `${UI_PREFERENCES_KEY_PREFIX}${hash}`;
};

const loadVocabularyData = (allWords: Word[]): SavedVocabularyData => {
  try {
    const key = getStorageKey(allWords.map(w => w.id));
    const data = localStorage.getItem(key);
    if (data) {
      const parsedData = JSON.parse(data);
      const wordIds = allWords.map(w => w.id);
      
      return {
        learnedWords: (parsedData.learnedWords || []).filter((w: Word) => wordIds.includes(w.id)),
        skippedWords: (parsedData.skippedWords || []).filter((w: Word) => wordIds.includes(w.id)),
        availableWords: (parsedData.availableWords || []).filter((w: Word) => wordIds.includes(w.id)),
        isCompleted: parsedData.isCompleted || false,
      };
    }
  } catch (error) {
    console.error('Error loading vocabulary data from localStorage:', error);
  }
  
  return {
    learnedWords: [],
    skippedWords: [],
    availableWords: shuffleArray(allWords),
    isCompleted: false,
  };
};

const loadUIPreferences = (allWords: Word[]): UIPreferences => {
  try {
    const key = getUIPreferencesKey(allWords.map(w => w.id));
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading UI preferences from localStorage:', error);
  }
  
  return {
    useSkippedWordsMode: false,
    hidePhrases: false,
  };
};

const saveVocabularyData = (allWords: Word[], learnedWords: Word[], skippedWords: Word[], availableWords: Word[], isCompleted: boolean) => {
  try {
    const key = getStorageKey(allWords.map(w => w.id));
    localStorage.setItem(key, JSON.stringify({
      learnedWords,
      skippedWords,
      availableWords,
      isCompleted,
    }));
  } catch (error) {
    console.error('Error saving vocabulary data to localStorage:', error);
  }
};

const saveUIPreferences = (allWords: Word[], useSkippedWordsMode: boolean, hidePhrases: boolean) => {
  try {
    const key = getUIPreferencesKey(allWords.map(w => w.id));
    localStorage.setItem(key, JSON.stringify({
      useSkippedWordsMode,
      hidePhrases,
    }));
  } catch (error) {
    console.error('Error saving UI preferences to localStorage:', error);
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getNextWord = (
  availableWords: Word[],
  skippedWords: Word[],
  useSkippedWordsMode: boolean
): Word | null => {
  if (!useSkippedWordsMode) {
    if (availableWords.length > 0) {
      return availableWords[Math.floor(Math.random() * availableWords.length)];
    }
    return null;
  }

  if (useSkippedWordsMode) {
    const combinedWords = [...availableWords, ...skippedWords];
    if (combinedWords.length > 0) {
      return combinedWords[Math.floor(Math.random() * combinedWords.length)];
    }
    return null;
  }

  return null;
};

const isAnswerCorrect = (answer: string, word: Word): boolean => {
  const normalizedAnswer = answer.toLowerCase().trim();
  
  if (normalizedAnswer === word.english.toLowerCase().trim()) {
    return true;
  }
  
  if (word.alternatives?.some(alt => 
    normalizedAnswer === alt.toLowerCase().trim()
  )) {
    return true;
  }
  
  return false;
};

export const useVocabulary = (initialWords: Word[]) => {
  const savedData = loadVocabularyData(initialWords);
  const savedUIPrefs = loadUIPreferences(initialWords);
  
  const [state, setState] = useState<VocabularyState>({
    allWords: initialWords,
    currentWord: null,
    availableWords: savedData.availableWords.length > 0
      ? savedData.availableWords
      : savedData.isCompleted
        ? []
        : shuffleArray(initialWords),
    skippedWords: savedData.skippedWords,
    learnedWords: savedData.learnedWords,
    userInput: '',
    showSuccess: false,
    showSkippedModal: false,
    useSkippedWordsMode: savedUIPrefs.useSkippedWordsMode,
  });

  const [hidePhrases, setHidePhrases] = useState(savedUIPrefs.hidePhrases);
  const [isCompleted, setIsCompleted] = useState(savedData.isCompleted);

  useEffect(() => {
    // Don't load first word if vocabulary is completed
    if (isCompleted) {
      setState(prev => ({ ...prev, currentWord: null }));
      return;
    }

    setState(prev => {
      if (prev.currentWord === null && prev.availableWords.length > 0) {
        const firstWord = getNextWord(
          prev.availableWords,
          prev.skippedWords,
          prev.useSkippedWordsMode
        );
        if (firstWord) {
          return { ...prev, currentWord: firstWord };
        }
      }
      return prev;
    });
  }, [isCompleted]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveVocabularyData(state.allWords, state.learnedWords, state.skippedWords, state.availableWords, isCompleted);
  }, [state.learnedWords, state.skippedWords, state.availableWords, state.allWords, isCompleted]);

  // Save UI preferences whenever they change
  useEffect(() => {
    saveUIPreferences(state.allWords, state.useSkippedWordsMode, hidePhrases);
  }, [state.useSkippedWordsMode, hidePhrases, state.allWords]);

  const checkAnswer = useCallback((answer: string) => {
    setState(prev => {
      if (!prev.currentWord) return prev;

      const isCorrect = isAnswerCorrect(answer, prev.currentWord);

      if (isCorrect) {
        const newLearned = [...prev.learnedWords, prev.currentWord];
        let newAvailable = prev.availableWords.filter(w => w.id !== prev.currentWord!.id);
        let newSkipped = prev.skippedWords.filter(w => w.id !== prev.currentWord!.id);
        
        const nextWord = getNextWord(newAvailable, newSkipped, prev.useSkippedWordsMode);

        // Check if game is over (all words processed)
        const gameOver = !nextWord && newAvailable.length === 0;
        if (gameOver) {
          setIsCompleted(true);
        }

        setTimeout(() => {
          setState(s => ({ ...s, showSuccess: false }));
        }, 2500);

        return {
          ...prev,
          learnedWords: newLearned,
          availableWords: newAvailable,
          skippedWords: newSkipped,
          currentWord: nextWord,
          userInput: '',
          showSuccess: true,
        };
      }

      return prev;
    });
  }, []);

const skipWord = useCallback(() => {
  setState(prev => {
    if (!prev.currentWord) return prev;

    const isAlreadySkipped = prev.skippedWords.some(w => w.id === prev.currentWord!.id);
    const newSkipped = isAlreadySkipped 
      ? prev.skippedWords
      : [...prev.skippedWords, prev.currentWord];
    
    const newAvailable = prev.availableWords.filter(w => w.id !== prev.currentWord!.id);
    
    // If there are no more available words but we have skipped words and we're not in skipped mode, complete
    if (newAvailable.length === 0 && newSkipped.length > 0 && !prev.useSkippedWordsMode) {
      setIsCompleted(true);
      return {
        ...prev,
        skippedWords: newSkipped,
        availableWords: newAvailable,
        currentWord: null,
        userInput: '',
      };
    }

    const nextWord = getNextWord(newAvailable, newSkipped, prev.useSkippedWordsMode);

    const gameOver = !nextWord && newAvailable.length === 0;
    if (gameOver) {
      setIsCompleted(true);
    }

    return {
      ...prev,
      skippedWords: newSkipped,
      availableWords: newAvailable,
      currentWord: nextWord,
      userInput: '',
    };
  });
}, []);

  const toggleSkippedWordsMode = useCallback(() => {
    setState(prev => {
      const newMode = !prev.useSkippedWordsMode;
      
      return {
        ...prev,
        useSkippedWordsMode: newMode,
        userInput: '',
      };
    });
  }, []);

  const toggleHidePhrases = useCallback(() => {
    setHidePhrases(prev => !prev);
  }, []);

  const resetVocabulary = useCallback(() => {
    setState({
      allWords: state.allWords,
      currentWord: null,
      availableWords: shuffleArray(state.allWords),
      skippedWords: [],
      learnedWords: [],
      userInput: '',
      showSuccess: false,
      showSkippedModal: false,
      useSkippedWordsMode: state.useSkippedWordsMode,
    });
    
    setIsCompleted(false);
    
    setState(prev => {
      const firstWord = getNextWord(
        prev.availableWords,
        prev.skippedWords,
        prev.useSkippedWordsMode
      );
      if (firstWord) {
        return { ...prev, currentWord: firstWord };
      }
      return prev;
    });
  }, [state.allWords, state.useSkippedWordsMode]);

  const openSkippedModal = useCallback(() => {
    setState(prev => ({ ...prev, showSkippedModal: true }));
  }, []);

  const closeSkippedModal = useCallback(() => {
    setState(prev => ({ ...prev, showSkippedModal: false }));
  }, []);

  const updateInput = useCallback((value: string) => {
    setState(prev => ({ ...prev, userInput: value }));
  }, []);

  const getStats = useCallback(() => {
    return {
      learned: state.learnedWords.length,
      skipped: state.skippedWords.length,
    };
  }, [state.learnedWords.length, state.skippedWords.length]);

  return {
    state,
    checkAnswer,
    skipWord,
    toggleSkippedWordsMode,
    toggleHidePhrases,
    hidePhrases,
    resetVocabulary,
    openSkippedModal,
    closeSkippedModal,
    updateInput,
    getStats,
    isCompleted,
  };
};
