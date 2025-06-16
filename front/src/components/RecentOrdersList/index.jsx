import React from 'react';
import './styles.css';

const RecentOrdersList = ({ pedidos }) => {
  // Função para determinar a classe e texto do status
  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'concluido':
      case 'concluído':
        return 'status-concluido';
      case 'em_andamento':
      case 'em andamento':
        return 'status-andamento';
      case 'pendente':
        return 'status-pendente';
      case 'cancelado':
        return 'status-cancelado';
      default:
        console.log('Status não mapeado:', status);
        return 'status-outros';
    }
  };

  // Componente para texto com tooltip
  const TextoComTooltip = ({ texto, textoOriginal, className = "" }) => {
    const temTextoTruncado = textoOriginal && textoOriginal !== texto;
    
    return (
      <span 
        className={`texto-truncado ${className}`}
        title={temTextoTruncado ? textoOriginal : undefined}
      >
        {texto}
      </span>
    );
  };

  return (
    <div className="recent-orders-list">
      {pedidos.map((pedido, index) => (
        <div key={index} className="recent-order-item">
          <div className="order-main-info">
            <div className="order-header">
              <div className="order-number">#{pedido.id}</div>
              <span className={`order-status ${getStatusClass(pedido.status)}`}>
                {pedido.status}
              </span>
            </div>
            <div className="order-type">
              <TextoComTooltip 
                texto={pedido.tipo} 
                textoOriginal={pedido.tipoOriginal} 
              />
            </div>
            <div className="order-details">
              <div className="detail-item">
                <span className="detail-label">Dentista:</span>
                <TextoComTooltip 
                  texto={pedido.dentista} 
                  textoOriginal={pedido.dentistaOriginal}
                  className="detail-value"
                />
              </div>
              <div className="detail-item">
                <span className="detail-label">Paciente:</span>
                <TextoComTooltip 
                  texto={pedido.paciente} 
                  textoOriginal={pedido.pacienteOriginal}
                  className="detail-value"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="view-all-orders">
        <a href="/pedidos" className="view-all-link">Ver todos os pedidos</a>
      </div>
    </div>
  );
};

export default RecentOrdersList; 