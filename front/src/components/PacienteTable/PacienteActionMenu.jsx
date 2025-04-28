import React, { useState, useRef, useEffect } from 'react';
import './PacienteActionMenu.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';

const PacienteActionMenu = ({ pacienteId, onPacienteDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    setShowDeleteModal(true);
    setIsOpen(false);
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
      
      // Mensagem de sucesso usando toast
      toast.success('Paciente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast.error('Erro ao excluir paciente. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="paciente-action-menu" ref={dropdownRef}>
        <button className="action-menu-button" onClick={toggleDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="action-menu-dropdown">
            <ul>
              <li onClick={handleVerHistorico}>Ver histórico</li>
              <li onClick={handleEditar}>Editar</li>
              <li onClick={handleExcluir} className="delete-option">Excluir</li>
            </ul>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir permanentemente este paciente? Esta ação não poderá ser desfeita."
      />
    </>
  );
};

export default PacienteActionMenu; 