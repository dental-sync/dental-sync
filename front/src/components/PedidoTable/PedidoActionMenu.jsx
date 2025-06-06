import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PedidoActionMenu.css';

const PedidoActionMenu = ({ pedidoId, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Fechar menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleViewClick = () => {
    navigate(`/pedidos/${pedidoId}`);
    setIsOpen(false);
  };

  const handleEditClick = () => {
    navigate(`/pedidos/editar/${pedidoId}`);
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      onDelete(pedidoId);
    }
    setIsOpen(false);
  };

  return (
    <div className="pedido-action-menu" ref={menuRef}>
      <button className="action-menu-trigger" onClick={toggleMenu}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="3" r="1.5" fill="#6c757d" />
          <circle cx="8" cy="8" r="1.5" fill="#6c757d" />
          <circle cx="8" cy="13" r="1.5" fill="#6c757d" />
        </svg>
      </button>

      {isOpen && (
        <div className="action-menu-dropdown">
          <button className="action-menu-item" onClick={handleViewClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Visualizar
          </button>
          
          <button className="action-menu-item" onClick={handleEditClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            Editar
          </button>
          
          <button className="action-menu-item action-delete" onClick={handleDeleteClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Excluir
          </button>
        </div>
      )}
    </div>
  );
};

export default PedidoActionMenu; 