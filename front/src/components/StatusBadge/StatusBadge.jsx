import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, isActive }) => {
  // Verifica se o campo isActive foi fornecido, senão usa o status 
  // (para compatibilidade durante a transição)
  const isActiveValue = isActive !== undefined ? isActive : status;
  
  //Verifica se o status é boolean ou string e normaliza
  const activeStatus = typeof isActiveValue === 'boolean' ? isActiveValue : 
                   isActiveValue === true || isActiveValue === 'true' || 
                   isActiveValue === 'ATIVO' || isActiveValue === 'Ativo';
  
  //Usar tanto as classes novas quanto as antigas para compatibilidade
  const statusClass = activeStatus ? 'status-active status-ativo' : 'status-inactive status-inativo';
  const displayText = activeStatus ? 'Ativo' : 'Inativo';
  
  console.log('Status value:', status, 'Type:', typeof status, 'Is Active:', activeStatus);
  
  return (
    <span className={`status-badge ${statusClass}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge; 