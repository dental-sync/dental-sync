import React, { useState } from 'react';
import Logo from '../components/Logo';
import PlanCard from '../components/PlanCard';
import './Planos.css';

const planoPremium = {
  title: 'Premium',
  description: 'Plano completo para laboratórios de todos os tamanhos',
  price: '300,00',
  benefits: [
    'Pedidos ilimitados',
    'Usuários ilimitados',
    'Suporte prioritário 24/7',
    'Relatórios avançados e personalizados',
    'Integração com dentistas',
    'Acesso a todas as funcionalidades',
  ],
};

const PlanosPage = () => {
  const [selected, setSelected] = useState(true);

  return (
    <div className="planos-page">
      <header className="planos-header">
        <Logo size="small" withText={true} />
      </header>
      <main className="planos-main">
        <h1 className="planos-title">Escolha seu plano</h1>
        <p className="planos-subtitle">Selecione o plano que melhor atende às necessidades do seu laboratório</p>
        <div className="planos-card-container">
          <PlanCard {...planoPremium} selected={selected} onSelect={() => setSelected(true)} />
        </div>
        <button className="planos-continue-btn" disabled={!selected}>
          Continuar com o plano selecionado
        </button>
      </main>
      <footer className="planos-footer">
        <p>© {new Date().getFullYear()} DentalSync - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default PlanosPage; 