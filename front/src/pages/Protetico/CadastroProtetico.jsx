import React, { useState } from 'react';
import './CadastroProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../../components/PageHeader/PageHeader';
import { toast } from 'react-toastify';

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
    
    if (name === 'nome') {
      // Remove números do nome
      const nomeSemNumeros = value.replace(/[0-9]/g, '');
      setFormData({
        ...formData,
        [name]: nomeSemNumeros
      });
      return;
    }
    
    if (name === 'telefone') {
      const digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      if (digits.length > 0) {
        // Limita a 11 dígitos (2 do DDD + 9 do número)
        const limitedDigits = digits.substring(0, 11);
        
        // Adiciona o DDD
        formattedValue = `(${limitedDigits.substring(0, 2)}`;
        
        if (limitedDigits.length > 2) {
          // Adiciona o espaço após o DDD
          formattedValue += ') ';
          
          // Adiciona os números após o DDD
          const remainingDigits = limitedDigits.substring(2);
          formattedValue += remainingDigits;
        }
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
      return;
    }
    
    if (name === 'cro') {
      // Aplicar máscara para CRO
      let formattedValue = value.toUpperCase();
      
      // Garante que o valor sempre começa com CRO-
      if (!formattedValue.startsWith('CRO-')) {
        formattedValue = 'CRO-' + formattedValue.replace(/^CRO-?/, '');
      }
      
      // Remove caracteres inválidos
      formattedValue = formattedValue.replace(/[^A-Z0-9-]/g, '');
      
      // Adiciona hífen após a sigla do estado (após 6 caracteres: CRO-XX)
      if (formattedValue.length > 6 && formattedValue.charAt(6) !== '-') {
        formattedValue = formattedValue.substring(0, 6) + '-' + formattedValue.substring(6);
      }
      
      // Limita o tamanho máximo do CRO (CRO-XX-XXXXXX = 15 caracteres)
      if (formattedValue.length > 15) {
        formattedValue = formattedValue.substring(0, 15);
      }

      // Limita o número após o segundo hífen para 6 dígitos
      const parts = formattedValue.split('-');
      if (parts.length === 3 && parts[2].length > 6) {
        parts[2] = parts[2].substring(0, 6);
        formattedValue = parts.join('-');
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
      return;
    }
    
    // Para outros campos, sem máscara
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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      if (digits.length > 0) {
        // Adiciona o DDD
        formattedValue = `(${digits.substring(0, 2)}`;
        
        if (digits.length > 2) {
          // Adiciona o espaço após o DDD
          formattedValue += ') ';
          
          // Adiciona os números após o DDD
          const remainingDigits = digits.substring(2);
          
          if (remainingDigits.length >= 8) {
            // Identifica se é fixo (8 dígitos) ou celular (9 dígitos)
            const isCelular = remainingDigits.length >= 9;
            const splitPoint = isCelular ? 5 : 4;
            formattedValue += `${remainingDigits.substring(0, splitPoint)}-${remainingDigits.substring(splitPoint, splitPoint + 4)}`;
          } else {
            formattedValue += remainingDigits;
          }
        }
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    } else if (formData.nome.trim().split(' ').length < 2) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    } else if (formData.nome.trim().split(' ').some(part => part.length < 2)) {
      newErrors.nome = 'Sobrenome deve possuir no mínimo 2 letras';
    } else if (formData.nome.length > 255) {
      newErrors.nome = 'O nome não pode ultrapassar 255 caracteres';
    } else if (/\d/.test(formData.nome)) {
      newErrors.nome = 'O nome não pode conter números';
    }
    
    // Validar CRO
    if (!formData.cro.trim() || formData.cro === 'CRO-') {
      newErrors.cro = 'O CRO é obrigatório';
    } else if (!/^CRO-[A-Z]{2}-\d{1,6}$/.test(formData.cro)) {
      newErrors.cro = 'CRO incorreto. Digite o padrão correto: CRO-UF-NÚMERO (máximo 6 dígitos)';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido. O email deve terminar com .com';
    } else if (formData.email.length > 255) {
      newErrors.email = 'O email não pode ultrapassar 255 caracteres';
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'O telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo';
    }
    
    // Validar cargo
    if (!formData.cargo) {
      newErrors.cargo = 'O cargo é obrigatório';
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
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

      // Limpa qualquer estado de navegação existente
      window.history.replaceState({}, document.title);
      
      // Navegar para a página de listagem com mensagem de sucesso e flag de refresh
      navigate('/protetico', { 
        state: { 
          success: 'Protético cadastrado com sucesso!',
          refresh: true 
        } 
      });
    } catch (error) {
      console.error('Erro ao cadastrar protético:', error);
      
      if (error.response) {
        // Capturar erros de validação de e-mail
        const errorResponseData = error.response.data || {};
        const errorMessage = errorResponseData.message || '';
        
        // Verificar diferentes padrões de erro que indicam problemas com o email
        if (
          (error.response.status === 500 && 
            (errorMessage.includes('Email inv') || 
             errorMessage.includes('ConstraintViolationException') || 
             errorMessage.includes('propertyPath=email')))
        ) {
          setErrors(prev => ({
            ...prev,
            email: 'Email inválido. Verifique o formato e tente novamente.'
          }));
        }
        // Verificar outros erros específicos da API
        else if (errorResponseData.errors) {
          const apiErrors = {};
          errorResponseData.errors.forEach(err => {
            apiErrors[err.field] = err.message;
          });
          setErrors(apiErrors);
        } 
        // Mensagem de erro específica
        else if (errorResponseData.message) {
          toast.error(errorResponseData.message);
        } 
        // Mensagem de erro genérica
        else {
          toast.error('Ocorreu um erro ao cadastrar o protético. Tente novamente.');
        }
      } else {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/protetico');
  };

  return (
    <div className="protetico-page">
      <div className="cadastro-protetico-page">
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
        
        {errors.serverValidation && (
          <div className="server-validation-error">
            <div className="error-title">Erro de validação:</div>
            <div className="error-message">{errors.serverValidation}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="protetico-form">
          <div className="form-group">
            <label htmlFor="nome" className="required">Nome Completo</label>
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
            <label htmlFor="email" className="required">Email</label>
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
            <label htmlFor="telefone" className="required">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.telefone ? 'input-error' : ''}
              placeholder="(00) 00000-0000"
            />
            {errors.telefone && <div className="error-text">{errors.telefone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cargo" className="required">Cargo</label>
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
            <label htmlFor="cro" className="required">CRO</label>
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
            <label htmlFor="senha" className="required">Senha</label>
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
            <label htmlFor="confirmarSenha" className="required">Confirmar Senha</label>
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
    </div>
  );
};

export default CadastroProtetico; 