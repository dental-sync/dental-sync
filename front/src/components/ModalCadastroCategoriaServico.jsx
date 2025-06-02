import React, { useState, useRef, useEffect } from 'react';
import './ModalCadastroCategoriaServico.css';
import api from '../axios-config';

const ModalCadastroCategoriaServico = ({ isOpen, onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/categoria-servico', { nome });
      onSuccess(response.data);
      setNome('');
      onClose();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setError('Erro ao criar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setError(null);
    onClose();
  };

  return (
    <div className="modal-categoria-servico-overlay">
      <div className="modal-categoria-servico" ref={modalRef}>
        <h2>Nova Categoria de Serviço</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nome-categoria-servico">Nome da categoria</label>
          <input
            id="nome-categoria-servico"
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Digite o nome da categoria"
            autoFocus
            ref={inputRef}
          />
          {error && <div className="modal-categoria-servico-erro">{error}</div>}
          <div className="modal-categoria-servico-actions">
            <button type="button" onClick={handleClose} className="btn-cancelar">Cancelar</button>
            <button type="submit" className="btn-salvar" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCadastroCategoriaServico; 