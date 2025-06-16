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
            <div className="order-type">{pedido.tipo}</div>
            <div className="order-details">
              <div className="detail-item">
                <span className="detail-label">Dentista:</span>
                <span className="detail-value">{pedido.dentista}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Paciente:</span>
                <span className="detail-value">{pedido.paciente}</span>
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