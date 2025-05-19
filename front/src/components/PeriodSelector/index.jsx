import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

const PeriodSelector = ({ periodo, setPeriodo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const periodos = [
    'Último Mês',
    'Últimos 3 Meses',
    'Últimos 6 Meses',
    'Último Ano',
    'Todos os Períodos'
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlePeriodSelect = (selected) => {
    setPeriodo(selected);
    setIsOpen(false);
  };

  // Fechar o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="period-selector" ref={dropdownRef}>
      <button className="period-selector-button" onClick={toggleDropdown}>
        {periodo}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`chevron-icon ${isOpen ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <div className="period-selector-dropdown">
          {periodos.map(opcao => (
            <div 
              key={opcao} 
              className={`period-option ${periodo === opcao ? 'active' : ''}`}
              onClick={() => handlePeriodSelect(opcao)}
            >
              {opcao}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodSelector; 