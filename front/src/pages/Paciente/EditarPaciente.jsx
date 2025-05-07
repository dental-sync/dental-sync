import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import axios from 'axios';
import { toast } from 'react-toastify';

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
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPaciente = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/paciente/${id}`);
        console.log('Dados recebidos do servidor:', response.data);
        
       
        const isActiveValue = typeof response.data.isActive === 'boolean' 
          ? response.data.isActive 
          : (response.data.isActive === 'true' || response.data.isActive === true);
        
        
        let dataNascimentoFormatada = '';
        if (response.data.dataNascimento) {
          // A data vem no formato ISO do backend, pronta para o input type="date"
          dataNascimentoFormatada = response.data.dataNascimento;
          console.log('Data recebida do backend:', response.data.dataNascimento);
          console.log('Data formatada para o formulário:', dataNascimentoFormatada);
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
        toast.error('Não foi possível carregar os dados do paciente. Tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'isActive') {
      setFormData({
        ...formData,
        [name]: value === 'true'
      });
    } else if (name === 'nome') {
      // Remove todos os números do valor digitado
      const lettersOnlyValue = value.replace(/\d/g, '');
      
      setFormData({
        ...formData,
        [name]: lettersOnlyValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    
    // Retorna diretamente a string ISO do input de data HTML (yyyy-MM-dd)
    return dateString;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios com trim para garantir que não haja espaços em branco
    const nomeTrimmed = formData.nome.trim();
    const emailTrimmed = formData.email.trim();
    
    if (!nomeTrimmed) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (!nomeTrimmed.includes(' ') || nomeTrimmed.split(' ').some(part => part.length === 0)) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    } else if (/\d/.test(nomeTrimmed)) {
      newErrors.nome = 'O nome não pode conter números';
    }
    
    if (!emailTrimmed) {
      newErrors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Formato de email inválido';
      }
    }
    
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Aplicar trim() no nome e email antes da validação
    setFormData(prev => ({
      ...prev,
      nome: prev.nome.trim(),
      email: prev.email.trim()
    }));
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Preparar os dados para enviar para o backen
      const pacienteData = {
        ...formData,
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        dataNascimento: formatDateForAPI(formData.dataNascimento)
      };
      
      // Certificar-se de que isActive é boolean
      pacienteData.isActive = Boolean(pacienteData.isActive);
      
      console.log('Data de nascimento do formulário:', formData.dataNascimento);
      console.log('Data de nascimento formatada para API:', pacienteData.dataNascimento);
      console.log('Enviando dados para a API:', pacienteData);
      
      // Enviar a atualização para a API
      const response = await axios.put(`http://localhost:8080/paciente/${id}`, pacienteData);
      console.log('Resposta da API:', response.data);
      
      // Limpa qualquer estado de navegação existente
      window.history.replaceState({}, document.title);
      
      // Navegar para a página de listagem com mensagem de sucesso
      navigate('/paciente', { 
        state: { 
          success: `Paciente atualizado com sucesso!`,
          refresh: true
        } 
      });
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      toast.error('Ocorreu um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/paciente');
  };

  const handleToggleStatus = async () => {
    try {
      setSaving(true);
      
      const newStatus = !formData.isActive;
      
      
      await axios.patch(`http://localhost:8080/paciente/${id}`, {
        isActive: newStatus
      });
      
      
      setFormData({
        ...formData,
        isActive: newStatus
      });
      
      toast.success(`Status atualizado com sucesso para ${newStatus ? 'Ativo' : 'Inativo'}`);
    } catch (err) {
      console.error('Erro ao atualizar status do paciente:', err);
      toast.error('Ocorreu um erro ao atualizar o status. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="editar-paciente-container">
      <div className="editar-paciente-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Editar Paciente</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="paciente-form">
          <div className="form-row">
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
          </div>
          
          <div className="form-row">
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
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className={errors.telefone ? 'input-error' : ''}
              />
              {errors.telefone && <div className="error-text">{errors.telefone}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dataNascimento">Data de Nascimento</label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                className={errors.dataNascimento ? 'input-error' : ''}
              />
              {errors.dataNascimento && <div className="error-text">{errors.dataNascimento}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isActive">Status</label>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive}
                onChange={handleChange}
              >
                <option value={true}>Ativo</option>
                <option value={false}>Inativo</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="form-button secondary" 
              onClick={handleVoltar}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="form-button primary" 
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPaciente;
