import React from 'react';
import { IrregularVerb } from '../types/vocabulary';
import useSpeech from '../hooks/useSpeech';

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
                    onClick={() => speak(verb[key], { lang: 'en-US', rate: 0.9 })}
                    className="
                      w-[26px] h-[26px] md:w-7 md:h-7 p-0 rounded-full
                      bg-transparent text-on-surface
                      border border-outline/20 hover:border-outline/60
                      transition-all flex items-center justify-center flex-shrink-0
                    "
                    aria-label={`Pronounce: ${verb[key]}`}
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
                      <div key={pi} className="flex items-start gap-1.5 min-h-[68px] md:min-h-[72px]">
                        <span className="text-[24px] md:text-[25px] text-on-surface-variant leading-snug flex-1 line-clamp-2">
                          {phrase}
                        </span>
                        <button
                          onClick={() => speak(phrase, { lang: 'en-US', rate: 0.9 })}
                          className="
                            w-[26px] h-[26px] md:w-7 md:h-7 p-0 rounded-full
                            bg-transparent text-on-surface-variant
                            border border-outline/20 hover:border-outline/60 hover:text-on-surface
                            transition-all flex items-center justify-center flex-shrink-0
                          "
                          aria-label={`Pronounce phrase: ${phrase}`}
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
    </div>
  );
};
