import React, { useState, useEffect } from 'react';
import './EditarProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditarProtetico = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProtetico = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/proteticos/${id}`);
        const protetico = response.data;
        
        setFormData({
          nome: protetico.nome || '',
          email: protetico.email || '',
          telefone: protetico.telefone || '',
          cargo: protetico.isAdmin ? 'Admin' : 'Protetico',
          cro: protetico.cro || '',
          senha: '',
          confirmarSenha: '',
          isActive: protetico.isActive
        });
      } catch (error) {
        console.error('Erro ao buscar dados do protético:', error);
        setErrors({ general: 'Erro ao carregar dados do protético. Tente novamente.' });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchProtetico();
  }, [id]);

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
    
    // Validar senha apenas se foi preenchida
    if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
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
    setErrors({});
    
    try {
      // Primeiro, buscar o status atual do protético
      const statusResponse = await axios.get(`http://localhost:8080/proteticos/${id}`);
      const currentStatus = statusResponse.data.isActive;

      // Preparar dados para atualização
      const proteticoData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        cro: formData.cro,
        isAdmin: formData.cargo === 'Admin'
      };
      
      // Incluir senha apenas se foi preenchida
      if (formData.senha) {
        proteticoData.senha = formData.senha;
      }
      
      console.log('Dados enviados para atualização:', proteticoData);
      const response = await axios.put(`http://localhost:8080/proteticos/${id}`, proteticoData);
      console.log('Resposta da API:', response.data);
      
      // Restaurar o status original se necessário
      if (response.data.isActive !== currentStatus) {
        console.log(`Restaurando status original: ${currentStatus}`);
        await axios.patch(`http://localhost:8080/proteticos/${id}`, { isActive: currentStatus });
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/protetico');
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar protético:', error);
      
      // Resetar estado de sucesso em caso de erro
      setSuccess(false);
      
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
          setErrors({ general: errorResponseData.message });
        } 
        // Mensagem de erro genérica
        else {
          setErrors({ general: 'Ocorreu um erro ao atualizar o protético. Tente novamente.' });
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

  if (loadingData) {
    return (
      <div className="protetico-page">
        <div className="cadastro-protetico-page">
          <div className="loading">Carregando dados...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="protetico-page">
      <div className="cadastro-protetico-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Editar Protético</h1>
        </div>
        
        {success && (
          <div className="success-message">
            Protético atualizado com sucesso!
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
            <label htmlFor="senha">Nova Senha (opcional)</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className={errors.senha ? 'input-error' : ''}
              placeholder="Deixe em branco para manter a senha atual"
              minLength={6}
            />
            {errors.senha && <div className="error-text">{errors.senha}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              className={errors.confirmarSenha ? 'input-error' : ''}
              placeholder="Repita a nova senha"
            />
            {errors.confirmarSenha && <div className="error-text">{errors.confirmarSenha}</div>}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={handleVoltar} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-cadastrar" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProtetico; 