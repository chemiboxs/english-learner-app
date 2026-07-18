/**
 * Randomly selects phrases from an array of phrases.
 * @param phrases - Array of phrases to select from
 * @param maxPhrases - Maximum number of phrases to return (default: 2)
 *
 * If there are fewer phrases than maxPhrases, returns all available phrases.
 * If there are more phrases than maxPhrases, randomly selects maxPhrases unique phrases.
 */
export const selectRandomPhrases = (phrases: string[], maxPhrases: number = 2): string[] => {
  if (!phrases || phrases.length === 0) {
    return [];
  }

  if (phrases.length <= maxPhrases) {
    return phrases;
  }

  // Fisher-Yates shuffle to select random phrases
  const shuffled = [...phrases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxPhrases);
};
