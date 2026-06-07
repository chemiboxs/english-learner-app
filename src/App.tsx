import React from 'react';
import { VocabularyApp } from './components/VocabularyApp';
import { useDictionaries } from './hooks/useDictionaries';
import { VoiceSelector } from './components/VoiceSelector';
import { WordsList } from './components/WordsList';

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
        "
      >

        <div
          className="
            max-w-[1400px]
            mx-auto
            grid
            grid-cols-3
            items-center
            h-12
          "
        >


          {/* LEFT */}
          <div className="flex items-center h-10 gap-2">

            <select
              value={selectedDictionary}
              onChange={(e) => handleDictionaryChange(e.target.value)}
              className="
                h-10
                w-[180px]
                px-3
                rounded-lg
                bg-surface-container
                text-on-surface
                border
                border-outline
                text-sm
                font-medium
              "
            >
              {dictionaryList.map(dict => (
                <option key={dict} value={dict}>
                  {dict}
                </option>
              ))}
            </select>


            <button
              onClick={() => setShowCurrentWordsModal(true)}
              className="
                h-10
                px-4
                rounded-lg
                bg-secondary-fixed
                text-black
                border border-black
                font-bold
                transition-all
                hover:bg-secondary-fixed-dim
                whitespace-nowrap
              "
            >
              Current words
            </button>

            <button
              onClick={() => setShowAllWordsModal(true)}
              className="
                h-10
                px-4
                rounded-lg
                bg-secondary-fixed
                text-black
                border border-black
                font-bold
                transition-all
                hover:bg-secondary-fixed-dim
                whitespace-nowrap
              "
            >
              All words
            </button>

          </div>



          {/* CENTER */}
          <div className="flex justify-center">

            <VoiceSelector />

          </div>



          {/* RIGHT */}
          <div className="flex items-center justify-end gap-2 h-10">


            <button
              onClick={handleLearnedClick}
              className="
                h-10
                px-4
                min-w-[120px]
                rounded-lg
                bg-primary
                text-white
                border
                border-black
                font-bold
                whitespace-nowrap
              "
            >
              Learned {stats.learned}
            </button>


            <button
              onClick={handleSkippedClick}
              className="
                h-10
                px-4
                min-w-[120px]
                rounded-lg
                bg-secondary-fixed
                text-black
                border
                border-black
                font-bold
                whitespace-nowrap
              "
            >
              Skipped {stats.skipped}
            </button>


            <button
              onClick={handleResetVocabulary}
              className="
                h-10
                px-3
                rounded-lg
                bg-secondary-fixed/20
                border
                border-black
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
          setModalType={setModalType}
          resetVocabularyCallback={handleResetVocabulary}
        />

      )}



      {/* CURRENT DICTIONARY WORDS MODAL */}
      <WordsList
        words={currentWords}
        isOpen={showCurrentWordsModal}
        onClose={() => setShowCurrentWordsModal(false)}
        title="Current Words"
        type="all"
      />

      {/* ALL VOCABULARIES WORDS MODAL */}
      <WordsList
        words={allWords}
        isOpen={showAllWordsModal}
        onClose={() => setShowAllWordsModal(false)}
        title="All Words"
        type="all"
      />


    </div>
  );
}

export default App;
