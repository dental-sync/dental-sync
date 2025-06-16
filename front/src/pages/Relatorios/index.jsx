import React, { useState, useEffect } from 'react';
import './styles.css';
import StatCard from '../../components/StatCard';
import ChartContainer from '../../components/ChartContainer';
import PeriodSelector from '../../components/PeriodSelector';
import BarChart from '../../components/BarChart';
import HorizontalBarChart from '../../components/HorizontalBarChart';
import RecentOrdersList from '../../components/RecentOrdersList';
import api from '../../axios-config';

//Funções auxiliares para cálculos
const calcularCrescimento = (atual, anterior) => {
  if (!anterior || anterior === 0) return '+0%';
  const crescimento = ((atual - anterior) / anterior) * 100;
  return `${crescimento > 0 ? '+' : ''}${crescimento.toFixed(1)}% em relação ao mês anterior`;
};

const calcularTaxaConclusao = (concluidos, total) => {
  if (!total || total === 0) return '0% de taxa de conclusão';
  const taxa = (concluidos / total) * 100;
  return `${taxa.toFixed(1)}% de taxa de conclusão`;
};

const calcularCrescimentoDentistas = (atual, anterior) => {
  // Se anterior é undefined ou null, considerar como 0
  const anteriorValido = anterior || 0;
  const crescimento = atual - anteriorValido;
  
  // Debug para entender os valores
  console.log('🦷 DEBUG Dentistas:', { atual, anterior: anteriorValido, crescimento });
  
  return `${crescimento > 0 ? '+' : ''}${crescimento} ${Math.abs(crescimento) === 1 ? 'novo dentista' : 'novos dentistas'} este mês`;
};

const processarDadosBackend = (dados) => {
  if (!dados) return null;

  //Garante que todos os campos necessários existam
  const dadosProcessados = {
    totalPedidos: dados.totalPedidos || 0,
    pedidosConcluidos: dados.pedidosConcluidos || 0,
    dentistasAtivos: dados.dentistasAtivos || 0,
    pedidosPorMes: dados.pedidosPorMes || [],
    pedidosPorTipo: dados.pedidosPorTipo || [],
    statusPedidos: dados.statusPedidos || [],
    pedidosRecentes: dados.pedidosRecentes || [],
    dadosAnteriores: dados.dadosAnteriores || {
      totalPedidos: 0,
      dentistasAtivos: 0
    }
  };

  return {
    ...dadosProcessados,
    crescimentoPedidos: calcularCrescimento(
      dadosProcessados.totalPedidos,
      dadosProcessados.dadosAnteriores.totalPedidos
    ),
    taxaConclusao: calcularTaxaConclusao(
      dadosProcessados.pedidosConcluidos,
      dadosProcessados.totalPedidos
    ),
    crescimentoDentistas: calcularCrescimentoDentistas(
      dadosProcessados.dentistasAtivos,
      dadosProcessados.dadosAnteriores.dentistasAtivos
    )
  };
};

const Relatorios = () => {
  const [periodo, setPeriodo] = useState('Último Mês');
  const [dadosRelatorio, setDadosRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        //Chamada para a API
        const response = await api.get('/relatorios/dashboard');
        const dadosBrutos = response.data;
        
        //Processa os dados brutos
        console.log('📊 Dados recebidos do backend:', dadosBrutos);
        const dadosProcessados = processarDadosBackend(dadosBrutos);
        console.log('📊 Dados processados para o frontend:', dadosProcessados);
        console.log('📊 Dados pedidos por mês:', dadosProcessados?.pedidosPorMes);
        setDadosRelatorio(dadosProcessados);
      } catch (erro) {
        console.error('Erro ao carregar relatórios:', erro);
        setError('Não foi possível carregar os dados do relatório');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [periodo]);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!dadosRelatorio) {
    return <div className="no-data">Nenhum dado disponível</div>;
  }

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
          trend={dadosRelatorio.totalPedidos > (dadosRelatorio.dadosAnteriores?.totalPedidos || 0) ? "up" : "down"}
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
          trend={dadosRelatorio.dentistasAtivos > (dadosRelatorio.dadosAnteriores?.dentistasAtivos || 0) ? "up" : "down"}
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