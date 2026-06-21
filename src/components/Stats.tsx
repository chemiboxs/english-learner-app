import React from 'react';

interface StatsProps {
  learned: number;
  skipped: number;
  onLearnedClick?: () => void;
  onSkippedClick?: () => void;
  onResetClick?: () => void;
}

export const Stats: React.FC<StatsProps> = ({
  learned,
  skipped,
  onLearnedClick,
  onSkippedClick,
  onResetClick,
}) => {
  const baseButton =
    "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors cursor-pointer border";

  return (
    <div className="flex gap-3 justify-end items-center">
      {/* Learned */}
      <button
        onClick={onLearnedClick}
        className={`
          ${baseButton}
          bg-success/15
          border-success/40
          text-on-surface
          hover:bg-success/25
        `}
      >
        <span className="text-lg">✓</span>
        <span>Learned: {learned}</span>
      </button>

      {/* Skipped */}
      <button
        onClick={onSkippedClick}
        className={`
          ${baseButton}
          bg-primary/10
          border-primary/30
          text-on-surface
          hover:bg-primary/15
        `}
      >
        <span>Skipped: {skipped}</span>
      </button>

      {/* Reset (акцентна кнопка — залишаємо як є) */}
      <button
        onClick={onResetClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm
          bg-primary text-on-primary
          hover:bg-primary-container
          transition-colors cursor-pointer
        `}
      >
        Reset
      </button>
    </div>
  );
};
