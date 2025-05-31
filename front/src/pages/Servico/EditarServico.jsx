import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CadastroServico.css';
import ModalSelecionarMateriais from '../../components/ModalSelecionarMateriais';

const EditarServico = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [errors, setErrors] = useState({});
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
  const [showModalMateriais, setShowModalMateriais] = useState(false);
  const [materiaisSelecionados, setMateriaisSelecionados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar categorias
        const categoriasResponse = await axios.get('http://localhost:8080/categoria-servico');
        setCategorias(categoriasResponse.data);

        // Buscar dados do serviço
        const servicoResponse = await axios.get(`http://localhost:8080/servico/${id}`);
        const servicoData = servicoResponse.data;
        
        setServico({
          nome: servicoData.nome,
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
            quantidadeUso: sm.quantidade
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do serviço.');
        navigate('/servico');
      }
    };

    fetchData();
  }, [id, navigate]);

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

  const handleMateriaisConfirm = (materiais) => {
    setMateriaisSelecionados(prev => {
      return materiais.map(m => {
        const antigo = prev.find(pm => pm.id === m.id);
        return {
          ...m,
          quantidadeEstoque: m.quantidade ?? m.quantidadeEstoque ?? 0,
          quantidadeUso: antigo ? antigo.quantidadeUso : 1
        };
      });
    });
    setShowModalMateriais(false);
  };

  const handleRemoverMaterial = (id) => {
    setMateriaisSelecionados(prev => prev.filter(mat => mat.id !== id));
  };

  const handleQuantidadeChange = (id, value) => {
    const quantidade = Math.max(1, Math.floor(Number(value)));
    setMateriaisSelecionados(prev => prev.map(m =>
      m.id === id
        ? { ...m, quantidadeUso: quantidade }
        : m
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!servico.nome || !servico.valor || !servico.categoriaServico.id || !servico.tempoPrevisto) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }
      const servicoData = {
        nome: servico.nome,
        descricao: servico.descricao,
        preco: parseFloat(servico.valor.replace(',', '.')),
        tempoPrevisto: parseInt(servico.tempoPrevisto, 10) * 60,
        categoriaServico: servico.categoriaServico,
        status: servico.status,
        isActive: servico.isActive,
        materiais: materiaisSelecionados.map(m => ({ material: { id: m.id }, quantidade: m.quantidadeUso }))
      };
      await axios.put(`http://localhost:8080/servico/${id}`, servicoData);
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
              <select
                id="categoriaServico"
                name="categoriaServico"
                value={servico.categoriaServico.id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
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

          <ModalSelecionarMateriais
            isOpen={showModalMateriais}
            onClose={() => setShowModalMateriais(false)}
            onConfirm={handleMateriaisConfirm}
            materiaisSelecionados={materiaisSelecionados.map(m => m.id)}
          />
          <div className="form-card">
            <div className="card-header">
              <h2>Materiais Necessários</h2>
            </div>
            <div className="card-content">
              <div className="form-group">
                <div className="material-select">
                  <button type="button" className="select-materiais-button" onClick={() => setShowModalMateriais(true)}>
                    Selecionar materiais
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </button>
                </div>
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
                                  let val = parseInt(e.target.value, 10);
                                  if (isNaN(val) || val < 1) val = 1;
                                  if (val > m.quantidadeEstoque) val = m.quantidadeEstoque;
                                  handleQuantidadeChange(m.id, val);
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