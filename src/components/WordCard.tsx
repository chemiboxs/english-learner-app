import React, { useState, useMemo } from 'react';
import { Word } from '../types/vocabulary';
import useSpeech from '../hooks/useSpeech';
import { Button } from './Button';
import { selectRandomPhrases } from '../utils/phraseSelector';

interface WordCardProps {
  word: Word | null;
  hidePhrases?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({ word, hidePhrases = false }) => {
  const { speak, cancel } = useSpeech();

  // Memoize the selected phrases so they don't change on every render
  const selectedPhrases = useMemo(() => {
    return word?.phrases ? selectRandomPhrases(word.phrases) : [];
  }, [word?.id]); // Only recalculate when word ID changes

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

  const pronouncePhrase = (phrase: string) => {
    speak(phrase, { lang: 'en-US', rate: 0.9 });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-gutter animate-slide-up">
      <div className="bg-surface-container-lowest rounded-xl shadow-soft p-6 text-center">

          <div className="flex items-center justify-center gap-3">
            <p
              className="text-primary font-bold text-[36px] md:text-[48px]"
              style={{
                lineHeight: 1,
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {word.ukrainian}
            </p>
          </div>


          {selectedPhrases && selectedPhrases.length > 0 && (
            <div
              className="text-on-surface text-[22px] md:text-[30px]"
              style={{
                marginTop: '0.5rem',
              }}
            >
              {selectedPhrases.map((phrase, idx) => (
                <PhraseRow
                  key={idx}
                  phrase={phrase}
                  pronounce={pronouncePhrase}
                  cancel={cancel}
                  hideText={hidePhrases}
                />
              ))}
            </div>
          )}

      </div>
    </div>
  );
};


const PhraseRow: React.FC<{
  phrase: string;
  pronounce: (p: string) => void;
  cancel: () => void;
  hideText?: boolean;
}> = ({
  phrase,
  pronounce,
  cancel,
  hideText = false,
}) => {

  const [hover, setHover] = useState(false);

  const hoverBg = 'var(--surface-container-high, rgba(0,0,0,0.06))';
  const hoverColor = 'var(--on-surface, inherit)';

  return (
    <div className="leading-tight flex flex-col md:flex-row items-start md:items-center w-full">

      {!hideText && (
        <p className="flex-1 text-left w-full md:w-auto">
          {phrase}
        </p>
      )}

      {hideText && <div className="flex-1 w-full md:w-auto" />}

      <div className="flex items-center gap-2 md:ml-3 mt-1 md:mt-0 self-end md:self-auto">


        {/* PLAY */}
        <Button
          onClick={() => pronounce(phrase)}
          variant="tertiary"
          size="sm"
          className="
            speaker-button
            w-[34px]
            h-[34px]
            min-w-[34px]
            md:w-10
            md:h-10
            md:min-w-10
            p-0
            rounded-full
            bg-transparent
            text-on-surface
            border border-outline
            transition-colors
            flex items-center justify-center
          "
          aria-label={`Pronounce example: ${phrase}`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onTouchStart={() => setHover(true)}
          onTouchEnd={() => setTimeout(() => setHover(false), 300)}
          style={
            hover
              ? { backgroundColor: hoverBg, color: hoverColor }
              : { backgroundColor: 'transparent' }
          }
        >
          <svg
            className="w-[15px] h-[15px] md:w-[18px] md:h-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            style={{ display: 'block' }}
          >
            <path
              d="M11 5L6 9H2v6h4l5 4V5z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 8a5 5 0 010 8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>



        {/* STOP */}
        <Button
          onClick={() => cancel()}
          variant="tertiary"
          size="sm"
          className="
            speaker-button
            w-[34px]
            h-[34px]
            min-w-[34px]
            md:w-10
            md:h-10
            md:min-w-10
            p-0
            rounded-full
            bg-transparent
            text-on-surface
            border border-outline
            flex items-center justify-center
          "
          aria-label="Stop pronunciation"
        >
          <svg
            className="w-[14px] h-[14px] md:w-4 md:h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="6"
              y="6"
              width="12"
              height="12"
              rx="1"
            />
          </svg>
        </Button>



      </div>

    </div>
  );
};
