import React from 'react';
import './styles.css';

const BarChart = ({ data }) => {
  console.log('📊 BarChart recebeu dados:', data);
  
  // Verificar se há dados
  if (!data || data.length === 0) {
    return (
      <div className="bar-chart-container">
        <div className="no-data-message">
          <p>Nenhum dado disponível para exibir</p>
          <small>Crie alguns pedidos para ver o gráfico</small>
        </div>
      </div>
    );
  }
  
  // Encontrar o valor máximo para calcular as alturas relativas
  const maxValue = Math.max(...data.map(item => item.total));
  console.log('📊 MaxValue calculado:', maxValue);
  
  return (
    <div className="bar-chart-container">
      <div className="bar-chart">
        {data.map((item, index) => {
          // Calcular a altura relativa da barra (entre 20% e 100%)
          const barHeight = Math.max(20, (item.total / maxValue) * 100);
          console.log(`📊 Item ${item.mes}: total=${item.total}, height=${barHeight}%`);
          
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