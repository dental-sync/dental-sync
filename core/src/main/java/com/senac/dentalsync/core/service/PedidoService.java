package com.senac.dentalsync.core.service;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.PedidoServico;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoServicoRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoMaterialRepository;
import com.senac.dentalsync.core.dto.HistoricoProteticoDTO;
import com.senac.dentalsync.core.dto.PedidoDTO;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.dto.HistoricoPacienteDTO;
import com.senac.dentalsync.core.dto.HistoricoDentistaDTO;

@Service
public class PedidoService extends BaseService<Pedido, Long> {

    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private PedidoServicoRepository pedidoServicoRepository;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private MaterialService materialService;
    
    @Autowired
    private ServicoService servicoService;
    
    @Autowired
    private PacienteService pacienteService;
    
    @Autowired
    private DentistaService dentistaService;
    
    @Autowired
    private ProteticoService proteticoService;
    
    @Autowired
    private ServicoMaterialRepository servicoMaterialRepository;

    @Override
    protected BaseRepository<Pedido, Long> getRepository() {
        return pedidoRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        // Simplificando para um usuário mock
        // Em um ambiente real, isso seria obtido do contexto de segurança
        return null;
    }

    @Override
    @Transactional
    public Pedido save(Pedido pedido) {
        System.out.println("=== SALVANDO PEDIDO ===");
        System.out.println("Pedido ID: " + pedido.getId());
        System.out.println("Status: " + pedido.getStatus());
        
        // Se for um novo pedido, garantir que o status seja PENDENTE
        if (pedido.getId() == null && pedido.getStatus() == null) {
            pedido.setStatus(Pedido.Status.PENDENTE);
        }
        
        // Se for um novo pedido, descontar estoque dos materiais dos serviços
        if (pedido.getId() == null) {
            System.out.println("Novo pedido detectado, processando desconto de estoque...");
            descontarEstoqueMateriais(pedido);
        } else {
            System.out.println("Pedido existente, não descontando estoque.");
        }
        
        return super.save(pedido);
    }
    
    private void descontarEstoqueMateriais(Pedido pedido) {
        System.out.println("=== DESCONTANDO ESTOQUE DE MATERIAIS ===");
        
        if (pedido.getServicos() == null || pedido.getServicos().isEmpty()) {
            System.out.println("AVISO: Pedido não possui serviços!");
            return;
        }
        
        System.out.println("Quantidade de serviços no pedido: " + pedido.getServicos().size());
        
        for (Servico servico : pedido.getServicos()) {
            System.out.println("Processando serviço: " + servico.getNome() + " (ID: " + servico.getId() + ")");
            
            // Buscar a quantidade deste serviço na tabela pedido_servico
            List<PedidoServico> pedidosServicos = pedidoServicoRepository.findByPedidoId(pedido.getId());
            BigDecimal quantidadeServico = BigDecimal.ONE; // padrão 1
            
            for (PedidoServico ps : pedidosServicos) {
                if (ps.getServico().getId().equals(servico.getId())) {
                    quantidadeServico = ps.getQuantidade();
                    break;
                }
            }
            
            System.out.println("Quantidade do serviço no pedido: " + quantidadeServico);
            
            // Busca explicitamente os materiais do serviço no banco para evitar problemas de lazy loading
            List<ServicoMaterial> materiais = servicoMaterialRepository.findByServicoId(servico.getId());
            
            if (materiais == null || materiais.isEmpty()) {
                System.out.println("AVISO: Serviço " + servico.getNome() + " não possui materiais!");
                continue;
            }
            
            System.out.println("Quantidade de materiais no serviço: " + materiais.size());
            
            for (ServicoMaterial servicoMaterial : materiais) {
                Material material = servicoMaterial.getMaterial();
                BigDecimal quantidadePorServico = servicoMaterial.getQuantidade();
                // Multiplicar pela quantidade de vezes que o serviço foi solicitado
                BigDecimal quantidadeNecessaria = quantidadePorServico.multiply(quantidadeServico);
                
                System.out.println("Processando material: " + material.getNome() + " (ID: " + material.getId() + ")");
                System.out.println("Quantidade por serviço: " + quantidadePorServico);
                System.out.println("Quantidade total necessária: " + quantidadeNecessaria);
                
                if (quantidadeNecessaria != null && quantidadeNecessaria.compareTo(BigDecimal.ZERO) > 0) {
                    // Busca o material atualizado do banco
                    Material materialAtualizado = materialService.getRepository()
                        .findById(material.getId())
                        .orElseThrow(() -> new RuntimeException("Material não encontrado: " + material.getNome()));
                    
                    System.out.println("Estoque atual do material " + materialAtualizado.getNome() + ": " + materialAtualizado.getQuantidade());
                    
                    // Verifica se há estoque suficiente
                    if (materialAtualizado.getQuantidade().compareTo(quantidadeNecessaria) < 0) {
                        String erro = "Estoque insuficiente para o material: " + 
                            materialAtualizado.getNome() + " (Disponível: " + 
                            materialAtualizado.getQuantidade() + ", Necessário: " + quantidadeNecessaria + ")";
                        System.out.println("ERRO: " + erro);
                        throw new RuntimeException(erro);
                    }
                    
                    // Desconta a quantidade do estoque
                    BigDecimal novoEstoque = materialAtualizado.getQuantidade().subtract(quantidadeNecessaria);
                    materialAtualizado.setQuantidade(novoEstoque);
                    materialService.save(materialAtualizado);
                    
                    System.out.println("Estoque atualizado do material " + materialAtualizado.getNome() + ": " + novoEstoque);
                } else {
                    System.out.println("AVISO: Quantidade necessária é zero ou nula para o material: " + material.getNome());
                }
            }
        }
        
        System.out.println("=== FIM DO DESCONTO DE ESTOQUE ===");
    }
    
