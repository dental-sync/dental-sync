import React, { useState } from 'react';
import './styles.css';

const SuporteSection = () => {
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqItems = [
    {
      id: 'adicionar-pedido',
      question: 'Como adicionar um novo pedido?',
      answer: 'Para adicionar um novo pedido, acesse o menu "Pedidos" no painel lateral e clique no botão "Novo Pedido". Preencha os dados do paciente, dentista e detalhes do trabalho solicitado. Não se esqueça de definir a data de entrega e salvar as informações.'
    },
    {
      id: 'alterar-status',
      question: 'Como alterar o status de um pedido?',
      answer: 'Para alterar o status de um pedido, vá até a página "Pedidos" ou "Kanban", localize o pedido desejado e clique na opção "Alterar Status". Você pode movê-lo entre as categorias: Em Análise, Em Produção, Finalizado ou Entregue, conforme o andamento do trabalho.'
    },
    {
      id: 'cadastrar-dentista',
      question: 'Como cadastrar um novo dentista?',
      answer: 'Para cadastrar um novo dentista, acesse o menu "Dentistas" no painel lateral e clique em "Novo Dentista". Preencha todas as informações do profissional, como nome, CRO, contato e a clínica associada. Em seguida, clique em "Salvar" para concluir o cadastro.'
    },
    {
      id: 'gerar-relatorios',
      question: 'Como gerar relatórios?',
      answer: 'Para gerar relatórios, vá até a seção "Relatórios" no menu lateral. Selecione o tipo de relatório desejado (produção, financeiro, dentistas, etc.), defina o período de análise e os filtros adicionais. Clique em "Gerar Relatório" e você poderá visualizar, baixar ou imprimir o resultado.'
    },
    {
      id: 'alterar-senha',
      question: 'Como alterar minha senha?',
      answer: 'Para alterar sua senha, acesse a seção "Configurações", clique na aba "Segurança" e utilize o formulário "Alterar Senha". Você precisará informar sua senha atual e digitar a nova senha duas vezes para confirmação. Clique em "Alterar Senha" para finalizar.'
    }
  ];

  return (
    <div className="suporte-section">
      <div className="section-header">
        <h2>Suporte</h2>
        <p className="section-description">Obtenha ajuda e suporte para o sistema</p>
      </div>
      
      <div className="support-options">
        <div className="support-card">
          <div className="support-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <h3>Email</h3>
          <p className="support-card-description">Envie um email para nossa equipe de suporte</p>
          <button className="btn-primary">Enviar Email</button>
        </div>
        
        <div className="support-card">
          <div className="support-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <h3>Telefone</h3>
          <p className="support-card-description">Ligue para nossa central de atendimento</p>
          <button className="btn-primary">Ver Número</button>
        </div>
      </div>
      
      <h3 className="faq-title">Perguntas Frequentes</h3>
      
      <div className="faq-container">
        {faqItems.map((item) => (
          <div key={item.id} className="faq-item">
            <div 
              className={`faq-question ${openQuestions[item.id] ? 'active' : ''}`}
              onClick={() => toggleQuestion(item.id)}
            >
              <span>{item.question}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="chevron-icon"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {openQuestions[item.id] && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <h3 className="doc-title">Documentação</h3>
      
      <div className="doc-container">
        <div className="doc-card">
          <div className="doc-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="doc-content">
            <h4>Manual do Usuário</h4>
            <p>Guia completo de uso do sistema</p>
            <a href="#" className="doc-link">Baixar PDF</a>
          </div>
        </div>
        
        <div className="doc-card">
          <div className="doc-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div className="doc-content">
            <h4>Notas de Atualização</h4>
            <p>Veja as novidades e melhorias do sistema</p>
            <a href="#" className="doc-link">Ver Histórico</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuporteSection; 