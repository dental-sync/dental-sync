import React from 'react';
import './CadastroPedido.css';
import PedidoForm from '../../components/PedidoForm/PedidoForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CadastroPedido = () => {
  const handleSubmitSuccess = () => {
    toast.success('Pedido cadastrado com sucesso!');
  };

  return (
    <div className="cadastro-pedido-page">
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
      
      <div className="page-header">
        <h1 className="page-title">Cadastro de Pedido</h1>
      </div>
      
      <PedidoForm onSubmitSuccess={handleSubmitSuccess} />
    </div>
  );
};

export default CadastroPedido; 