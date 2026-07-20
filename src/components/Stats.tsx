import React from 'react';
import { Button } from './Button';

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
  return (
    <div className="flex flex-wrap gap-3 justify-end items-center">
      <Button
        onClick={onLearnedClick || (() => {})}
        variant="primary"
        size="md"
        className="flex items-center gap-2"
      >
        <span className="text-lg">✓</span>
        <span>Learned: {learned}</span>
      </Button>

      <Button
        onClick={onSkippedClick || (() => {})}
        variant="secondary"
        size="md"
        className="flex items-center gap-2"
      >
        <span>Skipped: {skipped}</span>
      </Button>

      <Button
        onClick={onResetClick || (() => {})}
        variant="primary"
        size="md"
        className="flex items-center gap-2"
      >
        Reset
      </Button>
    </div>
  );
};
