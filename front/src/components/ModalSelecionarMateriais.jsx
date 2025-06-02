import React, { useEffect, useState } from 'react';
import api from '../axios-config';
import './ModalSelecionarMateriais.css';

const ModalSelecionarMateriais = ({ isOpen, onClose, onConfirm, materiaisSelecionados = [] }) => {
  const [materiais, setMateriais] = useState([]);
  const [selecionados, setSelecionados] = useState(materiaisSelecionados);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchMateriais = async () => {
        try {
          const response = await api.get('/material');
          setMateriais(response.data);
        } catch (error) {
          console.error('Erro ao carregar materiais:', error);
        }
      };
      
      fetchMateriais();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelecionados(materiaisSelecionados);
  }, [materiaisSelecionados, isOpen]);

  const handleToggle = (id) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const materiaisSelecionadosObj = materiais.filter(m => selecionados.includes(m.id));
    onConfirm(materiaisSelecionadosObj);
  };

  const materiaisFiltrados = materiais.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal-materiais-overlay">
      <div className="modal-materiais">
        <h2>Selecionar Materiais</h2>
        <input
          type="text"
          placeholder="Buscar material..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="input-busca-material"
        />
        <div className="lista-materiais">
          {loading ? (
            <div className="loading-materiais">Carregando materiais...</div>
          ) : materiaisFiltrados.length === 0 ? (
            <div className="empty-materiais">Nenhum material encontrado</div>
          ) : (
            materiaisFiltrados.map(m => (
              <label key={m.id} className="item-material">
                <input
                  type="checkbox"
                  checked={selecionados.includes(m.id)}
                  onChange={() => handleToggle(m.id)}
                  disabled={m.quantidade === 0 || m.quantidadeEstoque === 0}
                />
                <span>{m.nome}</span>
                {(m.quantidade === 0 || m.quantidadeEstoque === 0) && (
                  <span style={{ color: '#b0b0b0', fontSize: '13px', marginLeft: 8 }}>(Sem estoque)</span>
                )}
              </label>
            ))
          )}
        </div>
        <div className="modal-materiais-actions">
          <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-confirmar" onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalSelecionarMateriais; 