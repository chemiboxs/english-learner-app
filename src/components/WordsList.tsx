import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Word } from '../types/vocabulary';
import { selectRandomPhrases } from '../utils/phraseSelector';
import useSpeech from '../hooks/useSpeech';

interface WordsListProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type?: 'learned' | 'skipped';
}

interface TooltipState {
  rect: DOMRect;
  word: Word;
}

interface ComputedTooltipPosition {
  left: number;
  top: number;
  maxHeight?: number;
  placement: 'top' | 'bottom';
}

export const WordsList: React.FC<WordsListProps> = ({
  words,
  isOpen,
  onClose,
  title = 'Words',
  type = 'skipped',
}) => {
  const { speak, cancel } = useSpeech();
  const [searchQuery, setSearchQuery] = useState('');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (isOpen) {
    setSearchQuery('');
  }
}, [isOpen, type]);

  // Tooltip state (word + rect)
  const [tooltipTarget, setTooltipTarget] = useState<TooltipState | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<ComputedTooltipPosition | null>(null);
  const [tooltipMeasured, setTooltipMeasured] = useState(false);

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

  //
  // Tooltip rendering fix:
  // The previous implementation returned null until tooltipPosition existed.
  // This caused a render loop because tooltipPosition could only be calculated
  // after the tooltip DOM element existed.
  //
  // New flow:
  // 1. Render tooltip invisibly with a fallback position.
  // 2. Measure real tooltip dimensions using tooltipRef.
  // 3. Calculate the correct viewport-aware position.
  // 4. Re-render tooltip in the final position.
  //

  // Calculate tooltip position with intelligent viewport awareness
  const calculateTooltipPosition = (
    triggerRect: DOMRect,
    tooltipRect: DOMRect
  ): ComputedTooltipPosition => {
    const GAP = 8;
    const PADDING = 16;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available vertical space
    const spaceBelow = viewportHeight - triggerRect.bottom - GAP;
    const spaceAbove = triggerRect.top - GAP;

    const fitsBelow = tooltipRect.height <= spaceBelow;
    const fitsAbove = tooltipRect.height <= spaceAbove;

    let placement: 'top' | 'bottom';

    if (fitsBelow) {
      placement = 'bottom';
    } else if (fitsAbove) {
      placement = 'top';
    } else {
      // Use the side with more available space
      placement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }

    let maxHeight: number | undefined;

    // Enable scrolling only when the tooltip cannot fit naturally
    if (!fitsBelow && !fitsAbove) {
      maxHeight = Math.max(
        150,
        placement === 'bottom' ? spaceBelow - PADDING : spaceAbove - PADDING
      );
    }

    const tooltipHeight = maxHeight ?? tooltipRect.height;

    let top =
      placement === 'bottom'
        ? triggerRect.bottom + GAP
        : triggerRect.top - tooltipHeight - GAP;

    // Keep tooltip inside viewport vertically
    if (top < PADDING) {
      top = PADDING;
    }

    if (top + tooltipHeight > viewportHeight - PADDING) {
      top = viewportHeight - tooltipHeight - PADDING;
    }

    // Horizontal positioning
    let left = triggerRect.left + triggerRect.width / 2;

    const halfWidth = tooltipRect.width / 2;

    if (left - halfWidth < PADDING) {
      left = halfWidth + PADDING;
    }

    if (left + halfWidth > viewportWidth - PADDING) {
      left = viewportWidth - halfWidth - PADDING;
    }

    return {
      left,
      top,
      maxHeight,
      placement,
    };
  };

  // Measure tooltip and compute position after it renders
  useEffect(() => {
    if (!tooltipTarget) {
      setTooltipPosition(null);
      setTooltipMeasured(false);
      return;
    }

    // Wait until tooltip is mounted in DOM before measuring
    requestAnimationFrame(() => {
      if (!tooltipRef.current) {
        return;
      }

      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const position = calculateTooltipPosition(tooltipTarget.rect, tooltipRect);

      setTooltipPosition(position);
      setTooltipMeasured(true);
    });
  }, [tooltipTarget]);

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

  // Handlers to show/hide tooltip based on the info icon element
  const showTooltipForIcon = (iconEl: HTMLElement | null, word: Word | null) => {
    if (iconEl && word) {
      const rect = iconEl.getBoundingClientRect();
      setTooltipTarget({ rect, word });
    } else {
      setTooltipTarget(null);
      setTooltipPosition(null);
      setTooltipMeasured(false);
    }
  };

  // Portal tooltip rendering
  const renderTooltipPortal = () => {
    if (!tooltipTarget) {
      return null;
    }

    const { word, rect } = tooltipTarget;

    // Use fallback position during first render
    const left = tooltipPosition?.left ?? rect.left + rect.width / 2;
    const top = tooltipPosition?.top ?? rect.bottom + 8;
    const maxHeight = tooltipPosition?.maxHeight;

    const alternatives = (word as any).alternatives || [];
    const phrases = (word as any).phrases || [];

    const displayPhrases = selectRandomPhrases(phrases, 6);

    const tooltip = (
      <div
        ref={tooltipRef}
        role="tooltip"
        style={{
          position: 'fixed',
          left,
          top,
          transform: 'translateX(-50%)',
          width: 468,
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 99999,
          pointerEvents: 'auto',
          // Hide tooltip only during the measuring phase
          // to prevent visual jump
          visibility: tooltipMeasured ? 'visible' : 'hidden',
        }}
        className="
          bg-surface-container-lowest
          text-on-surface
          border
          border-outline
          rounded-md
          shadow-lg
          overflow-hidden
        "
        onMouseEnter={() => {
          // Keep tooltip visible while hovering inside it
        }}
        onMouseLeave={() => {
          // Hide tooltip after leaving tooltip area
          setTooltipTarget(null);
          setTooltipPosition(null);
          setTooltipMeasured(false);
        }}
      >
        <div
          style={
            maxHeight
              ? {
                  maxHeight,
                  overflowY: 'auto',
                }
              : undefined
          }
          className="
            p-3
            whitespace-normal
            text-lg
          "
        >
          {alternatives && alternatives.length > 0 && (
            <div className="mb-2">
              <div className="text-lg font-bold">Alternatives</div>

              <div className="text-lg mt-1">{alternatives.join(', ')}</div>
            </div>
          )}

          {displayPhrases && displayPhrases.length > 0 && (
            <div>
              <div className="text-lg font-bold">Phrases</div>

              <div className="text-lg mt-1 space-y-1">
                {displayPhrases.map((p: string, i: number) => (
                  <div key={i}>• {p}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return typeof document !== 'undefined' ? createPortal(tooltip, document.body) : null;
  };

  const pronounceWord = (word: string) => {
    speak(word, { lang: 'en-US', rate: 0.9 });
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
                    onFocus={() => {
                      // Focus on row but don't show tooltip
                    }}
                    onBlur={() => {
                      // Blur on row
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-on-surface font-bold text-lg flex-1">
                        {hasEmoji && `${(word as any).emoji} `}{word.ukrainian}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="text-on-surface font-bold text-lg w-24">
                          {word.english}
                        </p>
                        {hasTooltip && (
                          <InfoButton
                            word={word}
                            onHover={(el) => showTooltipForIcon(el, word)}
                            onLeave={() => showTooltipForIcon(null, null)}
                          />
                        )}
                        <PlayButton
                          word={word.english}
                          onSpeak={() => pronounceWord(word.english)}
                          onStop={cancel}
                        />
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

interface InfoButtonProps {
  word: Word;
  onHover: (el: HTMLElement | null) => void;
  onLeave: () => void;
}

const InfoButton: React.FC<InfoButtonProps> = ({ word, onHover, onLeave }) => {
  const [hover, setHover] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const hoverBg = 'var(--surface-container-high, rgba(0,0,0,0.06))';
  const hoverColor = 'var(--on-surface, inherit)';

  return (
    <button
      ref={infoButtonRef}
      className="
        w-6
        h-6
        p-0
        rounded-full
        bg-transparent
        text-on-surface
        border border-outline
        transition-colors
        flex items-center justify-center
        flex-shrink-0
        hover:border-on-surface
      "
      aria-label={`Info about: ${word.english}`}
      onMouseEnter={() => {
        setHover(true);
        if (infoButtonRef.current) {
          onHover(infoButtonRef.current);
        }
      }}
      onMouseLeave={() => {
        setHover(false);
        onLeave();
      }}
      onFocus={() => {
        if (infoButtonRef.current) {
          onHover(infoButtonRef.current);
        }
      }}
      onBlur={() => {
        onLeave();
      }}
      style={
        hover
          ? { backgroundColor: hoverBg, color: hoverColor }
          : { backgroundColor: 'transparent' }
      }
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        style={{ display: 'block' }}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 16v-4M12 8h0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};

interface PlayButtonProps {
  word: string;
  onSpeak: () => void;
  onStop: () => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ word, onSpeak, onStop }) => {
  const [hover, setHover] = useState(false);

  const hoverBg = 'var(--surface-container-high, rgba(0,0,0,0.06))';
  const hoverColor = 'var(--on-surface, inherit)';

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* PLAY */}
      <button
        onClick={onSpeak}
        className="
          w-6
          h-6
          p-0
          rounded-full
          bg-transparent
          text-on-surface
          border border-outline
          transition-colors
          flex items-center justify-center
          flex-shrink-0
          hover:border-on-surface
        "
        aria-label={`Pronounce: ${word}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={
          hover
            ? { backgroundColor: hoverBg, color: hoverColor }
            : { backgroundColor: 'transparent' }
        }
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          style={{ display: 'block' }}
        >
          <path
            d="M11 5L6 9H2v6h4l5 4V5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 8a5 5 0 010 8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* STOP */}
      <button
        onClick={onStop}
        className="
          w-6
          h-6
          p-0
          rounded-full
          bg-transparent
          text-on-surface
          border border-outline
          flex items-center justify-center
          flex-shrink-0
          transition-colors
          hover:border-on-surface
        "
        aria-label="Stop pronunciation"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="6"
            y="6"
            width="12"
            height="12"
            rx="1"
          />
        </svg>
      </button>
    </div>
  );
};
