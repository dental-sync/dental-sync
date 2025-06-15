import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../axios-config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CadastroServico.css';
import Dropdown from '../../components/Dropdown/Dropdown';
import ModalCadastroCategoriaServico from '../../components/ModalCadastroCategoriaServico';

const EditarServico = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [errors, setErrors] = useState({});
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [servico, setServico] = useState({
    nome: '',
    descricao: '',
    valor: '',
    tempoPrevisto: '',
    categoriaServico: {
      id: ''
    },
    status: 'ATIVO',
    isActive: true
  });
  const [materiaisSelecionados, setMateriaisSelecionados] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriasResponse, materiaisResponse] = await Promise.all([
          api.get('/categoria-servico'),
          api.get('/material')
        ]);
        setCategorias(categoriasResponse.data);
        setMateriais(materiaisResponse.data);

        if (id) {
          const servicoResponse = await api.get(`/servico/${id}`);
          const servicoData = servicoResponse.data;
          
          setServico({
            nome: servicoData.nome || '',
            descricao: servicoData.descricao || '',
            valor: servicoData.preco != null
              ? servicoData.preco.toFixed(2).replace('.', ',')
              : '',
            tempoPrevisto: servicoData.tempoPrevisto ? (servicoData.tempoPrevisto / 60).toString() : '',
            categoriaServico: {
              id: servicoData.categoriaServico?.id || ''
            },
            status: servicoData.status || 'ATIVO',
            isActive: servicoData.isActive
          });
          
          // Carregar materiais utilizados (via ServicoMaterial)
          setMateriaisSelecionados(
            (servicoData.materiais || []).map(sm => ({
              id: sm.material.id,
              nome: sm.material.nome,
              unidadeMedida: sm.material.unidadeMedida,
              quantidadeEstoque: sm.material.quantidade,
              quantidadeUso: sm.quantidade,
              valorUnitario: sm.material.valorUnitario
            }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoriaServico') {
      setServico(prev => ({
        ...prev,
        categoriaServico: {
          id: value
        }
      }));
    } else if (name === 'valor') {
      const valorFormatado = value.replace(/[^0-9,]/g, '');
      setServico(prev => ({ ...prev, valor: valorFormatado }));
    } else {
      setServico(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoriaChange = (selectedCategoria) => {
    setServico(prev => ({
      ...prev,
      categoriaServico: {
        id: selectedCategoria ? selectedCategoria.id : ''
      }
    }));
  };

  const handleCategoriaSuccess = (novaCategoria) => {
    setCategorias(prev => [...prev, novaCategoria]);
    setServico(prev => ({
      ...prev,
      categoriaServico: { id: novaCategoria.id }
    }));
    setShowModalCategoria(false);
    toast.success('Categoria cadastrada com sucesso!');
  };

  const handleMateriaisChange = (selectedMateriais) => {
    setMateriaisSelecionados(selectedMateriais.map(material => ({
      ...material,
      quantidadeUso: material.quantidadeUso || 1,
      id: material.id,
      nome: material.nome,
      valorUnitario: material.valorUnitario || 0,
      unidadeMedida: material.unidadeMedida || '',
      quantidadeEstoque: material.quantidade || material.quantidadeEstoque || 0
    })));
  };

  const handleRemoverMaterial = (id) => {
    setMateriaisSelecionados(prev => prev.filter(mat => mat.id !== id));
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!servico.nome || !servico.valor || !servico.categoriaServico.id || !servico.tempoPrevisto) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // Filtrar e validar materiais antes de enviar
      const materiaisValidos = materiaisSelecionados
        .filter(m => m.id && m.quantidadeUso && m.quantidadeUso > 0)
        .map(m => ({
          material: { id: parseInt(m.id) },
          quantidade: parseInt(m.quantidadeUso) || 1
        }));

      const servicoData = {
        id: parseInt(id),
        nome: servico.nome,
        descricao: servico.descricao,
        preco: parseFloat(servico.valor.replace(',', '.')) || 0,
        tempoPrevisto: parseInt(servico.tempoPrevisto, 10) * 60,
        categoriaServico: { id: parseInt(servico.categoriaServico.id) },
        status: servico.status,
        isActive: servico.isActive,
        materiais: materiaisValidos
      };

      console.log('Dados sendo enviados:', servicoData); // Para debug

      await api.put(`/servico/${id}`, servicoData);
      toast.success('Serviço atualizado com sucesso!');
      navigate('/servico');
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço. Por favor, tente novamente.');
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
        <h1>Editar Serviço</h1>
        
        <form onSubmit={handleSubmit} className="cadastro-servico-form">
          <div className="form-group">
            <label htmlFor="nome">
              Nome <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={servico.nome}
              onChange={handleChange}
              placeholder="Digite o nome do serviço"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={servico.descricao}
              onChange={handleChange}
              placeholder="Digite a descrição do serviço"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="valor">
                Valor <span className="required">*</span>
              </label>
              <input
                type="text"
                id="valor"
                name="valor"
                value={servico.valor}
                onChange={handleChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoriaServico">
                Categoria <span className="required">*</span>
              </label>
              <Dropdown
                items={categorias}
                value={categorias.find(c => c.id === servico.categoriaServico.id) || null}
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
          </div>

          <div className="form-group">
            <label htmlFor="tempoPrevisto">Tempo Previsto (horas)</label>
            <input
              type="number"
              id="tempoPrevisto"
              name="tempoPrevisto"
              value={servico.tempoPrevisto}
              onChange={handleChange}
              placeholder="Horas"
              min="1"
              required
            />
          </div>

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
                  <span className="total-valor">R$ {servico.valor || '0,00'}</span>
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
                    const precoServico = parseFloat(servico.valor.replace(',', '.')) || 0;
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
            <button type="button" className="cancel-button" onClick={handleCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarServico; 