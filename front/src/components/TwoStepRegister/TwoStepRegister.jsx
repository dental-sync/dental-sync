import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios-config';
import { toast } from 'react-toastify';
import UserForm from './UserForm';
import LabForm from './LabForm';
import './TwoStepRegister.css';

const TwoStepRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');
  const [userData, setUserData] = useState({
    nome: '',
    cro: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  const [labData, setLabData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  // Avança para o próximo passo
  const handleNextStep = async (formData) => {
    setUserData(formData);
    setSlideDirection('slide-left');
    setTimeout(() => {
      setStep(2);
      setSlideDirection('');
    }, 300);
  };

  // Volta para o passo anterior e salva os dados do laboratório
  const handlePrevStep = (labFormData) => {
    setLabData(labFormData);
    setSlideDirection('slide-right');
    setTimeout(() => {
      setStep(1);
      setSlideDirection('');
    }, 300);
  };

  // Atualiza labData em tempo real
  const handleLabFormChange = useCallback((newLabData) => {
    setLabData(newLabData);
  }, []);

  // Finaliza o registro
  const handleFinish = async (formData) => {
    setLabData(formData);
    setLoading(true);

    try {
      // Montar payload do laboratório
      const labPayload = {
        nomeLaboratorio: formData.nome,
        cnpj: formData.cnpj,
        emailLaboratorio: formData.email,
        telefoneLaboratorio: formData.telefone,
        endereco: {
          cep: formData.cep,
          logradouro: formData.endereco,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado
        }
      };
      // Registrar laboratório
      await api.post('/laboratorios', labPayload);

      // Montar payload do protético
      const proteticoPayload = {
        ...userData,
        isAdmin: true // sempre admin no primeiro cadastro
      };
      await api.post('/proteticos', proteticoPayload);

      toast.success('Registro concluído com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error(error.response?.data?.message || 'Erro ao completar o registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-step-register">
      <div className="register-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-text">Dados do Usuário</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-text">Dados do Laboratório</div>
        </div>
      </div>

      <div className={`form-container ${slideDirection}`}>
        {step === 1 && (
          <UserForm 
            initialData={userData} 
            onSubmit={handleNextStep} 
          />
        )}
        
        {step === 2 && (
          <LabForm 
            initialData={labData} 
            onSubmit={handleFinish} 
            onBack={() => handlePrevStep(labData)}
            onChange={handleLabFormChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default TwoStepRegister; 