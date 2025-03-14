import React, { useState, useRef, useEffect } from 'react';

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedValues?: string[]; // Controlled mode
  defaultValues?: string[];  // Uncontrolled mode
  onChange?: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  showSearchBar?: boolean;
  onSearch?: (query: string) => Promise<Option[]>;
  loadingText?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  defaultValues = [],
  onChange,
  label,
  placeholder = 'Sélectionnez...',
  className,
  showSearchBar = true,
  onSearch,
  loadingText = 'Chargement...',
}) => {
  const isControlled = selectedValues !== undefined;
  const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const labelCache = useRef(new Map<string, string>());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSelectedValues = isControlled ? selectedValues : internalSelectedValues;

  // Initialise le cache des labels
  useEffect(() => {
    options.forEach(option => {
      labelCache.current.set(option.value, option.label);
    });
  }, [options]);

  // Met à jour les options affichées en cas de recherche locale
  useEffect(() => {
    if (!onSearch) {
      setFilteredOptions(
        options.filter(option =>
          option.label.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [options, search, onSearch]);

  const toggleOption = (value: string, label: string) => {
    const newSelectedValues = currentSelectedValues.includes(value)
      ? currentSelectedValues.filter(v => v !== value)
      : [...currentSelectedValues, value];

    labelCache.current.set(value, label); // Stocke l'option sélectionnée

    if (isControlled) {
      onChange?.(newSelectedValues);
    } else {
      setInternalSelectedValues(newSelectedValues);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setHighlightedIndex(0);

    if (onSearch) {
      setLoading(true);
      onSearch(value)
        .then(newOptions => {
          newOptions.forEach(opt => labelCache.current.set(opt.value, opt.label));
          setFilteredOptions(newOptions);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredOptions[highlightedIndex]) {
      e.preventDefault();
      const option = filteredOptions[highlightedIndex];
      toggleOption(option.value, option.label);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className="border border-gray-300 rounded-lg p-2 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 min-h-[2rem] items-center">
          {currentSelectedValues.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            currentSelectedValues.map(value => (
              <span
                key={value}
                className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm"
              >
                <span>{labelCache.current.get(value) ?? value}</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    toggleOption(value, labelCache.current.get(value) ?? value);
                  }}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          {showSearchBar && (
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher..."
                className="w-full border border-gray-300 rounded p-1 text-sm"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="text-sm text-gray-500 p-2">{loadingText}</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-2 p-2 cursor-pointer ${
                    highlightedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleOption(option.value, option.label)}
                >
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600"
                    checked={currentSelectedValues.includes(option.value)}
                    readOnly
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 p-2">Aucun résultat trouvé</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
