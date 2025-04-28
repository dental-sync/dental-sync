import React, { useState, useRef, useEffect } from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, onClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Verifica se o status é boolean ou string e normaliza
  const isActive = typeof status === 'boolean' ? status : 
                  status === true || status === 'true' || 
                  status === 'ATIVO' || status === 'Ativo';
  
  const displayStatus = isActive ? 'Ativo' : 'Inativo';
  const statusClass = isActive ? 'status-active status-ativo' : 'status-inactive status-inativo';

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleStatusChange = (newStatus) => {
    if (onClick) {
      const isNewActive = newStatus === 'ATIVO';
      onClick(isNewActive);
      setIsDropdownOpen(false);
    }
  };
  
  return (
    <div className="status-container" ref={dropdownRef}>
      <button
        className={`status-badge ${statusClass}`}
        onClick={toggleDropdown}
      >
        {displayStatus}
      </button>
      {isDropdownOpen && (
        <div className="status-dropdown">
          <button
            className={`status-option ${isActive ? 'active' : ''}`}
            onClick={() => handleStatusChange('ATIVO')}
          >
            Ativo
          </button>
          <button
            className={`status-option ${!isActive ? 'active' : ''}`}
            onClick={() => handleStatusChange('INATIVO')}
          >
            Inativo
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusBadge; 