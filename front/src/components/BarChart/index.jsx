import React from 'react';
import './styles.css';

const BarChart = ({ data }) => {
  // Encontrar o valor máximo para calcular as alturas relativas
  const maxValue = Math.max(...data.map(item => item.total));
  
  return (
    <div className="bar-chart-container">
      <div className="bar-chart">
        {data.map((item, index) => {
          // Calcular a altura relativa da barra (entre 10% e 100%)
          const barHeight = Math.max(10, (item.total / maxValue) * 100);
          
          return (
            <div key={index} className="bar-item">
              <div className="bar-container">
                <div
                  className="bar"
                  style={{ height: `${barHeight}%` }}
                  title={`${item.mes}: ${item.total} pedidos`}
                >
                  <span className="bar-value">{item.total}</span>
                </div>
              </div>
              <div className="bar-label">{item.mes}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart; 