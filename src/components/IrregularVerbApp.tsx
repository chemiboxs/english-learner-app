import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { IrregularVerb } from '../types/vocabulary';
import { useIrregularVerbs } from '../hooks/useIrregularVerbs';
import { IrregularVerbCard } from './IrregularVerbCard';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { WordsList } from './WordsList';

interface IrregularVerbAppProps {
  verbs: IrregularVerb[];
  learnedVerbs: IrregularVerb[];
  skippedVerbs: IrregularVerb[];
  onStatsUpdate: (learned: number, skipped: number) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  modalType: 'learned' | 'skipped';
  resetVerbsCallback: () => void;
  dictionaryList: string[];
  selectedDictionary: string;
  onPrevDictionary: () => void;
  onNextDictionary: () => void;
}

const isFormCorrect = (input: string, correctValue: string): boolean => {
  const normalized = input.toLowerCase().trim();
  return correctValue.split('/').map(s => s.trim().toLowerCase()).some(a => normalized === a);
};

export const IrregularVerbApp: React.FC<IrregularVerbAppProps> = ({
  verbs,
  onStatsUpdate,
  showModal,
  setShowModal,
  modalType,
  resetVerbsCallback,
  dictionaryList,
  selectedDictionary,
  onPrevDictionary,
  onNextDictionary,
}) => {
  const {
    currentVerb,
    baseInput,
    pastInput,
    participleInput,
    setBaseInput,
    setPastInput,
    setParticipleInput,
    checkAnswer,
    skipVerb,
    toggleSkippedMode,
    useSkippedVerbsMode,
    resetVerbs,
    getStats,
    isCompleted,
    learnedVerbs,
    skippedVerbs,
  } = useIrregularVerbs(verbs);

  const fieldResults = useMemo(() => {
    if (!currentVerb) return { base: null, past: null, participle: null };
    return {
      base: isFormCorrect(baseInput, currentVerb.base),
      past: isFormCorrect(pastInput, currentVerb.past),
      participle: isFormCorrect(participleInput, currentVerb.participle),
    };
  }, [baseInput, pastInput, participleInput, currentVerb]);

  const handleCheck = useCallback(() => {
    checkAnswer();
  }, [checkAnswer]);

  const stats = getStats();

  const prevStatsRef = useRef({ learned: -1, skipped: -1 });

  useEffect(() => {
    if (
      stats.learned !== prevStatsRef.current.learned ||
      stats.skipped !== prevStatsRef.current.skipped
    ) {
      onStatsUpdate(stats.learned, stats.skipped);
      prevStatsRef.current = { learned: stats.learned, skipped: stats.skipped };
    }
  }, [stats.learned, stats.skipped, onStatsUpdate]);

  const handleReset = () => {
    resetVerbs();
    const verbIds = verbs.map(v => v.id).sort();
    localStorage.removeItem(`irrverb_data_${verbIds.join('|')}`);
    resetVerbsCallback();
    onStatsUpdate(0, 0);
  };

  const stars = Array.from({ length: stats.learned }, (_, i) => i);
  const leftStars = stars.slice(0, Math.ceil(stars.length / 2));
  const rightStars = stars.slice(Math.ceil(stars.length / 2));

  return (
    <div className="bg-surface flex flex-col">
      <main className="relative flex-1 w-full px-gutter py-3 flex flex-col">
        {!isCompleted && leftStars.length > 0 && (
          <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-[calc((100vw-1024px)/2)] min-w-[90px] flex-wrap justify-end gap-2 pr-4">
            {leftStars.map((_, index) => (
              <span key={index} className="text-2xl animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>⭐</span>
            ))}
          </div>
        )}

        {!isCompleted && rightStars.length > 0 && (
          <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-[calc((100vw-1024px)/2)] min-w-[90px] flex-wrap justify-start gap-2 pl-4">
            {rightStars.map((_, index) => (
              <span key={index} className="text-2xl animate-in fade-in duration-300" style={{ animationDelay: `${(index + leftStars.length) * 50}ms` }}>⭐</span>
            ))}
          </div>
        )}

        <div className="flex flex-col flex-1">
          {!isCompleted && (
            <div className="pt-2">
              <IrregularVerbCard
                verb={currentVerb}
                baseInput={baseInput}
                pastInput={pastInput}
                participleInput={participleInput}
                onBaseChange={setBaseInput}
                onPastChange={setPastInput}
                onParticipleChange={setParticipleInput}
                onCheck={handleCheck}
                fieldResults={fieldResults}
              />
            </div>
          )}

          {!isCompleted && currentVerb && (
            <div className="mt-4 mb-8 md:mb-12 space-y-2">
              <div className="w-full max-w-[1180px] mx-auto px-gutter flex items-center justify-center gap-3">
                <Button onClick={handleCheck} disabled={false} variant="primary" size="md">
                  Check
                </Button>
                <Button onClick={skipVerb} disabled={false} variant="secondary" size="md">
                  Skip
                </Button>
              </div>

              <div className="max-w-[1180px] mx-auto px-gutter flex flex-col md:flex-row justify-center gap-4 md:gap-8">
                <Toggle
                  enabled={useSkippedVerbsMode}
                  onChange={toggleSkippedMode}
                  label="Repeat skipped verbs"
                  disabled={false}
                />
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="text-center">
              <p className="text-3xl mb-3">🎉</p>
              <p className="text-xl font-bold text-primary mb-2">Congratulations!</p>
              <p className="text-on-surface-variant text-sm mb-6">
                You learned {stats.learned} verbs!
                {stats.skipped > 0 && ` (Skipped: ${stats.skipped})`}
              </p>
              <Button onClick={handleReset} variant="primary" size="md">Start Again</Button>
            </div>
          )}
        </div>
      </main>

      <WordsList
        words={(modalType === 'learned' ? learnedVerbs : skippedVerbs).map(v => {
          const allPhrases: string[] = [];
          if (v.examples) {
            if (v.examples.base) allPhrases.push(...v.examples.base);
            if (v.examples.past) allPhrases.push(...v.examples.past);
            if (v.examples.participle) allPhrases.push(...v.examples.participle);
          }
          return {
            id: v.id,
            ukrainian: v.ukrainian,
            english: `${v.base} / ${v.past} / ${v.participle}`,
            phrases: allPhrases,
          };
        })}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'learned' ? 'Learned Verbs' : 'Skipped Verbs'}
        type={modalType}
        onPrevDictionary={onPrevDictionary}
        onNextDictionary={onNextDictionary}
        hasPrev={dictionaryList.indexOf(selectedDictionary) > 0}
        hasNext={dictionaryList.indexOf(selectedDictionary) < dictionaryList.length - 1}
      />
    </div>
  );
};
