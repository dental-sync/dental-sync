import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  // Normalizar o valor do status para comparação case-insensitive
  const normalizedStatus = status?.toUpperCase() || '';
  
  const getStatusClass = () => {
    switch (normalizedStatus) {
      case 'ATIVO':
        return 'status-active';
      case 'INATIVO':
        return 'status-inactive';
      default:
        return 'status-default';
    }
  };
  
  // Formatação do texto para exibição
  const displayText = normalizedStatus === 'ATIVO' ? 'Ativo' :
                      normalizedStatus === 'INATIVO' ? 'Inativo' : 
                      status || 'Desconhecido';
  
  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge; 