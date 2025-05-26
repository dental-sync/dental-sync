import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import ResetPasswordForm from '../../components/ResetPasswordForm';
import './ResetPassword.css';

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = ({ password, confirmPassword }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Senha redefinida com sucesso!');
      // navigate('/login'); // Descomente para redirecionar após redefinir
    }, 1200);
  };

  return (
    <div className="reset-page">
      <header className="reset-header">
        <Logo size="small" withText={true} />
      </header>
      <main className="reset-main">
        <ResetPasswordForm onSubmit={handleReset} loading={loading} message={message} />
      </main>
      <footer className="reset-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default ResetPasswordPage; 