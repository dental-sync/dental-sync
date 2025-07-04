import React from 'react';
import './styles.css';

// Função para determinar a cor com base no tipo de escala e no índice
const getBarColor = (colorScale, index, label) => {
  // Escala de cores para barras azuis
  if (colorScale === 'blue') {
    const blueShades = [
      '#1e40af', // Azul mais escuro
      '#2563eb',
      '#3b82f6',
      '#60a5fa',
      '#93c5fd',
      '#bfdbfe'
    ];
    return blueShades[index % blueShades.length];
  }
  
  // Escala de cores para status (concluído, em andamento, pendente, cancelado)
  if (colorScale === 'status') {
    if (label.toLowerCase().includes('concluido')) return '#10b981';  // Verde
    if (label.toLowerCase().includes('em_andamento')) return '#3b82f6';  // Azul
    if (label.toLowerCase().includes('pendente')) return '#f59e0b';   // Amarelo
    if (label.toLowerCase().includes('cancelado')) return '#ef4444';  // Vermelho
    return '#94a3b8';  // Cinza para outros casos
  }
  
  // Cores padrão
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];
  return defaultColors[index % defaultColors.length];
};

const HorizontalBarChart = ({ data, colorScale = 'default' }) => {
  // Determinar a chave para o rótulo e valor com base no tipo de dados
  const labelKey = data[0]?.tipo ? 'tipo' : data[0]?.status ? 'status' : 'label';
  const valueKey = data[0]?.percentual ? 'percentual' : 'valor';
  
  // Ordenar os dados do maior para o menor
  const sortedData = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
  
  return (
    <div className="horizontal-bar-chart">
      {sortedData.map((item, index) => {
        const label = item[labelKey];
        const value = item[valueKey];
        const barColor = getBarColor(colorScale, index, label);
        
        return (
          <div key={index} className="horizontal-bar-item">
            <div className="horizontal-bar-label-row">
              <div className="horizontal-bar-label">
                <div 
                  className="color-indicator" 
                  style={{ backgroundColor: barColor }}
                ></div>
                <span 
                  className="label-text"
                  title={item.nomeOriginal && item.nomeOriginal !== label ? item.nomeOriginal : undefined}
                >
                  {label}
                </span>
              </div>
              <span className="horizontal-bar-value">{Number(value).toFixed(2)}%</span>
            </div>
            <div className="horizontal-bar-container">
              <div 
                className="horizontal-bar" 
                style={{ 
                  width: `${value}%`,
                  backgroundColor: barColor 
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalBarChart; 