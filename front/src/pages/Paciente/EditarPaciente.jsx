import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import api from '../../axios-config';
import { toast } from 'react-toastify';

const EditarPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    isActive: true,
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const MAX_CHARS = 255; 

  useEffect(() => {
    const fetchPaciente = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/paciente/${id}`);
        const paciente = response.data;
        
        setFormData({
          nome: paciente.nome || '',
          email: paciente.email || '',
          telefone: paciente.telefone || '',
          dataNascimento: paciente.dataNascimento || '',
          isActive: paciente.isActive !== undefined ? paciente.isActive : true,
          endereco: {
            cep: paciente.endereco?.cep || '',
            logradouro: paciente.endereco?.logradouro || '',
            numero: paciente.endereco?.numero || '',
            bairro: paciente.endereco?.bairro || '',
            cidade: paciente.endereco?.cidade || '',
            estado: paciente.endereco?.estado || ''
          }
        });
      } catch (error) {
        console.error('Erro ao buscar paciente:', error);
        toast.error('Erro ao carregar dados do paciente');
        navigate('/paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'isActive') {
      setFormData({
        ...formData,
        [name]: value === 'true'
      });
    } else if (name === 'telefone') {
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
    } else if (name === 'nome') {
      // Remove todos os números do valor digitado
      const lettersOnlyValue = value.replace(/\d/g, '');
      
      // Limita a 255 caracteres
      const limitedValue = lettersOnlyValue.slice(0, MAX_CHARS);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
      
      
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
    } else if (name === 'email') {
      
      const limitedValue = value.slice(0, MAX_CHARS);
      
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
       
        const updatedErrors = {...errors};
        delete updatedErrors[name];
        setErrors(updatedErrors);
      }
    } else if (name === 'dataNascimento') {
      // Permitir apenas datas com ano de até 4 dígitos
      let partes = value.split('-');
      if (partes.length === 3) {
        if (partes[0].length > 4) {
          partes[0] = partes[0].slice(0, 4);
          const valorCorrigido = partes.join('-');
          setFormData({
            ...formData,
            [name]: valorCorrigido
          });
          return;
        }
      }
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (errors[name] && errors[name] !== `Limite máximo de ${MAX_CHARS} caracteres excedido`) {
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
    } else if (nomeTrimmed.length > MAX_CHARS) {
      newErrors.nome = `Limite máximo de ${MAX_CHARS} caracteres excedido`;
    }
    
    if (!emailTrimmed) {
      newErrors.email = 'Email é obrigatório';
    } else if (emailTrimmed.length > MAX_CHARS) {
      newErrors.email = `Limite máximo de ${MAX_CHARS} caracteres excedido`;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Formato de email inválido';
      }
    }
    
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const pacienteData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        dataNascimento: formData.dataNascimento,
        endereco: formData.endereco,
        isActive: formData.isActive
      };

      const response = await api.put(`/paciente/${id}`, pacienteData);
      toast.success('Paciente atualizado com sucesso!');
      navigate('/paciente');
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar paciente';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/paciente');
  };

  const handleStatusToggle = async () => {
    try {
      await api.patch(`/paciente/${id}`, {
        isActive: !formData.isActive
      });
      
      setFormData(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));
      
      toast.success('Status do paciente alterado com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do paciente');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="paciente-page">
      <div className="cadastro-paciente-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Editar Paciente</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="paciente-form">
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
            <label htmlFor="dataNascimento">Data de Nascimento</label>
            <input
              type="date"
              id="dataNascimento"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              className={errors.dataNascimento ? 'input-error' : ''}
            />
            {errors.dataNascimento && <span className="error-text">{errors.dataNascimento}</span>}
          </div>
          
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
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancelar" 
              onClick={handleVoltar}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-cadastrar" 
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
