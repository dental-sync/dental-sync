import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './TwoStepRegister.css';
import { useNavigate } from 'react-router-dom';
import { validatePassword } from '../../utils/passwordValidator';
import PasswordRequirements from '../PasswordRequirements/PasswordRequirements';
import PasswordInput from '../PasswordInput';

const UserForm = ({ initialData, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nome') {
      // Remove números do nome
      const nomeSemNumeros = value.replace(/[0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: nomeSemNumeros
      }));
      return;
    }
    
    if (name === 'cro') {
      // Garante que o valor sempre começa com CRO-
      let formattedValue = value;
      if (!value.startsWith('CRO-')) {
        formattedValue = 'CRO-' + value.replace(/^CRO-?/, '');
      }
      
      // Remove caracteres inválidos e converte para maiúsculo
      formattedValue = formattedValue.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      
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
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
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
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
  };

  const validateForm = () => {
    // Validar nome
    if (!formData.nome.trim()) {
      toast.error('O nome é obrigatório');
      return false;
    } else if (formData.nome.trim().split(' ').length < 2) {
      toast.error('Por favor, informe o nome e sobrenome');
      return false;
    } else if (formData.nome.trim().split(' ')[0].length < 2) {
      toast.error('O primeiro nome deve possuir no mínimo 2 letras');
      return false;
    } else if (formData.nome.trim().split(' ').pop().length < 1) {
      toast.error('O sobrenome deve possuir no mínimo 1 letra');
      return false;
    } else if (formData.nome.length > 255) {
      toast.error('O nome não pode ultrapassar 255 caracteres');
      return false;
    } else if (/\d/.test(formData.nome)) {
      toast.error('O nome não pode conter números');
      return false;
    }
    
    // Validar CRO
    if (!formData.cro.trim() || formData.cro === 'CRO-') {
      toast.error('O CRO é obrigatório');
      return false;
    } else if (!/^CRO-[A-Z]{2}-\d{1,6}$/.test(formData.cro)) {
      toast.error('CRO incorreto. Digite o padrão correto: CRO-UF-NÚMERO (máximo 6 dígitos)');
      return false;
    }
    
    // Validar email
    if (!formData.email.trim()) {
      toast.error('O email é obrigatório');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(formData.email)) {
      toast.error('Formato de email inválido. O email deve terminar com .com');
      return false;
    } else if (formData.email.length > 255) {
      toast.error('O email não pode ultrapassar 255 caracteres');
      return false;
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      toast.error('O telefone é obrigatório');
      return false;
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      toast.error('Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo');
      return false;
    }
    
    // Validar senha com regras complexas
    const passwordErrors = validatePassword(formData.senha);
    if (passwordErrors.length > 0) {
      // Mostrar apenas o primeiro erro para evitar muitos toasts
      toast.error(passwordErrors[0]);
      return false;
    }
    
    // Validar confirmação de senha
    if (!formData.confirmarSenha) {
      toast.error('Confirme sua senha');
      return false;
    } else if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>Dados do Usuário</h2>
      <p className="form-subtitle">Informe seus dados pessoais para criar sua conta</p>
      
      <div className="form-group">
        <label htmlFor="nome" className="required">Nome Completo</label>
        <div className="input-container">
          <span className="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="cro" className="required">
          CRO
          <span className="tooltip-icon" data-tooltip="Formato: CRO-UF-NÚMERO (máximo 6 dígitos)">?</span>
        </label>
        <div className="input-container">
          <span className="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <input
            type="text"
            id="cro"
            name="cro"
            value={formData.cro}
            onChange={handleChange}
            onFocus={(e) => {
              if (!e.target.value || e.target.value === '') {
                setFormData(prev => ({ ...prev, cro: 'CRO-' }));
              }
            }}
            placeholder="CRO-UF-NÚMERO"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="email" className="required">Email</label>
        <div className="input-container">
          <span className="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu.email@exemplo.com"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="telefone" className="required">Telefone</label>
        <div className="input-container">
          <span className="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </span>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="(00) 00000-0000"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="senha" className="required">Senha</label>
        <PasswordInput
          id="senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          placeholder="Crie uma senha segura"
          required
        />
        <PasswordRequirements password={formData.senha} />
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmarSenha" className="required">Confirmar Senha</label>
        <PasswordInput
          id="confirmarSenha"
          name="confirmarSenha"
          value={formData.confirmarSenha}
          onChange={handleChange}
          placeholder="Confirme sua senha"
          required
        />
      </div>
      
      <div className="form-actions">
      
        <button type="button" className="btn-voltar" onClick={() => navigate('/login')}>
          Voltar
        </button>
        <button type="submit" className="btn-primary">
          Continuar
        </button>

      </div>
    </form>
  );
};

export default UserForm; 