import React, { useState, useEffect } from 'react';
import './EditarProtetico.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../axios-config';
import { toast } from 'react-toastify';

const EditarProtetico = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nome: '',
    cro: 'CRO-',
    telefone: '',
    email: '',
    cargo: '',
    senha: '',
    confirmarSenha: '',
    isActive: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/proteticos/${id}`);
        const protetico = response.data;
        
        setFormData({
          ...formData,
          nome: protetico.nome,
          cro: protetico.cro,
          telefone: protetico.telefone,
          email: protetico.email,
          cargo: protetico.isAdmin ? 'Admin' : 'Protetico',
          isActive: protetico.isActive
        });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErrors({ general: 'Não foi possível carregar os dados do protético.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    } else if (formData.nome.trim().split(' ').length < 2) {
      newErrors.nome = 'Por favor, informe o nome e sobrenome';
    } else if (formData.nome.trim().split(' ')[0].length < 2) {
      newErrors.nome = 'O nome deve possuir no mínimo 2 letras';
    } else if (formData.nome.trim().split(' ').pop().length < 2) {
      newErrors.nome = 'O último sobrenome deve possuir no mínimo 2 letras';
    } else if (formData.nome.length > 255) {
      newErrors.nome = 'O nome não pode ultrapassar 255 caracteres';
    } else if (/\d/.test(formData.nome)) {
      newErrors.nome = 'O nome não pode conter números';
    }
    
    if (!formData.cro.trim() || formData.cro === 'CRO-') {
      newErrors.cro = 'O CRO é obrigatório';
    } else if (!/^CRO-[A-Z]{2}-\d{1,6}$/.test(formData.cro)) {
      newErrors.cro = 'CRO incorreto. Digite o padrão correto: CRO-UF-NÚMERO (máximo 6 dígitos)';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido. O email deve terminar com .com';
    } else if (formData.email.length > 255) {
      newErrors.email = 'O email não pode ultrapassar 255 caracteres';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'O telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo';
    }
    
    if (!formData.cargo) {
      newErrors.cargo = 'O cargo é obrigatório';
    }
    
    // Validar senha apenas se foi preenchida
    if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      
      setFormData({
        ...formData,
        [name]: formattedValue
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
    
    setFormData({
      ...formData,
      [name]: value
    });
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Verificar todas as validações simultaneamente
      const [croResponse, emailResponse, telefoneResponse] = await Promise.all([
        api.get(`/proteticos/cro/${formData.cro}`).catch(() => ({ data: null })),
        api.get(`/proteticos/email/${formData.email}`).catch(() => ({ data: null })),
        api.get(`/proteticos/telefone/${formData.telefone}`).catch(() => ({ data: null }))
      ]);

      const newErrors = {};

      // Verifica se o CRO pertence a outro protético
      if (croResponse.data && croResponse.data.id !== parseInt(id)) {
        newErrors.cro = "CRO já cadastrado";
      }

      // Verifica se o email pertence a outro protético
      if (emailResponse.data && emailResponse.data.id !== parseInt(id)) {
        newErrors.email = "E-mail já cadastrado";
      }

      // Verifica se o telefone pertence a outro protético
      if (telefoneResponse.data && telefoneResponse.data.id !== parseInt(id)) {
        newErrors.telefone = "Telefone já cadastrado";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSaving(false);
        return;
      }

      // Se chegou aqui, nenhum dado está duplicado
      const proteticoData = {
        nome: formData.nome,
        cro: formData.cro,
        telefone: formData.telefone,
        email: formData.email,
        isAdmin: formData.cargo === 'Admin',
        isActive: formData.isActive
      };

      // Incluir senha apenas se foi preenchida
      if (formData.senha) {
        proteticoData.senha = formData.senha;
      }

      await api.put(`/proteticos/${id}`, proteticoData);
      
      // Limpa qualquer estado de navegação existente
      window.history.replaceState({}, document.title);
      
      // Navegar para a página de listagem com mensagem de sucesso e flag de refresh
      navigate('/protetico', { 
        state: { 
          success: 'Protético atualizado com sucesso!',
          refresh: true 
        } 
      });
    } catch (error) {
      console.error('Erro ao atualizar protético:', error);
      
      if (error.response) {
        const errorMessage = error.response.data;
        console.log('Mensagem de erro:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          toast.error(errorMessage);
        } else if (errorMessage.message) {
          toast.error(errorMessage.message);
        } else {
          toast.error('Ocorreu um erro ao atualizar o protético. Tente novamente.');
        }
      } else {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/protetico');
  };

  if (loading) {
    return <div className="loading">Carregando dados do protético...</div>;
  }

  return (
    <div className="protetico-page">
      <div className="editar-protetico-page">
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
              placeholder="Digite o nome completo"
            />
            {errors.nome && <span className="error-text">{errors.nome}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cro">
              CRO
              <span className="required-mark">*</span>
              <span className="tooltip-icon" data-tooltip="Formato: CRO-UF-NÚMERO (máximo 6 dígitos)">?</span>
            </label>
            <input
              type="text"
              id="cro"
              name="cro"
              value={formData.cro}
              onChange={handleChange}
              className={errors.cro ? 'input-error' : ''}
              placeholder="Digite o CRO"
            />
            {errors.cro && <span className="error-text">{errors.cro}</span>}
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
              <option value="Protetico">Protético</option>
              <option value="Admin">Administrador</option>
            </select>
            {errors.cargo && <span className="error-text">{errors.cargo}</span>}
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
              placeholder="Digite a nova senha (mínimo 6 caracteres)"
            />
            {errors.senha && <span className="error-text">{errors.senha}</span>}
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
              placeholder="Confirme a nova senha"
            />
            {errors.confirmarSenha && <span className="error-text">{errors.confirmarSenha}</span>}
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
            <button type="button" onClick={handleVoltar} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProtetico; 