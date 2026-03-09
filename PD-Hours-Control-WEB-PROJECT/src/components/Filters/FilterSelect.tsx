import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: number | string;
  name: string;
}

interface FilterSelectProps {
  label: string;
  options: Option[];
  value: number | string | 'all';
  onChange: (value: number | string | 'all') => void;
  placeholder?: string;
  allOptionText?: string;
  showAllOption?: boolean;
  width?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  allOptionText = 'Todos',
  showAllOption = true,
  width = '280px'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = (): string => {
    if (value === 'all') return allOptionText;
    const option = options.find(opt => opt.id === value);
    return option?.name || placeholder;
  };

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue: number | string | 'all') => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="filter-group" style={{ width }} ref={containerRef}>
      <label>{label}</label>
      <div className="custom-select">
        <div 
          className={`select-display ${value === 'all' || !value ? 'placeholder' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="select-value" title={getDisplayValue()}>
            {getDisplayValue()}
          </span>
          <span className={`select-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </div>

        {isOpen && (
          <div className="select-dropdown">
            <input
              type="text"
              className="select-search"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="select-options">
              {showAllOption && (
                <div
                  className={`select-item ${value === 'all' ? 'selected' : ''}`}
                  onClick={() => handleSelect('all')}
                >
                  {allOptionText}
                </div>
              )}
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <div
                    key={option.id}
                    className={`select-item ${value === option.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.id)}
                    title={option.name}
                  >
                    {option.name}
                  </div>
                ))
              ) : (
                <div className="select-empty">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};