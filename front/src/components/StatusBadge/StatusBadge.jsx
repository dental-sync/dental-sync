import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  //Verifica se o status é boolean ou string e normaliza
  const isActive = typeof status === 'boolean' ? status : 
                   status === true || status === 'true' || 
                   status === 'ATIVO' || status === 'Ativo';
  
  //Usar tanto as classes novas quanto as antigas para compatibilidade
  const statusClass = isActive ? 'status-active status-ativo' : 'status-inactive status-inativo';
  const displayText = isActive ? 'Ativo' : 'Inativo';
  
  console.log('Status value:', status, 'Type:', typeof status, 'Is Active:', isActive);
  
  return (
    <span className={`status-badge ${statusClass}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge; 