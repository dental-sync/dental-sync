import React, { useState } from 'react';
import './styles.css';

import ConfigContainer from '../../components/ConfigContainer';
import ConfigNavigation from '../../components/ConfigNavigation';
import InformacaoSection from '../../components/InformacaoSection';
import SegurancaSection from '../../components/SegurancaSection';
import ConfiguracoesGeraisSection from '../../components/ConfiguracoesGeraisSection';
import SuporteSection from '../../components/SuporteSection';

const Configuracao = () => {
  const [activeTab, setActiveTab] = useState('informacao');

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'informacao':
        return <InformacaoSection />;
      case 'seguranca':
        return <SegurancaSection />;
      case 'configuracoesGerais':
        return <ConfiguracoesGeraisSection />;
      case 'suporte':
        return <SuporteSection />;
      default:
        return <InformacaoSection />;
    }
  };

  return (
    <ConfigContainer title="Configurações">
      <ConfigNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderActiveSection()}
    </ConfigContainer>
  );
};

export default Configuracao; 