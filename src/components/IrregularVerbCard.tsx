import React, { useState, useRef, useEffect } from 'react';
import { IrregularVerb } from '../types/vocabulary';
import useSpeech from '../hooks/useSpeech';
import { createPortal } from 'react-dom';

interface IrregularVerbCardProps {
  verb: IrregularVerb | null;
  baseInput: string;
  pastInput: string;
  participleInput: string;
  onBaseChange: (v: string) => void;
  onPastChange: (v: string) => void;
  onParticipleChange: (v: string) => void;
  onCheck: () => void;
  fieldResults?: { base: boolean | null; past: boolean | null; participle: boolean | null };
}

const forms: { key: 'base' | 'past' | 'participle'; label: string }[] = [
  { key: 'base', label: 'Base' },
  { key: 'past', label: 'Past' },
  { key: 'participle', label: 'Participle' },
];

interface TooltipState {
  triggerRect: DOMRect;
  phrase: string;
}

interface ComputedTooltipPosition {
  left: number;
  top: number;
  maxHeight?: number;
  placement: 'top' | 'bottom';
}

interface ExampleTooltipProps {
  tooltipTarget: TooltipState | null;
  tooltipPosition: ComputedTooltipPosition | null;
  tooltipMeasured: boolean;
  tooltipRef: React.RefObject<HTMLDivElement>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ExampleTooltip: React.FC<ExampleTooltipProps> = ({
  tooltipTarget,
  tooltipPosition,
  tooltipMeasured,
  tooltipRef,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!tooltipTarget) return null;

  const { phrase } = tooltipTarget;

  const PADDING = 16;
  const fallbackLeft = PADDING;
  const fallbackTop = PADDING;

  const left = tooltipPosition?.left ?? fallbackLeft;
  const top = tooltipPosition?.top ?? fallbackTop;
  const maxHeight = tooltipPosition?.maxHeight;

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      style={{
        position: 'fixed',
        left,
        top,
        minWidth: Math.min(320, window.innerWidth - 32),
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
        <div className="text-[13px] md:text-lg font-bold">Full example</div>
        <div className="text-[13px] md:text-lg mt-1">{phrase}</div>
      </div>
    </div>,
    document.body
  );
};

export const IrregularVerbCard: React.FC<IrregularVerbCardProps> = ({
  verb,
  baseInput,
  pastInput,
  participleInput,
  onBaseChange,
  onPastChange,
  onParticipleChange,
  onCheck,
  fieldResults = { base: null, past: null, participle: null },
}) => {
  const { speak, cancel } = useSpeech();

  const baseRef = React.useRef<HTMLInputElement>(null);
  const pastRef = React.useRef<HTMLInputElement>(null);
  const participleRef = React.useRef<HTMLInputElement>(null);

  const [tooltipTarget, setTooltipTarget] = useState<TooltipState | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<ComputedTooltipPosition | null>(null);
  const [tooltipMeasured, setTooltipMeasured] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const tooltipTriggerElRef = useRef<HTMLElement | null>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);

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

  const calculateTooltipPosition = (
    triggerRect: DOMRect,
    tooltipRect: DOMRect
  ): ComputedTooltipPosition => {
    const GAP = 8;
    const PADDING = 16;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const availableBelow = viewportHeight - PADDING - triggerRect.bottom - GAP;
    const availableAbove = triggerRect.top - PADDING - GAP;

    const fitsBelow = tooltipRect.height <= availableBelow;
    const fitsAbove = tooltipRect.height <= availableAbove;

    let placement: 'top' | 'bottom';

    if (fitsBelow) {
      placement = 'bottom';
    } else if (fitsAbove) {
      placement = 'top';
    } else {
      placement = availableBelow >= availableAbove ? 'bottom' : 'top';
    }

    let maxHeight: number | undefined;

    if (!fitsBelow && !fitsAbove) {
      const chosenAvailable = placement === 'bottom' ? availableBelow : availableAbove;
      maxHeight = Math.max(150, chosenAvailable);
    }

    const tooltipHeight = maxHeight ?? tooltipRect.height;

    let top =
      placement === 'bottom'
        ? triggerRect.bottom + GAP
        : triggerRect.top - tooltipHeight - GAP;

    if (top < PADDING) {
      top = PADDING;
    }

    if (top + tooltipHeight > viewportHeight - PADDING) {
      top = viewportHeight - tooltipHeight - PADDING;
    }

    const left = triggerRect.left - tooltipRect.width - GAP;

    let finalLeft = left;
    if (finalLeft < PADDING) {
      finalLeft = PADDING;
    }

    if (finalLeft + tooltipRect.width > viewportWidth - PADDING) {
      finalLeft = viewportWidth - tooltipRect.width - PADDING;
    }

    return {
      left: finalLeft,
      top,
      maxHeight,
      placement,
    };
  };

  useEffect(() => {
    if (!tooltipTarget) {
      setTooltipPosition(null);
      setTooltipMeasured(false);
      return;
    }

    requestAnimationFrame(() => {
      if (!tooltipRef.current) return;
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const position = calculateTooltipPosition(tooltipTarget.triggerRect, tooltipRect);
      setTooltipPosition(position);
      setTooltipMeasured(true);
    });
  }, [tooltipTarget]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const scheduleHideTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
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

      if (!lp) {
        pointerInside = isTriggerHovered || isTooltipHovered;
      }

      if (!pointerInside) {
        setTooltipTarget(null);
        setTooltipPosition(null);
        setTooltipMeasured(false);
        tooltipTriggerElRef.current = null;
        setIsTriggerHovered(false);
        setIsTooltipHovered(false);
      }

      hideTimeoutRef.current = null;
    }, 150);
  };

  const cancelHideTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  if (!verb) {
    return (
      <div className="w-full max-w-[1180px] mx-auto px-gutter">
        <div className="bg-surface-container-lowest rounded-xl shadow-soft p-8 md:p-12 text-center">
          <p className="text-on-surface text-xl md:text-2xl font-semibold">
            🎉 Congratulations! You've completed all the verbs!
          </p>
        </div>
      </div>
    );
  }

  const inputs = [
    { key: 'base' as const, value: baseInput, onChange: onBaseChange, ref: baseRef, next: pastRef },
    { key: 'past' as const, value: pastInput, onChange: onPastChange, ref: pastRef, prev: baseRef, next: participleRef },
    { key: 'participle' as const, value: participleInput, onChange: onParticipleChange, ref: participleRef, prev: pastRef },
  ];

  return (
    <div className="w-full max-w-[1180px] mx-auto px-gutter animate-slide-up">
      <div className="bg-surface-container-lowest rounded-xl shadow-soft px-6 pb-6 pt-2 md:px-10 md:pb-10 md:pt-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <p
            className="text-primary font-bold text-[28px] md:text-[38px] text-center"
            style={{ lineHeight: 1, overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}
          >
            {verb.ukrainian}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
          {forms.map(({ key, label }) => {
            const result = fieldResults[key];
            const input = inputs.find(i => i.key === key)!;
            const hasInput = input.value.trim().length > 0;
            const examples = verb.examples?.[key] || [];

            const borderColor =
              hasInput && result !== null
                ? result
                  ? 'border-success'
                  : 'border-error'
                : 'border-outline/30';

            return (
              <div key={key} className="flex flex-col items-center h-full">
                <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  {label}
                </p>

                <p
                  className="text-primary font-bold text-[22px] md:text-[28px] text-center mt-2"
                  style={{ lineHeight: 1, overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}
                >
                  {verb[key]}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => speak(verb.speech?.[key] || verb[key], { lang: 'en-US', rate: 0.9 })}
                    className="
                      w-[26px] h-[26px] md:w-7 md:h-7 p-0 rounded-full
                      bg-transparent text-on-surface
                      border border-outline/20 hover:border-outline/60
                      transition-all flex items-center justify-center flex-shrink-0
                    "
                    aria-label={`Pronounce: ${verb.speech?.[key] || verb[key]}`}
                  >
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 8a5 5 0 010 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => cancel()}
                    className="
                      w-[26px] h-[26px] md:w-7 md:h-7 p-0 rounded-full
                      bg-transparent text-on-surface
                      border border-outline/20 hover:border-outline/60
                      flex items-center justify-center flex-shrink-0
                    "
                    aria-label="Stop pronunciation"
                  >
                    <svg className="w-[7px] h-[7px] md:w-2 md:h-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  </button>
                </div>

                {examples.length > 0 && (
                  <div className="w-full mt-4 mb-3 space-y-2">
                    {examples.slice(0, 2).map((phrase, pi) => (
                      <div key={pi} className="flex flex-col gap-1">
                        <span className="text-[24px] md:text-[25px] text-on-surface-variant leading-snug line-clamp-2">
                          {phrase}
                        </span>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => speak(verb.speechExamples?.[key]?.[pi] || phrase, { lang: 'en-US', rate: 0.9 })}
                            className="
                              w-[26px] h-[26px] md:w-7 md:h-7 p-0 rounded-full
                              bg-transparent text-on-surface-variant
                              border border-outline/20 hover:border-outline/60 hover:text-on-surface
                              transition-all flex items-center justify-center flex-shrink-0
                            "
                            aria-label={`Pronounce phrase: ${verb.speechExamples?.[key]?.[pi] || phrase}`}
                          >
                            <svg className="w-2.5 h-2.5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                              <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M19 8a5 5 0 010 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => cancel()}
                            className="
                              w-[26px] h-[26px] md:w-7 md:h-7 p-0 rounded-full
                              bg-transparent text-on-surface-variant
                              border border-outline/20 hover:border-outline/60 hover:text-on-surface
                              transition-all flex items-center justify-center flex-shrink-0
                            "
                            aria-label="Stop pronunciation"
                          >
                            <svg className="w-[7px] h-[7px] md:w-2 md:h-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <rect x="6" y="6" width="12" height="12" rx="1" />
                            </svg>
                          </button>
                          <button
                            ref={infoButtonRef}
                            className="
                              w-[26px] h-[26px] md:w-7 md:h-7 p-0 rounded-full
                              bg-transparent text-on-surface-variant
                              border border-outline/20 hover:border-outline/60 hover:text-on-surface
                              transition-all flex items-center justify-center flex-shrink-0
                            "
                            aria-label={`Info about phrase: ${phrase}`}
                            onMouseEnter={() => {
                              if (infoButtonRef.current) {
                                cancelHideTooltip();
                                setIsTriggerHovered(true);
                                tooltipTriggerElRef.current = infoButtonRef.current;
                                const triggerRect = infoButtonRef.current.getBoundingClientRect();
                                setTooltipTarget({ triggerRect, phrase });
                              }
                            }}
                            onMouseLeave={() => {
                              setIsTriggerHovered(false);
                              scheduleHideTooltip();
                            }}
                            onTouchStart={() => {
                              if (infoButtonRef.current) {
                                cancelHideTooltip();
                                setIsTriggerHovered(true);
                                tooltipTriggerElRef.current = infoButtonRef.current;
                                const triggerRect = infoButtonRef.current.getBoundingClientRect();
                                setTooltipTarget({ triggerRect, phrase });
                              }
                            }}
                          >
                            <svg className="w-[14px] h-[14px] md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
                              <path d="M12 16v-4M12 8h0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="w-full mt-auto">
                  <div className="relative">
                    <input
                      ref={input.ref}
                      type="text"
                      value={input.value}
                      onChange={(e) => input.onChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab' && !e.shiftKey && input.next?.current) {
                          e.preventDefault();
                          input.next.current.focus();
                        }
                        if (e.key === 'Tab' && e.shiftKey && input.prev?.current) {
                          e.preventDefault();
                          input.prev.current.focus();
                        }
                        if (e.key === 'Enter') onCheck();
                      }}
                      placeholder={label}
                      className={`
                        w-full px-4 py-3 pr-14 rounded-xl
                        text-base md:text-lg font-medium
                        border-2 ${borderColor}
                        bg-surface-container-lowest
                        focus:outline-none focus:border-primary
                        transition-all duration-200
                        placeholder:text-on-surface-variant/50
                        shadow-sm focus:shadow-md
                      `}
                    />
                    {input.value.length > 0 && (
                      <button
                        type="button"
                        onClick={() => input.onChange('')}
                        className="
                          absolute right-3 top-1/2 -translate-y-1/2
                          w-8 h-8 rounded-full
                          flex items-center justify-center
                          text-on-surface bg-transparent
                          hover:bg-surface-container
                          transition text-xl font-bold
                        "
                        aria-label="Clear input"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {result !== null && (
                    <p
                      className={`mt-1 text-xs font-medium h-[1em] leading-none ${hasInput ? '' : 'invisible'}`}
                      style={{ color: result ? '#16a34a' : '#dc2626' }}
                    >
                      {result ? '✓ Perfect!' : '✗ Not quite!'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ExampleTooltip
        tooltipTarget={tooltipTarget}
        tooltipPosition={tooltipPosition}
        tooltipMeasured={tooltipMeasured}
        tooltipRef={tooltipRef}
        onMouseEnter={() => {
          cancelHideTooltip();
          setIsTooltipHovered(true);
        }}
        onMouseLeave={() => {
          setIsTooltipHovered(false);
          scheduleHideTooltip();
        }}
      />
    </div>
  );
};