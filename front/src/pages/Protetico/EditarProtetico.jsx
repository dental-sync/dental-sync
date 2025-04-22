import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import axios from 'axios';

const EditarProtetico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    cro: '',
    status: 'ATIVO'
  });
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProtetico = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/proteticos/${id}`);
        setFormData({
          nome: response.data.nome || '',
          email: response.data.email || '',
          telefone: response.data.telefone || '',
          cargo: response.data.isAdmin ? 'Admin' : 'Protetico',
          cro: response.data.cro || '',
          status: response.data.status || 'ATIVO'
        });
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados do protético:', err);
        setError('Não foi possível carregar os dados do protético. Tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchProtetico();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    
    try {
      // Preparar os dados para enviar para o backend
      const proteticoData = {
        ...formData,
        isAdmin: formData.cargo === 'Admin'
      };
      
      // Enviar a atualização para a API
      await axios.put(`/api/proteticos/${id}`, proteticoData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/protetico');
      }, 2000);
    } catch (err) {
      console.error('Erro ao atualizar protético:', err);
      setError('Ocorreu um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleVoltar = () => {
    navigate('/protetico');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="editar-protetico-page">
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>
      
      <div className="back-navigation">
        <button onClick={handleVoltar} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="page-title">Editar Protético</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Protético atualizado com sucesso!</div>}
      
      <form onSubmit={handleSubmit} className="protetico-form">
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cargo">Cargo</label>
          <select
            id="cargo"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um cargo</option>
            <option value="Admin">Admin</option>
            <option value="Protetico">Protetico</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="cro">CRO</label>
          <input
            type="text"
            id="cro"
            name="cro"
            value={formData.cro}
            onChange={handleChange}
            required
          />
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
          <button type="button" onClick={handleVoltar} className="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" className="btn-salvar" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarProtetico; 