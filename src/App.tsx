import React, { useState } from 'react';
import { VocabularyApp } from './components/VocabularyApp';
import { DictionarySelector } from './components/DictionarySelector';
import { useDictionaries } from './hooks/useDictionaries';
import './index.css';

function App() {
  const { selectedDictionary, isLoading, switchDictionary, getCurrentDictionary, getDictionaryList } = useDictionaries();
  const [key, setKey] = useState(0);

  const handleDictionaryChange = (newDict: string) => {
    switchDictionary(newDict);
    // Перезавантажуємо VocabularyApp компонент
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
      {dictionaryList.length > 1 && (
        <DictionarySelector
          dictionaries={dictionaryList}
          selectedDictionary={selectedDictionary}
          onSelect={handleDictionaryChange}
        />
      )}
      {currentWords.length > 0 && (
        <VocabularyApp key={key} words={currentWords} />
      )}
    </div>
  );
}

export default App;
