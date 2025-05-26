import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import ForgotPasswordForm from '../../components/ForgotPasswordForm';
import './ForgotPassword.css';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleForgot = (email) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Se existir uma conta com este e-mail, você receberá as instruções em instantes.');
    }, 1200);
  };

  return (
    <div className="forgot-page">
      <header className="forgot-header">
        <Logo size="small" withText={true} />
      </header>
      <main className="forgot-main">
        <ForgotPasswordForm onSubmit={handleForgot} loading={loading} message={message} />
      </main>
      <footer className="forgot-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage; 