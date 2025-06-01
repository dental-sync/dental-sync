import React from 'react';
import Logo from '../Logo';
import LoginForm from '../LoginForm';
import './styles.css';

const LoginCard = ({ onSubmit }) => {
  return (
    <div className="login-card">
      <div className="login-card-header">
        <Logo size="medium" />
        <h1 className="login-title">DentalSync</h1>
        <p className="login-subtitle">Entre com seu e-mail e senha para acessar o sistema</p>
      </div>
      
      <LoginForm onSubmit={onSubmit} />
    </div>
  );
};

export default LoginCard; 