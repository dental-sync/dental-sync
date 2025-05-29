import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CadastroServico.css';

const CadastroServico = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.valor || !formData.categoriaServico.id) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Formatar o valor para número
      const servicoData = {
        ...formData,
        valor: parseFloat(formData.valor.replace(',', '.'))
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
      <div className="cadastro-servico-container">
        <h1>Cadastrar Novo Serviço</h1>
        
        <form onSubmit={handleSubmit} className="cadastro-servico-form">
          <div className="form-group">
            <label htmlFor="nome">
              Nome <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
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
              value={formData.descricao}
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
                value={formData.valor}
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
                value={formData.categoriaServico.id}
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
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroServico; 