import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  label = '',
  disabled = false,
}) => {
  return (
    <div className="flex items-center w-full justify-between md:w-auto md:justify-start md:gap-3">
      {label && (
        <label className="text-on-surface font-medium">
          {label}
        </label>
      )}
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-[33px] w-[42px] md:h-7 md:w-14 rounded-full
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex-shrink-0
          ${enabled ? 'bg-primary' : 'bg-outline-variant'}
        `}
      >
        <span
          className={`
            inline-block h-[18px] w-[18px] md:h-6 md:w-6 transform rounded-full
            bg-on-surface transition-transform duration-200
            absolute top-1/2 -translate-y-1/2
            ${enabled ? 'translate-x-[21px] md:translate-x-7' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
};
