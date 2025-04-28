import React from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="delete-modal-body">
          <p>{message}</p>
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
    </div>
  );
};

export default DeleteConfirmationModal; 