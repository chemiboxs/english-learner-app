import React from 'react';
import { Word } from '../types/vocabulary';

interface WordCardProps {
  word: Word | null;
}

export const WordCard: React.FC<WordCardProps> = ({ word }) => {
  if (!word) {
    return (
      <div className="w-full max-w-2xl mx-auto px-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-soft p-8 text-center">
          <p className="text-on-surface text-xl">
            🎉 Вітаємо! Ви завершили всі слова!
          </p>
        </div>
      </div>
    );
  }

  const hasEmoji = word.emoji && word.emoji.trim() !== '';

  return (
    <div className="w-full max-w-2xl mx-auto px-gutter animate-slide-up">
      <div className="bg-surface-container-lowest rounded-xl shadow-soft p-6 text-center">
        {hasEmoji && (
          <div className="text-5xl mb-4">
            {word.emoji}
          </div>
        )}

        <p 
          className="text-primary font-bold text-4xl"
          style={{ fontFamily: 'Quicksand' }}
        >
          {word.ukrainian}
        </p>
      </div>
    </div>
  );
};
