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
    cro: 'CRO-',
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
      
      // Registrar laboratório primeiro
      const labResponse = await api.post('/laboratorios', labPayload);
      const laboratorioId = labResponse.data.id;

      // Montar payload do protético associado ao laboratório
      const proteticoPayload = {
        ...userData,
        isAdmin: true, // sempre admin no primeiro cadastro
        laboratorio: {
          id: laboratorioId
        }
      };
      await api.post('/proteticos', proteticoPayload);

      toast.success('Registro concluído com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro no registro:', error);
      
      let errorMessage = 'Erro ao completar o registro'; // mensagem padrão
      
      if (error.response) {
        // Erro da API - tentar extrair a mensagem específica
        if (error.response.data) {
          // Se a resposta tem uma propriedade message
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
          // Se a resposta é uma string diretamente
          else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
          // Se há erro específico em outras propriedades
          else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
          // Tratamento específico para erros de validação
          else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.join(', ');
          }
        }
      } else if (error.request) {
        // Erro de rede - sem resposta do servidor
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        // Outros tipos de erro
        errorMessage = 'Erro inesperado. Tente novamente.';
      }
      
      toast.error(errorMessage);
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