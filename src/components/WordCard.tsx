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
        {/* Display Ukrainian word and phrases.
            Container fontSize set to 110% so ukrainian inside is 110% of the card base.
            Phrases use 0.9em so they are 10% smaller than the ukrainian word. */}
        <div style={{ fontFamily: 'Quicksand', fontSize: '110%' }}>
          <p
            className="text-primary font-bold"
            style={{ fontSize: '1em' }}
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
