import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CadastroServico.css';
import ModalCadastroCategoriaServico from '../../components/ModalCadastroCategoriaServico';

const CadastroServico = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:8080/categoria-servico');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias.');
      }
    };

    fetchCategorias();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.valor || !formData.categoriaServico.id || !formData.tempoPrevisto) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Formatar o valor para número e converter tempo previsto para minutos
      const servicoData = {
        ...formData,
        valor: parseFloat(formData.valor.replace(',', '.')),
        tempoPrevisto: parseInt(formData.tempoPrevisto) * 60 // Convertendo horas para minutos
      };

      await axios.post('http://localhost:8080/servico', servicoData);
      toast.success('Serviço cadastrado com sucesso!');
      navigate('/servico');
    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      toast.error('Erro ao cadastrar serviço. Por favor, tente novamente.');
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
                  <div className="categoria-select">
                    <select
                      id="categoriaServico"
                      name="categoriaServico"
                      value={formData.categoriaServico.id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione a categoria</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="nova-categoria-button"
                      onClick={() => setShowModalCategoria(true)}
                      title="Adicionar nova categoria"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
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
                    placeholder="Quantidade"
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
                <div className="material-select">
                  <button type="button" className="select-materiais-button">
                    Selecionar materiais
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </button>
                </div>
                <div className="empty-state">
                  Nenhum material selecionado
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save">
                <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
                <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path>
                <path d="M7 3v4a1 1 0 0 0 1 1h7"></path>
              </svg>
              Salvar Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroServico; 