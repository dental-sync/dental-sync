import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VisualizarPedido.css';
import ActionButton from '../../components/ActionButton/ActionButton';

const VisualizarPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPedido = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/pedidos/${id}`);
        setPedido(response.data);
      } catch (err) {
        console.error('Erro ao carregar pedido:', err);
        setError('Não foi possível carregar os dados do pedido.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPedido();
  }, [id]);
  
  // Função para formatar a data
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Função para converter enum de prioridade para texto em português
  const formatarPrioridade = (prioridade) => {
      const prioridadeMap = {
    'BAIXA': 'Baixa',
    'MEDIA': 'Média',
    'ALTA': 'Alta'
  };
    return prioridadeMap[prioridade] || prioridade;
  };
  
  // Função para obter a cor da prioridade
  const getPrioridadeColor = (prioridade) => {
    const colorMap = {
      'BAIXA': '#28a745',
      'MEDIA': '#17a2b8',
      'ALTA': '#ffc107'
    };
    return colorMap[prioridade] || '#6c757d';
  };
  
  if (loading) {
    return <div className="loading">Carregando dados do pedido...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="visualizar-pedido-page">
      <div className="page-header">
        <h1 className="page-title">Pedido #{pedido?.id}</h1>
        <div className="header-actions">
          <ActionButton
            label="Editar"
            variant="secondary"
            onClick={() => navigate(`/pedidos/editar/${id}`)}
          />
          <ActionButton
            label="Voltar"
            variant="outline"
            onClick={() => navigate('/pedidos')}
          />
        </div>
      </div>
      
      <div className="pedido-details-container">
        <div className="pedido-section">
          <h2 className="section-title">Informações Gerais</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Cliente:</span>
              <span className="detail-value">{pedido?.cliente?.nome || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Dentista:</span>
              <span className="detail-value">{pedido?.dentista?.nome || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Protético:</span>
              <span className="detail-value">{pedido?.protetico?.nome || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Serviço:</span>
              <span className="detail-value">{pedido?.servico?.nome || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Data de Entrega:</span>
              <span className="detail-value">{formatarData(pedido?.dataEntrega)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Prioridade:</span>
              <span 
                className="prioridade-badge"
                style={{ backgroundColor: getPrioridadeColor(pedido?.prioridade) }}
              >
                {formatarPrioridade(pedido?.prioridade)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="pedido-section">
          <h2 className="section-title">Odontograma</h2>
          <div className="odontograma-visualizacao">
            {Array.from({ length: 32 }, (_, i) => i + 1).map(numero => (
              <div
                key={numero}
                className={`dente-visualizacao ${pedido?.odontograma?.includes(numero) ? 'selecionado' : ''}`}
              >
                {numero}
              </div>
            ))}
          </div>
        </div>
        
        {pedido?.observacao && (
          <div className="pedido-section">
            <h2 className="section-title">Observações</h2>
            <div className="observacao-container">
              <p className="observacao-texto">{pedido.observacao}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizarPedido; 