import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditarMaterial.css';
import ModalCadastroCategoriaMaterial from '../../components/ModalCadastroCategoriaMaterial';

const EditarMaterial = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    valorUnitario: '',
    tipo: '',
    isActive: true,
    estoqueMinimo: '',
    unidadeMedida: ''
  });
  const [showModalCategoria, setShowModalCategoria] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar categorias
        const categoriasResponse = await axios.get('http://localhost:8080/categoria-material');
        setCategorias(categoriasResponse.data);

        // Buscar material
        const materialResponse = await axios.get(`http://localhost:8080/material/${id}`);
        const material = materialResponse.data;
        
        setFormData({
          nome: material.nome,
          quantidade: material.quantidade?.toString() || '',
          valorUnitario: material.valorUnitario?.toString() || '',
          tipo: material.categoriaMaterial?.id || '',
          isActive: material.isActive,
          estoqueMinimo: material.estoqueMinimo?.toString() || '',
          unidadeMedida: material.unidadeMedida || ''
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados. Por favor, tente novamente.');
        navigate('/material');
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        [name]: checked
      }));
      return;
    }

    // Para campos numéricos, permitir apenas números e um ponto decimal
    if (type === 'number') {
      // Remove qualquer caractere que não seja número ou ponto
      const sanitizedValue = value.replace(/[^\d.]/g, '');
      
      // Garante que só exista um ponto decimal
      const parts = sanitizedValue.split('.');
      const formattedValue = parts.length > 2 
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : sanitizedValue;

      setFormData(prevState => ({
        ...prevState,
        [name]: formattedValue
      }));
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Converter strings vazias para null e formatar números
    const formattedData = {
      ...formData,
      quantidade: formData.quantidade ? Number(formData.quantidade) : null,
      valorUnitario: formData.valorUnitario ? Number(formData.valorUnitario) : null,
      estoqueMinimo: formData.estoqueMinimo ? Number(formData.estoqueMinimo) : null,
      unidadeMedida: formData.unidadeMedida || null,
      categoriaMaterial: {
        id: formData.tipo
      }
    };
    
    try {
      await axios.put(`http://localhost:8080/material/${id}`, formattedData);
      toast.success('Material atualizado com sucesso!');
      navigate('/material');
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      toast.error('Erro ao atualizar material. Por favor, tente novamente.');
    }
  };

  const handleCategoriaSuccess = (novaCategoria) => {
    setCategorias(prev => [...prev, novaCategoria]);
    setFormData(prevState => ({
      ...prevState,
      tipo: novaCategoria.id
    }));
    setShowModalCategoria(false);
  };

  return (
    <div className="editar-material-page">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="page-header">
        <h1 className="page-title">Editar Material</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="material-form">
          <div className="form-group">
            <label htmlFor="nome">Nome *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Digite o nome do material"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantidade">Quantidade *</label>
            <input
              type="number"
              id="quantidade"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="form-input"
              placeholder="0,00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="valorUnitario">Valor Unitário</label>
            <input
              type="number"
              id="valorUnitario"
              name="valorUnitario"
              value={formData.valorUnitario}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="form-input"
              placeholder="R$ 0,00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unidadeMedida">Unidade de Medida</label>
            <input
              type="text"
              id="unidadeMedida"
              name="unidadeMedida"
              value={formData.unidadeMedida}
              onChange={handleChange}
              className="form-input"
              placeholder="Ex: kg, g, un, ml"
            />
          </div>

          <div className="form-group">
            <label htmlFor="estoqueMinimo">Estoque Mínimo</label>
            <input
              type="number"
              id="estoqueMinimo"
              name="estoqueMinimo"
              value={formData.estoqueMinimo}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="form-input"
              placeholder="0,00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo *</label>
            <div className="tipo-container">
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="form-select"
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
                className="toggle-nova-categoria"
                onClick={() => setShowModalCategoria(true)}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="form-checkbox"
              />
              Material Ativo
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/material')} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      <ModalCadastroCategoriaMaterial
        isOpen={showModalCategoria}
        onClose={() => setShowModalCategoria(false)}
        onSuccess={handleCategoriaSuccess}
      />
    </div>
  );
};

export default EditarMaterial; 