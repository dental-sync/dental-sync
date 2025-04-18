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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [telefoneError, setTelefoneError] = useState('');

  // Carregar dados do protético
  useEffect(() => {
    const fetchProtetico = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await axios.get(`/api/proteticos/${id}`);
          
          // Mapear os dados da API para o estado do formulário
          setFormData({
            nome: response.data.nome || '',
            email: response.data.email || '',
            telefone: response.data.telefone || '',
            cargo: response.data.isAdmin ? 'admin' : 'tecnico',
            cro: response.data.cro || '',
            status: response.data.status || 'ATIVO'
          });
        } catch (apiErr) {
          console.error('Não foi possível acessar a API:', apiErr);
          setError('Não foi possível carregar os dados do protético. Tente novamente mais tarde.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados do protético:', err);
        setError('Não foi possível carregar os dados do protético.');
        setLoading(false);
      }
    };

    fetchProtetico();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      // Limpar a mensagem de erro quando o usuário edita o campo
      setTelefoneError('');
      
      // Aceitar o formato como está, apenas remover caracteres não numéricos para validação
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validar telefone - apenas verificar se tem números suficientes (pelo menos 10)
    if (formData.telefone) {
      const numerosTelefone = formData.telefone.replace(/\D/g, '');
      if (numerosTelefone.length < 10 || numerosTelefone.length > 11) {
        setTelefoneError('Telefone deve ter entre 10 e 11 números (incluindo DDD)');
        isValid = false;
      }
    }
    
    return isValid;
  };

  const formatarTelefoneParaEnvio = (telefone) => {
    // Remover todos os caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    // Verificar se tem números suficientes
    if (numeros.length < 10) return telefone;
    
    // Formatar como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX dependendo do tamanho
    if (numeros.length === 11) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    } else {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Converter dados do formulário para o formato esperado pela API
      const proteticoData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formatarTelefoneParaEnvio(formData.telefone),
        isAdmin: formData.cargo === 'admin',
        cro: formData.cro,
        status: formData.status
      };
      
      // Enviar dados para a API via PUT
      try {
        await axios.put(`/api/proteticos/${id}`, proteticoData);
        console.log('Dados enviados com sucesso para a API');
        setSaving(false);
        navigate('/protetico');
      } catch (apiErr) {
        console.error('Erro ao enviar para API:', apiErr);
        // Verificar se o erro é de validação
        if (apiErr.response && apiErr.response.data) {
          const errorMsg = apiErr.response.data.message || apiErr.response.data;
          if (errorMsg.includes('telefone')) {
            setTelefoneError('Formato de telefone inválido. Entre somente com os números incluindo DDD');
            setSaving(false);
            return;
          }
        }
        // Mostrar erro genérico
        setError('Ocorreu um erro ao salvar as alterações. Tente novamente mais tarde.');
        setSaving(false);
      }
      
    } catch (err) {
      console.error('Erro ao salvar dados do protético:', err);
      setError('Ocorreu um erro ao salvar as alterações.');
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/protetico');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
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
        <h1 className="page-title">Gerenciar Protético</h1>
      </div>
      
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-section-title">Informações do Protético</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="Ex: (48)991234567 ou 48991234567"
                className={`form-input ${telefoneError ? 'input-error' : ''}`}
              />
              {telefoneError && (
                <div className="error-message">{telefoneError}</div>
              )}
              <div className="help-text">Digite apenas números ou use o formato que preferir. Será formatado automaticamente.</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="cargo">Cargo</label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="admin">Admin</option>
                <option value="tecnico">Técnico</option>
                <option value="tecnico-senior">Técnico Sênior</option>
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
                placeholder="CRO-UF 00000"
                className="form-input"
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
                className="form-select"
                required
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-button" disabled={saving}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M17 21v-8H7v8" />
                  <path d="M7 3v5h8" />
                </svg>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProtetico; 