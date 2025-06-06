import React from 'react';
import AuthLayout from '../../components/AuthLayout';
import ForgotPasswordForm from '../../components/ForgotPasswordForm';
import './ForgotPassword.css';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage; 