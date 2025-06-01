import React from 'react';
import Logo from '../Logo';
import './styles.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <Logo size="small" withText={true} />
      </header>
      <div className="auth-layout-content">
        {children}
      </div>
      <div className="auth-layout-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </div>
    </div>
  );
};

export default AuthLayout; 