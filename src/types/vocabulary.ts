export interface Word {
  id: string;
  ukrainian: string;
  english: string;
  emoji?: string;
  alternatives?: string[];
  phrases?: string[];
}

export interface IrregularVerb {
  id: string;
  ukrainian: string;
  base: string;
  past: string;
  participle: string;
  examples?: {
    base?: string[];
    past?: string[];
    participle?: string[];
  };
}

export const getIrregularForms = (verb: IrregularVerb): string[] => {
  return [verb.base, verb.past, verb.participle];
};

export const getIrregularFormLabels = (): string[] => {
  return ['Base', 'Past', 'Participle'];
};

export interface VocabularyState {
  currentWord: Word | null;
  availableWords: Word[];
  skippedWords: Word[];
  learnedWords: Word[];
  userInput: string;
  showSuccess: boolean;
  showSkippedModal: boolean;
  useSkippedWordsMode: boolean;
  allWords: Word[];
}

export interface Stats {
  learned: number;
  skipped: number;
}
