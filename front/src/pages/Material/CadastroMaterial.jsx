import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../axios-config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CadastroMaterial.css';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import ModalCadastroCategoriaMaterial from '../../components/Modals/ModalCadastroCategoriaMaterial';
import Dropdown from '../../components/Dropdown/Dropdown';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal/DeleteConfirmationModal';

const CadastroMaterial = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  // Função para obter a classe CSS do status
  const getStatusClass = (status) => {
    switch (status) {
      case 'EM_ESTOQUE':
        return 'em-estoque';
      case 'BAIXO_ESTOQUE':
        return 'baixo-estoque';
      case 'SEM_ESTOQUE':
        return 'sem-estoque';
      default:
        return 'em-estoque';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'EM_ESTOQUE':
        return 'Em Estoque';
      case 'BAIXO_ESTOQUE':
        return 'Baixo Estoque';
      case 'SEM_ESTOQUE':
        return 'Sem Estoque';
      default:
        return 'Em Estoque';
    }
  };
  const [material, setMaterial] = useState({
    nome: '',
    categoriaMaterial: null,
    quantidade: '',
    unidadeMedida: '',
    valorUnitario: '',
    estoqueMinimo: '',
    status: '',
    isActive: true
  });

  const unidadesMedida = [
    { id: 'Uni.', nome: 'Unidade' },
    { id: 'Quilograma', nome: 'Quilograma' },
    { id: 'Grama', nome: 'Grama' },
    { id: 'Mililitro', nome: 'Mililitro' },
    { id: 'Litro', nome: 'Litro' },
    { id: 'Metro', nome: 'Metro' },
    { id: 'Centímetro', nome: 'Centímetro' }
  ];

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categoria-material');
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias');
      }
    };

    const fetchMaterial = async () => {
    if (id) {
        try {
          setLoading(true);
          const response = await api.get(`/material/${id}`);
          const material = response.data;
          
          setMaterial({
            nome: material.nome || '',
            quantidade: material.quantidade ? material.quantidade.toString().replace('.', ',') : '',
            unidadeMedida: material.unidadeMedida || '',
            valorUnitario: material.valorUnitario ? material.valorUnitario.toString().replace('.', ',') : '',
            categoriaMaterial: material.categoriaMaterial || null,
            estoqueMinimo: material.estoqueMinimo ? material.estoqueMinimo.toString().replace('.', ',') : '',
            status: material.status || '',
            isActive: material.isActive || true
          });
        } catch (error) {
          console.error('Erro ao buscar material:', error);
          toast.error('Erro ao carregar dados do material');
          navigate('/material');
        } finally {
          setLoading(false);
        }
        }
      };

    fetchCategorias();
      fetchMaterial();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'valorUnitario' || name === 'quantidade' || name === 'estoqueMinimo') {
      // Permitir apenas números e uma vírgula decimal (padrão brasileiro)
      const sanitizedValue = value.replace(/[^\d,]/g, '');
      const parts = sanitizedValue.split(',');
      const formattedValue = parts.length > 2 
        ? `${parts[0]},${parts.slice(1).join('')}`
        : sanitizedValue;

      setMaterial(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setMaterial(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoriaChange = (selectedCategoria) => {
    setMaterial(prev => ({
      ...prev,
      categoriaMaterial: selectedCategoria
    }));
    
    if (errors.categoriaMaterial) {
      setErrors(prev => ({
        ...prev,
        categoriaMaterial: ''
      }));
    }
  };

  const handleUnidadeMedidaChange = (selectedUnidade) => {
    setMaterial(prev => ({
      ...prev,
      unidadeMedida: selectedUnidade ? selectedUnidade.id : ''
    }));
    
    if (errors.unidadeMedida) {
      setErrors(prev => ({
        ...prev,
        unidadeMedida: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar campos obrigatórios
    if (!material.nome) newErrors.nome = 'Nome é obrigatório';
    if (!material.categoriaMaterial) newErrors.categoriaMaterial = 'Categoria é obrigatória';
    if (!material.quantidade) newErrors.quantidade = 'Quantidade é obrigatória';
    if (!material.unidadeMedida) newErrors.unidadeMedida = 'Unidade de medida é obrigatória';
    if (!material.valorUnitario) newErrors.valorUnitario = 'Valor unitário é obrigatório';
    if (!material.estoqueMinimo) newErrors.estoqueMinimo = 'Estoque mínimo é obrigatório';

    // Validar tamanho do nome
    if (material.nome && material.nome.length > 100) {
      newErrors.nome = 'O nome não pode ter mais de 100 caracteres';
    }

    // Validar valores numéricos (converter vírgula para ponto antes da validação)
    if (material.quantidade && parseFloat(material.quantidade.replace(',', '.')) < 0) {
      newErrors.quantidade = 'A quantidade não pode ser negativa';
    }
    if (material.valorUnitario && parseFloat(material.valorUnitario.replace(',', '.')) < 0) {
      newErrors.valorUnitario = 'O valor unitário não pode ser negativo';
    }
    if (material.estoqueMinimo && parseFloat(material.estoqueMinimo.replace(',', '.')) < 0) {
      newErrors.estoqueMinimo = 'O estoque mínimo não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const materialData = {
        nome: material.nome,
        quantidade: parseFloat(material.quantidade.replace(',', '.')),
        unidadeMedida: material.unidadeMedida,
        valorUnitario: parseFloat(material.valorUnitario.replace(',', '.')),
        estoqueMinimo: parseFloat(material.estoqueMinimo.replace(',', '.')),
        categoriaMaterial: { id: material.categoriaMaterial?.id },
        isActive: material.isActive
      };

      // Adicionar o ID para edição (evitar criar novo registro)
      if (id) {
        materialData.id = parseInt(id);
      }

      if (id) {
        await api.put(`/material/${id}`, materialData);
        toast.success('Material atualizado com sucesso!');
      } else {
        await api.post('/material', materialData);
        toast.success('Material cadastrado com sucesso!');
      }

      navigate('/material');
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      const errorMessage = error.response?.data?.message || 
        `Erro ao ${id ? 'atualizar' : 'cadastrar'} material`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/material');
  };

  const handleCategoriaSuccess = (categoriaData, action) => {
    if (action === 'edit') {
      // Atualizar categoria existente na lista
      setCategorias(prev => prev.map(cat => 
        cat.id === categoriaData.id ? categoriaData : cat
      ));
      // Se a categoria editada é a selecionada, atualizar também
      if (material.categoriaMaterial && material.categoriaMaterial.id === categoriaData.id) {
        setMaterial(prev => ({
          ...prev,
          categoriaMaterial: categoriaData
        }));
      }
      toast.success('Categoria editada com sucesso!');
    } else {
      // Adicionar nova categoria
      setCategorias(prev => [...prev, categoriaData]);
      setMaterial(prev => ({
        ...prev,
        categoriaMaterial: categoriaData
      }));
      toast.success('Categoria cadastrada com sucesso!');
    }
    setShowModalCategoria(false);
    setCategoriaToEdit(null);
  };

  const handleEditCategoria = (categoria) => {
    setCategoriaToEdit(categoria);
    setShowModalCategoria(true);
  };

  const handleDeleteCategoria = (categoria) => {
    setCategoriaToDelete(categoria);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategoria = async () => {
    try {
      await api.delete(`/categoria-material/${categoriaToDelete.id}`);
      
      // Remover categoria da lista
      setCategorias(prev => prev.filter(cat => cat.id !== categoriaToDelete.id));
      
      // Se a categoria deletada era a selecionada, limpar seleção
      if (material.categoriaMaterial && material.categoriaMaterial.id === categoriaToDelete.id) {
        setMaterial(prev => ({
          ...prev,
          categoriaMaterial: null
        }));
      }
      
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Não é possível excluir esta categoria pois há materiais vinculados a ela.');
    } finally {
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    }
  };

  const cancelDeleteCategoria = () => {
    setShowDeleteModal(false);
    setCategoriaToDelete(null);
  };

  return (
    <div className="cadastro-material-page">
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
      <div className="page-top">
        <div className="notification-container">
          <NotificationBell count={2} />
        </div>
      </div>

      <div className="back-navigation">
        <button className="back-button" onClick={handleVoltar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="page-title">{id ? 'Editar Material' : 'Novo Material'}</h1>
      </div>

      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}
      
      <form onSubmit={handleSubmit} className="material-form">
        {id && (
          <div className="status-display">
            <span className="status-label">Status:</span>
            <span className={`status-badge ${getStatusClass(material.status)}`}>
              {getStatusText(material.status)}
            </span>
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nome" className="required">Nome do Material</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={material.nome}
              onChange={handleInputChange}
              className={errors.nome ? 'input-error' : ''}
              placeholder="Nome do material"
            />
            {errors.nome && <span className="error-text">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="categoriaMaterial" className="required">Categoria</label>
            <Dropdown
              items={categorias}
              value={material.categoriaMaterial}
              onChange={handleCategoriaChange}
              placeholder="Selecione a categoria"
              displayProperty="nome"
              valueProperty="id"
              searchable={false}
              showCheckbox={false}
              showAddButton={true}
              addButtonTitle="Adicionar nova categoria"
              onAddClick={() => setShowModalCategoria(true)}
              showActionButtons={true}
              onEditClick={handleEditCategoria}
              onDeleteClick={handleDeleteCategoria}
              className={errors.categoriaMaterial ? 'input-error' : ''}
            />
            {errors.categoriaMaterial && <span className="error-text">{errors.categoriaMaterial}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unidadeMedida" className="required">Unidade de Medida</label>
            <Dropdown
              items={unidadesMedida}
              value={unidadesMedida.find(u => u.id === material.unidadeMedida) || null}
              onChange={handleUnidadeMedidaChange}
              placeholder="Selecione a unidade"
              displayProperty="nome"
              valueProperty="id"
              searchable={false}
              showCheckbox={false}
              className={errors.unidadeMedida ? 'input-error' : ''}
            />
            {errors.unidadeMedida && <span className="error-text">{errors.unidadeMedida}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="quantidade" className="required">Quantidade</label>
            <input
              type="text"
              id="quantidade"
              name="quantidade"
              value={material.quantidade}
              onChange={handleInputChange}
              className={errors.quantidade ? 'input-error' : ''}
              placeholder="0,00"
            />
            {errors.quantidade && <span className="error-text">{errors.quantidade}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estoqueMinimo" className="required">Estoque Mínimo</label>
            <input
              type="text"
              id="estoqueMinimo"
              name="estoqueMinimo"
              value={material.estoqueMinimo}
              onChange={handleInputChange}
              className={errors.estoqueMinimo ? 'input-error' : ''}
              placeholder="0"
            />
            {errors.estoqueMinimo && <span className="error-text">{errors.estoqueMinimo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="valorUnitario" className="required">Preço (R$)</label>
            <input
              type="text"
              id="valorUnitario"
              name="valorUnitario"
              value={material.valorUnitario}
              onChange={handleInputChange}
              className={errors.valorUnitario ? 'input-error' : ''}
              placeholder="0,00"
            />
            {errors.valorUnitario && <span className="error-text">{errors.valorUnitario}</span>}
          </div>
        </div>


        <div className="form-actions">
          <button type="button" onClick={handleVoltar} className="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" className="btn-cadastrar" disabled={loading}>
            {loading ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Cadastrar')}
          </button>
        </div>
      </form>

      <ModalCadastroCategoriaMaterial
        isOpen={showModalCategoria}
        onClose={() => {
          setShowModalCategoria(false);
          setCategoriaToEdit(null);
        }}
        onSuccess={handleCategoriaSuccess}
        categoriaToEdit={categoriaToEdit}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteCategoria}
        onConfirm={confirmDeleteCategoria}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${categoriaToDelete?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default CadastroMaterial; 