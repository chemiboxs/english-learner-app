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
        {/* Ukrainian word enlarged by 10% using scale; phrases are rendered below on separate lines */}
        <div style={{ fontFamily: 'Quicksand' }}>
          <p
            className="text-primary font-bold text-4xl"
            style={{
              display: 'inline-block',        // so transform scales the element itself
              transform: 'scale(1.1)',        // 10% larger than the original size
              transformOrigin: 'center',
            }}
          >
            {word.ukrainian}
          </p>

          {word.phrases && word.phrases.length > 0 && (
            <div
              style={{ fontSize: '0.9em', marginTop: '0.5rem' }}
              className="text-on-surface"
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
