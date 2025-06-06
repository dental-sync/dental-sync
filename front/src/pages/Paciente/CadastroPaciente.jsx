import React, { useState } from 'react';
import './CadastroPaciente.css';
import { useNavigate } from 'react-router-dom';
import api from '../../axios-config';
import { toast } from 'react-toastify';

const CadastroPaciente = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    endereco: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const MAX_CHARS = 255; // Constante para limitar o número de caracteres

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "telefone") {
      // Remove todos os caracteres não numéricos
      const numericValue = value.replace(/\D/g, '');
      
      // Aplica a máscara conforme o usuário digita
      let formattedValue = '';
      
      if (numericValue.length <= 2) {
        formattedValue = numericValue.length ? `(${numericValue}` : '';
      } else if (numericValue.length <= 6) {
        formattedValue = `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
      } else if (numericValue.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        formattedValue = `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 6)}-${numericValue.slice(6, 10)}`;
      } else {
        // Celular: (XX) XXXXX-XXXX (limitado a 11 dígitos)
        formattedValue = `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    } else if (name === "nome") {
      // Remove todos os números do valor digitado
      const lettersOnlyValue = value.replace(/\d/g, '');
      
     
      const limitedValue = lettersOnlyValue.slice(0, MAX_CHARS);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
      
      //Mostrar erro se exceder o limite de caracteres
      if (lettersOnlyValue.length > MAX_CHARS) {
        setErrors({
          ...errors,
          [name]: `Limite máximo de ${MAX_CHARS} caracteres excedido`
        });
      } else if (errors[name] === `Limite máximo de ${MAX_CHARS} caracteres excedido`) {
       
        const updatedErrors = {...errors};
        delete updatedErrors[name];
        setErrors(updatedErrors);
      }
    } else if (name === "email") {
     
      // Remove espaços e normaliza o email
      const sanitizedValue = value.trim().toLowerCase();
      const limitedValue = sanitizedValue.slice(0, MAX_CHARS);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
      
   
      if (value.length > MAX_CHARS) {
        setErrors({
          ...errors,
          [name]: `Limite máximo de ${MAX_CHARS} caracteres excedido`
        });
      } else if (errors[name] === `Limite máximo de ${MAX_CHARS} caracteres excedido`) {
        //Limpar o erro específico de limite de caracteres
        const updatedErrors = {...errors};
        delete updatedErrors[name];
        setErrors(updatedErrors);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    //Limpar erro do campo quando o usuário digita
    if (errors[name] && errors[name] !== `Limite máximo de ${MAX_CHARS} caracteres excedido`) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios com trim para garantir que não haja espaços em branco
    const nomeTrimmed = formData.nome.trim();
    const emailTrimmed = formData.email.trim();
    const telefoneTrimmed = formData.telefone.trim();
    
    //Validação do nome
    if (!nomeTrimmed) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (!nomeTrimmed.includes(' ') || nomeTrimmed.split(' ').some(part => part.length === 0)) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    } else if (/\d/.test(nomeTrimmed)) {
      newErrors.nome = 'O nome não pode conter números';
    } else if (nomeTrimmed.length > MAX_CHARS) {
      newErrors.nome = `Limite máximo de ${MAX_CHARS} caracteres excedido`;
    }
    
    //Validação do email
    if (!emailTrimmed) {
      newErrors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Formato de email inválido';
      } else if (emailTrimmed.length > MAX_CHARS) {
        newErrors.email = `Limite máximo de ${MAX_CHARS} caracteres excedido`;
      }
    }
    
    //Validação do telefone
    if (!telefoneTrimmed) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else {
      const telefoneRegex = /^\(\d{2}\)\s(?:\d{4}-\d{4}|\d{5}-\d{4})$/;
      if (!telefoneRegex.test(telefoneTrimmed)) {
        newErrors.telefone = 'Formato de telefone inválido. Use (99) 9999-9999 ou (99) 99999-9999';
      }
    }
    
    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    } else {
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
      const diaHoje = String(hoje.getDate()).padStart(2, '0');
      const dataHojeISO = `${anoHoje}-${mesHoje}-${diaHoje}`;
      
      if (formData.dataNascimento > dataHojeISO) {
        newErrors.dataNascimento = 'A data de nascimento não pode ser maior que a data atual';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    
    // Retorna diretamente a string ISO do input de data HTML (yyyy-MM-dd)
    return dateString;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const pacienteData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone,
        dataNascimento: formData.dataNascimento,
        endereco: formData.endereco
      };

      await api.post('/paciente', pacienteData);
      toast.success('Paciente cadastrado com sucesso!');
      navigate('/paciente');
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar paciente';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/paciente');
  };

  return (
    <div className="paciente-page">
      <div className="cadastro-paciente-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Cadastro de Paciente</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="paciente-form" noValidate>
          <div className="form-group">
            <label htmlFor="nome" className="required">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'input-error' : ''}
              placeholder="Digite o nome completo"
              maxLength={MAX_CHARS}
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
              placeholder="exemplo@email.com"
              maxLength={MAX_CHARS}
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
              className={errors.telefone ? 'input-error' : ''}
              placeholder="(00) 00000-0000"
            />
            {errors.telefone && <span className="error-text">{errors.telefone}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dataNascimento" className="required">Data de Nascimento</label>
            <input
              type="date"
              id="dataNascimento"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              className={errors.dataNascimento ? 'input-error' : ''}
              placeholder="dd/mm/aaaa"
              noValidate
            />
            {errors.dataNascimento && <span className="error-text">{errors.dataNascimento}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="endereco" className="required">Endereço</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className={errors.endereco ? 'input-error' : ''}
              placeholder="Digite o endereço"
              maxLength={MAX_CHARS}
            />
            {errors.endereco && <span className="error-text">{errors.endereco}</span>}
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
              className="btn-cadastrar" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroPaciente;
