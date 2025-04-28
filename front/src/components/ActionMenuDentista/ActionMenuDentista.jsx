import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ActionMenuDentista.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';

const ActionMenuDentista = ({ dentistaId, onDentistaDeleted, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const navigate = useNavigate();

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
        buttonRef.current && !buttonRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition);
    };
  }, []);

  const handleVerHistorico = () => {
    navigate(`/dentista/historico/${dentistaId}`);
    setIsOpen(false);
  };

  const handleEditar = () => {
    navigate(`/dentista/editar/${dentistaId}`);
    setIsOpen(false);
  };

  const handleExcluir = async () => {
    setShowDeleteModal(true);
    setIsOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/dentistas/${dentistaId}`);
      onDentistaDeleted(dentistaId);
      toast.success('Dentista excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir dentista:', error);
      toast.error('Erro ao excluir dentista. Tente novamente.');
    }
    setShowDeleteModal(false);
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    const dropdownContent = (
      <div 
        className="action-menu-dropdown" 
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        <ul>
          <li onClick={handleVerHistorico}>Histórico</li>
          <li onClick={handleEditar}>Editar</li>
          {!isActive && <li onClick={handleExcluir} className="delete-option">Excluir</li>}
        </ul>
      </div>
    );

    return ReactDOM.createPortal(
      dropdownContent,
      document.body
    );
  };

  return (
    <>
      <div className="action-menu-dentista">
        <button 
          className="action-menu-button" 
          onClick={toggleDropdown}
          ref={buttonRef}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        
        {renderDropdown()}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir permanentemente este dentista? Esta ação não poderá ser desfeita."
      />
    </>
  );
};

export default ActionMenuDentista; 