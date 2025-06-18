import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './styles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data }) => {
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Pedidos por Mês',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        // Ajusta a escala Y para ter um espaço adequado
        suggestedMax: Math.max(...data.map(item => item.total)) + 2
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const chartData = {
    labels: data.map(item => item.mes),
    datasets: [
      {
        label: 'Quantidade de Pedidos',
        data: data.map(item => item.total),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 50, // Controla a largura máxima das barras
      },
    ],
  };

  return (
    <div className="bar-chart-container">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default BarChart; 