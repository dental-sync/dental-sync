import React, { useState, useRef, useEffect } from 'react';
import './ActionMenuDentista.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ActionMenuDentista = ({ dentistaId, onDentistaDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    navigate(`/dentista/historico/${dentistaId}`);
    setIsOpen(false);
  };

  const handleEditar = () => {
    navigate(`/dentista/editar/${dentistaId}`);
    setIsOpen(false);
  };

  const handleExcluir = async () => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este dentista? Esta ação não poderá ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:8080/dentistas/${dentistaId}`);
        onDentistaDeleted(dentistaId);
        toast.success('Dentista excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir dentista:', error);
        toast.error('Erro ao excluir dentista. Tente novamente.');
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="action-menu-dentista" ref={dropdownRef}>
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
            <li onClick={handleVerHistorico}>Histórico</li>
            <li onClick={handleEditar}>Editar</li>
            <li onClick={handleExcluir} className="delete-option">Excluir</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionMenuDentista; 