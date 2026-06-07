/**
 * Randomly selects 2 phrases from an array of phrases.
 * If there are fewer than 2 phrases, returns all available phrases.
 * If there are exactly 2 phrases, returns both.
 * If there are more than 2 phrases, randomly selects 2 unique phrases.
 */
export const selectRandomPhrases = (phrases: string[]): string[] => {
  if (!phrases || phrases.length === 0) {
    return [];
  }

  if (phrases.length <= 2) {
    return phrases;
  }

  // Fisher-Yates shuffle to select 2 random phrases
  const shuffled = [...phrases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
};
