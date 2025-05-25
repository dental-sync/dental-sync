import React from 'react';
import './ProteticoTable.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ActionMenu from '../ActionMenu/ActionMenu';
import StatusBadge from '../StatusBadge/StatusBadge';
import { formatProteticoId } from '../../utils/formatters';

const ProteticoTable = ({ proteticos, onProteticoDeleted, onStatusChange, sortConfig, onSort, isEmpty }) => {
  const navigate = useNavigate();

  const handleStatusChange = async (proteticoId, newStatus) => {
    try {
      // Encontrar o protético atual
      const proteticoAtual = proteticos.find(p => p.id === proteticoId);
      
      // Verificar se o status está realmente mudando
      const statusAtual = proteticoAtual.status === 'ATIVO';
      if (statusAtual === newStatus) {
        return; // Não faz nada se o status for o mesmo
      }

      await axios.patch(`http://localhost:8080/proteticos/${proteticoId}`, {
        isActive: newStatus
      });
      
      onStatusChange(proteticoId, newStatus ? 'ATIVO' : 'INATIVO');
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
    <div className={`protetico-table-container${isEmpty ? ' empty' : ''}`}>
      <table className="protetico-table">
        <thead>
          <tr>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort('id')}>
              <span className="sortable-content">
                ID
                <div className="sort-icon">{getSortIcon('id')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort('nome')}>
              <span className="sortable-content">
                Nome
                <div className="sort-icon">{getSortIcon('nome')}</div>
              </span>
            </th>
            <th>CRO</th>
            <th>Cargo</th>
            <th>Telefone</th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort('status')}>
              <span className="sortable-content">
                Status
                <div className="sort-icon">{getSortIcon('status')}</div>
              </span>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? null : proteticos.length > 0 ? (
            proteticos.map((protetico) => (
              <tr key={protetico.id}>
                <td>{formatProteticoId(protetico.id)}</td>
                <td>{protetico.nome}</td>
                <td>{protetico.cro}</td>
                <td>{protetico.cargo}</td>
                <td>{protetico.telefone}</td>
                <td>
                  <StatusBadge
                    status={protetico.status === 'ATIVO'}
                    onClick={(newStatus) => handleStatusChange(protetico.id, newStatus)}
                  />
                </td>
                <td>
                  <ActionMenu 
                    proteticoId={protetico.id} 
                    onProteticoDeleted={onProteticoDeleted}
                    isActive={protetico.status === 'ATIVO'}
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
      {isEmpty && (
        <div className="empty-table-message-absolute">
          Nenhum protético cadastrado
        </div>
      )}
    </div>
  );
}

export default ProteticoTable; 