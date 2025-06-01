import React from 'react';
import './styles.css';

const RecentOrdersList = ({ pedidos }) => {
  // Função para determinar a classe e texto do status
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'concluído':
        return 'status-concluido';
      case 'em andamento':
        return 'status-andamento';
      case 'pendente':
        return 'status-pendente';
      case 'cancelado':
        return 'status-cancelado';
      default:
        return 'status-outros';
    }
  };

  return (
    <div className="recent-orders-list">
      {pedidos.map((pedido, index) => (
        <div key={index} className="recent-order-item">
          <div className="order-info">
            <div className="order-number">#{pedido.id}</div>
            <div className="order-type">{pedido.tipo}</div>
          </div>
          <div className="order-status-wrapper">
            <span className={`order-status ${getStatusClass(pedido.status)}`}>
              {pedido.status}
            </span>
          </div>
        </div>
      ))}
      
      <div className="view-all-orders">
        <a href="#" className="view-all-link">Ver todos os pedidos</a>
      </div>
    </div>
  );
};

export default RecentOrdersList; 