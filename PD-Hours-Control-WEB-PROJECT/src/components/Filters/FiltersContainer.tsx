import React from 'react';

interface FiltersContainerProps {
  children: React.ReactNode;
}

export const FiltersContainer: React.FC<FiltersContainerProps> = ({ children }) => {
  return (
    <div className="filters-section">
      <div className="filters-container">
        {children}
      </div>
    </div>
  );
};