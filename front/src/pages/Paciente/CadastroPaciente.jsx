import React, { useState } from 'react';
import './CadastroPaciente.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CadastroPaciente = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    
    //Limpar erro do campo quando o usuário digita
    if (errors[name]) {
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
    
    if (!nomeTrimmed) newErrors.nome = 'Nome é obrigatório';
    // Verificar se o nome contém pelo menos um sobrenome
    else if (!nomeTrimmed.includes(' ') || nomeTrimmed.split(' ').some(part => part.length === 0)) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    }
    // Verificar se o nome contém números
    else if (/\d/.test(nomeTrimmed)) {
      newErrors.nome = 'O nome não pode conter números';
    }
    
    if (!emailTrimmed) newErrors.email = 'Email é obrigatório';
    if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
    
    //Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailTrimmed && !emailRegex.test(emailTrimmed)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    //Validar data de nascimento (não pode ser no futuro)
    if (formData.dataNascimento) {
      // Comparar diretamente a string de data com a data atual formatada em ISO
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
      const diaHoje = String(hoje.getDate()).padStart(2, '0');
      const dataHojeISO = `${anoHoje}-${mesHoje}-${diaHoje}`;
      
      if (formData.dataNascimento > dataHojeISO) {
        newErrors.dataNascimento = 'A data de nascimento não pode ser no futuro';
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
    
    // Aplicar trim() no nome e email antes da validação
    setFormData(prev => ({
      ...prev,
      nome: prev.nome.trim(),
      email: prev.email.trim()
    }));
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const pacienteData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone,
        dataNascimento: formatDateForAPI(formData.dataNascimento),
        isActive: true
      };
      
      console.log('Data de nascimento original do input:', formData.dataNascimento);
      console.log('Data de nascimento formatada para API:', pacienteData.dataNascimento);
      console.log('Enviando dados do paciente para API:', pacienteData);
      await axios.post('http://localhost:8080/paciente', pacienteData);
      
      // Limpa qualquer estado de navegação existente
      window.history.replaceState({}, document.title);
      
      // Navegar para a página de listagem com mensagem de sucesso e flag de refresh
      navigate('/paciente', { 
        state: { 
          success: `Paciente cadastrado com sucesso!`,
          refresh: true 
        } 
      });
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      
      if (error.response && error.response.data) {
        //Tratamento de erros específicos da API
        if (error.response.data.errors) {
          const apiErrors = {};
          error.response.data.errors.forEach(err => {
            apiErrors[err.field] = err.message;
          });
          setErrors(apiErrors);
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Ocorreu um erro ao cadastrar o paciente. Tente novamente.');
        }
      } else {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
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
              className={errors.dataNascimento ? 'input-error' : ''}
            />
            {errors.dataNascimento && <div className="error-text">{errors.dataNascimento}</div>}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={handleVoltar} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-cadastrar" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroPaciente;
