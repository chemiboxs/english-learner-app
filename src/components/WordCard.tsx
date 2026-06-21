
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
            🎉 Congratulations! You've completed all the words!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-gutter animate-slide-up">
      <div className="bg-surface-container-lowest rounded-xl shadow-soft p-6 text-center">
        <div style={{ fontFamily: 'Quicksand' }}>
          {/* Ukrainian word increased by 10% */}
          <p
            className="text-primary font-bold"
            style={{
              fontSize: '2.75rem', // 2.5rem (Tailwind text-4xl) × 1.1
            }}
          >
            {word.ukrainian}
          </p>

          {/* Phrases increased by 10% */}
          {word.phrases && word.phrases.length > 0 && (
            <div
              className="text-on-surface"
              style={{
                fontSize: '0.99em', // 0.9em × 1.1
                marginTop: '0.5rem',
              }}
            >
              {word.phrases.map((phrase, idx) => (
                <p key={idx} className="leading-tight">
                  {phrase}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
