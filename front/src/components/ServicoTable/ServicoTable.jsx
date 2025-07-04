import React from 'react';
import GenericTable from '../GenericTable/GenericTable';
import ActionMenu from '../ActionMenu/ActionMenu';
import { formatNome, formatCategoria, formatDescricao } from '../../utils/textUtils';

// Função utilitária para formatar o ID
const formatServicoId = (id) => `S${String(id).padStart(4, '0')}`;

// Função para formatar valores monetários
const formatCurrency = (value) => {
  if (value == null || value === undefined) return 'R$ 0,00';
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
};

// Função para formatar o tempo previsto em horas e minutos
const formatTempoPrevisto = (minutos) => {
  if (!minutos) return '-';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
};

// Função para formatar os dados do serviço
const formatServicoData = (servico) => ({
  ...servico,
  valorTotal: formatCurrency(servico.valorTotal), // Apenas valor total
  tempoPrevisto: formatTempoPrevisto(servico.tempoPrevisto),
  categoriaServico: servico.categoriaServico?.nome || '-'
});

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true, render: (nome) => formatNome(nome, 30) },
  { key: 'categoriaServico', label: 'Categoria', sortable: true, render: (categoria) => formatCategoria(categoria) },
  { key: 'valorTotal', label: 'Valor', sortable: true },
  { key: 'tempoPrevisto', label: 'Tempo Previsto', sortable: true },
  { key: 'descricao', label: 'Descrição', sortable: false, render: (descricao) => formatDescricao(descricao) },
  { key: 'actions', label: 'Ações' }
];

const ServicoTable = ({ servicos, onServicoDeleted, onStatusChange, sortConfig, onSort, isEmpty }) => {
  // Formatar os dados antes de passá-los para o GenericTable
  const formattedServicos = servicos.map(formatServicoData);

  return (
    <GenericTable
      data={formattedServicos}
      onItemDeleted={onServicoDeleted}
      onStatusChange={onStatusChange}
      sortConfig={sortConfig}
      onSort={onSort}
      isEmpty={isEmpty}
      columns={columns}
      formatId={formatServicoId}
      apiEndpoint="/servico"
      emptyMessage="Nenhum serviço cadastrado"
      ActionMenuComponent={(props) => (
        <ActionMenu
          {...props}
          deleteMessage="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
        />
      )}
      url="servico"
      hideOptions={['historico']}
      alwaysAllowDelete={true}
    />
  );
}

export default ServicoTable; 