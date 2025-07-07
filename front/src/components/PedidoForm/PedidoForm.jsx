import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
// axios removido - usando api do axios-config
import api from '../../axios-config';
import Dropdown from '../Dropdown/Dropdown';
import DatePicker from '../DatePicker/DatePicker';
import { toast } from 'react-toastify';
import './PedidoForm.css';



const PedidoForm = forwardRef(({ pedidoId = null, onSubmitSuccess }, ref) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!pedidoId);
  const [error, setError] = useState(null);
  
  // Listas de referência
  const [clientes, setClientes] = useState([]);
  const [dentistas, setDentistas] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [clinicasFiltradasPorDentista, setClinicasFiltradasPorDentista] = useState([]);
  const [proteticos, setProteticos] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    cliente: null,
    dentista: null,
    clinica: null,
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
  
  // Debug para monitorar mudanças no estado servicosSelecionados
  useEffect(() => {
    console.log('=== ESTADO servicosSelecionados MUDOU ===');
    console.log('Novos serviços selecionados:', servicosSelecionados);
    servicosSelecionados.forEach(servico => {
      console.log(`- ${servico.nome}: quantidade = ${servico.quantidade}`);
    });
  }, [servicosSelecionados]);

  // Método para preencher os dados via STT
  const preencherDadosSTT = React.useCallback((dadosProcessados) => {
    try {
      console.log('Dados recebidos do STT:', dadosProcessados);
      
      let dados;
      
      // Diferentes formatos de resposta possíveis
      if (dadosProcessados.output) {
        dados = JSON.parse(dadosProcessados.output);
      } else if (dadosProcessados.rawResponse) {
        const rawData = JSON.parse(dadosProcessados.rawResponse);
        if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].output) {
          dados = JSON.parse(rawData[0].output);
        } else {
          throw new Error('Formato de resposta não reconhecido');
        }
      } else if (typeof dadosProcessados === 'string') {
        dados = JSON.parse(dadosProcessados);
      } else {
        dados = dadosProcessados;
      }
      
      console.log('Dados processados:', dados);
      const novoFormData = {};
      let camposPreenchidos = [];
      let camposNaoEncontrados = [];
      
      // Procurar cliente pelo ID
      if (dados.cliente_id && clientes.length > 0) {
        const clienteEncontrado = clientes.find(c => c.id === dados.cliente_id);
        if (clienteEncontrado) {
          novoFormData.cliente = clienteEncontrado;
          camposPreenchidos.push('Cliente');
        } else {
          camposNaoEncontrados.push('Cliente (ID não encontrado)');
        }
      }
      
      // Procurar dentista pelo ID  
      if (dados.dentista_id && dentistas.length > 0) {
        const dentistaEncontrado = dentistas.find(d => d.id === dados.dentista_id);
        if (dentistaEncontrado) {
          novoFormData.dentista = dentistaEncontrado;
          camposPreenchidos.push('Dentista');
        } else {
          camposNaoEncontrados.push('Dentista (ID não encontrado)');
        }
      }
      
      // Procurar protético pelo ID
      if (dados.protetico_id && proteticos.length > 0) {
        const proteticoEncontrado = proteticos.find(p => p.id === dados.protetico_id);
        if (proteticoEncontrado) {
          novoFormData.protetico = proteticoEncontrado;
          camposPreenchidos.push('Protético');
        } else {
          camposNaoEncontrados.push('Protético (ID não encontrado)');
        }
      }
      
      // Procurar e selecionar serviços (agrupando serviços iguais)
      let servicosEncontrados = [];
      const servicosAgrupados = new Map();
      
      if (dados.servicos && Array.isArray(dados.servicos) && servicos.length > 0) {
        dados.servicos.forEach(servicoData => {
          const servicoEncontrado = servicos.find(s => s.id === servicoData.id);
          if (servicoEncontrado) {
            if (servicosAgrupados.has(servicoData.id)) {
              // Se já existe, somar a quantidade
              const existente = servicosAgrupados.get(servicoData.id);
              existente.quantidade += (servicoData.quantidade || 1);
            } else {
              // Se não existe, adicionar
              servicosAgrupados.set(servicoData.id, {
                ...servicoEncontrado,
                quantidade: servicoData.quantidade || 1
              });
            }
          }
        });
        
        servicosEncontrados = Array.from(servicosAgrupados.values());
        
        if (servicosEncontrados.length > 0) {
          novoFormData.servicos = servicosEncontrados.map(s => ({ ...s })); // Sem quantidade para o formData
          camposPreenchidos.push(`${servicosEncontrados.length} Serviço(s)`);
        }
      }
      
      // Definir dentes selecionados
      if (dados.dentes && Array.isArray(dados.dentes) && dados.dentes.length > 0) {
        novoFormData.odontograma = dados.dentes;
        camposPreenchidos.push(`${dados.dentes.length} Dente(s)`);
      }
      
      // Definir prioridade
      if (dados.prioridade) {
        const prioridadeMap = {
          'baixa': 'BAIXA',
          'media': 'MEDIA', 
          'alta': 'ALTA'
        };
        novoFormData.prioridade = prioridadeMap[dados.prioridade.toLowerCase()] || 'MEDIA';
        camposPreenchidos.push('Prioridade');
      }
      
      // Definir data
      if (dados.data) {
        const dataFormatada = formatDateForBrazilian(dados.data);
        if (dataFormatada) {
          novoFormData.dataEntrega = dataFormatada;
          camposPreenchidos.push('Data de Entrega');
        }
      }
      
      // Atualizar o estado uma única vez
      setFormData(prev => ({ ...prev, ...novoFormData }));
      
      // Atualizar arrays específicos
      if (dados.dentes && Array.isArray(dados.dentes)) {
        setDentesSelecionados(dados.dentes);
      }
      
      if (servicosEncontrados.length > 0) {
        setServicosSelecionados(servicosEncontrados);
      }
      
      // Feedback ao usuário sobre o que foi preenchido
      if (camposPreenchidos.length > 0) {
        toast.success(`Preenchido: ${camposPreenchidos.join(', ')}`);
        
        if (camposNaoEncontrados.length > 0) {
          toast.warning(`Não identificado: ${camposNaoEncontrados.join(', ')}`);
        }
        
        // Instruções sobre campos não preenchidos
        const camposNaoPreenchidos = [];
        if (!novoFormData.cliente) camposNaoPreenchidos.push('Cliente');
        if (!novoFormData.dentista) camposNaoPreenchidos.push('Dentista');
        if (!novoFormData.protetico) camposNaoPreenchidos.push('Protético');
        if (!servicosEncontrados.length) camposNaoPreenchidos.push('Serviços');
        
        if (camposNaoPreenchidos.length > 0) {
          toast.info(`Complete manualmente: ${camposNaoPreenchidos.join(', ')}`);
        }
      } else {
        toast.warning('A IA não conseguiu identificar dados específicos. Complete o formulário manualmente.');
      }
      
    } catch (error) {
      console.error('Erro ao processar dados STT:', error);
      toast.error('Erro ao processar os dados do reconhecimento de voz.');
    }
  }, [clientes, dentistas, proteticos, servicos]);

  // Função para formatar data brasileira para input
  const formatDateForBrazilian = (dateString) => {
    try {
      // Se já está no formato YYYY-MM-DD, retorna como está
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Se está no formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      return '';
    } catch {
      return '';
    }
  };

  // Expor métodos via ref
  useImperativeHandle(ref, () => ({
    preencherDadosSTT
  }), [preencherDadosSTT]);
  
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
          clinicasResponse,
          proteticosResponse, 
          servicosResponse
        ] = await Promise.all([
          api.get('/paciente'), // Busca apenas pacientes ativos
          api.get('/dentistas'), // Busca apenas dentistas ativos
          api.get('/clinicas'), // Busca apenas clínicas ativas
          api.get('/proteticos'), // Busca apenas protéticos ativos
          api.get('/servico') // Busca apenas serviços ativos
        ]);
        
        setClientes(clientesResponse.data);
        setDentistas(dentistasResponse.data);
        setClinicas(clinicasResponse.data);
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
          const [pedidoResponse, quantidadesResponse] = await Promise.all([
            api.get(`/pedidos/${pedidoId}`),
            api.get(`/pedidos/${pedidoId}/quantidades-servicos`).catch(quantErr => {
              console.warn('Erro ao buscar quantidades dos serviços:', quantErr);
              return { data: [] };
            })
          ]);
          
          const pedido = pedidoResponse.data;
          const quantidadesServicos = quantidadesResponse.data;
          
          console.log('Pedido carregado:', pedido);
          console.log('Quantidades carregadas:', quantidadesServicos);
          
          // Formatar a data para o formato esperado pelo input date (YYYY-MM-DD)
          const dataEntrega = pedido.dataEntrega ? formatDateForInput(pedido.dataEntrega) : '';
          
          // Filtrar serviços únicos (remover duplicatas se existirem)
          const servicosUnicos = [];
          const servicosVistos = new Set();
          
          (pedido.servicos || []).forEach(servico => {
            if (!servicosVistos.has(servico.id)) {
              servicosVistos.add(servico.id);
              servicosUnicos.push(servico);
            }
          });

          setFormData({
            cliente: pedido.cliente || null,
            dentista: pedido.dentista || null,
            clinica: pedido.clinica || null,
            protetico: pedido.protetico || null,
            servicos: servicosUnicos,
            dataEntrega,
            prioridade: pedido.prioridade || 'MEDIA',
            status: pedido.status || 'PENDENTE',
            odontograma: pedido.odontograma || [],
            observacao: pedido.observacao || ''
          });
          
          setDentesSelecionados(pedido.odontograma || []);
          
          // Configurar clínicas filtradas se existe dentista
          if (pedido.dentista) {
            const clinicasAssociadas = pedido.dentista.clinicas || [];
            if (clinicasAssociadas.length > 1) {
              setClinicasFiltradasPorDentista(clinicasAssociadas);
            } else {
              setClinicasFiltradasPorDentista([]);
            }
          }
          
          // Mapear serviços únicos com quantidade correta da tabela pedido_servico
          console.log('=== DEBUG CARREGAMENTO QUANTIDADES ===');
          console.log('Serviços únicos:', servicosUnicos);
          console.log('Quantidades do backend:', quantidadesServicos);
          
          const servicosComQuantidade = servicosUnicos.map(servico => {
            const quantidadeEncontrada = quantidadesServicos.find(qs => {
              console.log(`Comparando: servico.id=${servico.id} vs qs.servico.id=${qs.servico?.id}`);
              return qs.servico && qs.servico.id === servico.id;
            });
            
            // Tratar BigDecimal que vem do backend - pode ser número, string ou null
            let quantidade = 1;
            if (quantidadeEncontrada) {
              const qtdValue = quantidadeEncontrada.quantidade;
              console.log(`DEBUG qtdValue:`, qtdValue, `tipo:`, typeof qtdValue, `null?:`, qtdValue === null);
              
              if (qtdValue === null || qtdValue === undefined) {
                console.log(`⚠️ QUANTIDADE NULL - Este pode ser um pedido antigo. Usando padrão 1`);
                // Para pedidos antigos, podemos inferir a quantidade contando serviços duplicados
                const servicosDuplicados = (pedido.servicos || []).filter(s => s.id === servico.id);
                quantidade = servicosDuplicados.length > 1 ? servicosDuplicados.length : 1;
                console.log(`Quantidade inferida pelos serviços duplicados: ${quantidade}`);
              } else if (typeof qtdValue === 'string') {
                const parsed = parseInt(parseFloat(qtdValue));
                console.log(`String parseada: ${qtdValue} -> ${parsed}`);
                quantidade = Math.max(1, isNaN(parsed) ? 1 : parsed);
              } else if (typeof qtdValue === 'number') {
                const floored = Math.floor(qtdValue);
                console.log(`Number processado: ${qtdValue} -> ${floored}`);
                quantidade = Math.max(1, floored);
              } else {
                console.log(`Tipo não reconhecido:`, typeof qtdValue, qtdValue);
                // Tentar conversão forçada
                const forceConverted = Number(qtdValue);
                if (!isNaN(forceConverted) && forceConverted > 0) {
                  quantidade = Math.max(1, Math.floor(forceConverted));
                  console.log(`Conversão forçada: ${qtdValue} -> ${quantidade}`);
                } else {
                  console.log(`Conversão falhou, usando padrão 1`);
                  quantidade = 1;
                }
              }
            } else {
              console.log(`quantidadeEncontrada é null/undefined`);
            }
            console.log(`Serviço ${servico.nome} (ID: ${servico.id}) - Quantidade encontrada:`, quantidadeEncontrada);
            console.log(`Objeto completo quantidadeEncontrada:`, JSON.stringify(quantidadeEncontrada, null, 2));
            console.log(`Serviço ${servico.nome} (ID: ${servico.id}) - Quantidade final: ${quantidade}`);
            
            return {
              ...servico,
              quantidade: quantidade
            };
          });
          
          console.log('Serviços com quantidade FINAL:', servicosComQuantidade);
          setServicosSelecionados(servicosComQuantidade);
          
          // Debug adicional após setar o estado
          setTimeout(() => {
            console.log('Estado servicosSelecionados após setServicosSelecionados:', servicosSelecionados);
          }, 100);
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
      const hoje = new Date();
      const umAnoAtras = new Date();
      umAnoAtras.setFullYear(hoje.getFullYear() - 1);
      
      // Validar se a data não é anterior a 1 ano atrás
      if (inputDate < umAnoAtras) {
        const dataLimite = umAnoAtras.toLocaleDateString('pt-BR');
        toast.error(`A data de entrega não pode ser anterior a ${dataLimite} (1 ano atrás).`, {
          position: "top-right",
          autoClose: 4000,
        });
        setError('Por favor, insira uma data válida.');
        return;
      }
      
      // Validar se o ano está dentro de um range razoável (futuro)
      const currentYear = new Date().getFullYear();
      if (inputDate.getFullYear() > currentYear + 50) {
        toast.error('Ano inválido. Insira um ano até ' + (currentYear + 50) + '.', {
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

  const handleDentistaChange = async (dentista) => {
    console.log('Dentista selecionado:', dentista);
    
    let clinicaSelecionada = null;
    let clinicasFiltradas = [];
    
    if (dentista) {
      // Verificar as clínicas associadas ao dentista
      const clinicasAssociadas = dentista.clinicas || [];
      console.log('Clínicas associadas ao dentista:', clinicasAssociadas);
      
      if (clinicasAssociadas.length === 1) {
        // Se há apenas uma clínica, selecioná-la automaticamente
        clinicaSelecionada = clinicasAssociadas[0];
        console.log('Apenas uma clínica encontrada, selecionando automaticamente:', clinicaSelecionada);
      } else if (clinicasAssociadas.length > 1) {
        // Se há várias clínicas, filtrar para mostrar no select
        clinicasFiltradas = clinicasAssociadas;
        console.log('Múltiplas clínicas encontradas, mostrando no select:', clinicasFiltradas);
      }
    }
    
    setClinicasFiltradasPorDentista(clinicasFiltradas);
    
    setFormData({
      ...formData,
      dentista,
      clinica: clinicaSelecionada
    });
  };

  const handleClinicaChange = (clinica) => {
    setFormData({
      ...formData,
      clinica
    });
  };

  const handleProteticoChange = (protetico) => {
    setFormData({
      ...formData,
      protetico
    });
  };

  const handleStatusChange = (status) => {
    setFormData({
      ...formData,
      status: status ? status.value : 'PENDENTE'
    });
  };

  const getStatusDisplayValue = () => {
    if (!formData.status) return null;
    
    const statusMap = {
      'PENDENTE': 'Pendente',
      'EM_ANDAMENTO': 'Em Andamento', 
      'FINALIZADO': 'Concluído',
      'CANCELADO': 'Cancelado'
    };
    
    return {
      value: formData.status,
      nome: statusMap[formData.status] || formData.status
    };
  };

  const handleServicosChange = (servicos) => {
    // Filtrar serviços únicos e mapear com quantidades preservadas
    const servicosUnicos = [];
    const servicosComQuantidade = [];
    
    servicos.forEach(servico => {
      // Verificar se já foi adicionado
      if (!servicosUnicos.find(s => s.id === servico.id)) {
        servicosUnicos.push(servico);
        
        // Preservar quantidade existente ou definir como 1
        const existente = servicosSelecionados.find(s => s.id === servico.id);
        servicosComQuantidade.push({
          ...servico,
          quantidade: existente ? existente.quantidade : 1
        });
      }
    });
    
    setFormData({
      ...formData,
      servicos: servicosUnicos
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
        clinica: formData.clinica ? { id: formData.clinica.id } : null,
        protetico: formData.protetico ? { id: formData.protetico.id } : null,
        servicos: servicosSelecionados.map(servico => ({ 
          id: servico.id
        })),
        dataEntrega: formData.dataEntrega,
        prioridade: formData.prioridade,
        status: formData.status || 'PENDENTE', // Usar status selecionado ou PENDENTE como padrão
        odontograma: dentesSelecionados.join(','), // Converter array para string separada por vírgulas
        observacao: formData.observacao,
        isActive: true // Garantir que o pedido permanece ativo após edição
      };
      
      // Criar ou atualizar pedido usando o endpoint padrão
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
        
        // Verificar se é erro de data
        if (errorMessage.includes('data de entrega não pode ser anterior') || 
            errorMessage.includes('1 ano atrás') ||
            errorMessage.includes('data de entrega') ||
            errorMessage.includes('data')) {
          toast.error(`${errorMessage}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (errorMessage.includes('Estoque insuficiente') || errorMessage.includes('estoque')) {
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
                  minDate={(() => {
                    const hoje = new Date();
                    const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
                    const year = umAnoAtras.getFullYear();
                    const month = (umAnoAtras.getMonth() + 1).toString().padStart(2, '0');
                    const day = umAnoAtras.getDate().toString().padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  })()}
                  maxDate={(() => {
                    const futuro = new Date();
                    futuro.setFullYear(futuro.getFullYear() + 10);
                    futuro.setMonth(11);
                    futuro.setDate(31);
                    const year = futuro.getFullYear();
                    const month = (futuro.getMonth() + 1).toString().padStart(2, '0');
                    const day = futuro.getDate().toString().padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  })()}
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

              {/* Campo de Clínica - aparece apenas quando dentista tem múltiplas clínicas */}
              {formData.dentista && clinicasFiltradasPorDentista.length > 0 && (
                <div className="form-group">
                  <label htmlFor="clinica">Clínica</label>
                  <Dropdown
                    items={clinicasFiltradasPorDentista}
                    value={formData.clinica}
                    onChange={handleClinicaChange}
                    placeholder="Selecionar clínica"
                    searchPlaceholder="Buscar clínica..."
                    displayProperty="nome"
                    valueProperty="id"
                    searchBy="nome"
                    searchable={true}
                  />
                </div>
              )}

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
                  preventDuplicates={true}
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
              <div className="pedido-form-status-container">
                <h3>Status do Pedido</h3>
                <Dropdown
                  items={[
                    { value: 'PENDENTE', nome: 'Pendente' },
                    { value: 'EM_ANDAMENTO', nome: 'Em Andamento' },
                    { value: 'FINALIZADO', nome: 'Concluído' },
                    { value: 'CANCELADO', nome: 'Cancelado' }
                  ]}
                  value={getStatusDisplayValue()}
                  onChange={handleStatusChange}
                  placeholder="Selecionar status"
                  displayProperty="nome"
                  valueProperty="value"
                  searchable={false}
                />
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
                // Agrupar serviços únicos para exibição
                servicosSelecionados
                  .filter((servico, index, array) => 
                    array.findIndex(s => s.id === servico.id) === index
                  )
                  .map(servico => (
                    <div key={servico.id} className="servico-item">
                      <div className="servico-info">
                        <span className="servico-nome">
                          {servico.nome}
                          {servico.quantidade > 1 && <span className="quantidade-badge"> x {servico.quantidade}</span>}
                        </span>
                        <div className="servico-valores">
                          <small>Mão de obra: R$ {(servico.preco || 0).toFixed(2).replace('.', ',')}</small>
                          <small>Materiais: R$ {(servico.valorMateriais || 0).toFixed(2).replace('.', ',')}</small>
                          <strong>Total Unitário: R$ {(servico.valorTotal || servico.preco || 0).toFixed(2).replace('.', ',')}</strong>
                          {servico.quantidade > 1 && (
                            <strong>Total: R$ {((servico.valorTotal || servico.preco || 0) * servico.quantidade).toFixed(2).replace('.', ',')}</strong>
                          )}
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
                          key={`qty-${servico.id}-${servico.quantidade}`}
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
});

PedidoForm.displayName = 'PedidoForm';

export default PedidoForm; 