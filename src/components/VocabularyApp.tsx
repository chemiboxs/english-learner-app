import React, { useRef } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { Word } from '../types/vocabulary';
import { WordCard } from './WordCard';
import { InputField } from './InputField';
import { Button } from './Button';
import { WordsList } from './WordsList';
import { Toggle } from './Toggle';

interface VocabularyAppProps {
  words: Word[];
  learnedWords: Word[];
  skippedWords: Word[];
  onStatsUpdate: (learned: number, skipped: number) => void;
  onLearnedClick: () => void;
  onSkippedClick: () => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  modalType: 'learned' | 'skipped';
  setModalType: (type: 'learned' | 'skipped') => void;
  resetVocabularyCallback: () => void;
}

export const VocabularyApp: React.FC<VocabularyAppProps> = ({
  words,
  onStatsUpdate,
  showModal,
  setShowModal,
  modalType,
  setModalType,
  resetVocabularyCallback,
}) => {
  const {
    state,
    checkAnswer,
    skipWord,
    toggleSkippedWordsMode,
    toggleHidePhrases,
    hidePhrases,
    resetVocabulary,
    updateInput,
    getStats,
    isCompleted,
  } = useVocabulary(words);

  const stats = getStats();

  const prevStatsRef = useRef({ learned: -1, skipped: -1 });

  React.useEffect(() => {
    if (
      stats.learned !== prevStatsRef.current.learned ||
      stats.skipped !== prevStatsRef.current.skipped
    ) {
      onStatsUpdate(stats.learned, stats.skipped);

      prevStatsRef.current = {
        learned: stats.learned,
        skipped: stats.skipped,
      };
    }
  }, [stats.learned, stats.skipped, onStatsUpdate]);


  const handleReset = () => {
    resetVocabulary();
    resetVocabularyCallback();
    onStatsUpdate(0, 0);
  };


  const handleSubmit = () => {
    checkAnswer(state.userInput);
  };


  const showCongratulations = isCompleted;


  const stars = Array.from({ length: stats.learned }, (_, i) => i);

  const leftStars = stars.slice(0, Math.ceil(stars.length / 2));
  const rightStars = stars.slice(Math.ceil(stars.length / 2));


  return (
    <div className="min-h-screen bg-surface flex flex-col">


      <main
        className="
          relative
          flex-1
          w-full
          px-gutter
          py-3
          flex
          flex-col
        "
      >


        {/* LEFT STARS */}
        {!showCongratulations && leftStars.length > 0 && (
          <div
            className="
              absolute
              left-0
              top-1/2
              -translate-y-1/2
              w-[calc((100vw-1024px)/2)]
              min-w-[90px]
              flex
              flex-wrap
              justify-end
              gap-2
              pr-4
            "
          >
            {leftStars.map((_, index) => (
              <span
                key={index}
                className="text-2xl animate-in fade-in duration-300"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                ⭐
              </span>
            ))}
          </div>
        )}



        {/* RIGHT STARS */}
        {!showCongratulations && rightStars.length > 0 && (
          <div
            className="
              absolute
              right-0
              top-1/2
              -translate-y-1/2
              w-[calc((100vw-1024px)/2)]
              min-w-[90px]
              flex
              flex-wrap
              justify-start
              gap-2
              pl-4
            "
          >
            {rightStars.map((_, index) => (
              <span
                key={index}
                className="text-2xl animate-in fade-in duration-300"
                style={{
                  animationDelay:
                    `${(index + leftStars.length) * 50}ms`,
                }}
              >
                ⭐
              </span>
            ))}
          </div>
        )}



        <div className="flex flex-col flex-1">


          {/* WORD CARD */}
          {!showCongratulations && (
            <div className="pt-2">
              <WordCard word={state.currentWord} hidePhrases={hidePhrases} />
            </div>
          )}



          {/* INPUT + BUTTONS FIXED LOW */}
          {!showCongratulations && state.currentWord && (
           <div className="mt-auto mb-24 space-y-2">


              <InputField
                value={state.userInput}
                onChange={updateInput}
                onSubmit={handleSubmit}
                placeholder="Type here..."
                disabled={false}
              />



              <div className="flex gap-2 justify-center max-w-2xl mx-auto px-gutter">

                <Button
                  onClick={handleSubmit}
                  disabled={false}
                  variant="primary"
                  size="md"
                  className="border border-black"
                >
                  Check
                </Button>


              <Button
                onClick={skipWord}
                disabled={false}
                variant="secondary"
                size="md"
                className="border border-black"
              >
                Skip
              </Button>

              </div>



              <div className="max-w-2xl mx-auto px-gutter flex justify-center gap-8">

                <Toggle
                  enabled={state.useSkippedWordsMode}
                  onChange={toggleSkippedWordsMode}
                  label="Repeat skipped words"
                  disabled={false}
                />

                <Toggle
                  enabled={hidePhrases}
                  onChange={toggleHidePhrases}
                  label="Hide phrases"
                  disabled={false}
                />

              </div>

            </div>
          )}




          {showCongratulations && (
            <div className="text-center">

              <p className="text-3xl mb-3">🎉</p>


              <p
                className="text-xl font-bold text-primary mb-2"
              >
                Congratulations!
              </p>


              <p className="text-on-surface-variant text-sm mb-6">
                You learned {stats.learned} words!
                {stats.skipped > 0 && ` (Skipped: ${stats.skipped})`}
              </p>


              <Button
                onClick={handleReset}
                variant="primary"
                size="md"
              >
                Start Again
              </Button>

            </div>
          )}

        </div>

      </main>



      <WordsList
        words={
          modalType === 'learned'
            ? state.learnedWords
            : state.skippedWords
        }
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === 'learned'
            ? 'My Learned Words'
            : 'My Skipped Words'
        }
        type={modalType}
      />

    </div>
  );
};
