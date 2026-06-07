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
    <div className="flex items-center gap-3">
      {label && (
        <label className="text-on-surface font-medium">
          {label}
        </label>
      )}
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-7 w-14 rounded-full
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex-shrink-0
          ${enabled ? 'bg-primary' : 'bg-outline-variant'}
        `}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full
            bg-on-surface transition-transform duration-200
            absolute top-0.5
            ${enabled ? 'translate-x-7' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
};
