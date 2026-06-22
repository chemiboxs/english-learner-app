import React from 'react';
import { Word } from '../types/vocabulary';
import useSpeech from '../hooks/useSpeech';
import { Button } from './Button';

interface WordCardProps {
  word: Word | null;
}

export const WordCard: React.FC<WordCardProps> = ({ word }) => {
  const { speak } = useSpeech();

  if (!word) {
    return (
      <div className="w-full max-w-2xl mx-auto px-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-soft p-8 text-center">
          <p className="text-on-surface text-xl">🎉 Congratulations! You've completed all the words!</p>
        </div>
      </div>
    );
  }

  const pronouncePhrase = (phrase: string) => {
    // Speak example phrases in English 10% slower (rate 0.9)
    speak(phrase, { lang: 'en-US', rate: 0.9 });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-gutter animate-slide-up">
      <div className="bg-surface-container-lowest rounded-xl shadow-soft p-6 text-center">
        <div style={{ fontFamily: 'Quicksand' }}>
          {/* Ukrainian word (no speaker button) */}
          <div className="flex items-center justify-center gap-3">
            <p
              className="text-primary font-bold"
              style={{
                fontSize: '48px',
                lineHeight: 1,
              }}
            >
              {word.ukrainian}
            </p>
          </div>

          {/* Phrases (each with its own pronounce button) */}
          {word.phrases && word.phrases.length > 0 && (
            <div
              className="text-on-surface"
              style={{
                fontSize: '30px',
                marginTop: '0.5rem',
              }}
            >
              {word.phrases.map((phrase, idx) => (
                <div key={idx} className="leading-tight flex items-center justify-center gap-2">
                  <p>{phrase}</p>
                  <Button
                    onClick={() => pronouncePhrase(phrase)}
                    variant="tertiary"
                    size="sm"
                    className="min-w-0 p-2 rounded-full bg-transparent text-on-surface hover:bg-surface-container-low border border-outline"
                    aria-label={`Pronounce example: ${phrase}`}
                  >
                    🔊
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
