import React, { useState, useEffect } from 'react';
import './styles.css';
import StatCard from '../../components/StatCard';
import ChartContainer from '../../components/ChartContainer';
import PeriodSelector from '../../components/PeriodSelector';
import BarChart from '../../components/BarChart';
import HorizontalBarChart from '../../components/HorizontalBarChart';
import RecentOrdersList from '../../components/RecentOrdersList';

// Dados mockados para testes - podem ser substituídos pela API
const mockData = {
  totalPedidos: 458,
  crescimentoPedidos: '+12.5% em relação ao mês anterior',
  pedidosConcluidos: 298,
  taxaConclusao: '65% de taxa de conclusão',
  dentistasAtivos: 24,
  crescimentoDentistas: '+2 novos dentistas este mês',
  pedidosPorMes: [
    { mes: 'Jan', total: 35 },
    { mes: 'Fev', total: 28 },
    { mes: 'Mar', total: 42 },
    { mes: 'Abr', total: 50 },
    { mes: 'Mai', total: 55 },
    { mes: 'Jun', total: 48 },
    { mes: 'Jul', total: 45 },
    { mes: 'Ago', total: 60 },
    { mes: 'Set', total: 70 },
    { mes: 'Out', total: 65 },
    { mes: 'Nov', total: 62 },
    { mes: 'Dez', total: 75 }
  ],
  pedidosPorTipo: [
    { tipo: 'Prótese Total', percentual: 35 },
    { tipo: 'Prótese Parcial', percentual: 25 },
    { tipo: 'Coroa', percentual: 20 },
    { tipo: 'Faceta', percentual: 10 },
    { tipo: 'Implante', percentual: 5 },
    { tipo: 'Outros', percentual: 5 }
  ],
  statusPedidos: [
    { status: 'Concluído', percentual: 65 },
    { status: 'Em Andamento', percentual: 20 },
    { status: 'Pendente', percentual: 10 },
    { status: 'Cancelado', percentual: 5 }
  ],
  pedidosRecentes: [
    { id: '458', tipo: 'Prótese Total', status: 'Pendente' },
    { id: '457', tipo: 'Coroa de Porcelana', status: 'Pendente' },
    { id: '456', tipo: 'Prótese Parcial Removível', status: 'Pendente' },
    { id: '455', tipo: 'Faceta de Porcelana', status: 'Em Andamento' },
    { id: '454', tipo: 'Implante Dentário', status: 'Concluído' }
  ]
};

const Relatorios = () => {
  const [periodo, setPeriodo] = useState('Último Mês');
  const [dadosRelatorio, setDadosRelatorio] = useState(mockData);
  
  // Simulação de carregamento de dados do backend
  useEffect(() => {
    // Aqui seria feita a chamada para a API
    // Exemplo: api.get('/relatorios', { params: { periodo } })
    //   .then(response => setDadosRelatorio(response.data))
    //   .catch(error => console.error('Erro ao carregar relatórios:', error));
    
    // Por enquanto, mantemos os dados mockados
    setDadosRelatorio(mockData);
  }, [periodo]);

  return (
    <div className="relatorios-page">
      <div className="relatorios-header">
        <h1>Relatórios</h1>
        <div className="relatorios-actions">
          <PeriodSelector 
            periodo={periodo} 
            setPeriodo={setPeriodo} 
          />
          <button className="btn-icon" title="Imprimir relatório">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
          </button>
          <button className="btn-icon" title="Exportar relatório">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="stat-cards">
        <StatCard 
          title="Total de Pedidos"
          value={dadosRelatorio.totalPedidos}
          description={dadosRelatorio.crescimentoPedidos}
          trend="up"
        />
        <StatCard 
          title="Pedidos Concluídos"
          value={dadosRelatorio.pedidosConcluidos}
          description={dadosRelatorio.taxaConclusao}
          trend="neutral"
        />
        <StatCard 
          title="Dentistas Ativos"
          value={dadosRelatorio.dentistasAtivos}
          description={dadosRelatorio.crescimentoDentistas}
          trend="up"
        />
      </div>

      <div className="charts-row">
        <ChartContainer 
          title="Pedidos por Mês" 
          subtitle="Número total de pedidos recebidos por mês"
          className="chart-container-large"
        >
          <BarChart data={dadosRelatorio.pedidosPorMes} />
        </ChartContainer>

        <ChartContainer 
          title="Pedidos por Tipo" 
          subtitle="Distribuição de pedidos por tipo de produto"
        >
          <HorizontalBarChart data={dadosRelatorio.pedidosPorTipo} colorScale="blue" />
        </ChartContainer>
      </div>

      <div className="charts-row">
        <ChartContainer 
          title="Status dos Pedidos" 
          subtitle="Distribuição atual dos pedidos por status"
        >
          <HorizontalBarChart data={dadosRelatorio.statusPedidos} colorScale="status" />
        </ChartContainer>

        <ChartContainer 
          title="Pedidos Recentes" 
          subtitle="Últimos pedidos registrados no sistema"
        >
          <RecentOrdersList pedidos={dadosRelatorio.pedidosRecentes} />
        </ChartContainer>
      </div>
    </div>
  );
};

export default Relatorios; 