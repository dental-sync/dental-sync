import React from 'react';
import './EditarPedido.css';
import { useParams, useNavigate } from 'react-router-dom';
import PedidoForm from '../../components/PedidoForm/PedidoForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditarPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleSubmitSuccess = () => {
    toast.success('Pedido atualizado com sucesso!');
  };

  const handleVoltar = () => {
    navigate('/pedidos');
  };

  return (
    <div className="pedido-page">
    <div className="editar-pedido-page">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
        <div className="back-navigation">
          <button onClick={handleVoltar} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        <h1 className="page-title">Editar Pedido #{id}</h1>
          <button type="button" className="btn-microfone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
      </div>
      
      <PedidoForm pedidoId={id} onSubmitSuccess={handleSubmitSuccess} />
      </div>
    </div>
  );
};

export default EditarPedido; 