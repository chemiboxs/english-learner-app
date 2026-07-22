import React from 'react';
import { VocabularyApp } from './components/VocabularyApp';
import { IrregularVerbApp } from './components/IrregularVerbApp';
import { useDictionaries } from './hooks/useDictionaries';
import { IrregularVerb } from './types/vocabulary';
import { VoiceSelector } from './components/VoiceSelector';
import { WordsList } from './components/WordsList';
import { Select } from './components/Select';
import './index.css';

type Mode = 'words' | 'phrases' | 'irregular';

function App() {
  const {
    selectedDictionary,
    isLoading,
    mode,
    switchMode,
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

  const handleModeChange = (newMode: string) => {
    switchMode(newMode as Mode);
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
      const idHash = currentWords
        .map((w: { id: string }) => w.id)
        .sort()
        .join('|');

      localStorage.removeItem(`vocabulary_data_${idHash}`);
      localStorage.removeItem(`irrverb_data_${idHash}`);
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

  const isIrregular = mode === 'irregular';
  const currentWords = getCurrentDictionary();
  const allWords = getAllWords();
  const dictionaryList = getDictionaryList();

const commitShort = __COMMIT_SHA__ !== 'dev' ? __COMMIT_SHA__.slice(0, 7) : 'dev';
const versionLabel = `v.${commitShort}`;

const displayName = (name: string) => {
  let idx = name.indexOf('.phrases');
  if (idx !== -1) return name.slice(0, idx);
  idx = name.indexOf('.irreg');
  if (idx !== -1) return name.slice(0, idx);
  return name;
};

const currentLabel = isIrregular ? 'Current verbs' : mode === 'words' ? 'Current words' : 'Current phrases';
const allLabel = isIrregular ? 'All verbs' : mode === 'words' ? 'All words' : 'All phrases';
const titleLabel = isIrregular ? 'Verbs' : mode === 'words' ? 'Words' : 'Phrases';

const formatVerb = (v: IrregularVerb) => {
  const base = v.base || '';
  const past = v.past || '';
  const participle = v.participle || '';
  const examples = v.examples;
  const allPhrases: string[] = [];
  if (examples) {
    if (examples.base) allPhrases.push(...examples.base);
    if (examples.past) allPhrases.push(...examples.past);
    if (examples.participle) allPhrases.push(...examples.participle);
  }
  return {
    id: v.id,
    ukrainian: v.ukrainian,
    english: `${base} / ${past} / ${participle}`,
    phrases: allPhrases,
  };
};

const currentDisplayWords = isIrregular
  ? (currentWords as unknown as IrregularVerb[]).map(formatVerb)
  : currentWords;

const allDisplayWords = isIrregular
  ? (allWords as unknown as IrregularVerb[]).map(formatVerb)
  : allWords;

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
              value={mode}
              onChange={handleModeChange}
              options={[
                { value: 'words', label: 'Words' },
                { value: 'phrases', label: 'Phrases' },
                { value: 'irregular', label: 'Irregular' },
              ]}
              className="lg:w-[120px]"
            />

            <Select
              value={selectedDictionary}
              onChange={handleDictionaryChange}
              options={dictionaryList.map(d => ({ value: d, label: displayName(d) }))}
              className="lg:w-[180px]"
            />

            <div className="flex flex-row gap-2 relative z-10">
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
                {currentLabel}
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
                {allLabel}
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

      {currentWords.length > 0 && !isIrregular && (
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

      {currentWords.length > 0 && isIrregular && (
        <IrregularVerbApp
          key={key}
          verbs={currentWords as unknown as IrregularVerb[]}
          learnedVerbs={[]}
          skippedVerbs={[]}
          onStatsUpdate={handleStatsUpdate}
          showModal={showModal}
          setShowModal={setShowModal}
          modalType={modalType}
          resetVerbsCallback={handleResetVocabulary}
          dictionaryList={dictionaryList}
          selectedDictionary={selectedDictionary}
          onPrevDictionary={handlePrevDictionary}
          onNextDictionary={handleNextDictionary}
        />
      )}

      {/* CURRENT DICTIONARY WORDS MODAL */}
      <WordsList
        words={currentDisplayWords}
        isOpen={showCurrentWordsModal}
        onClose={() => setShowCurrentWordsModal(false)}
        title={`Current ${titleLabel}`}
        type="all"
        onPrevDictionary={handlePrevDictionary}
        onNextDictionary={handleNextDictionary}
        hasPrev={dictionaryList.indexOf(selectedDictionary) > 0}
        hasNext={dictionaryList.indexOf(selectedDictionary) < dictionaryList.length - 1}
      />

      {/* ALL VOCABULARIES WORDS MODAL */}
      <WordsList
        words={allDisplayWords}
        isOpen={showAllWordsModal}
        onClose={() => setShowAllWordsModal(false)}
        title={`All ${titleLabel}`}
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
