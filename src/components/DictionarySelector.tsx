import React from 'react';

interface DictionarySelectorProps {
  dictionaries: string[];
  selectedDictionary: string;
  onSelect: (dictionary: string) => void;
  disabled?: boolean;
}

const getDictionaryLabel = (name: string): string => {
  const labels: { [key: string]: string } = {
    'words': '📚 Main',
    'animals': '🐾 Тварини',
    'food': '🍎 Їжа',
    'colors': '🎨 Кольори',
    'numbers': '🔢 Цифри',
    'body': '💪 Тіло',
    'actions': '🏃 Дії',
  };
  return labels[name] || `📖 ${name.charAt(0).toUpperCase() + name.slice(1)}`;
};

export const DictionarySelector: React.FC<DictionarySelectorProps> = ({
  dictionaries,
  selectedDictionary,
  onSelect,
  disabled = false,
}) => {
  if (dictionaries.length <= 1) {
    return null;
  }

  return (
    <div className="bg-surface-container-low p-4 shadow-soft">
      <div className="max-w-4xl mx-auto">
        <label 
          className="text-sm font-medium text-on-surface-variant mb-2 block"
          style={{ fontFamily: 'Quicksand' }}
        >
          Select dictionary:
        </label>
        <div className="flex flex-wrap gap-2">
          {dictionaries.map((dict) => (
            <button
              key={dict}
              onClick={() => onSelect(dict)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedDictionary === dict
                  ? 'bg-primary text-on-primary shadow-soft'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }
              `}
            >
              {getDictionaryLabel(dict)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
