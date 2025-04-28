import React, { useState, useRef, useEffect } from 'react';
import './ActionMenu.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ActionMenu = ({ proteticoId, proteticoStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isActive = proteticoStatus === true || 
                  proteticoStatus === 'true' ||
                  proteticoStatus === 'ATIVO' ||
                  proteticoStatus === 'Ativo';

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
    navigate(`/protetico/historico/${proteticoId}`);
    setIsOpen(false);
  };

  const handleEditar = () => {
    navigate(`/protetico/editar/${proteticoId}`);
    setIsOpen(false);
  };

  const handleExcluir = () => {
    console.log(`Excluir protético ${proteticoId}`);
    setIsOpen(false);
  };
  
  const handleToggleStatus = async () => {
    try {
      const newStatus = !isActive;
      console.log(`Atualizando status do protético ${proteticoId} para ${newStatus ? 'Ativo' : 'Inativo'}`);
      
      const requestBody = { isActive: newStatus };
      console.log('Corpo da requisição:', JSON.stringify(requestBody));
      
      const response = await axios.patch(`http://localhost:8080/proteticos/${proteticoId}`, requestBody);
      
      console.log('Resposta da API:', response);
      
      if (response.status === 200) {
        // Notificar o componente pai sobre a mudança de status
        if (onStatusChange) {
          onStatusChange(proteticoId, newStatus);
        }
        toast.success(`Status atualizado com sucesso para ${newStatus ? 'Ativo' : 'Inativo'}`);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao alterar status do protético:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  return (
    <div className="action-menu" ref={dropdownRef}>
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
            <li onClick={handleToggleStatus}>
              {isActive ? 'Desativar' : 'Ativar'}
            </li>
            <li onClick={handleExcluir} className="delete-option">Excluir</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionMenu; 