import React from 'react';
import Logo from '../Logo';
import TwoFactorForm from '../TwoFactorForm';
import './styles.css';

const TwoFactorCard = ({ email, onSubmit, onBack }) => {
  return (
    <div className="twofactor-card">
      <div className="twofactor-card-header">
        <Logo size="medium" />
        <h1 className="twofactor-title">Verificação em Duas Etapas</h1>
        <p className="twofactor-subtitle">
          Digite o código de 6 dígitos gerado pelo Google Authenticator
        </p>
        <p className="twofactor-email">Logado como: <strong>{email}</strong></p>
      </div>
      
      <TwoFactorForm onSubmit={onSubmit} onBack={onBack} email={email} />
    </div>
  );
};

export default TwoFactorCard; 