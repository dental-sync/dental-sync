import React, { useState, useRef } from 'react';
import './CadastroPedido.css';
import PedidoForm from '../../components/PedidoForm/PedidoForm';
import STTModal from '../../components/STTModal/STTModal';
import useToast from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const CadastroPedido = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [showSTTModal, setShowSTTModal] = useState(false);
  const pedidoFormRef = useRef(null);
  
  const handleSubmitSuccess = () => {
    toast.success('Pedido cadastrado com sucesso!');
  };

  const handleVoltar = () => {
    navigate('/pedidos');
  };

  const handleMicrophoneClick = () => {
    setShowSTTModal(true);
  };

  const handleSTTModalClose = () => {
    setShowSTTModal(false);
  };

  const handleProcessedData = (data) => {
    if (pedidoFormRef.current && pedidoFormRef.current.preencherDadosSTT) {
      pedidoFormRef.current.preencherDadosSTT(data);
    }
  };

  return (
    <div className="pedido-page">
    <div className="cadastro-pedido-page">
      
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        <h1 className="page-title">Cadastro de Pedido</h1>
          <button type="button" className="btn-microfone" onClick={handleMicrophoneClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
      </div>
      
      <PedidoForm 
        onSubmitSuccess={handleSubmitSuccess} 
        ref={pedidoFormRef}
      />
      
      <STTModal 
        isOpen={showSTTModal}
        onClose={handleSTTModalClose}
        onProcessedData={handleProcessedData}
      />
      </div>
    </div>
  );
};

export default CadastroPedido; 