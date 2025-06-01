import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CadastroMaterial.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ModalCadastroCategoriaMaterial from '../../components/ModalCadastroCategoriaMaterial';

const CadastroMaterial = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [errors, setErrors] = useState({});
  const [material, setMaterial] = useState({
    nome: '',
    categoriaMaterial: null,
    quantidade: '',
    unidadeMedida: '',
    valorUnitario: '',
    estoqueMinimo: '',
    isActive: true
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:8080/categoria-material');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setErrors(prev => ({
          ...prev,
          categoria: 'Erro ao carregar categorias. Por favor, recarregue a página.'
        }));
      }
    };

    fetchCategorias();

    if (id) {
      const fetchMaterial = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/material/${id}`);
          setMaterial(response.data);
        } catch (error) {
          console.error('Erro ao buscar material:', error);
          toast.error('Erro ao carregar dados do material.');
          navigate('/material');
        }
      };

      fetchMaterial();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'valorUnitario' || name === 'quantidade' || name === 'estoqueMinimo') {
      // Permitir apenas números e um ponto decimal
      const sanitizedValue = value.replace(/[^\d.]/g, '');
      const parts = sanitizedValue.split('.');
      const formattedValue = parts.length > 2 
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : sanitizedValue;

      setMaterial(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setMaterial(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
    setMaterial(prev => ({
      ...prev,
      categoriaMaterial: categoria
    }));
    
    if (errors.categoriaMaterial) {
      setErrors(prev => ({
        ...prev,
        categoriaMaterial: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar campos obrigatórios
    if (!material.nome) newErrors.nome = 'Nome é obrigatório';
    if (!material.categoriaMaterial) newErrors.categoriaMaterial = 'Categoria é obrigatória';
    if (!material.quantidade) newErrors.quantidade = 'Quantidade é obrigatória';
    if (!material.unidadeMedida) newErrors.unidadeMedida = 'Unidade de medida é obrigatória';
    if (!material.valorUnitario) newErrors.valorUnitario = 'Valor unitário é obrigatório';
    if (!material.estoqueMinimo) newErrors.estoqueMinimo = 'Estoque mínimo é obrigatório';

    // Validar tamanho do nome
    if (material.nome && material.nome.length > 100) {
      newErrors.nome = 'O nome não pode ter mais de 100 caracteres';
    }

    // Validar valores numéricos
    if (material.quantidade && parseFloat(material.quantidade) < 0) {
      newErrors.quantidade = 'A quantidade não pode ser negativa';
    }
    if (material.valorUnitario && parseFloat(material.valorUnitario) < 0) {
      newErrors.valorUnitario = 'O valor unitário não pode ser negativo';
    }
    if (material.estoqueMinimo && parseFloat(material.estoqueMinimo) < 0) {
      newErrors.estoqueMinimo = 'O estoque mínimo não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário antes de salvar.');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const materialData = {
        ...material,
        quantidade: parseFloat(material.quantidade),
        valorUnitario: parseFloat(material.valorUnitario),
        estoqueMinimo: parseFloat(material.estoqueMinimo)
      };

      if (id) {
        await axios.put(`http://localhost:8080/material/${id}`, materialData);
        toast.success('Material atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:8080/material', materialData);
        toast.success('Material cadastrado com sucesso!');
      }

      navigate('/material');
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
        toast.error('Existem erros no formulário. Por favor, verifique os campos destacados.');
      } else {
        setErrors({
          submit: 'Erro ao salvar material. Por favor, verifique os dados e tente novamente.'
        });
        toast.error('Erro ao salvar material. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/material');
  };

  const handleCategoriaSuccess = (novaCategoria) => {
    setCategorias(prev => [...prev, novaCategoria]);
    setMaterial(prev => ({
      ...prev,
      categoriaMaterial: novaCategoria
    }));
    setShowModalCategoria(false);
    toast.success('Categoria cadastrada com sucesso!');
  };

  return (
    <div className="cadastro-material-page">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>

      <div className="back-navigation">
        <button className="back-button" onClick={handleVoltar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="page-title">{id ? 'Editar Material' : 'Novo Material'}</h1>
      </div>

      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}
      
      <form onSubmit={handleSubmit} className="material-form">
        <div className="form-group">
          <label htmlFor="nome">Nome*</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={material.nome}
            onChange={handleInputChange}
            className={errors.nome ? 'input-error' : ''}
            placeholder="Nome do material"
          />
          {errors.nome && <span className="error-text">{errors.nome}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="categoriaMaterial">Categoria*</label>
          <div className="categoria-container">
            <select
              id="categoriaMaterial"
              name="categoriaMaterial"
              value={material.categoriaMaterial?.id || ''}
              onChange={handleCategoriaChange}
              className={errors.categoriaMaterial ? 'input-error' : ''}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-add-categoria"
              onClick={() => setShowModalCategoria(true)}
              title="Adicionar nova categoria"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          {errors.categoriaMaterial && <span className="error-text">{errors.categoriaMaterial}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantidade">Quantidade em estoque*</label>
            <input
              type="text"
              id="quantidade"
              name="quantidade"
              value={material.quantidade}
              onChange={handleInputChange}
              className={errors.quantidade ? 'input-error' : ''}
              placeholder="0,00"
            />
            {errors.quantidade && <span className="error-text">{errors.quantidade}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unidadeMedida">Unidade de Medida*</label>
            <select
              id="unidadeMedida"
              name="unidadeMedida"
              value={material.unidadeMedida}
              onChange={handleInputChange}
              className={errors.unidadeMedida ? 'input-error' : ''}
            >
              <option value="">Selecione</option>
              <option value="Uni.">Unidade</option>
              <option value="Quilograma">Quilograma</option>
              <option value="Grama">Grama</option>
              <option value="Mililitro">Mililitro</option>
              <option value="Litro">Litro</option>
              <option value="Metro">Metro</option>
              <option value="Centímetro">Centímetro</option>
            </select>
            {errors.unidadeMedida && <span className="error-text">{errors.unidadeMedida}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="valorUnitario">Valor Unitário (R$)*</label>
            <input
              type="text"
              id="valorUnitario"
              name="valorUnitario"
              value={material.valorUnitario}
              onChange={handleInputChange}
              className={errors.valorUnitario ? 'input-error' : ''}
              placeholder="0,00"
            />
            {errors.valorUnitario && <span className="error-text">{errors.valorUnitario}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="estoqueMinimo">Estoque Mínimo*</label>
            <input
              type="text"
              id="estoqueMinimo"
              name="estoqueMinimo"
              value={material.estoqueMinimo}
              onChange={handleInputChange}
              className={errors.estoqueMinimo ? 'input-error' : ''}
              placeholder="0,00"
            />
            {errors.estoqueMinimo && <span className="error-text">{errors.estoqueMinimo}</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={handleVoltar} className="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" className="btn-cadastrar" disabled={loading}>
            {loading ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Cadastrar')}
          </button>
        </div>
      </form>

      <ModalCadastroCategoriaMaterial
        isOpen={showModalCategoria}
        onClose={() => setShowModalCategoria(false)}
        onSuccess={handleCategoriaSuccess}
      />
    </div>
  );
};

export default CadastroMaterial; 