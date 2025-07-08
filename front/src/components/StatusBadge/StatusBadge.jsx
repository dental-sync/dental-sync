import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './StatusBadge.css';

const StatusBadge = ({ status, onClick, tipo, pedidoId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const badgeRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Se for status de pedido, mostrar badge com dropdown
  if (tipo === 'pedido') {
    // Mapeamento de status do pedido para cor e texto
    const pedidoMap = {
      'PENDENTE': { texto: 'Pendente', cor: '#ffc107' },
      'EM_ANDAMENTO': { texto: 'Andamento', cor: '#007bff' },
      'CONCLUIDO': { texto: 'Concluído', cor: '#28a745' },
      'CANCELADO': { texto: 'Cancelado', cor: '#dc3545' }
    };
    const info = pedidoMap[status] || { texto: status || 'Pendente', cor: '#6c757d' };
    
    const updateDropdownPosition = () => {
      if (badgeRef.current) {
        const rect = badgeRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
      }
    };

    const toggleDropdown = () => {
      if (!isDropdownOpen) {
        updateDropdownPosition();
      }
      setIsDropdownOpen(!isDropdownOpen);
    };

    const handleStatusChange = (newStatus) => {
      if (onClick) {
        onClick(newStatus, pedidoId);
        setIsDropdownOpen(false);
      }
    };

    // Renderizar o dropdown no final do body usando portal
    const renderDropdown = () => {
      if (!isDropdownOpen) return null;

      const dropdownContent = (
        <div 
          className="status-dropdown status-dropdown-pedido" 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <button
            className={`status-option ${status === 'PENDENTE' ? 'active' : ''}`}
            onClick={() => handleStatusChange('PENDENTE')}
          >
            <span className="status-dot" style={{ backgroundColor: '#ffc107' }}></span>
            Pendente
          </button>
          <button
            className={`status-option ${status === 'EM_ANDAMENTO' ? 'active' : ''}`}
            onClick={() => handleStatusChange('EM_ANDAMENTO')}
          >
            <span className="status-dot" style={{ backgroundColor: '#007bff' }}></span>
            Andamento
          </button>
          <button
            className={`status-option ${status === 'CONCLUIDO' ? 'active' : ''}`}
            onClick={() => handleStatusChange('CONCLUIDO')}
          >
            <span className="status-dot" style={{ backgroundColor: '#28a745' }}></span>
            Concluído
          </button>
        </div>
      );

      return ReactDOM.createPortal(
        dropdownContent,
        document.body
      );
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

    return (
      <div className="status-container">
        <button
          ref={badgeRef}
          className="status-badge status-badge-pedido-dropdown"
          style={{ backgroundColor: info.cor, color: '#fff' }}
          onClick={toggleDropdown}
        >
        {info.texto}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="status-arrow"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {renderDropdown()}
      </div>
    );
  }
  
  // Verifica se o status é boolean ou string e normaliza
  const isActive = typeof status === 'boolean' ? status : 
                  status === true || status === 'true' || 
                  status === 'ATIVO' || status === 'Ativo';
  
  const displayStatus = isActive ? 'Ativo' : 'Inativo';
  const statusClass = isActive ? 'status-active status-ato' : 'status-inactive status-inativo';

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
      onClick(newStatus);
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
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="status-arrow"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {renderDropdown()}
    </div>
  );
};

export default StatusBadge; 