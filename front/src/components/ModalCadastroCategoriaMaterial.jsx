import React, { useState, useEffect } from 'react';
import './ModalCadastroCategoriaMaterial.css';
import api from '../axios-config';

const ModalCadastroCategoriaMaterial = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Limpa os campos quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da categoria é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/categoria-material', {
        nome: formData.nome,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar categoria');
      }

      const categoriaData = await response.json();
      onSuccess(categoriaData);
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar categoria:', error);
      setErrors({ submit: 'Erro ao salvar categoria. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Cadastrar Nova Categoria</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required">Nome da Categoria</label>
            {errors.nome && (
              <div className="error-message">
                {errors.nome}
              </div>
            )}
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'input-error' : ''}
              placeholder="Digite o nome da categoria"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCadastroCategoriaMaterial; 