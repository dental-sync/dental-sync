import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios-config';
import useToast from '../../hooks/useToast';
import './CadastroServico.css';
import Dropdown from '../../components/Dropdown/Dropdown';
import ModalCadastroCategoriaServico from '../../components/Modals/ModalCadastroCategoriaServico';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import useNotifications from '../../hooks/useNotifications';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal/DeleteConfirmationModal';

const CadastroServico = () => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const toast = useToast();
  const [categorias, setCategorias] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
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
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome do serviço é obrigatório';
    if (!formData.categoriaServico.id) newErrors.categoriaServico = 'Categoria é obrigatória';
    if (!formData.valor) newErrors.valor = 'Preço é obrigatório';
    if (!formData.tempoPrevisto) newErrors.tempoPrevisto = 'Tempo previsto é obrigatório';
    if (materiaisSelecionados.length === 0) newErrors.materiais = 'Selecione pelo menos um material';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
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

  const handleCategoriaSuccess = (categoriaData, action) => {
    if (action === 'edit') {
      // Atualizar categoria existente na lista
      setCategorias(prev => prev.map(cat => 
        cat.id === categoriaData.id ? categoriaData : cat
      ));
      // Se a categoria editada é a selecionada, atualizar também
      if (formData.categoriaServico && formData.categoriaServico.id === categoriaData.id) {
        setFormData(prev => ({
          ...prev,
          categoriaServico: { id: categoriaData.id }
        }));
      }
      toast.success('Categoria editada com sucesso!');
    } else {
      // Adicionar nova categoria
      setCategorias(prev => [...prev, categoriaData]);
      setFormData(prev => ({
        ...prev,
        categoriaServico: { id: categoriaData.id }
      }));
      toast.success('Categoria cadastrada com sucesso!');
    }
    setShowModalCategoria(false);
    setCategoriaToEdit(null);
  };

  const handleEditCategoria = (categoria) => {
    setCategoriaToEdit(categoria);
    setShowModalCategoria(true);
  };

  const handleDeleteCategoria = (categoria) => {
    setCategoriaToDelete(categoria);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategoria = async () => {
    try {
      await api.delete(`/categoria-servico/${categoriaToDelete.id}`);
      
      // Remover categoria da lista
      setCategorias(prev => prev.filter(cat => cat.id !== categoriaToDelete.id));
      
      // Se a categoria deletada era a selecionada, limpar seleção
      if (formData.categoriaServico && formData.categoriaServico.id === categoriaToDelete.id) {
        setFormData(prev => ({
          ...prev,
          categoriaServico: { id: '' }
        }));
      }
      
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Não é possível excluir esta categoria pois há serviços vinculados a ela.');
    } finally {
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    }
  };

  const cancelDeleteCategoria = () => {
    setShowDeleteModal(false);
    setCategoriaToDelete(null);
  };

  const handleCategoriaChange = (selectedCategoria) => {
    setFormData(prev => ({
      ...prev,
      categoriaServico: { id: selectedCategoria?.id || '' }
    }));
    if (errors.categoriaServico) {
      setErrors(prev => ({ ...prev, categoriaServico: '' }));
    }
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
    if (errors.materiais) {
      setErrors(prev => ({ ...prev, materiais: '' }));
    }
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
    
    // Permite qualquer quantidade positiva, sem limite de estoque
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
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      if (!formData.nome || !formData.valor || !formData.categoriaServico.id || !formData.tempoPrevisto) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }
      if (materiaisSelecionados.length === 0) {
        toast.error('Selecione pelo menos um material.');
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
      
      <ModalCadastroCategoriaServico
        isOpen={showModalCategoria}
        onClose={() => {
          setShowModalCategoria(false);
          setCategoriaToEdit(null);
        }}
        onSuccess={handleCategoriaSuccess}
        categoriaToEdit={categoriaToEdit}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteCategoria}
        onConfirm={confirmDeleteCategoria}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${categoriaToDelete?.nome}"? Esta ação não pode ser desfeita.`}
      />

      <div className="page-top">
        <div className="notification-container">
            <NotificationBell 
            count={notifications.total}
            baixoEstoque={notifications.baixoEstoque}
            semEstoque={notifications.semEstoque}
            materiaisBaixoEstoque={notifications.materiaisBaixoEstoque}
            materiaisSemEstoque={notifications.materiaisSemEstoque}
          />
        </div>
      </div>

      <div className="back-navigation">
        <button className="back-button" onClick={handleCancel}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="page-title">Novo Serviço</h1>
      </div>

      <div className="cadastro-servico-container">
        <form onSubmit={handleSubmit} className="cadastro-servico-form">
          {/* Primeiro Container */}
          <div className="form-card">
            <div className="card-content">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nome" className="required">Nome do Serviço</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome do serviço"
                    className={errors.nome ? 'input-error' : ''}
                  />
                  {errors.nome && <span className="error-text">{errors.nome}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="categoriaServico" className="required">Categoria</label>
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
                    showActionButtons={true}
                    onEditClick={handleEditCategoria}
                    onDeleteClick={handleDeleteCategoria}
                    className={errors.categoriaServico ? 'input-error' : ''}
                  />
                  {errors.categoriaServico && <span className="error-text">{errors.categoriaServico}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="valor" className="required">Preço (R$)</label>
                  <input
                    type="text"
                    id="valor"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    placeholder="0,00"
                    className={errors.valor ? 'input-error' : ''}
                  />
                  {errors.valor && <span className="error-text">{errors.valor}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="tempoPrevisto" className="required">Tempo Previsto (horas)</label>
                  <input
                    type="number"
                    id="tempoPrevisto"
                    name="tempoPrevisto"
                    value={formData.tempoPrevisto}
                    onChange={handleChange}
                    placeholder="Horas"
                    min="1"
                    className={errors.tempoPrevisto ? 'input-error' : ''}
                  />
                  {errors.tempoPrevisto && <span className="error-text">{errors.tempoPrevisto}</span>}
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
                <label htmlFor="materiais" className="required">Materiais</label>
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
                  className={errors.materiais ? 'input-error' : ''}
                />
                {errors.materiais && <span className="error-text">{errors.materiais}</span>}
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
                                value={m.quantidadeUso}
                                onChange={e => {
                                  const val = e.target.value;
                                  // Permitir campo vazio temporariamente para edição
                                  if (val === '') {
                                    handleQuantidadeChange(m.id, '');
                                    return;
                                  }
                                  
                                  const numVal = parseInt(val, 10);
                                  if (!isNaN(numVal) && numVal >= 1) {
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
                                onClick={() => handleQuantidadeChange(m.id, m.quantidadeUso + 1)}
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
            <button type="button" onClick={handleCancel} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-cadastrar" disabled={loading}>
              {loading ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroServico; 