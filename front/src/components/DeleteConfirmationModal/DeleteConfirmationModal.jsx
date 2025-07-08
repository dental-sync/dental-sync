import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  // Previne que o scroll do fundo funcione quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      // Corrige possíveis problemas de layout no iOS
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      
      // Restaura o layout normal
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
    };
  }, [isOpen]);

  // Impede a propagação do clique no modal para o overlay
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  // Manipulador de clique do backdrop que evita propagação
  const handleBackdropClick = (e) => {
    e.preventDefault();
    onClose();
  };
  
  // Usando portal para renderizar o modal diretamente no body
  // para evitar problemas de z-index ou estilos herdados
  return ReactDOM.createPortal(
    <div 
      className="delete-modal-overlay" 
      onClick={handleBackdropClick}
    >
      <div 
        className="delete-modal" 
        onClick={handleModalClick}
      >
        <div className="delete-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="delete-modal-body">
          <p>{message || "Tem certeza que deseja excluir este item? Esta ação não poderá ser desfeita."}</p>
        </div>
        <div className="delete-modal-footer">
          <button className="delete-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="delete-modal-confirm" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmationModal; 