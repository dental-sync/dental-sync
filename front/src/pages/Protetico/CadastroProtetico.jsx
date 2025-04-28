import React, { useState } from 'react';
import './CadastroProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CadastroProtetico = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    cro: '',
    senha: '',
    confirmarSenha: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      // Aplicar máscara de telefone (99) 99999-9999
      const cleaned = value.replace(/\D/g, '');
      let formatted = '';
      
      if (cleaned.length <= 11) {
        if (cleaned.length > 0) formatted += '(';
        if (cleaned.length > 0) formatted += cleaned.substring(0, 2);
        if (cleaned.length > 2) formatted += ') ';
        if (cleaned.length > 2) formatted += cleaned.substring(2, 7);
        if (cleaned.length > 7) formatted += '-';
        if (cleaned.length > 7) formatted += cleaned.substring(7, 11);
        
        setFormData({
          ...formData,
          [name]: formatted
        });
      }
    } else if (name === 'cro') {
      // Aplicar máscara para CRO
      const upperValue = value.toUpperCase();
      
      // Verificar o formato CRO-XX NNNNNN
      const croPrefixMatch = upperValue.match(/^(CRO-[A-Z]{0,2})/);
      
      if (croPrefixMatch) {
        // Formato começa com CRO-XX
        const prefix = croPrefixMatch[0];
        const rest = upperValue.substring(prefix.length).replace(/\D/g, '');
        
        if (rest) {
          setFormData({
            ...formData,
            [name]: `${prefix} ${rest}`
          });
        } else {
          setFormData({
            ...formData,
            [name]: prefix
          });
        }
      } else {
        // Permitir apenas letras para o estado ou números para o registro
        setFormData({
          ...formData,
          [name]: upperValue
        });
      }
    } else {
      // Para outros campos, sem máscara
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.cro) newErrors.cro = 'CRO é obrigatório';
    if (!formData.cargo) newErrors.cargo = 'Cargo é obrigatório';
    
    // Validar tamanho do nome
    if (formData.nome && formData.nome.length > 255) {
      newErrors.nome = 'O nome não pode ter mais de 255 caracteres';
    }
    
    // Validar formato do telefone
    if (formData.telefone) {
      const telefoneClean = formData.telefone.replace(/\D/g, '');
      if (telefoneClean.length !== 11) {
        newErrors.telefone = 'Telefone deve conter 11 dígitos (DDD + número)';
      }
    }
    
    // Validar formato de CRO
    const croRegex = /(CRO-[A-Z]{2}\s?\d{1,6})|(\d{1,6}\s?CRO-[A-Z]{2})/;
    if (formData.cro && !croRegex.test(formData.cro)) {
      newErrors.cro = 'Formato de CRO inválido. Use o formato: CRO-XX NNNNNN ou NNNNNN CRO-XX';
    }
    
    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
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
      const proteticoData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        cro: formData.cro,
        isAdmin: formData.cargo === 'Admin',
        senha: formData.senha,
        status: 'ATIVO'
      };
      
      await axios.post('/api/proteticos', proteticoData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/protetico');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar protético:', error);
      
      if (error.response && error.response.data) {
        // Tratamento de erros específicos da API
        if (error.response.data.errors) {
          const apiErrors = {};
          error.response.data.errors.forEach(err => {
            apiErrors[err.field] = err.message;
          });
          setErrors(apiErrors);
        } else if (error.response.data.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'Ocorreu um erro ao cadastrar o protético. Tente novamente.' });
        }
      } else {
        setErrors({ general: 'Erro de conexão. Verifique sua internet e tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/protetico');
  };

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
        <h1 className="page-title">Cadastro de Protético</h1>
      </div>
      
      {success && (
        <div className="success-message">
          Protético cadastrado com sucesso!
        </div>
      )}
      
      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="protetico-form">
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={errors.nome ? 'input-error' : ''}
            maxLength={255}
            placeholder="Digite o nome completo"
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
            maxLength={100}
            placeholder="exemplo@email.com"
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
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && <div className="error-text">{errors.telefone}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cargo">Cargo</label>
          <select
            id="cargo"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            className={errors.cargo ? 'input-error' : ''}
          >
            <option value="">Selecione um cargo</option>
            <option value="Admin">Admin</option>
            <option value="Protetico">Protetico</option>
          </select>
          {errors.cargo && <div className="error-text">{errors.cargo}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cro">CRO</label>
          <input
            type="text"
            id="cro"
            name="cro"
            value={formData.cro}
            onChange={handleChange}
            className={errors.cro ? 'input-error' : ''}
            placeholder="CRO-XX 000000"
          />
          {errors.cro && <div className="error-text">{errors.cro}</div>}
          <small className="input-help">Formato: CRO-XX NNNNNN (ex: CRO-SP 123456)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            className={errors.senha ? 'input-error' : ''}
            placeholder="Mínimo de 6 caracteres"
            minLength={6}
          />
          {errors.senha && <div className="error-text">{errors.senha}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha</label>
          <input
            type="password"
            id="confirmarSenha"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            className={errors.confirmarSenha ? 'input-error' : ''}
            placeholder="Repita a senha"
          />
          {errors.confirmarSenha && <div className="error-text">{errors.confirmarSenha}</div>}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={handleVoltar} className="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" className="btn-cadastrar" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroProtetico; 