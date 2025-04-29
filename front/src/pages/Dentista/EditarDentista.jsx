import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarDentista.css';
import axios from 'axios';

const EditarDentista = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    cro: 'CRO-',
    telefone: '',
    email: '',
    clinicaId: '',
    clinicasAssociadas: [],
    novaClinica: {
      nome: '',
      cnpj: ''
    },
    isActive: true
  });
  
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNovaClinica, setShowNovaClinica] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dentistaResponse, clinicasResponse] = await Promise.all([
          axios.get(`http://localhost:8080/dentistas/${id}`),
          axios.get('http://localhost:8080/clinicas')
        ]);
        
        const dentista = dentistaResponse.data;
        setFormData({
          ...formData,
          nome: dentista.nome,
          cro: dentista.cro,
          telefone: dentista.telefone,
          email: dentista.email,
          clinicasAssociadas: dentista.clinicas || [],
          isActive: dentista.isActive
        });
        
        setClinicas(clinicasResponse.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErrors({ general: 'Não foi possível carregar os dados do dentista.' });
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
    } else if (formData.nome.length > 255) {
      newErrors.nome = 'O nome não pode ultrapassar 255 caracteres';
    } else if (/\d/.test(formData.nome)) {
      newErrors.nome = 'O nome não pode conter números';
    }
    
    if (!formData.cro.trim()) {
      newErrors.cro = 'O CRO é obrigatório';
    } else if (!/^CRO-[A-Z]{2}-\d{1,20}$/.test(formData.cro)) {
      newErrors.cro = 'CRO incorreto. Digite o padrão correto: CRO-UF-NÚMERO';
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
    } else if (!/^\(\d{2}\)\s\d{5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato de telefone inválido. Use o formato: (99) 99999-9999';
    }

    if (showNovaClinica) {
      if (!formData.novaClinica.nome.trim()) {
        newErrors['novaClinica.nome'] = 'O nome da clínica é obrigatório';
      }
      
      if (!formData.novaClinica.cnpj.trim()) {
        newErrors['novaClinica.cnpj'] = 'O CNPJ é obrigatório';
      } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.novaClinica.cnpj)) {
        newErrors['novaClinica.cnpj'] = 'Formato de CNPJ inválido. Use o formato: 99.999.999/9999-99';
      }
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
    
    if (name.startsWith('novaClinica.')) {
      const field = name.split('.')[1];
      
      if (field === 'cnpj') {
        const formattedValue = value
          .replace(/\D/g, '')
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .substring(0, 18);
        
        setFormData({
          ...formData,
          novaClinica: {
            ...formData.novaClinica,
            cnpj: formattedValue
          }
        });
        return;
      }
      
      setFormData({
        ...formData,
        novaClinica: {
          ...formData.novaClinica,
          [field]: value
        }
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
      
      // Limita o tamanho máximo do CRO
      if (formattedValue.length > 26) { // CRO-XX-XXXXXXXXXX = 26 caracteres
        formattedValue = formattedValue.substring(0, 26);
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
      return;
    }
    
    if (name === 'telefone') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Primeiro verifica se o CRO e email já existem em outros dentistas
      const [croResponse, emailResponse] = await Promise.all([
        axios.get(`http://localhost:8080/dentistas/cro/${formData.cro}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8080/dentistas/email/${formData.email}`).catch(() => ({ data: null }))
      ]);

      // Verifica se o CRO pertence a outro dentista
      if (croResponse.data && croResponse.data.id !== parseInt(id)) {
        setErrors({ cro: "CRO já cadastrado" });
        setSaving(false);
        return;
      }

      // Verifica se o email pertence a outro dentista
      if (emailResponse.data && emailResponse.data.id !== parseInt(id)) {
        setErrors({ email: "E-mail já cadastrado" });
        setSaving(false);
        return;
      }

      // Se chegou aqui, o CRO e email são únicos
      // Agora verifica a clínica se houver nova
      let novaClinica = null;
      
      if (showNovaClinica) {
        try {
          // Verifica se o CNPJ já existe
          const cnpjResponse = await axios.get(`http://localhost:8080/clinicas/cnpj/${formData.novaClinica.cnpj}`).catch(() => ({ data: null }));
          
          if (cnpjResponse.data) {
            setErrors({ 'novaClinica.cnpj': 'CNPJ já cadastrado' });
            setSaving(false);
            return;
          }
          
          // Se o CNPJ não existe, tenta cadastrar a clínica
          const clinicaResponse = await axios.post('http://localhost:8080/clinicas', formData.novaClinica);
          novaClinica = clinicaResponse.data;
        } catch (error) {
          if (error.response?.data === "CNPJ já cadastrado") {
            setErrors({
              ...errors,
              'novaClinica.cnpj': 'CNPJ já cadastrado'
            });
          } else {
            setErrors({ 'novaClinica.cnpj': 'CNPJ já cadastrado' });
          }
          setSaving(false);
          return;
        }
      }

      // Se chegou aqui, tanto o dentista quanto a clínica estão ok
      // Agora tenta atualizar o dentista
      const dentistaData = {
        nome: formData.nome,
        cro: formData.cro,
        telefone: formData.telefone,
        email: formData.email,
        clinicas: novaClinica 
          ? [...formData.clinicasAssociadas, novaClinica]
          : formData.clinicasAssociadas,
        isActive: formData.isActive
      };

      await axios.put(`http://localhost:8080/dentistas/${id}`, dentistaData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dentista', { state: { refresh: true } });
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar dentista:', error);
      
      if (error.response) {
        const errorMessage = error.response.data;
        console.log('Mensagem de erro:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          setErrors({ general: errorMessage });
        } else if (errorMessage.message) {
          setErrors({ general: errorMessage.message });
        } else {
          setErrors({ general: 'Ocorreu um erro ao atualizar o dentista. Tente novamente.' });
        }
      } else {
        setErrors({ general: 'Erro de conexão. Verifique sua internet e tente novamente.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/dentista');
  };

  if (loading) {
    return <div className="loading">Carregando dados do dentista...</div>;
  }

  return (
    <div className="dentista-page">
      <div className="editar-dentista-page">
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="page-title">Editar Dentista</h1>
        </div>
        
        {success && (
          <div className="success-message">
            Dentista atualizado com sucesso!
          </div>
        )}
        
        {errors.general && (
          <div className="error-message">
            <p>{errors.general}</p>
          </div>
        )}
        
        {Object.keys(errors).length > 0 && !errors.general && (
          <div className="error-message">
            {Object.entries(errors).map(([key, value]) => (
              <p key={key}>{value}</p>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="dentista-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'input-error' : ''}
              placeholder="Digite o nome completo"
              required
            />
            {errors.nome && <span className="error-text">{errors.nome}</span>}
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
              placeholder="XX-XXX-XXXXX"
              required
            />
            {errors.cro && <span className="error-text">{errors.cro}</span>}
            <span className="info-text">Formato: CRO-UF-NÚMERO</span>
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
              placeholder="exemplo@email.com"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
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
              required
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
                  disabled={showNovaClinica}
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
                  onClick={() => setShowNovaClinica(!showNovaClinica)}
                >
                  {showNovaClinica ? '←' : '+'}
                </button>
              </div>
            </div>
            {errors.clinicaId && <span className="error-text">{errors.clinicaId}</span>}
          </div>

          {showNovaClinica && (
            <>
              <div className="form-group">
                <label htmlFor="novaClinica.nome">Nome da Clínica</label>
                <input
                  type="text"
                  id="novaClinica.nome"
                  name="novaClinica.nome"
                  value={formData.novaClinica.nome}
                  onChange={handleChange}
                  className={errors['novaClinica.nome'] ? 'input-error' : ''}
                  placeholder="Digite o nome da clínica"
                  required
                />
                {errors['novaClinica.nome'] && <span className="error-text">{errors['novaClinica.nome']}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="novaClinica.cnpj">CNPJ</label>
                <input
                  type="text"
                  id="novaClinica.cnpj"
                  name="novaClinica.cnpj"
                  value={formData.novaClinica.cnpj}
                  onChange={handleChange}
                  className={errors['novaClinica.cnpj'] ? 'input-error' : ''}
                  placeholder="XX.XXX.XXX/YYYY-ZZ"
                  required
                />
                {errors['novaClinica.cnpj'] && <span className="error-text">{errors['novaClinica.cnpj']}</span>}
              </div>
            </>
          )}
          
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

export default EditarDentista; 