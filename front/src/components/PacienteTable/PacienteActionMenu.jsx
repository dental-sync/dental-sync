import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './PacienteActionMenu.css';
import { useNavigate } from 'react-router-dom';
import api from '../../axios-config';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';

const PacienteActionMenu = ({ pacienteId, itemId, pacienteStatus, itemStatus, onPacienteDeleted, onItemDeleted, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const navigate = useNavigate();
  
  // Usar o pacienteId ou o itemId (dependendo de qual foi passado)
  const id = pacienteId || itemId;
  const status = pacienteStatus || itemStatus;
  const onDeleted = onPacienteDeleted || onItemDeleted;
  
  const isActive = status === true || 
                  status === 'true' ||
                  status === 'ATIVO' ||
                  status === 'Ativo';

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
    navigate(`/paciente/historico/${id}`);
    setIsOpen(false);
  };

  const handleEditar = () => {
    navigate(`/paciente/editar/${id}`);
    setIsOpen(false);
  };

  const handleExcluir = () => {
    if (isActive) {
      toast.error('Não é possível excluir um paciente ativo. Desative-o primeiro.');
    } else {
      setShowDeleteModal(true);
    }
    setIsOpen(false);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !isActive;
      console.log(`Atualizando status do paciente ${id} para ${newStatus ? 'Ativo' : 'Inativo'}`);
      
      const requestBody = { isActive: newStatus };
      console.log('Corpo da requisição:', JSON.stringify(requestBody));
      
      const response = await api.patch(`/paciente/${id}`, requestBody);
      
      console.log('Resposta da API:', response);
      
      if (response.status === 200) {
        // Notificar o componente pai sobre a mudança de status
        if (onStatusChange) {
          onStatusChange(id, newStatus ? 'ATIVO' : 'INATIVO');
        }
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao alterar status do paciente:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      console.log(`Iniciando exclusão do paciente ID ${id}`);
      
      const response = await api.delete(`/paciente/excluir/${id}`);
      
      console.log('Resposta da exclusão:', response.data);
      
      // Notificar o componente pai que o paciente foi excluído
      if (onDeleted) {
        onDeleted(id);
      }
      
    } catch (error) {
      console.error('Erro ao excluir paciente:', error.response?.data || error.message);
      
      // Exibir mensagem de erro
      const errorMessage = error.response?.data?.message || 'Erro ao excluir paciente. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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
          <li onClick={handleVerHistorico}>Ver histórico</li>
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
    <div className="paciente-action-menu">
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
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir permanentemente este paciente? Esta ação não poderá ser desfeita."
      />
    </div>
  );
};

export default PacienteActionMenu; 