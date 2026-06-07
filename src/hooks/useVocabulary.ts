import { useState, useCallback, useEffect } from 'react';
import { Word, VocabularyState } from '../types/vocabulary';

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
  // Коли режим "Повторювати пропущені слова" ВИМКНЕНИЙ:
  // Пропонуються лише слова з availableWords (слова які ще не пропонувались)
  if (!useSkippedWordsMode) {
    if (availableWords.length > 0) {
      return availableWords[Math.floor(Math.random() * availableWords.length)];
    }
    return null;
  }

  // Коли режим "Повторювати пропущені слова" ВКЛЮЧЕНИЙ:
  // Змішуються слова з обох списків - доступні і пропущені
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
  
  // Перевіряємо основне слово
  if (normalizedAnswer === word.english.toLowerCase().trim()) {
    return true;
  }
  
  // Перевіряємо альтернативні слова
  if (word.alternatives?.some(alt => 
    normalizedAnswer === alt.toLowerCase().trim()
  )) {
    return true;
  }
  
  return false;
};

export const useVocabulary = (initialWords: Word[]) => {
  const [state, setState] = useState<VocabularyState>({
    allWords: initialWords,
    currentWord: null,
    availableWords: shuffleArray(initialWords),
    skippedWords: [],
    learnedWords: [],
    userInput: '',
    showSuccess: false,
    showSkippedModal: false,
    useSkippedWordsMode: false,
  });

  useEffect(() => {
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
  }, []);

  const checkAnswer = useCallback((answer: string) => {
    setState(prev => {
      if (!prev.currentWord) return prev;

      const isCorrect = isAnswerCorrect(answer, prev.currentWord);

      if (isCorrect) {
        const newLearned = [...prev.learnedWords, prev.currentWord];
        let newAvailable = prev.availableWords.filter(w => w.id !== prev.currentWord!.id);
        let newSkipped = prev.skippedWords.filter(w => w.id !== prev.currentWord!.id);
        
        const nextWord = getNextWord(newAvailable, newSkipped, prev.useSkippedWordsMode);

        // Скидуємо success через 2.5 секунди
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
        ? prev.skippedWords  // Залишаємо слово в списку пропущених
        : [...prev.skippedWords, prev.currentWord];  // Додаємо у список пропущених
      
      const newAvailable = prev.availableWords.filter(w => w.id !== prev.currentWord!.id);
      const nextWord = getNextWord(newAvailable, newSkipped, prev.useSkippedWordsMode);

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
      if (newMode && prev.skippedWords.length === 0) return prev;
      
      const nextWord = getNextWord(prev.availableWords, prev.skippedWords, newMode);

      return {
        ...prev,
        useSkippedWordsMode: newMode,
        currentWord: nextWord || prev.currentWord,
        userInput: '',
      };
    });
  }, []);

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
    openSkippedModal,
    closeSkippedModal,
    updateInput,
    getStats,
  };
};
