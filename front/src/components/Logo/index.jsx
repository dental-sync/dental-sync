import React from 'react';
import logoImg from '../../assets/images/logo.png';
import './styles.css';

const Logo = ({ size = 'medium', withText = false }) => {
  return (
    <div className={`logo-container ${size}`}>
      <img src={logoImg} alt="DentalSync Logo" className="logo-image" />
      {withText && <span className="logo-text">DENTAL SYNC</span>}
    </div>
  );
};

export default Logo; 