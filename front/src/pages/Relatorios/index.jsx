import React, { useState, useEffect, useRef } from 'react';
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

// Função para truncar texto e preservar layout
const truncarTexto = (texto, maxCaracteres = 30) => {
  if (!texto) return '';
  if (texto.length <= maxCaracteres) return texto;
  return texto.substring(0, maxCaracteres - 3) + '...';
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
  
  return `${crescimento > 0 ? '+' : ''}${crescimento} ${Math.abs(crescimento) === 1 ? 'novo dentista' : 'novos dentistas'} este mês`;
};

const processarDadosBackend = (dados) => {
  if (!dados) return null;

  // Aplicar máscara nos pedidos recentes para proteger layout
  const pedidosRecentesMascarados = (dados.pedidosRecentes || []).map(pedido => ({
    ...pedido,
    dentista: truncarTexto(pedido.dentista, 30),
    paciente: truncarTexto(pedido.paciente, 30),
    tipo: truncarTexto(pedido.tipo, 35),
    // Guardar originais para tooltip
    dentistaOriginal: pedido.dentista,
    pacienteOriginal: pedido.paciente,
    tipoOriginal: pedido.tipo
  }));

  // Aplicar máscara nos dados de gráficos e ordenar por percentual
  const pedidosPorTipoMascarados = (dados.pedidosPorTipo || [])
    .map(item => ({
      ...item,
      nome: truncarTexto(item.nome, 25),
      nomeOriginal: item.nome
    }))
    .sort((a, b) => b.percentual - a.percentual); // Ordena do maior para o menor

  // Ordenar status dos pedidos por percentual
  const statusPedidosOrdenados = (dados.statusPedidos || [])
    .sort((a, b) => b.percentual - a.percentual);

  //Garante que todos os campos necessários existam
  const dadosProcessados = {
    totalPedidos: dados.totalPedidos || 0,
    pedidosConcluidos: dados.pedidosConcluidos || 0,
    dentistasAtivos: dados.dentistasAtivos || 0,
    pedidosPorMes: dados.pedidosPorMes || [],
    pedidosPorTipo: pedidosPorTipoMascarados,
    statusPedidos: statusPedidosOrdenados,
    pedidosRecentes: pedidosRecentesMascarados,
    dadosAnteriores: dados.dadosAnteriores || {
      totalPedidos: 0,
      dentistasAtivos: 0
    }
  };

  // Calcular descrições e aplicar máscara se necessário
  const crescimentoPedidos = calcularCrescimento(
    dadosProcessados.totalPedidos,
    dadosProcessados.dadosAnteriores.totalPedidos
  );
  const taxaConclusao = calcularTaxaConclusao(
    dadosProcessados.pedidosConcluidos,
    dadosProcessados.totalPedidos
  );
  const crescimentoDentistas = calcularCrescimentoDentistas(
    dadosProcessados.dentistasAtivos,
    dadosProcessados.dadosAnteriores.dentistasAtivos
  );

  return {
    ...dadosProcessados,
    crescimentoPedidos: truncarTexto(crescimentoPedidos, 45),
    crescimentoPedidosOriginal: crescimentoPedidos,
    taxaConclusao: truncarTexto(taxaConclusao, 45),
    taxaConclusaoOriginal: taxaConclusao,
    crescimentoDentistas: truncarTexto(crescimentoDentistas, 45),
    crescimentoDentistasOriginal: crescimentoDentistas
  };
};

const Relatorios = () => {
  const [periodo, setPeriodo] = useState('Último Mês');
  const [dadosRelatorio, setDadosRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geratingPDF, setGeratingPDF] = useState(false);
  const [atualizarDados, setAtualizarDados] = useState(0);
  const relatorioRef = useRef();
  
  // Função para forçar atualização dos dados
  const forcarAtualizacao = () => {
    setAtualizarDados(prev => prev + 1);
  };

  // Expor a função de atualização para outros componentes
  React.useEffect(() => {
    window.atualizarRelatorios = forcarAtualizacao;
    return () => {
      delete window.atualizarRelatorios;
    };
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        //Chamada para a API
        const response = await api.get('/relatorios/dashboard');
        const dadosBrutos = response.data;
        
        //Processa os dados brutos
        const dadosProcessados = processarDadosBackend(dadosBrutos);
        setDadosRelatorio(dadosProcessados);
      } catch (erro) {
        console.error('Erro ao carregar relatórios:', erro);
        setError('Não foi possível carregar os dados do relatório');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [periodo, atualizarDados]); // Adicionado atualizarDados como dependência

  // Função para gerar PDF
  const gerarPDF = async () => {
    try {
      setGeratingPDF(true);
      
      //Esconde o botão antes de capturar
      const btnExportar = document.querySelector('.btn-icon');
      if (btnExportar) {
        btnExportar.style.display = 'none';
      }
      
      // Importar as bibliotecas dinamicamente
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      // Capturar o elemento da página
      const elemento = relatorioRef.current;
      
      // Configurar o canvas
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: elemento.scrollWidth,
        height: elemento.scrollHeight
      });
      
      // Configurar o PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Gerar nome do arquivo com data atual
      const agora = new Date();
      const dataFormatada = agora.toLocaleDateString('pt-BR').replace(/\//g, '-');
      const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const nomeArquivo = `relatorio-dentalsync-${dataFormatada}-${horaFormatada}.pdf`;
      
      // Baixar o PDF
      pdf.save(nomeArquivo);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório em PDF. Tente novamente.');
    } finally {
      // Mostra o botão novamente após finalizar
      const btnExportar = document.querySelector('.btn-icon');
      if (btnExportar) {
        btnExportar.style.display = 'flex';
      }
      setGeratingPDF(false);
    }
  };

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
    <div className="relatorios-page" ref={relatorioRef}>
      <div className="relatorios-header">
        <h1>Relatórios</h1>
        <div className="relatorios-actions">
          <PeriodSelector 
            periodo={periodo} 
            setPeriodo={setPeriodo} 
          />

          <button 
            className="btn-icon" 
            title="Exportar relatório em PDF"
            onClick={gerarPDF}
            disabled={geratingPDF}
          >
            {geratingPDF ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="stat-cards">
        <StatCard 
          title="Total de Pedidos"
          value={dadosRelatorio.totalPedidos}
          description={dadosRelatorio.crescimentoPedidos}
          descriptionOriginal={dadosRelatorio.crescimentoPedidosOriginal}
          trend={dadosRelatorio.totalPedidos > (dadosRelatorio.dadosAnteriores?.totalPedidos || 0) ? "up" : "down"}
        />
        <StatCard 
          title="Pedidos Concluídos"
          value={dadosRelatorio.pedidosConcluidos}
          description={dadosRelatorio.taxaConclusao}
          descriptionOriginal={dadosRelatorio.taxaConclusaoOriginal}
          trend="neutral"
        />
        <StatCard 
          title="Dentistas Ativos"
          value={dadosRelatorio.dentistasAtivos}
          description={dadosRelatorio.crescimentoDentistas}
          descriptionOriginal={dadosRelatorio.crescimentoDentistasOriginal}
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