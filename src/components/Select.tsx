import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          h-12 lg:h-10 px-3 rounded-lg
          bg-surface-container text-on-surface border border-outline
          text-sm font-medium flex items-center justify-center lg:justify-between gap-2
          hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary
          transition-colors
        "
      >
        <span className="truncate">{selected?.label || value}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute top-full left-0 right-0 mt-1 z-50
            bg-surface-container-lowest border border-outline rounded-lg shadow-soft-lg
            overflow-hidden animate-fade-in
          "
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`
                w-full px-3 py-2.5 text-left text-sm font-medium transition-colors
                ${opt.value === value
                  ? 'bg-primary-container/30 text-primary'
                  : 'text-on-surface hover:bg-surface-container'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
