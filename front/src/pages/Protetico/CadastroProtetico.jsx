import React, { useState } from 'react';
import './CadastroProtetico.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    confirmarSenha: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      // Aplicar máscara de telefone (99) 99999-9999
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
          formattedValue += limitedDigits.substring(2);
        }
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    } else if (name === 'cro') {
      // Aplicar máscara para CRO
      const upperValue = value.toUpperCase();
      
      // Garante que o valor sempre começa com CRO-
      let formattedValue = upperValue;
      if (!upperValue.startsWith('CRO-')) {
        formattedValue = 'CRO-' + upperValue.replace(/^CRO-?/, '');
      }
      
      // Remove caracteres inválidos
      formattedValue = formattedValue.replace(/[^A-Z0-9-]/g, '');
      
      // Formato CRO-XX NNNNNN
      const parts = formattedValue.split('-');
      if (parts.length >= 2 && parts[1].length === 2) {
        // Se já temos o estado (XX), adicionamos espaço antes dos números
        const restOfString = parts.slice(2).join('');
        formattedValue = `CRO-${parts[1]} ${restOfString}`;
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    } else if (name === 'nome') {
      // Remove números do nome
      const nomeSemNumeros = value.replace(/[0-9]/g, '');
      setFormData({
        ...formData,
        [name]: nomeSemNumeros
      });
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
    
    // Validar campos obrigatórios
    if (!formData.nome) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().split(' ').length < 2) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    } else if (formData.nome.trim().split(' ')[0].length < 2) {
      newErrors.nome = 'O nome deve possuir no mínimo 2 letras';
    } else if (formData.nome.length > 255) {
      newErrors.nome = 'O nome não pode ter mais de 255 caracteres';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    } else if (formData.email.length > 255) {
      newErrors.email = 'O email não pode ter mais de 255 caracteres';
    }
    
    if (!formData.cro) {
      newErrors.cro = 'CRO é obrigatório';
    } else {
      // Validar formato de CRO (CRO-XX NNNNNN)
      const croRegex = /^CRO-[A-Z]{2}\s\d{1,6}$/;
      if (!croRegex.test(formData.cro)) {
        newErrors.cro = 'Formato de CRO inválido. Use o formato: CRO-XX NNNNNN (ex: CRO-SP 123456)';
      }
    }
    
    if (!formData.cargo) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    
    // Validar formato do telefone
    if (formData.telefone) {
      const telefoneClean = formData.telefone.replace(/\D/g, '');
      if (telefoneClean.length !== 11 && telefoneClean.length !== 10) {
        newErrors.telefone = 'Telefone deve ter formato válido: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo';
      }
    } else {
      newErrors.telefone = 'Telefone é obrigatório';
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
        isActive: formData.isActive
      };
      
      await axios.post('http://localhost:8080/proteticos', proteticoData);
      
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
        const errorMessage = error.response.data;
        if (typeof errorMessage === 'string') {
          toast.error(errorMessage);
        } else if (errorMessage.message) {
          toast.error(errorMessage.message);
        } else {
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
    <div className="cadastro-protetico-page">
      <div className="back-navigation">
        <button onClick={handleVoltar} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="page-title">Cadastro de Protético</h1>
      </div>
      
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
          {errors.nome && <span className="error-text">{errors.nome}</span>}
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
          {errors.email && <span className="error-text">{errors.email}</span>}
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
          {errors.telefone && <span className="error-text">{errors.telefone}</span>}
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
          {errors.cargo && <span className="error-text">{errors.cargo}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cro" className="required">
            CRO
            <span className="tooltip-icon" data-tooltip="Formato: CRO-XX NNNNNN (ex: CRO-SP 123456)">?</span>
          </label>
          <input
            type="text"
            id="cro"
            name="cro"
            value={formData.cro}
            onChange={handleChange}
            className={errors.cro ? 'input-error' : ''}
            placeholder="CRO-XX 000000"
          />
          {errors.cro && <span className="error-text">{errors.cro}</span>}
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
          {errors.senha && <span className="error-text">{errors.senha}</span>}
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
          {errors.confirmarSenha && <span className="error-text">{errors.confirmarSenha}</span>}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancelar"
            onClick={handleVoltar}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-salvar"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroProtetico; 