    public List<Pedido> findByDentista(Dentista dentista) {
        return pedidoRepository.findByDentista(dentista);
    }
    
    public List<Pedido> findByCliente(Paciente cliente) {
        return pedidoRepository.findByCliente(cliente);
    }
    
    public List<Pedido> findByProtetico(Protetico protetico) {
        return pedidoRepository.findByProtetico(protetico);
    }
    
    public List<Pedido> findByDataEntrega(LocalDate dataEntrega) {
        return pedidoRepository.findByDataEntrega(dataEntrega);
    }
    
    public List<Pedido> findByPrioridade(Pedido.Prioridade prioridade) {
        return pedidoRepository.findByPrioridade(prioridade);
    }

    public List<HistoricoProteticoDTO> buscarHistoricoPorProtetico(Long proteticoId) {
        Protetico protetico = new Protetico();
        protetico.setId(proteticoId);
        List<Pedido> pedidos = pedidoRepository.findByProtetico(protetico);
        List<HistoricoProteticoDTO> historico = new ArrayList<>();
        for (Pedido pedido : pedidos) {
            HistoricoProteticoDTO dto = new HistoricoProteticoDTO();
            // Pega o primeiro serviço (ou adapte conforme sua regra)
            if (pedido.getServicos() != null && !pedido.getServicos().isEmpty()) {
                Servico servico = pedido.getServicos().get(0);
                dto.setNomeServico(servico.getNome());
            } else {
                dto.setNomeServico("Serviço não informado");
            }
            dto.setNomePaciente(pedido.getCliente().getNome());
            dto.setNomeDentista(pedido.getDentista().getNome());
            dto.setDataEntrega(pedido.getDataEntrega());
            // Soma dos valores dos serviços
            BigDecimal valorTotal = pedido.getServicos().stream()
                .map(servico -> servico.getValorTotal() != null ? servico.getValorTotal() : servico.getPreco())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setValorTotal(valorTotal);
            historico.add(dto);
        }
        return historico;
    }

    public List<HistoricoPacienteDTO> buscarHistoricoPorPaciente(Long pacienteId) {
        Paciente paciente = new Paciente();
        paciente.setId(pacienteId);
        List<Pedido> pedidos = pedidoRepository.findByCliente(paciente);
        List<HistoricoPacienteDTO> historico = new ArrayList<>();
        for (Pedido pedido : pedidos) {
            HistoricoPacienteDTO dto = new HistoricoPacienteDTO();
            if (pedido.getServicos() != null && !pedido.getServicos().isEmpty()) {
                dto.setNomeServico(pedido.getServicos().get(0).getNome());
            } else {
                dto.setNomeServico("Serviço não informado");
            }
            dto.setNomeDentista(pedido.getDentista().getNome());
            dto.setDataEntrega(pedido.getDataEntrega());
            BigDecimal valorTotal = pedido.getServicos().stream()
                .map(servico -> servico.getValorTotal() != null ? servico.getValorTotal() : servico.getPreco())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setValorTotal(valorTotal);
            historico.add(dto);
        }
        return historico;
    }

    public List<HistoricoDentistaDTO> buscarHistoricoPorDentista(Long dentistaId) {
        Dentista dentista = new Dentista();
        dentista.setId(dentistaId);
        List<Pedido> pedidos = pedidoRepository.findByDentista(dentista);
        List<HistoricoDentistaDTO> historico = new ArrayList<>();
        for (Pedido pedido : pedidos) {
            HistoricoDentistaDTO dto = new HistoricoDentistaDTO();
            if (pedido.getServicos() != null && !pedido.getServicos().isEmpty()) {
                dto.setNomeServico(pedido.getServicos().get(0).getNome());
            } else {
                dto.setNomeServico("Serviço não informado");
            }
            dto.setNomePaciente(pedido.getCliente().getNome());
            dto.setDataEntrega(pedido.getDataEntrega());
            BigDecimal valorTotal = pedido.getServicos().stream()
                .map(servico -> servico.getValorTotal() != null ? servico.getValorTotal() : servico.getPreco())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setValorTotal(valorTotal);
            historico.add(dto);
        }
        return historico;
    }
    
    public List<PedidoServico> getQuantidadesServicos(Long pedidoId) {
        return pedidoServicoRepository.findByPedidoId(pedidoId);
    }
} 