import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import ConfigNavigation from './components/ConfigNavigation/ConfigNavigation';
import InformacaoSection from './components/InformacaoSection/InformacaoSection';
import SegurancaSection from './components/SegurancaSection/SegurancaSection';
import './ConfiguracaoPage.css';

const ConfiguracaoPage = () => {
  const [activeSection, setActiveSection] = useState('informacao');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'informacao':
        return <InformacaoSection />;
      case 'seguranca':
        return <SegurancaSection />;
      case 'configuracoes-gerais':
        return <div>Configurações Gerais</div>;
      case 'suporte':
        return <div>Seção de Suporte</div>;
      default:
        return <InformacaoSection />;
    }
  };

  return (
    <div className="configuracao-page">
      <PageHeader title="Configurações" />
      
      <div className="configuracao-content">
        <ConfigNavigation activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="section-content">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoPage; 