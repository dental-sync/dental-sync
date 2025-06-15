import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../axios-config';
import Dropdown from '../Dropdown/Dropdown';
import './PedidoForm.css';

const PedidoForm = ({ pedidoId = null, onSubmitSuccess }) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!pedidoId);
  const [error, setError] = useState(null);
  
  // Listas de referência
  const [clientes, setClientes] = useState([]);
  const [dentistas, setDentistas] = useState([]);
  const [proteticos, setProteticos] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    cliente: null,
    dentista: null,
    protetico: null,
    servicos: [],
    dataEntrega: '',
    prioridade: 'MEDIA',
    status: 'PENDENTE',
    odontograma: [],
    observacao: ''
  });
  
  // Estado para controlar quais dentes estão selecionados no odontograma
  const [dentesSelecionados, setDentesSelecionados] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  
  // Efeito para carregar dados de referência ao montar o componente
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Recupera o token do localStorage
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const [
          clientesResponse, 
          dentistasResponse, 
          proteticosResponse, 
          servicosResponse
        ] = await Promise.all([
          api.get('/paciente'),
          api.get('/dentistas'),
          api.get('/proteticos'),
          api.get('/servico')
        ]);
        
        setClientes(clientesResponse.data);
        setDentistas(dentistasResponse.data);
        setProteticos(proteticosResponse.data);
        setServicos(servicosResponse.data);
      } catch (err) {
        console.error('Erro ao carregar dados de referência:', err);
        setError('Não foi possível carregar os dados necessários para o formulário.');
      }
    };
    
    fetchReferenceData();
  }, []);
  
  // Efeito para carregar dados do pedido se estiver editando
  useEffect(() => {
    if (pedidoId) {
      const fetchPedido = async () => {
        try {
          setLoadingData(true);
          const response = await api.get(`/pedidos/${pedidoId}`);
          const pedido = response.data;
          
          // Formatar a data para o formato esperado pelo input date (YYYY-MM-DD)
          const dataEntrega = pedido.dataEntrega ? new Date(pedido.dataEntrega).toISOString().split('T')[0] : '';
          
          setFormData({
            cliente: pedido.cliente || null,
            dentista: pedido.dentista || null,
            protetico: pedido.protetico || null,
            servicos: pedido.servicos || [],
            dataEntrega,
            prioridade: pedido.prioridade || 'MEDIA',
            status: pedido.status || 'PENDENTE',
            odontograma: pedido.odontograma || [],
            observacao: pedido.observacao || ''
          });
          
          setDentesSelecionados(pedido.odontograma || []);
          setServicosSelecionados(pedido.servicos || []);
        } catch (err) {
          console.error('Erro ao carregar pedido:', err);
          setError('Não foi possível carregar os dados do pedido.');
        } finally {
          setLoadingData(false);
        }
      };
      
      fetchPedido();
    }
  }, [pedidoId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleClienteChange = (cliente) => {
    setFormData({
      ...formData,
      cliente
    });
  };

  const handleDentistaChange = (dentista) => {
    setFormData({
      ...formData,
      dentista
    });
  };

  const handleProteticoChange = (protetico) => {
    setFormData({
      ...formData,
      protetico
    });
  };

  const handleServicosChange = (servicos) => {
    setFormData({
      ...formData,
      servicos
    });
    setServicosSelecionados(servicos);
  };
  
  const toggleDente = (numero) => {
    setDentesSelecionados(prev => {
      if (prev.includes(numero)) {
        return prev.filter(n => n !== numero);
      } else {
        return [...prev, numero];
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Preparar dados para envio
      const dadosParaEnviar = {
        cliente: formData.cliente ? { id: formData.cliente.id } : null,
        dentista: formData.dentista ? { id: formData.dentista.id } : null,
        protetico: formData.protetico ? { id: formData.protetico.id } : null,
        servicos: formData.servicos.map(servico => ({ id: servico.id })),
        dataEntrega: formData.dataEntrega,
        prioridade: formData.prioridade,
        status: pedidoId ? formData.status : 'PENDENTE', // Manter status atual se editando, PENDENTE se novo
        odontograma: dentesSelecionados.join(','), // Converter array para string separada por vírgulas
        observacao: formData.observacao
      };
      
      // Criar ou atualizar pedido
      if (pedidoId) {
        await api.put(`/pedidos/${pedidoId}`, dadosParaEnviar);
      } else {
        await api.post('/pedidos', dadosParaEnviar);
      }
      
      // Notificar sucesso e redirecionar
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      navigate('/pedidos');
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      setError('Erro ao salvar pedido. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Organizar dentes em apenas 2 linhas
  const dentesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const dentesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  
  const valorTotal = servicosSelecionados.reduce((total, servico) => total + (servico.preco || 0), 0);
  
  if (loadingData) {
    return <div className="loading">Carregando dados do pedido...</div>;
  }
  
  return (
    <div className="pedido-form-container">
      <div className="pedido-header">
        <button className="back-button" onClick={() => navigate('/pedidos')}>
          ← Cadastro Pedido
        </button>
        <button type="button" className="btn-microfone">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
      </div>

      <form id="pedido-form" className="pedido-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-content">
          {/* Layout principal: Inputs à esquerda, Odontograma e Observações à direita */}
          <div className="main-layout">
            {/* Coluna Esquerda - Campos de Input */}
            <div className="inputs-container">
              <div className="form-group">
                <label htmlFor="cliente">Cliente</label>
                <Dropdown
                  items={clientes}
                  value={formData.cliente}
                  onChange={handleClienteChange}
                  placeholder="Selecionar cliente"
                  searchPlaceholder="Buscar cliente..."
                  displayProperty="nome"
                  valueProperty="id"
                  searchBy="nome"
                  searchable={true}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dataEntrega">Data Entrega</label>
                <input
                  type="date"
                  id="dataEntrega"
                  name="dataEntrega"
                  value={formData.dataEntrega}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dentista">Dentista</label>
                <Dropdown
                  items={dentistas}
                  value={formData.dentista}
                  onChange={handleDentistaChange}
                  placeholder="Selecionar dentista"
                  searchPlaceholder="Buscar dentista..."
                  displayProperty="nome"
                  valueProperty="id"
                  searchBy="nome"
                  searchable={true}
                />
              </div>

              <div className="form-group">
                <label htmlFor="protetico">Protético</label>
                <Dropdown
                  items={proteticos}
                  value={formData.protetico}
                  onChange={handleProteticoChange}
                  placeholder="Selecionar protético"
                  searchPlaceholder="Buscar protético..."
                  displayProperty="nome"
                  valueProperty="id"
                  searchBy="nome"
                  searchable={true}
                />
              </div>

              <div className="form-group">
                <label htmlFor="servico">Serviços</label>
                <Dropdown
                  items={servicos}
                  value={formData.servicos}
                  onChange={handleServicosChange}
                  placeholder="Selecionar serviços"
                  searchPlaceholder="Buscar serviços..."
                  displayProperty="nome"
                  valueProperty="id"
                  searchBy="nome"
                  searchable={true}
                  allowMultiple={true}
                  showCheckbox={true}
                  showItemValue={true}
                  valueDisplayProperty="preco"
                  valuePrefix="R$ "
                  maxHeight="250px"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prioridade">Prioridade</label>
                <select
                  id="prioridade"
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Selecione a prioridade</option>
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
            </div>

            {/* Coluna Direita - Odontograma e Observações */}
            <div className="right-column">
              {/* Odontograma */}
              <div className="odontograma-container">
                <h3>Odontograma</h3>
                <div className="odontograma">
                  <div className="dentes-row">
                    {dentesSuperiores.map(numero => (
                      <button
                        key={numero}
                        type="button"
                        className={`dente ${dentesSelecionados.includes(numero) ? 'selecionado' : ''}`}
                        onClick={() => toggleDente(numero)}
                      >
                        {numero}
                      </button>
                    ))}
                  </div>
                  <div className="dentes-row">
                    {dentesInferiores.map(numero => (
                      <button
                        key={numero}
                        type="button"
                        className={`dente ${dentesSelecionados.includes(numero) ? 'selecionado' : ''}`}
                        onClick={() => toggleDente(numero)}
                      >
                        {numero}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="observacoes-container">
                <h3>Observações</h3>
                <textarea
                  id="observacao"
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="8"
                  placeholder="Adicione observações ou instruções especiais para este pedido"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Contêiner de Serviços */}
          <div className="servicos-container">
            <h3>Serviços Selecionados</h3>
            <div className="servicos-content">
              {servicosSelecionados.length > 0 ? (
                servicosSelecionados.map(servico => (
                  <div key={servico.id} className="servico-item">
                    <span>{servico.nome}</span>
                    <span>R$ {(servico.preco || 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))
              ) : (
                <p className="nenhum-servico">Nenhum serviço selecionado</p>
              )}
            </div>
          </div>

          {/* Contêiner do Valor Total */}
          <div className="valor-container">
            <div className="valor-total">
              <span>Valor total: <strong>R$ {valorTotal.toFixed(2).replace('.', ',')}</strong></span>
            </div>
          </div>
        </div>
      </form>

      <div className="form-footer">
        <button type="submit" form="pedido-form" className="btn-salvar-pedido" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Pedido'}
        </button>
      </div>
    </div>
  );
};

export default PedidoForm; 