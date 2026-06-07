import React, { useState } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { Word } from '../types/vocabulary';
import { WordCard } from './WordCard';
import { InputField } from './InputField';
import { Button } from './Button';
import { Stats } from './Stats';
import { SuccessNotification } from './SuccessNotification';
import { WordsList } from './WordsList';
import { Toggle } from './Toggle';

interface VocabularyAppProps {
  words: Word[];
}

export const VocabularyApp: React.FC<VocabularyAppProps> = ({ words }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'learned' | 'skipped'>('learned');

  const {
    state,
    checkAnswer,
    skipWord,
    toggleSkippedWordsMode,
    updateInput,
    getStats,
  } = useVocabulary(words);

  const stats = getStats();

  const handleSubmit = () => {
    checkAnswer(state.userInput);
  };

  const isGameOver = 
    !state.currentWord && 
    state.availableWords.length === 0 && 
    state.skippedWords.length === 0;

  const canToggleSkippedMode = state.skippedWords.length > 0;

  const handleLearnedClick = () => {
    setModalType('learned');
    setShowModal(true);
  };

  const handleSkippedClick = () => {
    setModalType('skipped');
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Success Notification - у верхній частині */}
      <SuccessNotification show={state.showSuccess} />
      
      {/* Header */}
      <header className="bg-surface-container-low p-4 shadow-soft flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-end justify-end">
          <Stats 
            learned={stats.learned}
            skipped={stats.skipped}
            onLearnedClick={handleLearnedClick}
            onSkippedClick={handleSkippedClick}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-gutter py-3 flex flex-col justify-center">
        <div className="space-y-3">
          {/* Word Card */}
          <WordCard word={state.currentWord} />

          {/* Input and Controls */}
          {!isGameOver && state.currentWord && (
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
                  ⏩ Skip
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

          {/* Game Over Message */}
          {isGameOver && (
            <div className="text-center">
              <p className="text-3xl mb-3">🎉</p>
              <p 
                className="text-xl font-bold text-primary mb-2"
                style={{ fontFamily: 'Quicksand' }}
              >
                Congratulations!
              </p>
              <p className="text-on-surface-variant text-sm">
                You learned all {stats.learned} words!
              </p>
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
