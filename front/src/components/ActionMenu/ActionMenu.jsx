import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ActionMenu.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';
import { formatProteticoId } from '../../utils/formatters';

const ActionMenu = ({ proteticoId, onProteticoDeleted, isActive }) => {
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
    navigate(`/protetico/historico/${proteticoId}`);
    setIsOpen(false);
  };

  const handleEditar = () => {
    navigate(`/protetico/editar/${proteticoId}`);
    setIsOpen(false);
  };

  const handleExcluir = () => {
    if (isActive) {
      toast.warning('Não é possível excluir um protético ativo. Desative-o primeiro.');
      setIsOpen(false);
      return;
    }
    
    setShowDeleteModal(true);
    setIsOpen(false);
  };
  
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/proteticos/${proteticoId}`);
      onProteticoDeleted(proteticoId);
    } catch (error) {
      console.error('Erro ao excluir protético:', error);
      toast.error('Erro ao excluir protético. Tente novamente.');
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
          {!isActive && (
            <li onClick={handleExcluir} className="delete-option">Excluir</li>
          )}
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
      <div className="action-menu">
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
        message="Tem certeza que deseja excluir permanentemente este protético? Esta ação não poderá ser desfeita."
      />
    </>
  );
};

export default ActionMenu; 