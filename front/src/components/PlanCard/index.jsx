import React from 'react';
import './styles.css';

const PlanCard = ({ title, description, price, benefits, selected, onSelect }) => {
  return (
    <div className={`plan-card${selected ? ' selected' : ''}`}> 
      <div className="plan-card-header">
        <div className="plan-card-title">{title}</div>
        <div className="plan-card-description">{description}</div>
      </div>
      <div className="plan-card-price">R$ {price}/mês</div>
      <ul className="plan-card-benefits">
        {benefits.map((b, i) => (
          <li key={i} className="plan-card-benefit">
            <span className="plan-card-check">✔</span> {b}
          </li>
        ))}
      </ul>
      {!selected && (
        <button className="plan-card-btn" onClick={onSelect}>
          Selecionar
        </button>
      )}
    </div>
  );
};

export default PlanCard; 