import React from 'react';
import './ActionButton.css';
import { FilterIcon, ExportIcon } from './icons';

const ActionButton = ({ label, icon, variant = 'default', onClick, style }) => {
  const renderIcon = () => {
    switch (icon) {
      case 'filter':
        return <FilterIcon />;
      case 'export':
        return <ExportIcon />;
      default:
        return null;
    }
  };

  const isNovoButton = label === 'Novo';
  const buttonClass = `action-button ${variant} ${isNovoButton ? 'novo-button' : ''}`;

  return (
    <button 
      className={buttonClass}
      onClick={onClick}
      style={style}
    >
      {icon && renderIcon()}
      {label}
    </button>
  );
};

export default ActionButton; 