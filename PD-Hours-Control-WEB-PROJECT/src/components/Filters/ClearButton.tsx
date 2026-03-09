import React from 'react';

interface ClearButtonProps {
  onClick: () => void;
  visible: boolean;
  label?: string;
}

export const ClearButton: React.FC<ClearButtonProps> = ({
  onClick,
  visible,
  label = 'Limpar filtros'
}) => {
  if (!visible) return null;

  return (
    <button 
      className="clear-filter-btn"
      onClick={onClick}
    >
      {label}
    </button>
  );
}