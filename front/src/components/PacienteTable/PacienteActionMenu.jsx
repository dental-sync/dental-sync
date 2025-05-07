import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './PacienteActionMenu.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';

const PacienteActionMenu = ({ pacienteId, pacienteStatus, onPacienteDeleted, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const navigate = useNavigate();
  const isActive = pacienteStatus === true || 
                  pacienteStatus === 'true' ||
                  pacienteStatus === 'ATIVO' ||
                  pacienteStatus === 'Ativo';

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
    navigate(`/paciente/historico/${pacienteId}`);
    setIsOpen(false);
  };

  const handleEditar = () => {
    navigate(`/paciente/editar/${pacienteId}`);
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
      console.log(`Atualizando status do paciente ${pacienteId} para ${newStatus ? 'Ativo' : 'Inativo'}`);
      
      const requestBody = { isActive: newStatus };
      console.log('Corpo da requisição:', JSON.stringify(requestBody));
      
      const response = await axios.patch(`http://localhost:8080/paciente/${pacienteId}`, requestBody);
      
      console.log('Resposta da API:', response);
      
      if (response.status === 200) {
        // Notificar o componente pai sobre a mudança de status
        if (onStatusChange) {
          onStatusChange(pacienteId, newStatus);
        }
        toast.success(`Status atualizado com sucesso para ${newStatus ? 'Ativo' : 'Inativo'}`);
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
      console.log(`Iniciando exclusão do paciente ID ${pacienteId}`);
      
      const response = await axios.delete(`http://localhost:8080/paciente/excluir/${pacienteId}`);
      
      console.log('Resposta da exclusão:', response.data);
      
      // Notificar o componente pai que o paciente foi excluído
      if (onPacienteDeleted) {
        onPacienteDeleted(pacienteId);
      }
      
      toast.success('Paciente excluído com sucesso!');
      
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