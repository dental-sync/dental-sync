import React from 'react';
import './DentistaTable.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ActionMenuDentista from '../ActionMenuDentista/ActionMenuDentista';
import StatusBadge from '../StatusBadge/StatusBadge';

const DentistaTable = ({ dentistas, onDentistaDeleted, onStatusChange, sortConfig, onSort }) => {
  const navigate = useNavigate();

  const handleStatusChange = async (dentistaId, newStatus) => {
    try {
      // Encontrar o dentista atual
      const dentistaAtual = dentistas.find(d => d.id === dentistaId);
      
      // Verificar se o status está realmente mudando
      const statusAtual = dentistaAtual.isActive === 'ATIVO';
      if (statusAtual === newStatus) {
        return; // Não faz nada se o status for o mesmo
      }

      await axios.patch(`http://localhost:8080/dentistas/${dentistaId}`, {
        isActive: newStatus
      });
      
      onStatusChange(dentistaId, newStatus ? 'ATIVO' : 'INATIVO');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <span style={{fontSize: '18px', opacity: 0.4, marginLeft: '2px', marginTop: '-2px'}}>–</span>
      );
    }
    return sortConfig.direction === 'ascending' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    );
  };

  return (
    <div className="dentista-table-container">
      <table className="dentista-table">
        <thead>
          <tr>
            <th className="sortable-header" onClick={() => onSort('id')}>
              <span className="sortable-content">
                ID
                <div className="sort-icon">{getSortIcon('id')}</div>
              </span>
            </th>
            <th className="sortable-header" onClick={() => onSort('nome')}>
              <span className="sortable-content">
                Nome
                <div className="sort-icon">{getSortIcon('nome')}</div>
              </span>
            </th>
            <th>CRO</th>
            <th>Email</th>
            <th>Telefone</th>
            <th className="sortable-header" onClick={() => onSort('isActive')}>
              <span className="sortable-content">
                Status
                <div className="sort-icon">{getSortIcon('isActive')}</div>
              </span>
            </th>
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
              <td colSpan="7" className="empty-row"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DentistaTable; 