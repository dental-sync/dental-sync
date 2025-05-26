import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import RegisterForm from '../../components/RegisterForm';
import './styles.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegister = (formData) => {
    console.log('Registro:', formData);
    // Implementar lógica de registro aqui
    // Após registro bem-sucedido, redirecionar para login
    // navigate('/login');
  };

  return (
    <div className="register-page">
      <header className="register-header">
        <Logo size="small" withText={true} />
      </header>
      <main className="register-main">
        <RegisterForm onSubmit={handleRegister} />
      </main>
      <footer className="register-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default RegisterPage; 