import React, { useState, useEffect } from 'react';
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
  // Learned -> primary style (white text on primary background)
  // Skipped -> secondary/tertiary style (white text on secondary background)
  const headerBg = isLearned ? 'bg-primary' : 'bg-secondary-fixed';
  const headerBorder = isLearned ? 'border-primary' : 'border-secondary-fixed-dim';
  const badgeBg = isLearned ? 'bg-success/30' : 'bg-tertiary-fixed/20';
  const badgeBorder = isLearned ? 'border-success/40' : 'border-tertiary-fixed-dim';
  const titleTextClass = isLearned ? 'text-on-primary' : 'text-on-surface';
  const badgeTextClass = isLearned ? 'text-on-primary' : 'text-on-surface';
  const icon = isLearned ? '✓' : '⏩';

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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-gutter"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-soft-lg animate-slide-up">
        {/* Header */}
        <div className={`${headerBg} p-6 flex items-center justify-between border-b-2 ${headerBorder}`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${isLearned ? 'text-on-primary' : 'text-on-surface'}`}>{icon}</span>
            <div>
              <h2
                className={`text-lg font-bold ${titleTextClass}`}
                style={{ fontFamily: 'Quicksand' }}
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
          <input
            type="text"
            placeholder="Search in English or Ukrainian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg
              bg-surface text-on-surface
              border-2 border-outline
              placeholder:text-on-surface-variant
              focus:outline-none focus:border-primary
              transition-colors
            "
            style={{ fontFamily: 'Quicksand' }}
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {filteredWords.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-on-surface-variant text-lg">
                {searchQuery
                  ? 'No words found matching your search'
                  : `No ${type === 'learned' ? 'learned' : 'skipped'} words yet! 🎉`
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
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-on-surface font-bold text-lg flex-1">
                        {hasEmoji && `${(word as any).emoji} `}{word.ukrainian}
                      </p>
                      <p className="text-on-surface font-bold text-lg flex-1 text-right">
                        {word.english}
                      </p>
                    </div>

                    {/* Tooltip: shown on hover and focus */}
                    {hasTooltip && (
                      <div
                        className="
                          hidden group-hover:block group-focus:block
                          absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-[320px]
                          bg-surface-container-lowest text-on-surface border border-outline rounded-md p-3
                          shadow-lg z-50 whitespace-normal text-sm
                        "
                        role="tooltip"
                      >
                        {alternatives && alternatives.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-bold">Alternatives</div>
                            <div className="text-xs mt-1">{alternatives.join(', ')}</div>
                          </div>
                        )}

                        {phrases && phrases.length > 0 && (
                          <div>
                            <div className="text-xs font-bold">Phrases</div>
                            <div className="text-xs mt-1 space-y-1">
                              {phrases.map((p: string, i: number) => (
                                <div key={i}>• {p}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
            style={{ fontFamily: 'Quicksand' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
