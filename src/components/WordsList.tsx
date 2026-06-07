import React from 'react';
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
  if (!isOpen) return null;

  const bgColor = type === 'learned' ? 'bg-success/20 border-success' : 'bg-tertiary-fixed/30 border-tertiary-fixed-dim';
  const headerBg = type === 'learned' ? 'bg-success/30' : 'bg-tertiary-fixed/20';
  const icon = type === 'learned' ? '✓' : '⏩';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-gutter">
      <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-soft-lg animate-slide-up">
        {/* Header */}
        <div className={`${headerBg} p-6 flex items-center justify-between border-b-2 ${type === 'learned' ? 'border-success' : 'border-tertiary-fixed-dim'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h2 
                className="text-lg font-bold text-on-surface"
                style={{ fontFamily: 'Quicksand' }}
              >
                {title}
              </h2>
            </div>
          </div>
          <span className={`${bgColor} px-3 py-1 rounded-full text-sm font-bold text-on-surface`}>
            {words.length} words
          </span>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {words.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-on-surface-variant text-lg">
                No {type === 'learned' ? 'learned' : 'skipped'} words yet! 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {words.map((word) => {
                const hasEmoji = word.emoji && word.emoji.trim() !== '';
                return (
                  <div 
                    key={word.id} 
                    className="p-4 hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-on-surface-variant text-xs mb-1">Ukrainian</p>
                        <p className="text-on-surface font-bold text-lg">
                          {hasEmoji && `${word.emoji} `}{word.ukrainian}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-on-surface-variant text-xs mb-1">English</p>
                        <p className="text-on-surface font-bold text-lg">
                          {word.english}
                        </p>
                      </div>
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
            style={{ fontFamily: 'Quicksand' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
