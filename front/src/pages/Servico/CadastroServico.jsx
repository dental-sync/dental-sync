import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios-config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CadastroServico.css';
import Dropdown from '../../components/Dropdown/Dropdown';
import ModalCadastroCategoriaServico from '../../components/ModalCadastroCategoriaServico';
import ModalSelecionarMateriais from '../../components/ModalSelecionarMateriais';

const CadastroServico = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [materiaisSelecionados, setMateriaisSelecionados] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
    tempoPrevisto: '',
    categoriaServico: { id: '' },
    materiais: [],
    status: 'ATIVO',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasResponse, materiaisResponse] = await Promise.all([
          api.get('/categoria-servico'),
          api.get('/material')
        ]);
        setCategorias(categoriasResponse.data);
        setMateriais(materiaisResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categoriaServico') {
      setFormData(prev => ({
        ...prev,
        categoriaServico: {
          id: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoriaSuccess = (novaCategoria) => {
    setCategorias(prev => [...prev, novaCategoria]);
    setFormData(prev => ({
      ...prev,
      categoriaServico: { id: novaCategoria.id }
    }));
    setShowModalCategoria(false);
    toast.success('Categoria cadastrada com sucesso!');
  };

  const handleCategoriaChange = (selectedCategoria) => {
    setFormData(prev => ({
      ...prev,
      categoriaServico: { id: selectedCategoria?.id || '' }
    }));
  };

  const handleMateriaisChange = (selectedMateriais) => {
    const materiaisArray = Array.isArray(selectedMateriais) ? selectedMateriais : [];
    setMateriaisSelecionados(materiaisArray.map(m => ({
          ...m,
      id: m.id,
      nome: m.nome,
      valorUnitario: m.valorUnitario || 0,
      unidadeMedida: m.unidadeMedida || '',
          quantidadeEstoque: m.quantidade ?? m.quantidadeEstoque ?? 0,
      quantidadeUso: 1
    })));
    setFormData(prev => ({
      ...prev,
      materiais: materiaisArray.map(m => ({ material: { id: m.id }, quantidade: 1 }))
    }));
  };

  const handleRemoverMaterial = (id) => {
    setMateriaisSelecionados(prev => prev.filter(mat => mat.id !== id));
    setFormData(prev => ({
      ...prev,
      materiais: prev.materiais.filter(sm => sm.material.id !== id)
    }));
  };

  const handleQuantidadeChange = (id, value) => {
    // Permitir valor vazio temporariamente para edição
    if (value === '') {
      setMateriaisSelecionados(prev => prev.map(m =>
        m.id === id
          ? { ...m, quantidadeUso: '' }
          : m
      ));
      return;
    }
    
    const quantidade = Math.max(1, Math.floor(Number(value)));
    if (!isNaN(quantidade)) {
    setMateriaisSelecionados(prev => prev.map(m =>
      m.id === id
        ? { ...m, quantidadeUso: quantidade }
        : m
    ));
    setFormData(prev => ({
      ...prev,
      materiais: prev.materiais.map(sm =>
        (sm.material.id === id) ? { ...sm, quantidade } : sm
      )
    }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nome || !formData.valor || !formData.categoriaServico.id || !formData.tempoPrevisto) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Filtrar e validar materiais antes de enviar
      const materiaisValidos = materiaisSelecionados
        .filter(m => m.id && m.quantidadeUso && m.quantidadeUso > 0)
        .map(m => ({
          material: { id: parseInt(m.id) },
          quantidade: parseInt(m.quantidadeUso) || 1
        }));

      const servicoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.valor.replace(',', '.')) || 0, // Apenas o valor da mão de obra
        categoriaServico: { id: parseInt(formData.categoriaServico.id) },
        tempoPrevisto: parseFloat(formData.tempoPrevisto) * 60,
        materiais: materiaisValidos
        // valorMateriais e valorTotal serão calculados automaticamente no backend
      };

      console.log('Dados sendo enviados:', servicoData); // Para debug

      await api.post('/servico', servicoData);
      toast.success('Serviço cadastrado com sucesso!');
      navigate('/servico');
    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar serviço';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/servico');
  };

  return (
    <div className="cadastro-servico-page">
      <ToastContainer />
      <ModalCadastroCategoriaServico
        isOpen={showModalCategoria}
        onClose={() => setShowModalCategoria(false)}
        onSuccess={handleCategoriaSuccess}
      />

      <div className="cadastro-servico-container">
        <div className="page-header">
          <button className="back-button" onClick={handleCancel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
          </button>
          <h1>Novo Serviço</h1>
        </div>

        <form onSubmit={handleSubmit} className="cadastro-servico-form">
          {/* Primeiro Container */}
          <div className="form-card">
            <div className="card-header">
              <h2>Informações do Serviço</h2>
            </div>
            <div className="card-content">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nome">Nome do Serviço</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome do serviço"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoriaServico">Categoria</label>
                  <Dropdown
                    items={categorias}
                    value={categorias.find(c => c.id === formData.categoriaServico.id) || null}
                    onChange={handleCategoriaChange}
                    placeholder="Selecione a categoria"
                    displayProperty="nome"
                    valueProperty="id"
                    searchable={false}
                    showCheckbox={false}
                    showAddButton={true}
                    addButtonTitle="Adicionar nova categoria"
                    onAddClick={() => setShowModalCategoria(true)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="valor">Preço (R$)</label>
                  <input
                    type="text"
                    id="valor"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tempoPrevisto">Tempo Previsto (horas)</label>
                  <input
                    type="number"
                    id="tempoPrevisto"
                    name="tempoPrevisto"
                    value={formData.tempoPrevisto}
                    onChange={handleChange}
                    placeholder="Horas"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descreva o serviço detalhadamente"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Segundo Container */}
          <div className="form-card">
            <div className="card-header">
              <h2>Materiais Necessários</h2>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="materiais">Materiais</label>
                <Dropdown
                  items={materiais}
                  value={materiaisSelecionados}
                  onChange={handleMateriaisChange}
                  placeholder="Selecionar materiais"
                  searchPlaceholder="Buscar materiais..."
                  displayProperty="nome"
                  valueProperty="id"
                  searchBy="nome"
                  searchable={true}
                  allowMultiple={true}
                  showCheckbox={true}
                  showItemValue={true}
                  valueDisplayProperty="valorUnitario"
                  valuePrefix="R$ "
                />
                <div className="materiais-selecionados-lista">
                  {materiaisSelecionados.length === 0 ? (
                    <div className="empty-state">Nenhum material selecionado</div>
                  ) : (
                    <ul className="materiais-lista-quantidade">
                      {materiaisSelecionados.map(m => (
                        <li key={m.id} className="item-material-quantidade">
                          <span className="nome-material">{m.nome}</span>
                          <div className="material-acoes-direita">
                            <span className="label-quantidade">Quantidade:</span>
                            <div className="quantidade-bloco">
                              <button
                                type="button"
                                className="btn-quantidade"
                                onClick={() => handleQuantidadeChange(m.id, Math.max(1, m.quantidadeUso - 1))}
                                disabled={m.quantidadeUso <= 1}
                                tabIndex={0}
                              >-</button>
                              <input
                                type="number"
                                min={1}
                                max={m.quantidadeEstoque}
                                value={m.quantidadeUso}
                                onChange={e => {
                                  const val = e.target.value;
                                  // Permitir campo vazio temporariamente para edição
                                  if (val === '') {
                                    handleQuantidadeChange(m.id, '');
                                    return;
                                  }
                                  
                                  const numVal = parseInt(val, 10);
                                  if (!isNaN(numVal) && numVal >= 1 && numVal <= m.quantidadeEstoque) {
                                    handleQuantidadeChange(m.id, numVal);
                                  }
                                }}
                                onBlur={e => {
                                  // Ao sair do campo, garantir valor mínimo
                                  const val = parseInt(e.target.value, 10);
                                  if (isNaN(val) || val < 1) {
                                    handleQuantidadeChange(m.id, 1);
                                  }
                                }}
                                className="input-quantidade-material"
                              />
                              <button
                                type="button"
                                className="btn-quantidade"
                                onClick={() => handleQuantidadeChange(m.id, Math.min(m.quantidadeEstoque, m.quantidadeUso + 1))}
                                disabled={m.quantidadeUso >= m.quantidadeEstoque}
                                tabIndex={0}
                              >+</button>
                            </div>
                            <span className="unidade-material">{m.unidadeMedida || ''}</span>
                            <button
                              type="button"
                              className="btn-remover-material"
                              onClick={() => handleRemoverMaterial(m.id)}
                              title="Remover material"
                            >×</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="total-servico">
                <div className="total-item">
                  <span className="total-label">Preço do Serviço:</span>
                  <span className="total-valor">R$ {formData.valor || '0,00'}</span>
                </div>
                <div className="total-item">
                  <span className="total-label">Valor dos Materiais:</span>
                  <span className="total-valor">R$ {materiaisSelecionados.reduce((total, material) => {
                    const preco = material.valorUnitario || 0;
                    const quantidade = material.quantidadeUso || 1;
                    return total + (preco * quantidade);
                  }, 0).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="total-item total-final">
                  <span className="total-label">Total Geral:</span>
                  <span className="total-valor">R$ {(() => {
                    const precoServico = parseFloat(formData.valor.replace(',', '.')) || 0;
                    const valorMateriais = materiaisSelecionados.reduce((total, material) => {
                      const preco = material.valorUnitario || 0;
                      const quantidade = material.quantidadeUso || 1;
                      return total + (preco * quantidade);
                    }, 0);
                    return (precoServico + valorMateriais).toFixed(2).replace('.', ',');
                  })()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save">
                <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
                <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path>
                <path d="M7 3v4a1 1 0 0 0 1 1h7"></path>
              </svg>
              {loading ? 'Salvando...' : 'Salvar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroServico; 