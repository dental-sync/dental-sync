import React, { useState, useEffect } from 'react';
import './styles.css';
import api from '../../axios-config';
import { useAuth } from '../../contexts/AuthContext';
import useToast from '../../hooks/useToast';

const InformacaoSection = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    nomeLaboratorio: '',
    cnpj: '',
    emailLaboratorio: '',
    telefoneLaboratorio: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [laboratorioId, setLaboratorioId] = useState(null);
  const [enderecoId, setEnderecoId] = useState(null);

  useEffect(() => {
    const fetchLaboratorioData = async () => {
      try {
        setLoading(true);
        // Buscar dados do laboratório do usuário logado
        const response = await api.get('/laboratorios/me');
        
        if (response.data) {
          const laboratorio = response.data;
          const endereco = laboratorio.endereco || {};
          
          setLaboratorioId(laboratorio.id);
          setEnderecoId(endereco.id || null); // Guardar ID do endereço para atualização
          
          setFormData({
            nomeLaboratorio: laboratorio.nomeLaboratorio || '',
            cnpj: laboratorio.cnpj || '',
            emailLaboratorio: laboratorio.emailLaboratorio || '',
            telefoneLaboratorio: laboratorio.telefoneLaboratorio || '',
            cep: endereco.cep || '',
            logradouro: endereco.logradouro || '',
            numero: endereco.numero || '',
            bairro: endereco.bairro || '',
            cidade: endereco.cidade || '',
            estado: endereco.estado || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do laboratório:', error);
        
        // Mostrar detalhes do erro
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
        }
        
        // Deixar campos vazios para permitir cadastro
        setFormData({
          nomeLaboratorio: '',
          cnpj: '',
          emailLaboratorio: '',
          telefoneLaboratorio: '',
          cep: '',
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLaboratorioData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      // Formatação do CNPJ
      const digits = value.replace(/\D/g, '');
      let formattedValue = digits;
      
      if (digits.length > 2) {
        formattedValue = `${digits.substring(0, 2)}.${digits.substring(2)}`;
      }
      if (digits.length > 5) {
        formattedValue = `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5)}`;
      }
      if (digits.length > 8) {
        formattedValue = `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8)}`;
      }
      if (digits.length > 12) {
        formattedValue = `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8, 12)}-${digits.substring(12, 14)}`;
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    if (name === 'telefoneLaboratorio') {
      // Formatação do telefone
      const digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      if (digits.length > 0) {
        formattedValue = `(${digits.substring(0, 2)}`;
        if (digits.length > 2) {
          formattedValue += `) ${digits.substring(2)}`;
          if (digits.length > 7) {
            const mainNumber = digits.substring(2);
            const isCelular = mainNumber.length >= 9;
            const splitPoint = isCelular ? 5 : 4;
            formattedValue = `(${digits.substring(0, 2)}) ${mainNumber.substring(0, splitPoint)}-${mainNumber.substring(splitPoint, splitPoint + 4)}`;
          }
        }
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    if (name === 'cep') {
      // Formatação do CEP
      const digits = value.replace(/\D/g, '');
      let formattedValue = digits;
      
      if (digits.length > 5) {
        formattedValue = `${digits.substring(0, 5)}-${digits.substring(5, 8)}`;
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.warning('Apenas administradores podem editar as informações do laboratório.');
      return;
    }
    
    setSaving(true);
    
    try {
      // Preparar dados para envio
      const enderecoData = {
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado
      };
      
      // Se é atualização e há ID do endereço, inclui no payload
      if (enderecoId) {
        enderecoData.id = enderecoId;
      }
      
      const dataToSend = {
        nomeLaboratorio: formData.nomeLaboratorio,
        cnpj: formData.cnpj,
        emailLaboratorio: formData.emailLaboratorio,
        telefoneLaboratorio: formData.telefoneLaboratorio,
        endereco: enderecoData
      };
      
      if (laboratorioId) {
        await api.put(`/laboratorios/${laboratorioId}`, dataToSend);
      } else {
        await api.post('/laboratorios', dataToSend);
      }
      
      toast.success('Informações do laboratório atualizadas com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar as informações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando informações do laboratório...</div>;
  }

  return (
    <div className="informacao-section">
      <h2>Informações do Laboratório</h2>
      <p className="section-description">
        {isAdmin 
          ? 'Gerencie as informações básicas do seu laboratório' 
          : 'Visualize as informações básicas do laboratório'
        }
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nomeLaboratorio">Nome do Laboratório</label>
            <input 
              type="text" 
              id="nomeLaboratorio" 
              name="nomeLaboratorio" 
              value={formData.nomeLaboratorio} 
              onChange={handleChange} 
              placeholder="Digite o nome do laboratório"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cnpj">CNPJ</label>
            <input 
              type="text" 
              id="cnpj" 
              name="cnpj" 
              value={formData.cnpj} 
              onChange={handleChange} 
              placeholder="12.345.678/0001-90"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="emailLaboratorio">Email</label>
            <input 
              type="email" 
              id="emailLaboratorio" 
              name="emailLaboratorio" 
              value={formData.emailLaboratorio} 
              onChange={handleChange} 
              placeholder="contato@laboratorio.com"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefoneLaboratorio">Telefone</label>
            <input 
              type="text" 
              id="telefoneLaboratorio" 
              name="telefoneLaboratorio" 
              value={formData.telefoneLaboratorio} 
              onChange={handleChange} 
              placeholder="(11) 98765-4321"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cep">CEP</label>
            <input 
              type="text" 
              id="cep" 
              name="cep" 
              value={formData.cep} 
              onChange={handleChange} 
              placeholder="01310-100"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="logradouro">Endereço</label>
            <input 
              type="text" 
              id="logradouro" 
              name="logradouro" 
              value={formData.logradouro} 
              onChange={handleChange} 
              placeholder="Av. Paulista"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numero">Número</label>
            <input 
              type="text" 
              id="numero" 
              name="numero" 
              value={formData.numero} 
              onChange={handleChange} 
              placeholder="1000"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bairro">Bairro</label>
            <input 
              type="text" 
              id="bairro" 
              name="bairro" 
              value={formData.bairro} 
              onChange={handleChange} 
              placeholder="Bela Vista"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cidade">Cidade</label>
            <input 
              type="text" 
              id="cidade" 
              name="cidade" 
              value={formData.cidade} 
              onChange={handleChange} 
              placeholder="São Paulo"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <input 
              type="text" 
              id="estado" 
              name="estado" 
              value={formData.estado} 
              onChange={handleChange} 
              placeholder="SP"
              disabled={!isAdmin}
              className={!isAdmin ? 'input-disabled' : ''}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="info-form-actions">
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default InformacaoSection; 