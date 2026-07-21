// src/App.tsx
import React from 'react';
import { VocabularyApp } from './components/VocabularyApp';
import { useDictionaries } from './hooks/useDictionaries';
import { VoiceSelector } from './components/VoiceSelector';
import { WordsList } from './components/WordsList';
import { Select } from './components/Select';
import './index.css';

function App() {
  const {
    selectedDictionary,
    isLoading,
    switchDictionary,
    getCurrentDictionary,
    getDictionaryList,
    getAllWords,
  } = useDictionaries();

  const [key, setKey] = React.useState(0);

  const [showModal, setShowModal] = React.useState(false);
  const [showCurrentWordsModal, setShowCurrentWordsModal] = React.useState(false);
  const [showAllWordsModal, setShowAllWordsModal] = React.useState(false);

  const [modalType, setModalType] = React.useState<'learned' | 'skipped'>('learned');

  const [stats, setStats] = React.useState({
    learned: 0,
    skipped: 0,
  });

  const handleDictionaryChange = (newDict: string) => {
    switchDictionary(newDict);
    setStats({ learned: 0, skipped: 0 });
    setKey(prev => prev + 1);
  };

  const handlePrevDictionary = () => {
    const list = getDictionaryList();
    const idx = list.indexOf(selectedDictionary);
    if (idx > 0) {
      handleDictionaryChange(list[idx - 1]);
    }
  };

  const handleNextDictionary = () => {
    const list = getDictionaryList();
    const idx = list.indexOf(selectedDictionary);
    if (idx < list.length - 1) {
      handleDictionaryChange(list[idx + 1]);
    }
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
    setStats({
      learned,
      skipped,
    });
  };

  const handleResetVocabulary = () => {
    const currentWords = getCurrentDictionary();

    if (currentWords.length > 0) {
      const storageKey = `vocabulary_data_${currentWords
        .map(w => w.id)
        .sort()
        .join('|')}`;

      localStorage.removeItem(storageKey);
    }

    setStats({
      learned: 0,
      skipped: 0,
    });

    setKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-4">📚</p>
          <p className="text-lg text-on-surface-variant">
            Завантаження словників...
          </p>
        </div>
      </div>
    );
  }

  const currentWords = getCurrentDictionary();
  const allWords = getAllWords();
  const dictionaryList = getDictionaryList();

  const commitShort = __COMMIT_SHA__ !== 'dev' ? __COMMIT_SHA__.slice(0, 7) : 'dev';
  const versionLabel = `v.${commitShort}`;

  return (
    <div className="App">
      <header
        className="
          relative
          z-50
          bg-surface-container-low
          px-3
          py-0
          shadow-soft
          border-b border-outline/10
        "
      >
        <div
          className="
            max-w-[1400px]
            mx-auto
            flex
            flex-col
            lg:grid
            lg:grid-cols-3
            items-center
            gap-3
            lg:gap-0
            py-3
            lg:py-0
            lg:h-14
          "
        >
          {/* LEFT */}
          <div className="flex flex-col lg:flex-row items-center lg:flex-nowrap justify-center lg:justify-start gap-2">
            <Select
              value={selectedDictionary}
              onChange={handleDictionaryChange}
              options={dictionaryList.map(d => ({ value: d, label: d }))}
              className="lg:w-[180px]"
            />

            <div className="flex flex-row gap-2">
              <button
                onClick={() => setShowCurrentWordsModal(true)}
                className="
                  h-12
                  lg:h-10
                  px-4
                  rounded-lg
                  bg-secondary-fixed
                  text-black
                  font-bold
                  transition-all
                  active:bg-secondary-fixed-dim
                  focus-visible:bg-secondary-fixed-dim
                  hover:bg-secondary-fixed-dim
                  whitespace-nowrap
                  border border-outline/30
                  shadow-sm hover:shadow-md active:shadow-none
                "
              >
                Current words
              </button>

              <button
                onClick={() => setShowAllWordsModal(true)}
                className="
                  h-12
                  lg:h-10
                  px-4
                  rounded-lg
                  bg-secondary-fixed
                  text-black
                  font-bold
                  transition-all
                  active:bg-secondary-fixed-dim
                  focus-visible:bg-secondary-fixed-dim
                  hover:bg-secondary-fixed-dim
                  whitespace-nowrap
                  border border-outline/30
                  shadow-sm hover:shadow-md active:shadow-none
                "
              >
                All words
              </button>
            </div>
          </div>

          {/* CENTER */}
          <div className="hidden lg:flex justify-center">
            <VoiceSelector />
          </div>

          {/* RIGHT */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-end gap-2">
            <button
              onClick={handleLearnedClick}
              className="
                h-12
                lg:h-10
                px-4
                min-w-0
                lg:min-w-[120px]
                rounded-lg
                bg-primary
                text-white
                font-bold
                whitespace-nowrap
                active:bg-primary-container
                focus-visible:bg-primary-container
                border border-primary/30
                shadow-sm hover:shadow-md active:shadow-none
                transition-all
              "
            >
              Learned {stats.learned}
            </button>

            <button
              onClick={handleSkippedClick}
              className="
                h-12
                lg:h-10
                px-4
                min-w-0
                lg:min-w-[120px]
                rounded-lg
                bg-secondary-fixed
                text-black
                font-bold
                whitespace-nowrap
                active:bg-secondary-fixed-dim
                focus-visible:bg-secondary-fixed-dim
                hover:bg-secondary-fixed-dim
                border border-outline/30
                shadow-sm hover:shadow-md active:shadow-none
                transition-all
              "
            >
              Skipped {stats.skipped}
            </button>

            <button
              onClick={handleResetVocabulary}
              className="
                h-12
                lg:h-10
                px-3
                rounded-lg
                bg-secondary-fixed/20
                active:bg-secondary-fixed/40
                focus-visible:bg-secondary-fixed/40
                text-on-surface
                font-medium
                border border-outline/20
                shadow-sm hover:shadow-md active:shadow-none
                transition-all
              "
            >
              Reset
            </button>
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
          showModal={showModal}
          setShowModal={setShowModal}
          modalType={modalType}
          resetVocabularyCallback={handleResetVocabulary}
          dictionaryList={dictionaryList}
          selectedDictionary={selectedDictionary}
          onPrevDictionary={handlePrevDictionary}
          onNextDictionary={handleNextDictionary}
        />
      )}

      {/* CURRENT DICTIONARY WORDS MODAL */}
      <WordsList
        words={currentWords}
        isOpen={showCurrentWordsModal}
        onClose={() => setShowCurrentWordsModal(false)}
        title="Current Words"
        type="all"
        onPrevDictionary={handlePrevDictionary}
        onNextDictionary={handleNextDictionary}
        hasPrev={dictionaryList.indexOf(selectedDictionary) > 0}
        hasNext={dictionaryList.indexOf(selectedDictionary) < dictionaryList.length - 1}
      />

      {/* ALL VOCABULARIES WORDS MODAL */}
      <WordsList
        words={allWords}
        isOpen={showAllWordsModal}
        onClose={() => setShowAllWordsModal(false)}
        title="All Words"
        type="all"
      />

      {/* --- Version badge (app-level, bottom-right) --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-3 right-3 z-[1000] rounded px-2 py-1 text-xs bg-surface-container-high/80 text-on-surface-variant border border-outline/50 shadow-sm"
        style={{ backdropFilter: 'blur(4px)', bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {versionLabel}
      </div>
    </div>
  );
}

export default App;