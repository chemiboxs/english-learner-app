import { useState, useCallback, useEffect, useRef } from 'react';
import { IrregularVerb } from '../types/vocabulary';

const VERB_DATA_KEY_PREFIX = 'irrverb_data_';
const VERB_UI_PREFIX = 'irrverb_ui_';

interface SavedVerbData {
  learnedVerbs: IrregularVerb[];
  skippedVerbs: IrregularVerb[];
  availableVerbs: IrregularVerb[];
  isCompleted: boolean;
}

interface VerbUIPrefs {
  useSkippedVerbsMode: boolean;
}

const getStorageKey = (verbIds: string[]): string => {
  const hash = verbIds.sort().join('|');
  return `${VERB_DATA_KEY_PREFIX}${hash}`;
};

const getUIPrefsKey = (verbIds: string[]): string => {
  const hash = verbIds.sort().join('|');
  return `${VERB_UI_PREFIX}${hash}`;
};

const parseAlternatives = (field: string): string[] => {
  return field.split('/').map(s => s.trim().toLowerCase());
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getNextVerb = (
  available: IrregularVerb[],
  skipped: IrregularVerb[],
  useSkipped: boolean
): IrregularVerb | null => {
  const pool = useSkipped ? [...available, ...skipped] : available;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

const isFormCorrect = (input: string, correctValue: string): boolean => {
  const normalized = input.toLowerCase().trim();
  const alternatives = parseAlternatives(correctValue);
  return alternatives.some(a => normalized === a);
};

const loadVerbData = (allVerbs: IrregularVerb[]): SavedVerbData => {
  try {
    const key = getStorageKey(allVerbs.map(v => v.id));
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      const verbIds = allVerbs.map(v => v.id);
      const learned = (parsed.learnedVerbs || []).filter((v: IrregularVerb) => verbIds.includes(v.id));
      const skipped = (parsed.skippedVerbs || []).filter((v: IrregularVerb) => verbIds.includes(v.id));
      const available = (parsed.availableVerbs || []).filter((v: IrregularVerb) => verbIds.includes(v.id));
      const total = learned.length + skipped.length + available.length;
      if (total === 0 && allVerbs.length > 0) {
        return {
          learnedVerbs: [],
          skippedVerbs: [],
          availableVerbs: shuffleArray(allVerbs),
          isCompleted: false,
        };
      }
      return {
        learnedVerbs: learned,
        skippedVerbs: skipped,
        availableVerbs: available,
        isCompleted: parsed.isCompleted || false,
      };
    }
  } catch (error) {
    console.error('Error loading verb data:', error);
  }
  return {
    learnedVerbs: [],
    skippedVerbs: [],
    availableVerbs: shuffleArray(allVerbs),
    isCompleted: false,
  };
};

const loadVerbUIPrefs = (verbIds: string[]): VerbUIPrefs => {
  try {
    const key = getUIPrefsKey(verbIds);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch {}
  return { useSkippedVerbsMode: false };
};

const saveVerbData = (
  verbIds: string[],
  learnedVerbs: IrregularVerb[],
  skippedVerbs: IrregularVerb[],
  availableVerbs: IrregularVerb[],
  isCompleted: boolean
) => {
  try {
    const key = getStorageKey(verbIds);
    localStorage.setItem(key, JSON.stringify({ learnedVerbs, skippedVerbs, availableVerbs, isCompleted }));
  } catch (error) {
    console.error('Error saving verb data:', error);
  }
};

const saveVerbUIPrefs = (verbIds: string[], useSkippedVerbsMode: boolean) => {
  try {
    const key = getUIPrefsKey(verbIds);
    localStorage.setItem(key, JSON.stringify({ useSkippedVerbsMode }));
  } catch {}
};

export const useIrregularVerbs = (allVerbs: IrregularVerb[]) => {
  const verbIds = allVerbs.map(v => v.id);
  const saved = loadVerbData(allVerbs);
  const savedUIPrefs = loadVerbUIPrefs(verbIds);

  const [availableVerbs, setAvailableVerbs] = useState<IrregularVerb[]>(saved.availableVerbs);
  const [learnedVerbs, setLearnedVerbs] = useState<IrregularVerb[]>(saved.learnedVerbs);
  const [skippedVerbs, setSkippedVerbs] = useState<IrregularVerb[]>(saved.skippedVerbs);
  const [currentVerb, setCurrentVerb] = useState<IrregularVerb | null>(null);
  const [isCompleted, setIsCompleted] = useState(saved.isCompleted);

  const [baseInput, setBaseInput] = useState('');
  const [pastInput, setPastInput] = useState('');
  const [participleInput, setParticipleInput] = useState('');
  const [useSkippedVerbsMode, setUseSkippedVerbsMode] = useState(savedUIPrefs.useSkippedVerbsMode);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (isCompleted) return;

    if (availableVerbs.length > 0 && !currentVerb) {
      const next = getNextVerb(availableVerbs, skippedVerbs, useSkippedVerbsMode);
      if (next) setCurrentVerb(next);
    }
  }, [isCompleted]);

  useEffect(() => {
    saveVerbData(verbIds, learnedVerbs, skippedVerbs, availableVerbs, isCompleted);
  }, [learnedVerbs, skippedVerbs, availableVerbs, isCompleted, verbIds]);

  useEffect(() => {
    saveVerbUIPrefs(verbIds, useSkippedVerbsMode);
  }, [useSkippedVerbsMode, verbIds]);

  const resetInputs = useCallback(() => {
    setBaseInput('');
    setPastInput('');
    setParticipleInput('');
  }, []);

  const checkAnswer = useCallback(() => {
    if (!currentVerb) return;

    const baseOk = isFormCorrect(baseInput, currentVerb.base);
    const pastOk = isFormCorrect(pastInput, currentVerb.past);
    const participleOk = isFormCorrect(participleInput, currentVerb.participle);

    if (baseOk && pastOk && participleOk) {
      const newLearned = [...learnedVerbs, currentVerb];
      const newAvailable = availableVerbs.filter(v => v.id !== currentVerb.id);
      const newSkipped = skippedVerbs.filter(v => v.id !== currentVerb.id);

      setLearnedVerbs(newLearned);
      setAvailableVerbs(newAvailable);
      setSkippedVerbs(newSkipped);

      const next = getNextVerb(newAvailable, newSkipped, useSkippedVerbsMode);
      const gameOver = !next && newAvailable.length === 0;
      if (gameOver) {
        setIsCompleted(true);
        setCurrentVerb(null);
      } else {
        setCurrentVerb(next);
      }
      resetInputs();
    }
  }, [currentVerb, baseInput, pastInput, participleInput, learnedVerbs, availableVerbs, skippedVerbs, useSkippedVerbsMode, resetInputs]);

  const skipVerb = useCallback(() => {
    if (!currentVerb) return;

    const isAlreadySkipped = skippedVerbs.some(v => v.id === currentVerb.id);
    const newSkipped = isAlreadySkipped ? skippedVerbs : [...skippedVerbs, currentVerb];
    const newAvailable = availableVerbs.filter(v => v.id !== currentVerb.id);

    setSkippedVerbs(newSkipped);
    setAvailableVerbs(newAvailable);

    if (newAvailable.length === 0 && newSkipped.length > 0 && !useSkippedVerbsMode) {
      setIsCompleted(true);
      setCurrentVerb(null);
      return;
    }

    const next = getNextVerb(newAvailable, newSkipped, useSkippedVerbsMode);
    if (!next && newAvailable.length === 0) {
      setIsCompleted(true);
      setCurrentVerb(null);
    } else {
      setCurrentVerb(next);
    }
    resetInputs();
  }, [currentVerb, skippedVerbs, availableVerbs, useSkippedVerbsMode, resetInputs]);

  const toggleSkippedMode = useCallback(() => {
    setUseSkippedVerbsMode(prev => !prev);
  }, []);

  const resetVerbs = useCallback(() => {
    const shuffled = shuffleArray(allVerbs);
    setAvailableVerbs(shuffled);
    setLearnedVerbs([]);
    setSkippedVerbs([]);
    setCurrentVerb(null);
    setIsCompleted(false);
    resetInputs();

    const next = getNextVerb(shuffled, [], useSkippedVerbsMode);
    if (next) setCurrentVerb(next);
  }, [allVerbs, useSkippedVerbsMode, resetInputs]);

  const getStats = useCallback(() => ({
    learned: learnedVerbs.length,
    skipped: skippedVerbs.length,
  }), [learnedVerbs.length, skippedVerbs.length]);

  const validation = (() => {
    if (!currentVerb) return null;

    const baseFilled = baseInput.trim().length > 0;
    const pastFilled = pastInput.trim().length > 0;
    const participleFilled = participleInput.trim().length > 0;
    const allFilled = baseFilled && pastFilled && participleFilled;
    if (!allFilled) return null;

    const baseOk = isFormCorrect(baseInput, currentVerb.base);
    const pastOk = isFormCorrect(pastInput, currentVerb.past);
    const participleOk = isFormCorrect(participleInput, currentVerb.participle);

    if (baseOk && pastOk && participleOk) return 'correct';
    return 'incorrect';
  })();

  return {
    currentVerb,
    baseInput,
    pastInput,
    participleInput,
    setBaseInput,
    setPastInput,
    setParticipleInput,
    checkAnswer,
    skipVerb,
    toggleSkippedMode,
    useSkippedVerbsMode,
    resetVerbs,
    getStats,
    isCompleted,
    validation,
    learnedVerbs,
    skippedVerbs,
  };
};
