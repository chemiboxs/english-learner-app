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
  type?: 'learned' | 'skipped' | 'all';
}

interface TooltipState {
  triggerRect: DOMRect;
  rowRect: DOMRect;
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
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track hovered state flags (used for quick checks)
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);

  // Save a live reference to the current trigger element so we can
  // test containment when deciding to hide the tooltip.
  const tooltipTriggerElRef = useRef<HTMLElement | null>(null);

  // Track last pointer coords so we can query the element under the pointer
  // at the moment the hide timer fires (more robust than relying only on state).
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, type]);

  // Tooltip state (word + trigger + row rects)
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

  // Ensure tooltip state is cleared when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // Reset tooltip and hover flags so reopening starts fresh
      setTooltipTarget(null);
      setTooltipPosition(null);
      setTooltipMeasured(false);
      setIsTriggerHovered(false);
      setIsTooltipHovered(false);
      tooltipTriggerElRef.current = null;
    }
  }, [isOpen]);

  // Capture pointer coordinates globally so the hide-timer can check
  // what element the pointer currently sits over.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      lastPointerRef.current = { x: t.clientX, y: t.clientY };
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Constants for tooltip sizing
  const TOOLTIP_MIN_WIDTH = Math.min(320, window.innerWidth - 32);

  // Calculate tooltip position with intelligent viewport awareness
  const calculateTooltipPosition = (
    triggerRect: DOMRect,
    rowRect: DOMRect,
    tooltipRect: DOMRect
  ): ComputedTooltipPosition => {
    const GAP = 8;
    const PADDING = 16; // keep some space from viewport edges

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available vertical space (respect top/bottom padding)
    const availableBelow = viewportHeight - PADDING - triggerRect.bottom - GAP;
    const availableAbove = triggerRect.top - PADDING - GAP;

    // Determine if natural tooltip height fits without scrolling
    const fitsBelow = tooltipRect.height <= availableBelow;
    const fitsAbove = tooltipRect.height <= availableAbove;

    let placement: 'top' | 'bottom';

    if (fitsBelow) {
      placement = 'bottom';
    } else if (fitsAbove) {
      placement = 'top';
    } else {
      // Use the side with more available space
      placement = availableBelow >= availableAbove ? 'bottom' : 'top';
    }

    let maxHeight: number | undefined;

    // Enable scrolling only when the tooltip cannot fit naturally
    if (!fitsBelow && !fitsAbove) {
      const chosenAvailable = placement === 'bottom' ? availableBelow : availableAbove;
      // Ensure we leave some padding and set a reasonable minimum
      maxHeight = Math.max(150, chosenAvailable);
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

    // Horizontal positioning: align tooltip right edge before English word column
    // The right-side flex container has Play/Stop (6+6 + 2*gap) and Info (6 + gap)
    const rightSideWidth = 24 + 8 + 24 + 8 + 24; // info + gap + play + gap + stop + gaps
    const englishColumnStart = rowRect.right - rightSideWidth - 24 - 8; // minus English word width and gap

    // Position tooltip so its right edge is before English column with small gap
    let left = englishColumnStart - tooltipRect.width - GAP;

    // Only constrain to viewport if would go outside
    if (left < PADDING) {
      left = PADDING;
    }

    if (left + tooltipRect.width > viewportWidth - PADDING) {
      left = viewportWidth - tooltipRect.width - PADDING;
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

      const position = calculateTooltipPosition(tooltipTarget.triggerRect, tooltipTarget.rowRect, tooltipRect);

      setTooltipPosition(position);
      setTooltipMeasured(true);
    });
  }, [tooltipTarget]);

  // Cancel pending hide timeout on cleanup
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Dismiss tooltip on tap outside (touch devices)
  useEffect(() => {
    if (!tooltipTarget) return;

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const insideTooltip = tooltipRef.current?.contains(target);
      const insideTrigger = tooltipTriggerElRef.current?.contains(target);
      if (!insideTooltip && !insideTrigger) {
        setTooltipTarget(null);
        setTooltipPosition(null);
        setTooltipMeasured(false);
        tooltipTriggerElRef.current = null;
        setIsTriggerHovered(false);
        setIsTooltipHovered(false);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    return () => document.removeEventListener('touchstart', onTouchStart);
  }, [tooltipTarget]);

  // Function to schedule tooltip hide with delay, but only if pointer is not inside trigger/tooltip.
  // We use the last pointer coordinates and elementFromPoint to make this reliable.
  const scheduleHideTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      // If we have pointer coords, check the element under the pointer.
      let pointerInside = false;

      const lp = lastPointerRef.current;
      if (lp) {
        const el = document.elementFromPoint(lp.x, lp.y);
        if (el) {
          if (tooltipRef.current && tooltipRef.current.contains(el)) {
            pointerInside = true;
          }
          if (tooltipTriggerElRef.current && tooltipTriggerElRef.current.contains(el)) {
            pointerInside = true;
          }
        }
      }

      // Fallback to state-based check if pointer coordinates are not available
      if (!lp) {
        pointerInside = isTriggerHovered || isTooltipHovered;
      }

      if (!pointerInside) {
        // Hide tooltip and reset measured/trigger refs
        setTooltipTarget(null);
        setTooltipPosition(null);
        setTooltipMeasured(false);
        tooltipTriggerElRef.current = null;
        setIsTriggerHovered(false);
        setIsTooltipHovered(false);
      }

      hideTimeoutRef.current = null;
    }, 150); // keep the short delay to allow cursor move
  };

  // Function to cancel hide timeout
  const cancelHideTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

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

  // Handlers to show tooltip based on the info icon element
  const showTooltipForIcon = (iconEl: HTMLElement | null, rowEl: HTMLElement | null, word: Word | null) => {
    if (iconEl && rowEl && word) {
      cancelHideTooltip();
      setIsTriggerHovered(true);
      tooltipTriggerElRef.current = iconEl;
      const triggerRect = iconEl.getBoundingClientRect();
      const rowRect = rowEl.getBoundingClientRect();
      setTooltipTarget({ triggerRect, rowRect, word });
    }
  };

  // Handler to hide tooltip when leaving trigger
  const hideTooltipFromTrigger = () => {
    setIsTriggerHovered(false);
    // Schedule hide only if tooltip is also not hovered (the scheduleHideTooltip will guard with pointer check)
    scheduleHideTooltip();
  };

  // Portal tooltip rendering
  const renderTooltipPortal = () => {
    if (!tooltipTarget) {
      return null;
    }

    const { word } = tooltipTarget;

    // Use fallback position during first render (measure at a stable in-viewport location)
    const PADDING = 16;
    const fallbackLeft = PADDING; // measure at left padding to get consistent wrapping
    const fallbackTop = PADDING; // measure at top padding to avoid being constrained by trigger row

    const left = tooltipPosition?.left ?? fallbackLeft;
    const top = tooltipPosition?.top ?? fallbackTop;
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
          minWidth: TOOLTIP_MIN_WIDTH,
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 99999,
          pointerEvents: 'auto',
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
          cancelHideTooltip();
          setIsTooltipHovered(true);
        }}
        onMouseLeave={() => {
          setIsTooltipHovered(false);
          scheduleHideTooltip();
        }}
        onTouchStart={() => {
          cancelHideTooltip();
          setIsTooltipHovered(true);
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
            text-[13px]
            md:text-lg
          "
        >
          {alternatives && alternatives.length > 0 && (
            <div className="mb-2">
              <div className="text-[13px] md:text-lg font-bold">Alternatives</div>

              <div className="text-[13px] md:text-lg mt-1">{alternatives.join(', ')}</div>
            </div>
          )}

          {displayPhrases && displayPhrases.length > 0 && (
            <div>
              <div className="text-[13px] md:text-lg font-bold">"{word.english}" phrases</div>

              <div className="text-[13px] md:text-lg mt-1 space-y-1">
                {displayPhrases.map((p: string, i: number) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="flex-1">• {p}</span>
                    <span className="hidden md:flex items-center gap-1">
                      <button
                        onClick={() => pronouncePhrase(p)}
                        className="w-5 h-5 p-0 rounded-full bg-transparent text-on-surface border border-outline flex items-center justify-center flex-shrink-0 hover:border-on-surface active:border-on-surface focus-visible:border-on-surface transition-colors"
                        aria-label={`Pronounce: ${p}`}
                      >
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19 8a5 5 0 0 1 0 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => cancel()}
                        className="w-5 h-5 p-0 rounded-full bg-transparent text-on-surface border border-outline flex items-center justify-center flex-shrink-0 hover:border-on-surface active:border-on-surface focus-visible:border-on-surface transition-colors"
                        aria-label="Stop pronunciation"
                      >
                        <svg className="w-[7px] h-[7px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <rect x="6" y="6" width="12" height="12" rx="1" />
                        </svg>
                      </button>
                    </span>
                  </div>
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

  const pronouncePhrase = (phrase: string) => {
    speak(phrase, { lang: 'en-US', rate: 0.9 });
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
                className={`text-[13px] md:text-lg font-bold ${titleTextClass}`}
              >
                {title}
              </h2>
            </div>
          </div>
          <span className={`${badgeBg} ${badgeBorder} px-3 py-1 rounded-full text-[10px] md:text-sm font-bold ${badgeTextClass}`}>
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
        py-3
        md:py-2
        pr-14
        rounded-lg
        bg-surface
        text-on-surface
        text-xs
        md:text-base
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
          w-10
          h-10
          md:w-8
          md:h-8
          rounded-full
          flex
          items-center
          justify-center
          text-on-surface
          active:bg-surface-container
          focus-visible:bg-surface-container
          hover:bg-surface-container
          transition
          text-[15px]
          md:text-xl
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
              <p className="text-on-surface-variant text-[13px] md:text-lg">
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
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-on-surface font-bold text-[13px] md:text-lg flex-1 break-words min-w-0">
                        {hasEmoji && `${(word as any).emoji} `}{word.ukrainian}
                      </p>
                      <div className="flex items-center gap-2 md:flex-shrink-0">
                        <p className="text-on-surface font-bold text-[13px] md:text-lg w-24 md:w-24 break-words">
                          {word.english}
                        </p>
                        {hasTooltip && (
                          <InfoButton
                            word={word}
                            onHover={(iconEl, rowEl) => showTooltipForIcon(iconEl, rowEl, word)}
                            onLeave={() => hideTooltipFromTrigger()}
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
              w-full px-4 py-4 md:py-3 rounded-base bg-primary text-on-primary font-bold
              active:bg-primary-container
              focus-visible:bg-primary-container
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
  onHover: (iconEl: HTMLElement, rowEl: HTMLElement) => void;
  onLeave: () => void;
}

const InfoButton: React.FC<InfoButtonProps> = ({ word, onHover, onLeave }) => {
  const [hover, setHover] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const hoverBg = 'var(--surface-container-high, rgba(0,0,0,0.06))';
  const hoverColor = 'var(--on-surface, inherit)';

  const handleMouseEnter = () => {
    setHover(true);
    if (infoButtonRef.current) {
      const rowEl = infoButtonRef.current.closest('div[class*="p-4"]') as HTMLElement;
      if (rowEl) {
        onHover(infoButtonRef.current, rowEl);
      }
    }
  };

  const handleMouseLeave = () => {
    setHover(false);
    onLeave();
  };

  const handleTouchStart = () => {
    setHover(true);
    if (infoButtonRef.current) {
      const rowEl = infoButtonRef.current.closest('div[class*="p-4"]') as HTMLElement;
      if (rowEl) {
        onHover(infoButtonRef.current, rowEl);
      }
    }
  };

  const handleFocus = () => {
    if (infoButtonRef.current) {
      const rowEl = infoButtonRef.current.closest('div[class*="p-4"]') as HTMLElement;
      if (rowEl) {
        onHover(infoButtonRef.current, rowEl);
      }
    }
  };

  const handleBlur = () => {
    onLeave();
  };

  return (
    <button
      ref={infoButtonRef}
      className="
        w-[34px]
        h-[34px]
        md:w-6
        md:h-6
        p-0
        rounded-full
        bg-transparent
        text-on-surface
        border border-outline
        transition-colors
        flex items-center justify-center
        flex-shrink-0
        active:border-on-surface
        focus-visible:border-on-surface
        hover:border-on-surface
      "
      aria-label={`Info about: ${word.english}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={
        hover
          ? { backgroundColor: hoverBg, color: hoverColor }
          : { backgroundColor: 'transparent' }
      }
    >
      <svg
        className="w-[10px] h-[10px] md:w-3 md:h-3"
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
    <div className="flex items-center gap-2 md:flex-shrink-0">
      {/* PLAY */}
      <button
        onClick={onSpeak}
        className="
          w-[34px]
          h-[34px]
          md:w-6
          md:h-6
          p-0
          rounded-full
          bg-transparent
          text-on-surface
          border border-outline
          transition-colors
          flex items-center justify-center
          flex-shrink-0
          active:border-on-surface
          focus-visible:border-on-surface
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
          className="w-[10px] h-[10px] md:w-3 md:h-3"
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
          w-[34px]
          h-[34px]
          md:w-6
          md:h-6
          p-0
          rounded-full
          bg-transparent
          text-on-surface
          border border-outline
          flex items-center justify-center
          flex-shrink-0
          transition-colors
          active:border-on-surface
          focus-visible:border-on-surface
          hover:border-on-surface
        "
        aria-label="Stop pronunciation"
      >
        <svg
          className="w-[8px] h-[8px] md:w-[10px] md:h-[10px]"
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