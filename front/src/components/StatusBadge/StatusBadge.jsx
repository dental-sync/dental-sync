import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './StatusBadge.css';

const StatusBadge = ({ status, onClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const badgeRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Verifica se o status é boolean ou string e normaliza
  const isActive = typeof status === 'boolean' ? status : 
                  status === true || status === 'true' || 
                  status === 'ATIVO' || status === 'Ativo';
  
  const displayStatus = isActive ? 'Ativo' : 'Inativo';
  const statusClass = isActive ? 'status-active status-ativo' : 'status-inactive status-inativo';

  const updateDropdownPosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        badgeRef.current && 
        !badgeRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition);
    };
  }, []);
  
  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      updateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleStatusChange = (newStatus) => {
    if (onClick) {
      const isNewActive = newStatus === 'ATIVO';
      onClick(isNewActive);
      setIsDropdownOpen(false);
    }
  };

  // Renderizar o dropdown no final do body usando portal
  const renderDropdown = () => {
    if (!isDropdownOpen) return null;

    const dropdownContent = (
      <div 
        className="status-dropdown" 
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
        }}
      >
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
    );

    return ReactDOM.createPortal(
      dropdownContent,
      document.body
    );
  };
  
  return (
    <div className="status-container">
      <button
        ref={badgeRef}
        className={`status-badge ${statusClass}`}
        onClick={toggleDropdown}
      >
        {displayStatus}
      </button>
      {renderDropdown()}
    </div>
  );
};

export default StatusBadge; 