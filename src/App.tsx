import React from 'react';
import { VocabularyApp } from './components/VocabularyApp';
import { useDictionaries } from './hooks/useDictionaries';
import { Button } from './components/Button';
import './index.css';

function App() {
  const { selectedDictionary, isLoading, switchDictionary, getCurrentDictionary, getDictionaryList } = useDictionaries();
  const [key, setKey] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'learned' | 'skipped'>('learned');
  const [stats, setStats] = React.useState({ learned: 0, skipped: 0 });

  const handleDictionaryChange = (newDict: string) => {
    switchDictionary(newDict);
    setKey(prev => prev + 1);
  };

  const handleLearnedClick = () => {
    setModalType('learned');
    setShowModal(true);
  };

  const handleSkippedClick = () => {
    setModalType('skipped');
    setShowModal(true);
  };

  const handleStatsUpdate = (learned: number, skipped: number) => {
    setStats({ learned, skipped });
  };

const handleResetVocabulary = () => {
  setStats({ learned: 0, skipped: 0 });
  setKey(prev => prev + 1);
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-4">📚</p>
          <p className="text-lg text-on-surface-variant" style={{ fontFamily: 'Quicksand' }}>
            Завантаження словників...
          </p>
        </div>
      </div>
    );
  }

  const currentWords = getCurrentDictionary();
  const dictionaryList = getDictionaryList();

  return (
    <div className="App">
      {/* Header з селектором словників і статистикою */}
      <header className="bg-surface-container-low p-4 shadow-soft flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Dictionary Selector */}
            {dictionaryList.length > 1 && (
              <div>
                <label 
                  className="text-sm font-medium text-on-surface-variant block mb-2"
                  style={{ fontFamily: 'Quicksand' }}
                >
                  Choose dictionary:
                </label>
                <div className="flex flex-wrap gap-2">
                  {dictionaryList.map((dict) => (
                    <button
                      key={dict}
                      onClick={() => handleDictionaryChange(dict)}
                      className={`
                        px-3 py-1 rounded-lg text-sm font-medium transition-all
                        ${selectedDictionary === dict
                          ? 'bg-primary text-on-primary shadow-soft'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }
                      `}
                      style={{ fontFamily: 'Quicksand' }}
                    >
                      {dict}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Stats Buttons */}
            <div className="flex gap-3 justify-end items-center flex-wrap">
              <button
                onClick={handleLearnedClick}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full
                  bg-success/20 border-2 border-success
                  hover:bg-success/30 transition-colors
                  cursor-pointer
                "
              >
                <span className="text-lg">✓</span>
                <span className="text-on-surface font-bold">
                  Learned: {stats.learned}
                </span>
              </button>

              <button
                onClick={handleSkippedClick}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full
                  bg-tertiary-fixed/30 border-2 border-tertiary-fixed-dim
                  hover:bg-tertiary-fixed/50 transition-colors
                  cursor-pointer
                "
              >
                <span className="text-lg">⏩</span>
                <span className="text-on-surface font-bold">
                  Skipped: {stats.skipped}
                </span>
              </button>

              <Button
                onClick={handleResetVocabulary}
                variant="secondary"
                size="sm"
              >
                🔄 Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

{currentWords.length > 0 && (
  <VocabularyApp 
    key={key} 
    words={currentWords}
    learnedWords={[]}
    skippedWords={[]}
    onStatsUpdate={handleStatsUpdate}
    onLearnedClick={handleLearnedClick}
    onSkippedClick={handleSkippedClick}
    showModal={showModal}
    setShowModal={setShowModal}
    modalType={modalType}
    setModalType={setModalType}
    resetVocabularyCallback={handleResetVocabulary}
  />
)}
    </div>
  );
}

export default App;
