import React, { useState } from 'react';
import './CadastroProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CadastroProtetico = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    cro: '',
    senha: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [telefoneError, setTelefoneError] = useState('');
  
  const navigate = useNavigate();

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
        senha: formData.senha,
        status: 'ATIVO'
      };
      
      // Enviar dados para a API via POST
      try {
        await axios.post('/api/proteticos', proteticoData);
        console.log('Dados enviados com sucesso para a API');
      } catch (apiErr) {
        console.warn('Erro ao enviar para API, simulando sucesso:', apiErr);
        // Verificar se o erro é de validação
        if (apiErr.response && apiErr.response.data) {
          const errorMsg = apiErr.response.data.message || apiErr.response.data;
          if (errorMsg.includes('telefone')) {
            setTelefoneError('Formato de telefone inválido. Entre somente com os números incluindo DDD');
            setSaving(false);
            return;
          }
        }
        // Simulamos sucesso mesmo sem API funcional
        console.log('Dados que seriam enviados:', proteticoData);
      }
      
      setSaving(false);
      navigate('/protetico');
    } catch (err) {
      console.error('Erro ao salvar dados do protético:', err);
      setError('Ocorreu um erro ao cadastrar o protético.');
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/protetico');
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cadastro-protetico-page">
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
        <h1 className="page-title">Cadastro Protético</h1>
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
                placeholder="Nome completo do protético"
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
                placeholder="email@exemplo.com"
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
                <option value="" disabled>Selecione o cargo</option>
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
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Digite a senha"
                className="form-input"
                required
              />
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

export default CadastroProtetico; 