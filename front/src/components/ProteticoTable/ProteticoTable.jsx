import React from 'react';
import './ProteticoTable.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import ActionMenu from '../ActionMenu/ActionMenu';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Função utilitária para formatar o ID
const formatProteticoId = (id) => `PT${String(id).padStart(4, '0')}`;

const ProteticoTable = ({ proteticos = [], onStatusChange, onProteticoDeleted, sortConfig, onSort, isEmpty }) => {
  const navigate = useNavigate();

  const handleStatusChange = async (proteticoId, newStatus) => {
    try {
      // Encontrar o protetico atual
      const proteticoAtual = proteticos.find(p => p.id === proteticoId);
      
      // Verificar se o status está realmente mudando
      const statusAtual = proteticoAtual.isActive === 'ATIVO';
      if (statusAtual === newStatus) {
        return; // Não faz nada se o status for o mesmo
      }

      await axios.patch(`/api/proteticos/${proteticoId}`, {
        isActive: newStatus
      });
      
      if (onStatusChange) {
        onStatusChange(proteticoId, newStatus ? 'ATIVO' : 'INATIVO');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    }
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
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
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('id')}>
              <span className="sortable-content">
                ID
                <div className="sort-icon">{getSortIcon('id')}</div>
              </span>
            </th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('nome')}>
              <span className="sortable-content">
                Nome
                <div className="sort-icon">{getSortIcon('nome')}</div>
              </span>
            </th>
            <th>CRO</th>
            <th>Email</th>
            <th>Telefone</th>
            <th className="sortable-header" data-sortable="true" onClick={() => onSort && onSort('isActive')}>
              <span className="sortable-content">
                Status
                <div className="sort-icon">{getSortIcon('isActive')}</div>
              </span>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? null : proteticos.length > 0 ? (
            proteticos.map((protetico, index) => {
              const isLastItem = index === proteticos.length - 1;
              
              return (
                <tr key={protetico.id} ref={isLastItem && protetico.ref ? protetico.ref : null}>
                  <td>{formatProteticoId(protetico.id)}</td>
                  <td>{protetico.nome}</td>
                  <td>{protetico.cro}</td>
                  <td>{protetico.email || '-'}</td>
                  <td>{protetico.telefone || '-'}</td>
                  <td>
                    <StatusBadge
                      status={protetico.isActive === 'ATIVO' || protetico.status === 'ATIVO'}
                      onClick={(newStatus) => handleStatusChange(protetico.id, newStatus)}
                    />
                  </td>
                  <td>
                    <ActionMenu 
                      itemId={protetico.id}
                      entityType="protetico"
                      apiEndpoint="/api/proteticos"
                      onDelete={onProteticoDeleted}
                      isActive={protetico.isActive === 'ATIVO' || protetico.status === 'ATIVO'}
                      texts={{
                        deleteTitle: 'Confirmar Exclusão',
                        deleteMessage: 'Tem certeza que deseja excluir este protético? Esta ação não pode ser desfeita.',
                        deleteWarning: 'Não é possível excluir um protético ativo. Desative-o primeiro.',
                        deleteSuccess: 'Protético excluído com sucesso!',
                        deleteError: 'Erro ao excluir protético. Tente novamente.'
                      }}
                    />
                  </td>
                </tr>
              );
            })
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
};

export default ProteticoTable; 