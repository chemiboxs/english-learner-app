import React, { useState } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { Word } from '../types/vocabulary';
import { WordCard } from './WordCard';
import { InputField } from './InputField';
import { Button } from './Button';
import { SuccessNotification } from './SuccessNotification';
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
    resetVocabulary,
    updateInput,
    getStats,
    isCompleted,
  } = useVocabulary(words);

  const stats = getStats();

  React.useEffect(() => {
    onStatsUpdate(stats.learned, stats.skipped);
  }, [stats.learned, stats.skipped, onStatsUpdate]);

  const handleReset = () => {
    resetVocabulary();
    resetVocabularyCallback();
    onStatsUpdate(0, 0);
  };

  const handleSubmit = () => {
    checkAnswer(state.userInput);
  };

  // Show congratulations if vocabulary is completed
  const showCongratulations = isCompleted;

  const canToggleSkippedMode = state.skippedWords.length > 0;

  // Generate stars array based on learned words count
  const stars = Array.from({ length: stats.learned }, (_, i) => i);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Success Notification - у верхній частині */}
      <SuccessNotification show={state.showSuccess} />

      {/* Stars Display */}
      {stats.learned > 0 && !showCongratulations && (
        <div className="bg-surface-container-low px-gutter py-3">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
            {stars.map((_, index) => (
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
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-gutter py-3 flex flex-col justify-center">
        <div className="space-y-3">
          {/* Word Card */}
          {!showCongratulations && <WordCard word={state.currentWord} />}

          {/* Input and Controls */}
          {!showCongratulations && state.currentWord && (
            <div className="space-y-2">
              {/* Input Field */}
              <InputField
                value={state.userInput}
                onChange={updateInput}
                onSubmit={handleSubmit}
                placeholder="Type English here..."
                disabled={false}
              />

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center max-w-2xl mx-auto px-gutter">
                <Button
                  onClick={handleSubmit}
                  disabled={false}
                  variant="primary"
                  size="md"
                >
                  Check
                </Button>
                <Button
                  onClick={skipWord}
                  disabled={false}
                  variant="secondary"
                  size="md"
                >
                  Skip
                </Button>
              </div>

              {/* Repeat Skipped Words Toggle */}
              {canToggleSkippedMode && (
                <div className="max-w-2xl mx-auto px-gutter flex justify-center">
                  <Toggle
                    enabled={state.useSkippedWordsMode}
                    onChange={toggleSkippedWordsMode}
                    label="Repeat skipped words"
                    disabled={false}
                  />
                </div>
              )}
            </div>
          )}

          {/* Congratulations Message */}
          {showCongratulations && (
            <div className="text-center">
              <p className="text-3xl mb-3">🎉</p>
              <p 
                className="text-xl font-bold text-primary mb-2"
                style={{ fontFamily: 'Quicksand' }}
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

      {/* Words Modal */}
      <WordsList
        words={modalType === 'learned' ? state.learnedWords : state.skippedWords}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'learned' ? 'My Learned Words' : 'My Skipped Words'}
        type={modalType}
      />
    </div>
  );
};
