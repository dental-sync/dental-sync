import React from 'react';
import './PedidoTable.css';
import GenericTable from '../GenericTable/GenericTable';
import ActionMenu from '../ActionMenu/ActionMenu';
import StatusBadge from '../StatusBadge/StatusBadge';
import ServicosTooltip from '../ServicosTooltip/ServicosTooltip';
import { formatNome, limitText } from '../../utils/textUtils';

const formatPedidoId = (id) => `PD${String(id).padStart(4, '0')}`;

const PedidoTable = ({ pedidos, onDelete, sortConfig, onSort, onStatusChange }) => {
  // Move columns definition inside component to access onStatusChange prop
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'paciente', label: 'Paciente', sortable: true, render: (paciente) => formatNome(paciente?.nome || 'N/A') },
  { key: 'dentista', label: 'Dentista', sortable: true, render: (dentista) => formatNome(dentista?.nome || 'N/A') },
  { key: 'protetico', label: 'Protético', sortable: true, render: (protetico) => formatNome(protetico?.nome || 'N/A') },
  { key: 'servicos', label: 'Serviços', render: (servicos, item) => {
    if (!servicos || servicos.length === 0) return 'N/A';
    
    // Filtrar serviços únicos (remover duplicatas se existirem) - igual ao PedidoForm
    const servicosUnicos = [];
    const servicosVistos = new Set();
    
    servicos.forEach(servico => {
      if (!servicosVistos.has(servico.id)) {
        servicosVistos.add(servico.id);
        servicosUnicos.push(servico);
      }
    });
    
    // Formatar serviços únicos com suas quantidades corretas da API
    const servicosFormatados = servicosUnicos.map(servico => {
      // Buscar quantidade correta da API (sem somar, apenas usar o valor)
      const quantidade = item.quantidadesServicos?.find(qs => qs.servico.id === servico.id)?.quantidade || 1;
      const nomeServico = limitText(servico.nome, 30);
      return quantidade > 1 ? `${nomeServico} x ${quantidade}` : nomeServico;
    });
    
    // Se há apenas um serviço, mostrar diretamente sem tooltip
    if (servicosFormatados.length === 1) {
      return servicosFormatados[0];
    }
    
    // Se há mais de um serviço, mostrar apenas o primeiro + tooltip
    const primeiroServico = servicosFormatados[0];
    const restantes = servicosFormatados.length - 1;
    const textoExibido = `${primeiroServico} +${restantes} mais`;
    
    return (
      <ServicosTooltip servicos={servicosFormatados}>
        {textoExibido}
      </ServicosTooltip>
    );
  } },
  { key: 'periodo', label: 'Período', render: (periodo) => {
    const formatDate = (date, label) => {
      if (!date) return 'N/A';
      const safeDate = typeof date === 'string' ? date.replace(/(\.\d{3})\d+/, '$1') : date;
      const d = new Date(safeDate);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('pt-BR');
    };
      
      const dataInicio = formatDate(periodo?.createdAt, 'createdAt');
      const dataFim = formatDate(periodo?.dataEntrega, 'dataEntrega');
      
    return (
        <div className="periodo-container">
          <span className="periodo-texto">{dataInicio} - {dataFim}</span>
      </div>
    );
  } },
  { key: 'valorTotal', label: 'Valor', render: (valor) => valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00' },
    { key: 'status', label: 'Status', render: (status, item) => <StatusBadge status={status} tipo="pedido" pedidoId={item.id} onClick={onStatusChange} /> },
  { key: 'actions', label: 'Ações' }
];

  // Adaptar os dados para o formato esperado pelo GenericTable
  const data = pedidos.map(p => ({
    ...p,
    periodo: { createdAt: p.createdAt, dataEntrega: p.dataEntrega },
    actions: '', // campo fake só para render customizado
  }));

  return (
    <GenericTable
      data={data}
      columns={columns}
      formatId={formatPedidoId}
      sortConfig={sortConfig}
      onSort={onSort}
      ActionMenuComponent={ActionMenu}
      onItemDeleted={onDelete}
      emptyMessage="Nenhum pedido cadastrado"
      apiEndpoint="/pedidos"
      url="pedidos"
      alwaysAllowDelete={true}
      hideOptions={['historico']}
      deleteMessage="Tem certeza que deseja excluir este pedido? Esta ação não poderá ser desfeita e todos os dados relacionados serão perdidos."
    />
  );
};

export default PedidoTable; 