import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css';
import NotificationBell from '../../../components/NotificationBell/NotificationBell';
import axios from 'axios';

const EditarPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPaciente = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/paciente/${id}`);
        console.log('Dados recebidos do servidor:', response.data);
        
        // Verificar se isActive existe e processar adequadamente
        const isActiveValue = typeof response.data.isActive === 'boolean' 
          ? response.data.isActive 
          : (response.data.isActive === 'true' || response.data.isActive === true);
        
        // Formatar data de nascimento  
        let dataNascimentoFormatada = '';
        if (response.data.dataNascimento) {
          // Formato vindo da API pode variar, então tratamos isso
          const data = new Date(response.data.dataNascimento);
          const ano = data.getFullYear();
          // getMonth() retorna 0-11, então adicionamos 1 para ter mês correto
          const mes = String(data.getMonth() + 1).padStart(2, '0');
          const dia = String(data.getDate()).padStart(2, '0');
          dataNascimentoFormatada = `${ano}-${mes}-${dia}`;
        }
          
        setFormData({
          nome: response.data.nome || '',
          email: response.data.email || '',
          telefone: response.data.telefone || '',
          dataNascimento: dataNascimentoFormatada,
          isActive: isActiveValue
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados do paciente:', err);
        setError('Não foi possível carregar os dados do paciente. Tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    return dateString; // Envia a data exatamente como está no formato YYYY-MM-DD
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nome completo
    if (!formData.nome) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (!formData.nome.trim().includes(' ') || formData.nome.trim().split(' ').some(part => part.length === 0)) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    }
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Formato de email inválido';
      }
    }
    
    // Validar telefone
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return;
    }
    
    setEnviando(true);
    setError(null);
    
    try {
      // Preparar os dados para enviar para o backend
      const pacienteData = {
        ...formData,
        dataNascimento: formatDateForAPI(formData.dataNascimento)
      };
      
      // Certificar-se de que isActive é boolean
      pacienteData.isActive = Boolean(pacienteData.isActive);
      
      console.log('Enviando dados para a API:', pacienteData);
      
      // Enviar a atualização para a API
      const response = await axios.put(`http://localhost:8080/paciente/${id}`, pacienteData);
      console.log('Resposta da API:', response.data);
      
      setSuccess(true);
      setTimeout(() => {
        // Navegação para a lista com sinal para atualizar
        navigate('/paciente', { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      setError('Ocorreu um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleVoltar = () => {
    navigate('/paciente');
  };

  const handleStatusChange = (e) => {
    const value = e.target.value === 'true';
    setFormData({
      ...formData,
      isActive: value,
      status: value ? 'ATIVO' : 'INATIVO'
    });
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="paciente-page">
      <div className="editar-paciente-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Editar Paciente</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Paciente atualizado com sucesso!</div>}
        
        <form onSubmit={handleSubmit} className="paciente-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'input-error' : ''}
            />
            {errors.nome && <div className="error-text">{errors.nome}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className={errors.telefone ? 'input-error' : ''}
            />
            {errors.telefone && <div className="error-text">{errors.telefone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dataNascimento">Data de Nascimento</label>
            <input
              type="date"
              id="dataNascimento"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="isActive">Status</label>
            <select
              id="isActive"
              name="isActive"
              value={formData.isActive.toString()}
              onChange={handleStatusChange}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
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
    </div>
  );
};

export default EditarPaciente;
