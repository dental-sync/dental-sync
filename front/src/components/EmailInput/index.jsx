import React from 'react';
import './styles.css';

const EmailInput = ({ id, name, value, onChange, placeholder, className, required, ...props }) => {
  return (
    <div className="email-input-container">
      <div className="input-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <input
        type="email"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`email-input ${className || ''}`}
        autoComplete="email"
        required={required}
        {...props}
      />
    </div>
  );
};

export default EmailInput; 