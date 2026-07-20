export interface Word {
  id: string;
  ukrainian: string;
  english: string;
  emoji?: string;
  alternatives?: string[];
  phrases?: string[];
}

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
