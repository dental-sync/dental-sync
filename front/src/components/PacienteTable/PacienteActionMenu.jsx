import React, { useState, useRef, useEffect } from 'react';
import './PacienteActionMenu.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

const PacienteActionMenu = ({ pacienteId, onPacienteDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
    setShowConfirmDialog(true);
    setIsOpen(false);
  };

  const confirmarExclusao = async () => {
    try {
      setIsDeleting(true);
      console.log(`Iniciando exclusão do paciente ID ${pacienteId}`);
      
      //Adicionar cabeçalhos para debug
      const response = await axios.delete(`http://localhost:8080/paciente/${pacienteId}`, {
        headers: {
          'X-Debug': 'true',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Resposta completa da exclusão:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });
      
      //Notificar o componente pai que o paciente foi excluído
      if (onPacienteDeleted) {
        onPacienteDeleted(pacienteId);
      }
      
      //Mensagem de sucesso
      alert('Paciente excluído com sucesso!');
    } catch (error) {
      console.error(`Erro ao excluir paciente ${pacienteId}:`, error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      alert(`Erro ao excluir paciente: ${error.response?.data?.message || error.message}. Tente novamente.`);
      
      //Mesmo com erro,será notificado o componente PAIZÃO para atualizar a lista
      // }
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  const cancelarExclusao = () => {
    setShowConfirmDialog(false);
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita."
        onConfirm={confirmarExclusao}
        onCancel={cancelarExclusao}
      />
    </>
  );
};

export default PacienteActionMenu; 