import React, { useState, useEffect, useRef } from 'react';
import './DentistaTable.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ActionMenuDentista from '../ActionMenuDentista/ActionMenuDentista';
import StatusBadge from '../StatusBadge/StatusBadge';

function DentistaTable({ dentistas, onDentistaDeleted, onStatusChange }) {
  const navigate = useNavigate();
  const [expandedClinicas, setExpandedClinicas] = useState({});
  const dropdownRefs = useRef({});

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedClinicas]);

  const handleStatusChange = async (dentistaId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8080/dentistas/${dentistaId}`, {
        isActive: newStatus
      });
      
      onStatusChange(dentistaId, newStatus ? 'ATIVO' : 'INATIVO');
      toast.success(`Dentista ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
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
                  <StatusBadge
                    status={dentista.isActive === 'ATIVO'}
                    onClick={(newStatus) => handleStatusChange(dentista.id, newStatus)}
                  />
                </td>
                <td>
                  <ActionMenuDentista 
                    dentistaId={dentista.id} 
                    onDentistaDeleted={onDentistaDeleted}
                    isActive={dentista.isActive === 'ATIVO'}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="empty-row"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DentistaTable; 