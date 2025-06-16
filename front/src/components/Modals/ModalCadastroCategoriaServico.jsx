import React, { useState, useRef, useEffect } from 'react';
import './ModalCadastroCategoriaServico.css';
import api from '../../axios-config';

const ModalCadastroCategoriaServico = ({ isOpen, onClose, onSuccess, categoriaToEdit = null }) => {
  const [formData, setFormData] = useState({
    nome: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Preenche os campos quando é para editar uma categoria
  useEffect(() => {
    if (isOpen && categoriaToEdit) {
      setFormData({
        nome: categoriaToEdit.nome || '',
      });
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        nome: '',
      });
      setErrors({});
    }
  }, [isOpen, categoriaToEdit]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open-servico');
      if (document.activeElement) {
        document.activeElement.blur();
      }
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    } else {
      document.body.classList.remove('modal-open-servico');
    }
    return () => {
      document.body.classList.remove('modal-open-servico');
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    const firstFocusable = modal.querySelectorAll(focusableElements)[0];
    const focusable = modal.querySelectorAll(focusableElements);
    const lastFocusable = focusable[focusable.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
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
      let response;
      if (categoriaToEdit) {
        // Editar categoria existente
        response = await api.put(`/categoria-servico/${categoriaToEdit.id}`, formData);
      } else {
        // Criar nova categoria
        response = await api.post('/categoria-servico', formData);
      }

      const categoriaData = response.data;
      onSuccess(categoriaData, categoriaToEdit ? 'edit' : 'create');
      onClose();
    } catch (error) {
      console.error(`Erro ao ${categoriaToEdit ? 'editar' : 'cadastrar'} categoria:`, error);
      setErrors({ submit: `Erro ao ${categoriaToEdit ? 'editar' : 'salvar'} categoria. Tente novamente.` });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-categoria-servico-overlay">
      <div className="modal-categoria-servico" ref={modalRef}>
        <h2>{categoriaToEdit ? 'Editar Categoria' : 'Nova Categoria de Serviço'}</h2>
        {errors.submit && (
          <div className="modal-categoria-servico-erro">
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="nome-categoria-servico" className="required">Nome da categoria</label>
          <input
            id="nome-categoria-servico"
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite o nome da categoria"
            autoFocus
            ref={inputRef}
            className={errors.nome ? 'input-error' : ''}
          />
          {errors.nome && <div className="modal-categoria-servico-erro">{errors.nome}</div>}
          <div className="modal-categoria-servico-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : (categoriaToEdit ? 'Salvar Alterações' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCadastroCategoriaServico; 