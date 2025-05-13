import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ActionMenu.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';

/**
 * Componente genérico de menu de ações
 * @param {Object} props - Propriedades do componente
 * @param {string|number} props.itemId - ID do item associado ao menu
 * @param {string} props.entityType - Tipo de entidade ('protetico', 'dentista', etc.)
 * @param {string} props.apiEndpoint - Endpoint da API para exclusão (ex: '/api/proteticos', '/api/dentistas')
 * @param {boolean} props.isActive - Se o item está ativo ou não
 * @param {Function} props.onDelete - Callback executado quando o item é excluído
 * @param {Array} props.customActions - Ações personalizadas adicionais [{ label, onClick }]
 * @param {Object} props.texts - Textos personalizados para o componente
 * @returns {JSX.Element}
 */
const ActionMenu = ({
  itemId,
  entityType = 'item',
  apiEndpoint,
  isActive = false,
  onDelete,
  customActions = [],
  texts = {
    deleteTitle: 'Confirmar Exclusão',
    deleteMessage: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
    deleteWarning: 'Não é possível excluir um item ativo. Desative-o primeiro.',
    deleteSuccess: 'Item excluído com sucesso!',
    deleteError: 'Erro ao excluir. Tente novamente.'
  }
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    navigate(`/${entityType}/historico/${itemId}`);
    setIsOpen(false);
  };

  const handleEditar = () => {
    navigate(`/${entityType}/editar/${itemId}`);
    setIsOpen(false);
  };

  const handleExcluir = () => {
    if (isActive) {
      toast.warning(texts.deleteWarning);
      setIsOpen(false);
      return;
    }
    
    // Abrir modal de confirmação
    setIsDeleteModalOpen(true);
    setIsOpen(false);
  };
  
  const handleConfirmDelete = async () => {
    try {
      // Chamada para o endpoint de exclusão
      const response = await axios.delete(`${apiEndpoint}/${itemId}`);
      
      if (response.status === 200 || response.status === 204) {
        toast.success(texts.deleteSuccess);
        // Forçar atualização da lista
        if (onDelete) {
          onDelete(itemId);
        }
      }
    } catch (error) {
      console.error(`Erro ao excluir ${entityType}:`, error);
      toast.error(error.response?.data?.message || texts.deleteError);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };
  
  // Renderizar o dropdown no final do body
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
          <li onClick={handleEditar}>Editar</li>
          <li onClick={handleVerHistorico}>Histórico</li>
          {customActions.map((action, index) => (
            <li key={index} onClick={() => {
              action.onClick(itemId);
              setIsOpen(false);
            }}>
              {action.label}
            </li>
          ))}
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
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={texts.deleteTitle}
        message={texts.deleteMessage}
      />
    </div>
  );
};

export default ActionMenu; 