import React from 'react';
import './GenericTable.css';
import { useNavigate } from 'react-router-dom';
import  api  from '../../axios-config';
import { toast } from 'react-toastify';
import StatusBadge from '../StatusBadge/StatusBadge';

// Função utilitária para limitar o texto
const limitText = (text, maxLength = 30) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const GenericTable = ({ 
  data, 
  onItemDeleted, 
  onStatusChange, 
  sortConfig, 
  onSort, 
  isEmpty,
  columns,
  formatId,
  statusField = 'isActive',
  apiEndpoint,
  emptyMessage,
  ActionMenuComponent,
  useCustomStatusRender = false,
  url,
  hideOptions = [],
  alwaysAllowDelete = false
}) => {
  const navigate = useNavigate();

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const itemAtual = data.find(item => item.id === itemId);
      
      const statusAtual = itemAtual[statusField];
      if (statusAtual === newStatus) {
        return;
      }

      await api.patch(`${apiEndpoint}/${itemId}`, {
        isActive: newStatus
      });
      
      onStatusChange(itemId, newStatus);
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
    <div className={`generic-table-container${isEmpty ? ' empty' : ''}`}>
      <table className="generic-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className={column.sortable ? 'sortable-header' : ''}
                data-sortable={column.sortable}
                data-column={column.key}
                onClick={column.sortable ? () => onSort(column.key) : undefined}
              >
                {column.sortable ? (
                  <span className="sortable-content">
                    {column.label}
                    <div className="sort-icon">{getSortIcon(column.key)}</div>
                  </span>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? null : data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => {
                  if (column.key === 'id') {
                    return <td key={column.key} data-column={column.key}>{formatId(item.id)}</td>;
                  }
                  if (column.key === statusField) {
                    if (useCustomStatusRender && column.render) {
                      return <td key={column.key} data-column={column.key}>{column.render(item[statusField])}</td>;
                    }
                    return (
                      <td key={column.key} data-column={column.key}>
                        <StatusBadge
                          status={item[statusField]}
                          onClick={(newStatus) => handleStatusChange(item.id, newStatus)}
                        />
                      </td>
                    );
                  }
                  if (column.key === 'actions') {
                    return (
                      <td key={column.key} data-column={column.key}>
                        <ActionMenuComponent 
                          itemId={item.id} 
                          onItemDeleted={onItemDeleted}
                          itemStatus={item[statusField]}
                          dentistaId={item.id}
                          proteticoId={item.id}
                          pacienteId={item.id}
                          clinicaId={item.id}
                          materialId={item.id}
                          isActive={item[statusField]}
                          url={url}
                          hideOptions={hideOptions}
                          alwaysAllowDelete={alwaysAllowDelete}
                        />
                      </td>
                    );
                  }
                  if (column.render) {
                    return <td key={column.key}>{column.render(item[column.key], item)}</td>;
                  }
                  return (
                    <td 
                      key={column.key} 
                      data-column={column.key}
                      title={item[column.key] || '-'}
                      className="truncated-cell"
                    >
                      {limitText(item[column.key])}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            null
          )}
        </tbody>
      </table>
      {isEmpty && (
        <div className="empty-table-message-absolute">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export default GenericTable; 