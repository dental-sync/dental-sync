import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    cliente: '',
    dentista: '',
    protetico: '',
    servico: '',
    dataEntrega: '',
    prioridade: 'MEDIA',
    odontograma: [],
    observacao: ''
  });
  
  // Estado para controlar quais dentes estão selecionados no odontograma
  const [dentesSelecionados, setDentesSelecionados] = useState([]);
  
  // Efeito para carregar dados de referência ao montar o componente
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [
          clientesResponse, 
          dentistasResponse, 
          proteticosResponse, 
          servicosResponse
        ] = await Promise.all([
          axios.get('http://localhost:8080/pacientes'),
          axios.get('http://localhost:8080/dentistas'),
          axios.get('http://localhost:8080/proteticos'),
          axios.get('http://localhost:8080/servicos')
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
          const response = await axios.get(`http://localhost:8080/pedidos/${pedidoId}`);
          const pedido = response.data;
          
          // Formatar a data para o formato esperado pelo input date (YYYY-MM-DD)
          const dataEntrega = pedido.dataEntrega ? new Date(pedido.dataEntrega).toISOString().split('T')[0] : '';
          
          setFormData({
            cliente: pedido.cliente?.id || '',
            dentista: pedido.dentista?.id || '',
            protetico: pedido.protetico?.id || '',
            servico: pedido.servico?.id || '',
            dataEntrega,
            prioridade: pedido.prioridade || 'MEDIA',
            odontograma: pedido.odontograma || [],
            observacao: pedido.observacao || ''
          });
          
          setDentesSelecionados(pedido.odontograma || []);
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
        cliente: { id: parseInt(formData.cliente) },
        dentista: { id: parseInt(formData.dentista) },
        protetico: { id: parseInt(formData.protetico) },
        servico: { id: parseInt(formData.servico) },
        dataEntrega: formData.dataEntrega,
        prioridade: formData.prioridade,
        odontograma: dentesSelecionados,
        observacao: formData.observacao
      };
      
      // Criar ou atualizar pedido
      if (pedidoId) {
        await axios.put(`http://localhost:8080/pedidos/${pedidoId}`, dadosParaEnviar);
      } else {
        await axios.post('http://localhost:8080/pedidos', dadosParaEnviar);
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
  
  // Gerar números dos dentes para o odontograma (1-32)
  const numerosDentes = Array.from({ length: 32 }, (_, i) => i + 1);
  
  if (loadingData) {
    return <div className="loading">Carregando dados do pedido...</div>;
  }
  
  return (
    <div className="pedido-form-container">
      <form className="pedido-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cliente">Cliente*</label>
            <select
              id="cliente"
              name="cliente"
              value={formData.cliente}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="dentista">Dentista*</label>
            <select
              id="dentista"
              name="dentista"
              value={formData.dentista}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Selecione um dentista</option>
              {dentistas.map(dentista => (
                <option key={dentista.id} value={dentista.id}>
                  {dentista.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="protetico">Protético*</label>
            <select
              id="protetico"
              name="protetico"
              value={formData.protetico}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Selecione um protético</option>
              {proteticos.map(protetico => (
                <option key={protetico.id} value={protetico.id}>
                  {protetico.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="servico">Serviço*</label>
            <select
              id="servico"
              name="servico"
              value={formData.servico}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Selecione um serviço</option>
              {servicos.map(servico => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataEntrega">Data de Entrega*</label>
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
            <label htmlFor="prioridade">Prioridade*</label>
            <select
              id="prioridade"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Odontograma (Selecione os dentes)</label>
          <div className="odontograma">
            {numerosDentes.map(numero => (
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
        
        <div className="form-group">
          <label htmlFor="observacao">Observações</label>
          <textarea
            id="observacao"
            name="observacao"
            value={formData.observacao}
            onChange={handleInputChange}
            className="form-textarea"
            rows="4"
            placeholder="Detalhes adicionais sobre o pedido..."
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={() => navigate('/pedidos')}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
          >
            {loading ? 'Salvando...' : pedidoId ? 'Atualizar Pedido' : 'Criar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PedidoForm; 