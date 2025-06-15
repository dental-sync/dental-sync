import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../axios-config';
import Dropdown from '../Dropdown/Dropdown';
import DatePicker from '../DatePicker/DatePicker';
import { toast } from 'react-toastify';
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
  
  // Função para formatar data para input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Função para formatar data para exibição brasileira (DD/MM/AAAA)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR');
  };
  
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
        toast.error('Erro ao carregar dados do formulário. Recarregue a página.', {
          position: "top-right",
          autoClose: 5000,
        });
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
          const dataEntrega = pedido.dataEntrega ? formatDateForInput(pedido.dataEntrega) : '';
          
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
          
          // Mapear serviços com quantidade para edição
          const servicosComQuantidade = (pedido.servicos || []).map(servico => ({
            ...servico,
            quantidade: servico.quantidade || 1
          }));
          setServicosSelecionados(servicosComQuantidade);
        } catch (err) {
          console.error('Erro ao carregar pedido:', err);
          toast.error('Erro ao carregar dados do pedido. Verifique se o pedido existe.', {
            position: "top-right",
            autoClose: 5000,
          });
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

  const handleDataEntregaChange = (value) => {
    // Validação da data
    if (value) {
      const inputDate = new Date(value);
      const currentYear = new Date().getFullYear();
      
      // Validar se o ano está dentro de um range razoável
      if (inputDate.getFullYear() > currentYear + 50 || inputDate.getFullYear() < currentYear - 50) {
        toast.error('Ano inválido. Insira um ano entre ' + (currentYear - 50) + ' e ' + (currentYear + 50) + '.', {
          position: "top-right",
          autoClose: 4000,
        });
        setError('Por favor, insira uma data válida.');
        return;
      }
      
      setError(null); // Limpar erro se data válida
    }
    
    setFormData({
      ...formData,
      dataEntrega: value
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
    // Mapear serviços adicionando quantidade padrão
    const servicosComQuantidade = servicos.map(servico => {
      const existente = servicosSelecionados.find(s => s.id === servico.id);
      return {
        ...servico,
        quantidade: existente ? existente.quantidade : 1
      };
    });
    
    setFormData({
      ...formData,
      servicos
    });
    setServicosSelecionados(servicosComQuantidade);
  };
  
  const handleQuantidadeServicoChange = (servicoId, novaQuantidade) => {
    const quantidade = Math.max(1, parseInt(novaQuantidade) || 1);
    setServicosSelecionados(prev => 
      prev.map(servico => 
        servico.id === servicoId 
          ? { ...servico, quantidade }
          : servico
      )
    );
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
    
    // Validações antes do envio
    if (!formData.cliente) {
      toast.error('Selecione um cliente.', { position: "top-right", autoClose: 3000 });
      setLoading(false);
      return;
    }
    
    if (!formData.dentista) {
      toast.error('Selecione um dentista.', { position: "top-right", autoClose: 3000 });
      setLoading(false);
      return;
    }
    
    if (!formData.protetico) {
      toast.error('Selecione um protético.', { position: "top-right", autoClose: 3000 });
      setLoading(false);
      return;
    }
    
    if (!formData.dataEntrega) {
      toast.error('Selecione uma data de entrega.', { position: "top-right", autoClose: 3000 });
      setLoading(false);
      return;
    }
    
    if (!servicosSelecionados || servicosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um serviço.', { position: "top-right", autoClose: 3000 });
      setLoading(false);
      return;
    }
    
    try {
      // Preparar dados para envio
      const dadosParaEnviar = {
        cliente: formData.cliente ? { id: formData.cliente.id } : null,
        dentista: formData.dentista ? { id: formData.dentista.id } : null,
        protetico: formData.protetico ? { id: formData.protetico.id } : null,
        servicos: servicosSelecionados.map(servico => ({ 
          id: servico.id,
          quantidade: servico.quantidade || 1
        })),
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
      
      // Tratamento específico de erros
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        
        // Verificar se é erro de estoque insuficiente
        if (errorMessage.includes('Estoque insuficiente') || errorMessage.includes('estoque')) {
          toast.error(`${errorMessage}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (errorMessage.includes('Material não encontrado')) {
          toast.error('Material não encontrado. Verifique os serviços selecionados.', {
            position: "top-right",
            autoClose: 5000,
          });
        } else if (errorMessage.includes('obrigatório')) {
          toast.error('Preencha todos os campos obrigatórios.', {
            position: "top-right",
            autoClose: 4000,
          });
        } else {
          toast.error(`${errorMessage}`, {
            position: "top-right",
            autoClose: 4000,
          });
        }
        setError(errorMessage);
             } else if (err.response?.status === 400) {
         toast.error('Dados inválidos. Verifique as informações e tente novamente.', {
           position: "top-right",
           autoClose: 4000,
         });
         setError('Dados inválidos. Verifique as informações e tente novamente.');
       } else if (err.response?.status === 500) {
         toast.error('Erro interno do servidor. Tente novamente em alguns instantes.', {
           position: "top-right",
           autoClose: 5000,
         });
         setError('Erro interno do servidor. Tente novamente em alguns instantes.');
       } else {
         toast.error('Erro ao salvar pedido. Verifique sua conexão e tente novamente.', {
           position: "top-right",
           autoClose: 4000,
         });
         setError('Erro ao salvar pedido. Verifique os dados e tente novamente.');
       }
    } finally {
      setLoading(false);
    }
  };
  
  // Organizar dentes em apenas 2 linhas
  const dentesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const dentesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  
  // Calcular valores usando o valorTotal do serviço
  const calcularResumoValores = () => {
    let valorServicos = 0;
    let valorMateriais = 0;
    let valorTotal = 0;
    
    servicosSelecionados.forEach(servico => {
      const quantidade = servico.quantidade || 1;
      valorServicos += (servico.preco || 0) * quantidade;
      valorMateriais += (servico.valorMateriais || 0) * quantidade;
      valorTotal += (servico.valorTotal || servico.preco || 0) * quantidade;
    });
    
    return {
      valorServicos,
      valorMateriais,
      valorTotal
    };
  };
  
  const { valorServicos, valorMateriais, valorTotal } = calcularResumoValores();
  
  if (loadingData) {
    return <div className="loading">Carregando dados do pedido...</div>;
  }
  
  return (
    <div className="pedido-form-container">
      <form id="pedido-form" className="pedido-form" onSubmit={handleSubmit}>
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
                <DatePicker
                  id="dataEntrega"
                  value={formData.dataEntrega}
                  onChange={handleDataEntregaChange}
                  placeholder="DD/MM/AAAA"
                  maxDate={new Date(new Date().getFullYear() + 10, 11, 31).toISOString().split('T')[0]}
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
                  valueDisplayProperty="valorTotal"
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
                    {dentesSuperiores.map((numero, index) => (
                      <React.Fragment key={numero}>
                      <button
                        type="button"
                        className={`dente ${dentesSelecionados.includes(numero) ? 'selecionado' : ''}`}
                        onClick={() => toggleDente(numero)}
                      >
                        {numero}
                      </button>
                        {numero === 11 && <div className="dente-spacer"></div>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="dentes-row">
                    {dentesInferiores.map((numero, index) => (
                      <React.Fragment key={numero}>
                      <button
                        type="button"
                        className={`dente ${dentesSelecionados.includes(numero) ? 'selecionado' : ''}`}
                        onClick={() => toggleDente(numero)}
                      >
                        {numero}
                      </button>
                        {numero === 41 && <div className="dente-spacer"></div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status do Pedido */}
              <div className="pedido-status-container">
                <h3>Status do Pedido</h3>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select status-select"
                  disabled={pedidoId} // Só permite alterar status se estiver editando
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="FINALIZADO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              {/* Observações */}
              <div className="observacoes-container observacoes-expandida">
                <h3>Observações</h3>
                <textarea
                  id="observacao"
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="12"
                  placeholder="Adicione observações ou instruções especiais para este pedido"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Contêiner de Serviços */}
          {error && <div className="error-message" style={{marginBottom: 16}}>{error}</div>}
          <div className="servicos-container">
            <h3>Serviços Selecionados</h3>
            <div className="servicos-content">
              {servicosSelecionados.length > 0 ? (
                servicosSelecionados.map(servico => (
                  <div key={servico.id} className="servico-item">
                    <div className="servico-info">
                      <span className="servico-nome">{servico.nome}</span>
                      <div className="servico-valores">
                        <small>Mão de obra: R$ {(servico.preco || 0).toFixed(2).replace('.', ',')}</small>
                        <small>Materiais: R$ {(servico.valorMateriais || 0).toFixed(2).replace('.', ',')}</small>
                        <strong>Total: R$ {(servico.valorTotal || servico.preco || 0).toFixed(2).replace('.', ',')}</strong>
                      </div>
                    </div>
                    <div className="quantidade-controls">
                      <label>Qtd:</label>
                      <button
                        type="button"
                        className="btn-quantidade"
                        onClick={() => handleQuantidadeServicoChange(servico.id, (servico.quantidade || 1) - 1)}
                        disabled={servico.quantidade <= 1}
                      >-</button>
                      <input
                        type="number"
                        min="1"
                        value={servico.quantidade || 1}
                        onChange={(e) => handleQuantidadeServicoChange(servico.id, e.target.value)}
                        className="quantidade-input"
                      />
                      <button
                        type="button"
                        className="btn-quantidade"
                        onClick={() => handleQuantidadeServicoChange(servico.id, (servico.quantidade || 1) + 1)}
                      >+</button>
                    </div>
                </div>
                ))
              ) : (
                <p className="nenhum-servico">Nenhum serviço selecionado</p>
              )}
          </div>

            {/* Mini Resumo dos Valores */}
            <div className="resumo-valores">
              <div className="resumo-item">
                <span className="resumo-label">Valor dos Serviços (Mão de obra):</span>
                <span className="resumo-valor">R$ {valorServicos.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="resumo-item">
                <span className="resumo-label">Valor dos Materiais:</span>
                <span className="resumo-valor">R$ {valorMateriais.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="resumo-item resumo-total">
                <span className="resumo-label">Valor Total:</span>
                <span className="resumo-valor">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={() => navigate('/pedidos')}>
                Cancelar
              </button>
              <button type="submit" form="pedido-form" className="btn-salvar-pedido" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PedidoForm; 