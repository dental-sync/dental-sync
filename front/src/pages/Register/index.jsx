import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import TwoStepRegister from '../../components/TwoStepRegister/TwoStepRegister';
import './styles.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="register-page">
      <header className="register-header">
        <Logo size="small" withText={true} />
      </header>
      <main className="register-main">
        <TwoStepRegister />
      </main>
      <footer className="register-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default RegisterPage; 