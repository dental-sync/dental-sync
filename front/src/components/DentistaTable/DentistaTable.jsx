import React, { useState, useEffect, useRef } from 'react';
import './DentistaTable.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ActionMenuDentista from '../ActionMenuDentista/ActionMenuDentista';

function DentistaTable({ dentistas, onDentistaDeleted, onStatusChange }) {
  const navigate = useNavigate();
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [expandedClinicas, setExpandedClinicas] = useState({});
  const dropdownRefs = useRef({});
  const statusDropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Fechar dropdown de clínicas
      Object.keys(expandedClinicas).forEach(dentistaId => {
        const dropdown = dropdownRefs.current[dentistaId];
        if (dropdown && !dropdown.contains(event.target)) {
          setExpandedClinicas(prev => ({
            ...prev,
            [dentistaId]: false
          }));
        }
      });

      // Fechar dropdown de status
      if (showStatusDropdown) {
        const statusDropdown = statusDropdownRefs.current[showStatusDropdown];
        if (statusDropdown && !statusDropdown.contains(event.target)) {
          setShowStatusDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedClinicas, showStatusDropdown]);

  const handleEdit = (id) => {
    navigate(`/dentista/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este dentista?')) {
      try {
        await axios.delete(`http://localhost:8080/dentistas/${id}`);
        onDentistaDeleted(id);
        toast.success('Dentista excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir dentista:', error);
        toast.error('Erro ao excluir dentista. Tente novamente.');
      }
    }
  };

  const handleStatusClick = (id) => {
    setShowStatusDropdown(showStatusDropdown === id ? null : id);
  };

  const handleStatusChange = async (dentistaId, newStatus) => {
    try {
      // Converte o status de string para booleano
      const statusBoolean = newStatus === 'ATIVO';
      
      await axios.patch(`http://localhost:8080/dentistas/${dentistaId}`, {
        status: statusBoolean
      });
      
      // Atualiza o estado local com o novo status em string
      onStatusChange(dentistaId, newStatus);
      setShowStatusDropdown(null);
      
      // Mostra mensagem de sucesso
      toast.success(`Dentista ${newStatus.toLowerCase()} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  const toggleClinicas = (dentistaId) => {
    setExpandedClinicas(prev => ({
      ...prev,
      [dentistaId]: !prev[dentistaId]
    }));
  };

  return (
    <div className="dentista-table-container">
      <table className="dentista-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CRO</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Clínicas</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dentistas.length > 0 ? (
            dentistas.map((dentista) => (
              <tr key={dentista.id}>
                <td>{dentista.id}</td>
                <td>{dentista.nome}</td>
                <td>{dentista.cro}</td>
                <td>{dentista.email}</td>
                <td>{dentista.telefone}</td>
                <td>
                  <div 
                    ref={el => dropdownRefs.current[dentista.id] = el}
                    className={`clinicas-dropdown ${expandedClinicas[dentista.id] ? 'active' : ''}`}
                  >
                    <button
                      className="clinicas-toggle"
                      onClick={() => toggleClinicas(dentista.id)}
                    >
                      <span>
                        {dentista.clinicas?.length > 0 
                          ? `${dentista.clinicas[0].nome}${dentista.clinicas?.length > 1 ? '...' : ''}`
                          : 'Nenhuma clínica'
                        }
                      </span>
                    </button>
                    {expandedClinicas[dentista.id] && dentista.clinicas?.length > 0 && (
                      <div className="clinicas-list">
                        {dentista.clinicas.map((clinica) => (
                          <div key={clinica.id} className="clinica-item">
                            {clinica.nome}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div 
                    ref={el => statusDropdownRefs.current[dentista.id] = el}
                    className="status-container"
                  >
                    <button
                      className={`status-badge status-${dentista.status.toLowerCase()}`}
                      onClick={() => handleStatusClick(dentista.id)}
                    >
                      {dentista.status}
                    </button>
                    {showStatusDropdown === dentista.id && (
                      <div className="status-dropdown">
                        <button
                          className={`status-option ${dentista.status === 'ATIVO' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(dentista.id, 'ATIVO')}
                        >
                          Ativo
                        </button>
                        <button
                          className={`status-option ${dentista.status === 'INATIVO' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(dentista.id, 'INATIVO')}
                        >
                          Inativo
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <ActionMenuDentista dentistaId={dentista.id} onDentistaDeleted={onDentistaDeleted} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="empty-row">Nenhum dentista encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DentistaTable; 