import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroDentista.css';
import axios from 'axios';
import ModalCadastroClinica from '../../components/ModalCadastroClinica/ModalCadastroClinica';
import { toast } from 'react-toastify';

const CadastroDentista = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cro: 'CRO-',
    telefone: '',
    email: '',
    clinicaId: '',
    clinicasAssociadas: [],
    isActive: true
  });
  
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModalClinica, setShowModalClinica] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinicas = async () => {
      try {
        const response = await axios.get('http://localhost:8080/clinicas');
        setClinicas(response.data);
      } catch (err) {
        console.error('Erro ao buscar clínicas:', err);
        setErrors({ general: 'Erro ao carregar lista de clínicas' });
      }
    };

    fetchClinicas();
  }, []);

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

    setLoading(true);
    
    try {
      // Verificar todas as validações simultaneamente
      const [croResponse, emailResponse, telefoneResponse] = await Promise.all([
        axios.get(`http://localhost:8080/dentistas/cro/${formData.cro}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8080/dentistas/email/${formData.email}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8080/dentistas/telefone/${formData.telefone}`).catch(() => ({ data: null }))
      ]);

      const newErrors = {};

      if (croResponse.data) {
        newErrors.cro = "CRO já cadastrado";
      }

      if (emailResponse.data) {
        newErrors.email = "E-mail já cadastrado";
      }

      if (telefoneResponse.data) {
        newErrors.telefone = "Telefone já cadastrado";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Se chegou aqui, nenhum dado está duplicado
      const dentistaData = {
        nome: formData.nome,
        cro: formData.cro,
        telefone: formData.telefone,
        email: formData.email,
        clinicas: formData.clinicasAssociadas,
        isActive: formData.isActive
      };

      await axios.post('http://localhost:8080/dentistas', dentistaData);
      
      // Limpa qualquer estado de navegação existente
      window.history.replaceState({}, document.title);
      
      // Navegar para a página de listagem com mensagem de sucesso e flag de refresh
      navigate('/dentista', { 
        state: { 
          success: 'Dentista cadastrado com sucesso!',
          refresh: true 
        } 
      });
    } catch (error) {
      console.error('Erro ao cadastrar dentista:', error);
      
      if (error.response) {
        const errorMessage = error.response.data;
        console.log('Mensagem de erro:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          toast.error(errorMessage);
        } else if (errorMessage.message) {
          toast.error(errorMessage.message);
        } else {
          toast.error('Ocorreu um erro ao cadastrar o dentista. Tente novamente.');
        }
      } else {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/dentista');
  };

  const handleClinicaSuccess = (novaClinica) => {
    setClinicas([...clinicas, novaClinica]);
    setFormData({
      ...formData,
      clinicasAssociadas: [...formData.clinicasAssociadas, novaClinica]
    });
    setShowModalClinica(false);
  };

  return (
    <div className="dentista-page">
      <div className="cadastro-dentista-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Cadastro de Dentista</h1>
        </div>
        
        {success && (
          <div className="success-message">
            Dentista cadastrado com sucesso!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="dentista-form">
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
            <label htmlFor="clinicaId">Clínicas</label>
            <div className="clinicas-container">
              <div className="clinicas-tags">
                {formData.clinicasAssociadas.map(clinica => (
                  <div key={clinica.id} className="clinica-tag">
                    <span>{clinica.nome}</span>
                    <button
                      type="button"
                      className="remove-clinica"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          clinicasAssociadas: formData.clinicasAssociadas.filter(c => c.id !== clinica.id)
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="clinica-options">
                <select
                  id="clinicaId"
                  name="clinicaId"
                  value={formData.clinicaId}
                  onChange={(e) => {
                    const clinicaId = e.target.value;
                    if (clinicaId && !formData.clinicasAssociadas.some(c => c.id.toString() === clinicaId)) {
                      const clinicaSelecionada = clinicas.find(c => c.id.toString() === clinicaId);
                      if (clinicaSelecionada) {
                        setFormData({
                          ...formData,
                          clinicasAssociadas: [...formData.clinicasAssociadas, clinicaSelecionada],
                          clinicaId: ''
                        });
                      }
                    }
                  }}
                  className={errors.clinicaId ? 'input-error' : ''}
                >
                  <option value="">Selecione uma clínica</option>
                  {clinicas
                    .filter(clinica => !formData.clinicasAssociadas.some(c => c.id === clinica.id))
                    .map(clinica => (
                      <option key={clinica.id} value={clinica.id}>
                        {clinica.nome}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="toggle-nova-clinica"
                  onClick={() => setShowModalClinica(true)}
                >
                  +
                </button>
              </div>
            </div>
            {errors.clinicaId && <span className="error-text">{errors.clinicaId}</span>}
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

      <ModalCadastroClinica
        isOpen={showModalClinica}
        onClose={() => setShowModalClinica(false)}
        onSuccess={handleClinicaSuccess}
      />
    </div>
  );
};

export default CadastroDentista; 