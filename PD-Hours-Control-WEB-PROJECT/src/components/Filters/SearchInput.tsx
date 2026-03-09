import React from 'react';

interface SearchInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string; 
  width?: string;
  max?: string;
  min?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Buscar...',
  type = 'text',
  width = '280px',
  max,
  min
}) => {
  return (
    <div className="filter-group" style={{ width }}>
      <label>{label}</label>
      <input
        type={type}
        className="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        max={max}
        min={min}
      />
    </div>
  );
};