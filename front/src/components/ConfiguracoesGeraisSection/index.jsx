import React, { useState } from 'react';
import './styles.css';

const ConfiguracoesGeraisSection = () => {
  const [selectedTheme, setSelectedTheme] = useState('claro');

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    // Aqui seria a lógica para aplicar o tema selecionado
    console.log(`Tema alterado para: ${theme}`);
  };

  const handleSave = () => {
    // Aqui seria a lógica para salvar todas as configurações
    console.log('Configurações salvas');
  };

  const handleCancel = () => {
    // Aqui seria a lógica para cancelar as alterações
    console.log('Alterações canceladas');
  };

  return (
    <div className="configuracoes-gerais-section">
      <h2>Configurações Gerais</h2>
      <p className="section-description">Personalize as configurações gerais do sistema</p>
      
      <h3 className="subsection-title">Aparência</h3>
      <p className="subsection-description">Personalize a aparência do sistema de acordo com suas preferências.</p>
      
      <div className="theme-options">
        <div 
          className={`theme-option ${selectedTheme === 'claro' ? 'selected' : ''}`}
          onClick={() => handleThemeChange('claro')}
        >
          <div className="theme-header">
            <span className="theme-name">Claro</span>
            {selectedTheme === 'claro' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          <div className="theme-preview light-theme">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
        </div>
        
        <div 
          className={`theme-option ${selectedTheme === 'escuro' ? 'selected' : ''}`}
          onClick={() => handleThemeChange('escuro')}
        >
          <div className="theme-header">
            <span className="theme-name">Escuro</span>
            {selectedTheme === 'escuro' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          <div className="theme-preview dark-theme">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
        </div>
        
        <div 
          className={`theme-option ${selectedTheme === 'sistema' ? 'selected' : ''}`}
          onClick={() => handleThemeChange('sistema')}
        >
          <div className="theme-header">
            <span className="theme-name">Sistema</span>
            {selectedTheme === 'sistema' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          <div className="theme-preview system-theme">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="form-actions-container">
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesGeraisSection; 