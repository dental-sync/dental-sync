import React from 'react';
import './EditarPedido.css';
import { useParams } from 'react-router-dom';
import PedidoForm from '../../components/PedidoForm/PedidoForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditarPedido = () => {
  const { id } = useParams();
  
  const handleSubmitSuccess = () => {
    toast.success('Pedido atualizado com sucesso!');
  };

  return (
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
      
      <div className="page-header">
        <h1 className="page-title">Editar Pedido #{id}</h1>
      </div>
      
      <PedidoForm pedidoId={id} onSubmitSuccess={handleSubmitSuccess} />
    </div>
  );
};

export default EditarPedido; 