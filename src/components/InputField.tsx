import React, { useState, useEffect } from 'react';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type here...',
  disabled = false,
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error && value.length > 0) {
      setError(false);
    }
  }, [value, error]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      if (value.trim().length === 0) {
        setError(true);
        return;
      }
      onSubmit(value);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-gutter">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus
        className={`
          w-full px-6 py-4 rounded-base text-lg font-medium
          border-2 transition-all duration-200
          placeholder-on-surface-variant
          focus:outline-none focus:ring-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-error bg-error-container/10' 
            : 'border-outline-variant bg-surface-container-lowest focus:border-primary'
          }
        `}
        style={{ fontFamily: 'Quicksand' }}
      />
      {error && (
        <p className="text-error text-sm mt-2 animate-fade-in">
          Please type something!
        </p>
      )}
    </div>
  );
};
