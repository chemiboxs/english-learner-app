import React, { useState, useEffect } from 'react';
import { Word } from '../types/vocabulary';

interface SkippedWordsListProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const SkippedWordsList: React.FC<SkippedWordsListProps> = ({
  words,
  isOpen,
  onClose,
  title = 'Skipped Words',
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
        <div className="bg-primary-fixed p-6 flex items-center justify-between border-b-2 border-primary">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h2 
                className="text-lg font-bold text-on-surface"
              >
                {title}
              </h2>
            </div>
          </div>
          <span className="bg-secondary-fixed px-3 py-1 rounded-full text-sm font-bold text-on-surface">
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
                  : 'No skipped words yet! 🎉'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
{filteredWords.map((word) => (
  <div 
    key={word.id} 
    className="p-4 hover:bg-surface-container transition-colors"
  >
    <div className="flex items-start justify-between gap-4">
      <p className="text-on-surface font-bold text-lg flex-1">
        {word.emoji ? `${word.emoji} ` : ''}{word.ukrainian}
      </p>
      <p className="text-on-surface font-bold text-lg flex-1 text-left">
        {word.english}
      </p>
    </div>
  </div>
))}
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
