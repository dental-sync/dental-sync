import React, { useState, useRef, useEffect } from 'react';
import './NotificationBell.css';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = ({
  count = 0,
  baixoEstoque = 0,
  semEstoque = 0,
  materiaisBaixoEstoque = [],
  materiaisSemEstoque = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        // Verificar se o clique foi no dropdown
        const dropdown = document.querySelector('.notification-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell" ref={bellRef}>
      <button
        className={`bell-button ${count > 0 ? 'has-notifications' : ''}`}
        onClick={handleToggle}
        aria-label={`Notificações ${count > 0 ? `(${count})` : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {count > 0 && (
          <span className="notification-count">{count}</span>
        )}
      </button>
      
      {isOpen && (
        <NotificationDropdown
          baixoEstoque={baixoEstoque}
          semEstoque={semEstoque}
          materiaisBaixoEstoque={materiaisBaixoEstoque}
          materiaisSemEstoque={materiaisSemEstoque}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell; 