import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Word } from '../types/vocabulary';

interface WordsListProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type?: 'learned' | 'skipped';
}

export const WordsList: React.FC<WordsListProps> = ({
  words,
  isOpen,
  onClose,
  title = 'Words',
  type = 'skipped',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
  if (isOpen) {
    setSearchQuery('');
  }
}, [isOpen, type]);

  // Tooltip state (word + rect)
  const [tooltipTarget, setTooltipTarget] = useState<{
    rect: DOMRect;
    word: Word;
  } | null>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLearned = type === 'learned';

  // Match modal header and badge colors to the corresponding header buttons
  const headerBg = isLearned ? 'bg-primary' : 'bg-secondary-fixed';
  const headerBorder = isLearned ? 'border-primary' : 'border-secondary-fixed-dim';
  const badgeBg = isLearned ? 'bg-success/30' : 'bg-tertiary-fixed/20';
  const badgeBorder = isLearned ? 'border-success/40' : 'border-tertiary-fixed-dim';
  const titleTextClass = isLearned ? 'text-on-primary' : 'text-on-surface';
  const badgeTextClass = isLearned ? 'text-on-primary' : 'text-on-surface';

  // Filter words based on search query
  const filteredWords = words.filter((word) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      word.ukrainian.toLowerCase().includes(query) ||
      word.english.toLowerCase().includes(query)
    );
  });

  // Handle click outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handlers to show/hide tooltip based on the row element
  const showTooltipForRow = (rowEl: HTMLElement | null, word: Word | null) => {
    if (rowEl && word) {
      const rect = rowEl.getBoundingClientRect();
      setTooltipTarget({ rect, word });
    } else {
      setTooltipTarget(null);
    }
  };

  // Portal tooltip rendering
  const renderTooltipPortal = () => {
    if (!tooltipTarget) return null;
    const { rect, word } = tooltipTarget;
    const alternatives = (word as any).alternatives || [];
    const phrases = (word as any).phrases || [];

    const tooltipWidth = 360;
    const padding = 12;
    
    let left = rect.left + rect.width / 2;
    let top = rect.bottom + 8;
    
    // keep tooltip inside visible viewport
    if (left - tooltipWidth / 2 < padding) {
      left = tooltipWidth / 2 + padding;
    }
    
    if (left + tooltipWidth / 2 > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth / 2 - padding;
    }
    
    // if there is no space below, show above the row
    const estimatedHeight = 180;
    
    if (top + estimatedHeight > window.innerHeight - padding) {
      top = rect.top - estimatedHeight - 8;
    }

    const tooltip = (
      <div
        role="tooltip"
        style={{
          position: 'fixed',
          left,
          top,
          transform: 'translateX(-50%)',
          width: tooltipWidth,
          maxWidth: `calc(100vw - ${padding * 2}px)`,
          zIndex: 99999,
        }}
        className="bg-surface-container-lowest text-on-surface border border-outline rounded-md p-3 shadow-lg whitespace-normal text-lg"
      >
        {/* Use the same font family and size as the words list */}
        {alternatives && alternatives.length > 0 && (
          <div className="mb-2">
            <div className="text-lg font-bold">Alternatives</div>
            <div className="text-lg mt-1">{alternatives.join(', ')}</div>
          </div>
        )}

        {phrases && phrases.length > 0 && (
          <div>
            <div className="text-lg font-bold">Phrases</div>
            <div className="text-lg mt-1 space-y-1">
              {phrases.map((p: string, i: number) => (
                <div key={i}>• {p}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return typeof document !== 'undefined' ? createPortal(tooltip, document.body) : null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-gutter"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-soft-lg animate-slide-up">
        {/* Header */}
        <div className={`${headerBg} px-6 py-3 flex items-center justify-between border-b-2 ${headerBorder}`}>
          <div className="flex items-center gap-3">
            <div>
              <h2
                className={`text-lg font-bold ${titleTextClass}`}
              >
                {title}
              </h2>
            </div>
          </div>
          <span className={`${badgeBg} ${badgeBorder} px-3 py-1 rounded-full text-sm font-bold ${badgeTextClass}`}>
            {filteredWords.length}/{words.length}
          </span>
        </div>

{/* Search Field */}
<div className="px-6 py-4 border-b-2 border-outline-variant bg-surface-container">

  <div className="relative">

    <input
      type="text"
      placeholder="Search in English or Ukrainian..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="
        w-full
        px-4
        py-2
        pr-12
        rounded-lg
        bg-surface
        text-on-surface
        border-2
        border-outline
        placeholder:text-on-surface-variant
        focus:outline-none
        focus:border-primary
        transition-colors
      "
    />


    {searchQuery && (
      <button
        type="button"
        onClick={() => setSearchQuery('')}
        className="
          absolute
          right-2
          top-1/2
          -translate-y-1/2
          w-8
          h-8
          rounded-full
          flex
          items-center
          justify-center
          text-on-surface
          hover:bg-surface-container
          transition
          text-xl
          font-bold
        "
        aria-label="Clear search"
      >
        ×
      </button>
    )}

  </div>

</div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {filteredWords.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-on-surface-variant text-lg">
                {searchQuery
                  ? 'No words found matching your search'
                  : `No ${type === 'learned' ? 'learned' : 'skipped'} words yet!`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {filteredWords.map((word) => {
                const hasEmoji = (word as any).emoji && (word as any).emoji.trim() !== '';
                const alternatives = (word as any).alternatives || [];
                const phrases = (word as any).phrases || [];
                const hasTooltip = (alternatives && alternatives.length > 0) || (phrases && phrases.length > 0);

                return (
                  <div
                    key={word.id}
                    tabIndex={0}
                    className="p-4 hover:bg-surface-container transition-colors group relative"
                    onMouseEnter={(e) => showTooltipForRow(e.currentTarget as HTMLElement, hasTooltip ? word : null)}
                    onMouseLeave={() => showTooltipForRow(null, null)}
                    onFocus={(e) => showTooltipForRow(e.currentTarget as HTMLElement, hasTooltip ? word : null)}
                    onBlur={() => showTooltipForRow(null, null)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-on-surface font-bold text-lg flex-1">
                        {hasEmoji && `${(word as any).emoji} `}{word.ukrainian}
                      </p>
                      <p className="text-on-surface font-bold text-lg flex-1 text-right">
                        {word.english}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-container-high p-4 border-t-2 border-outline-variant">
          <button
            onClick={onClose}
            className="
              w-full px-4 py-3 rounded-base bg-primary text-on-primary font-bold
              hover:bg-primary-container transition-colors
              active:translate-y-0.5
            "
          >
            Close
          </button>
        </div>
      </div>

      {/* Tooltip portal rendered above everything */}
      {renderTooltipPortal()}
    </div>
  );
};
