package com.senac.dentalsync.core.service;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.PedidoServico;
import com.senac.dentalsync.core.persistency.model.Protetico;
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
    protected Protetico getUsuarioLogado() {
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
        
        // Validar data de entrega
        validarDataEntrega(pedido.getDataEntrega());
        
        // Se for um novo pedido, garantir que o status seja PENDENTE
        if (pedido.getId() == null && pedido.getStatus() == null) {
            pedido.setStatus(Pedido.Status.PENDENTE);
        }
        
        return super.save(pedido);
    }
    
    /**
     * Método específico para descontar estoque em pedidos novos
     * Deve ser chamado APÓS salvar o pedido e os PedidoServico
     */
    public void descontarEstoqueNovoPedido(Long pedidoId, List<PedidoDTO.ServicoComQuantidadeDTO> servicosComQuantidade) {
        System.out.println("=== DESCONTANDO ESTOQUE PARA NOVO PEDIDO ===");
        
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        if (servicosComQuantidade == null || servicosComQuantidade.isEmpty()) {
            System.out.println("AVISO: Pedido não possui serviços com quantidades!");
            return;
        }
        
        System.out.println("Quantidade de serviços no pedido: " + servicosComQuantidade.size());
        
        for (PedidoDTO.ServicoComQuantidadeDTO servicoDTO : servicosComQuantidade) {
            // Buscar o serviço
            Servico servico = servicoService.findById(servicoDTO.getId())
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
            
            // Validar quantidade
            if (servicoDTO.getQuantidade() == null || servicoDTO.getQuantidade() <= 0) {
                System.out.println("ERRO: Quantidade inválida para serviço: " + servico.getNome());
                throw new RuntimeException("Quantidade do serviço deve ser maior que zero: " + servico.getNome());
            }
            
            BigDecimal quantidade = new BigDecimal(servicoDTO.getQuantidade());
            descontarMaterialServico(servico, quantidade);
        }
        
        System.out.println("=== FIM DO DESCONTO DE ESTOQUE PARA NOVO PEDIDO ===");
    }
    
    /**
     * Método alternativo para descontar estoque buscando do banco (com validações robustas)
     * Para compatibilidade com código legado
     */
    public void descontarEstoqueNovoPedido(Long pedidoId) {
        System.out.println("=== DESCONTANDO ESTOQUE PARA NOVO PEDIDO (BUSCA DO BANCO) ===");
        
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        List<PedidoServico> pedidosServicos = pedidoServicoRepository.findByPedidoId(pedidoId);
        
        if (pedidosServicos == null || pedidosServicos.isEmpty()) {
            System.out.println("AVISO: Pedido não possui serviços com quantidades!");
            return;
        }
        
        System.out.println("Quantidade de PedidoServico encontrados: " + pedidosServicos.size());
        
        for (PedidoServico pedidoServico : pedidosServicos) {
            // Validação robusta antes de processar
            if (pedidoServico.getServico() == null) {
                System.out.println("ERRO: PedidoServico sem serviço associado, ID: " + pedidoServico.getId());
                continue; // Pula este item em vez de falhar
            }
            
            if (pedidoServico.getQuantidade() == null) {
                System.out.println("ERRO: PedidoServico com quantidade nula para serviço: " + pedidoServico.getServico().getNome());
                System.out.println("Definindo quantidade padrão como 1 para continuar processamento");
                pedidoServico.setQuantidade(BigDecimal.ONE);
                pedidoServicoRepository.save(pedidoServico); // Salva a correção
            }
            
            if (pedidoServico.getQuantidade().compareTo(BigDecimal.ZERO) <= 0) {
                System.out.println("ERRO: PedidoServico com quantidade inválida para serviço: " + pedidoServico.getServico().getNome());
                throw new RuntimeException("Quantidade do serviço deve ser maior que zero: " + pedidoServico.getServico().getNome());
            }
            
            descontarMaterialServico(pedidoServico.getServico(), pedidoServico.getQuantidade());
        }
        
        System.out.println("=== FIM DO DESCONTO DE ESTOQUE PARA NOVO PEDIDO (BUSCA DO BANCO) ===");
    }
    
    /**
     * Método específico para ajustar estoque em pedidos editados
     * Deve ser chamado ANTES de atualizar os PedidoServico
     */
    public void ajustarEstoquePedidoEditado(Long pedidoId, List<PedidoDTO.ServicoComQuantidadeDTO> novosServicos) {
        System.out.println("=== AJUSTANDO ESTOQUE PARA PEDIDO EDITADO ===");
        
        // Buscar quantidades antigas
        List<PedidoServico> servicosAntigos = pedidoServicoRepository.findByPedidoId(pedidoId);
        Map<Long, BigDecimal> quantidadesAntigas = new HashMap<>();
        
        for (PedidoServico ps : servicosAntigos) {
            if (ps.getServico() != null) {
                // Validar e corrigir quantidade nula
                BigDecimal quantidade = ps.getQuantidade();
                if (quantidade == null) {
                    System.out.println("AVISO: Quantidade antiga nula para serviço: " + ps.getServico().getNome() + ", usando ZERO");
                    quantidade = BigDecimal.ZERO;
                    // Corrigir no banco
                    ps.setQuantidade(BigDecimal.ONE);
                    pedidoServicoRepository.save(ps);
                }
                quantidadesAntigas.put(ps.getServico().getId(), quantidade);
            }
        }
        
        // Criar mapa das novas quantidades
        Map<Long, BigDecimal> quantidadesNovas = new HashMap<>();
        for (PedidoDTO.ServicoComQuantidadeDTO servicoDTO : novosServicos) {
            // Validar nova quantidade
            if (servicoDTO.getQuantidade() == null || servicoDTO.getQuantidade() <= 0) {
                throw new RuntimeException("Quantidade do serviço deve ser maior que zero");
            }
            quantidadesNovas.put(servicoDTO.getId(), new BigDecimal(servicoDTO.getQuantidade()));
        }
        
        // Calcular diferenças e ajustar estoque
        for (Map.Entry<Long, BigDecimal> entry : quantidadesNovas.entrySet()) {
            Long servicoId = entry.getKey();
            BigDecimal quantidadeNova = entry.getValue();
            BigDecimal quantidadeAntiga = quantidadesAntigas.getOrDefault(servicoId, BigDecimal.ZERO);
            
            // Garantir que ambos os valores não são nulos
            if (quantidadeNova == null) {
                System.out.println("ERRO: Quantidade nova é nula para serviço ID: " + servicoId);
                continue;
            }
            if (quantidadeAntiga == null) {
                System.out.println("AVISO: Quantidade antiga é nula para serviço ID: " + servicoId + ", usando ZERO");
                quantidadeAntiga = BigDecimal.ZERO;
            }
            
            BigDecimal diferenca = quantidadeNova.subtract(quantidadeAntiga);
            
            System.out.println("Serviço ID: " + servicoId);
            System.out.println("Quantidade antiga: " + quantidadeAntiga);
            System.out.println("Quantidade nova: " + quantidadeNova);
            System.out.println("Diferença: " + diferenca);
            
            if (diferenca.compareTo(BigDecimal.ZERO) > 0) {
                // Quantidade aumentou, descontar a diferença
                Servico servico = servicoService.findById(servicoId)
                    .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
                descontarMaterialServico(servico, diferenca);
            } else if (diferenca.compareTo(BigDecimal.ZERO) < 0) {
                // Quantidade diminuiu, devolver a diferença ao estoque
                Servico servico = servicoService.findById(servicoId)
                    .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
                devolverMaterialServico(servico, diferenca.abs());
            }
            // Se diferença = 0, não faz nada
        }
        
        // Verificar serviços que foram removidos completamente
        for (Map.Entry<Long, BigDecimal> entry : quantidadesAntigas.entrySet()) {
            Long servicoId = entry.getKey();
            if (!quantidadesNovas.containsKey(servicoId)) {
                // Serviço foi removido, devolver todo o material ao estoque
                BigDecimal quantidadeAntiga = entry.getValue();
                if (quantidadeAntiga != null && quantidadeAntiga.compareTo(BigDecimal.ZERO) > 0) {
                    Servico servico = servicoService.findById(servicoId)
                        .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
                    devolverMaterialServico(servico, quantidadeAntiga);
                    System.out.println("Serviço removido ID: " + servicoId + ", devolvendo quantidade: " + quantidadeAntiga);
                } else {
                    System.out.println("Serviço removido ID: " + servicoId + ", mas quantidade antiga era nula ou zero");
                }
            }
        }
        
        System.out.println("=== FIM DO AJUSTE DE ESTOQUE PARA PEDIDO EDITADO ===");
    }
    
    /**
     * Desconta materiais de um serviço específico
     */
    private void descontarMaterialServico(Servico servico, BigDecimal quantidadeServico) {
        System.out.println("Processando desconto para serviço: " + servico.getNome() + " (ID: " + servico.getId() + ")");
        System.out.println("Quantidade do serviço: " + quantidadeServico);
        
        // Validar se a quantidade do serviço não é nula
        if (quantidadeServico == null) {
            System.out.println("ERRO: Quantidade do serviço é nula para: " + servico.getNome());
            throw new RuntimeException("Quantidade do serviço não pode ser nula: " + servico.getNome());
        }
        
        // Validar se a quantidade é positiva
        if (quantidadeServico.compareTo(BigDecimal.ZERO) <= 0) {
            System.out.println("ERRO: Quantidade do serviço deve ser positiva para: " + servico.getNome());
            throw new RuntimeException("Quantidade do serviço deve ser maior que zero: " + servico.getNome());
        }
        
        // Busca explicitamente os materiais do serviço no banco
        List<ServicoMaterial> materiais = servicoMaterialRepository.findByServicoId(servico.getId());
        
        if (materiais == null || materiais.isEmpty()) {
            System.out.println("AVISO: Serviço " + servico.getNome() + " não possui materiais!");
            return;
        }
        
        System.out.println("Quantidade de materiais no serviço: " + materiais.size());
        
        for (ServicoMaterial servicoMaterial : materiais) {
            Material material = servicoMaterial.getMaterial();
            BigDecimal quantidadePorServico = servicoMaterial.getQuantidade();
            
            // Validar se a quantidade por serviço não é nula
            if (quantidadePorServico == null) {
                System.out.println("AVISO: Quantidade por serviço é nula para material: " + material.getNome());
                quantidadePorServico = BigDecimal.ZERO;
            }
            
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
    
    /**
     * Devolve materiais de um serviço específico ao estoque
     */
    private void devolverMaterialServico(Servico servico, BigDecimal quantidadeServico) {
        System.out.println("Processando devolução para serviço: " + servico.getNome() + " (ID: " + servico.getId() + ")");
        System.out.println("Quantidade do serviço a devolver: " + quantidadeServico);
        
        // Validar se a quantidade do serviço não é nula
        if (quantidadeServico == null) {
            System.out.println("ERRO: Quantidade do serviço é nula para devolução: " + servico.getNome());
            throw new RuntimeException("Quantidade do serviço não pode ser nula para devolução: " + servico.getNome());
        }
        
        // Validar se a quantidade é positiva
        if (quantidadeServico.compareTo(BigDecimal.ZERO) <= 0) {
            System.out.println("ERRO: Quantidade do serviço deve ser positiva para devolução: " + servico.getNome());
            throw new RuntimeException("Quantidade do serviço deve ser maior que zero para devolução: " + servico.getNome());
        }
        
        // Busca explicitamente os materiais do serviço no banco
        List<ServicoMaterial> materiais = servicoMaterialRepository.findByServicoId(servico.getId());
        
        if (materiais == null || materiais.isEmpty()) {
            System.out.println("AVISO: Serviço " + servico.getNome() + " não possui materiais!");
            return;
        }
        
        for (ServicoMaterial servicoMaterial : materiais) {
            Material material = servicoMaterial.getMaterial();
            BigDecimal quantidadePorServico = servicoMaterial.getQuantidade();
            
            // Validar se a quantidade por serviço não é nula
            if (quantidadePorServico == null) {
                System.out.println("AVISO: Quantidade por serviço é nula para material: " + material.getNome());
                quantidadePorServico = BigDecimal.ZERO;
            }
            
            BigDecimal quantidadeParaDevolver = quantidadePorServico.multiply(quantidadeServico);
            
            System.out.println("Devolvendo material: " + material.getNome() + " (ID: " + material.getId() + ")");
            System.out.println("Quantidade por serviço: " + quantidadePorServico);
            System.out.println("Quantidade total para devolver: " + quantidadeParaDevolver);
            
            if (quantidadeParaDevolver != null && quantidadeParaDevolver.compareTo(BigDecimal.ZERO) > 0) {
                // Busca o material atualizado do banco
                Material materialAtualizado = materialService.getRepository()
                    .findById(material.getId())
                    .orElseThrow(() -> new RuntimeException("Material não encontrado: " + material.getNome()));
                
                System.out.println("Estoque atual do material " + materialAtualizado.getNome() + ": " + materialAtualizado.getQuantidade());
                
                // Adiciona a quantidade ao estoque
                BigDecimal novoEstoque = materialAtualizado.getQuantidade().add(quantidadeParaDevolver);
                materialAtualizado.setQuantidade(novoEstoque);
                materialService.save(materialAtualizado);
                
                System.out.println("Estoque atualizado do material " + materialAtualizado.getNome() + ": " + novoEstoque);
            }
        }
    }
    
    /**
     * Valida se a data de entrega está dentro do período permitido (até 1 ano atrás ou data futura)
     * @param dataEntrega A data de entrega a ser validada
     * @throws RuntimeException se a data for inválida
     */
    private void validarDataEntrega(LocalDate dataEntrega) {
        if (dataEntrega == null) {
            throw new RuntimeException("A data de entrega é obrigatória");
        }
        
        LocalDate hoje = LocalDate.now();
        LocalDate umAnoAtras = hoje.minusYears(1);
        
        if (dataEntrega.isBefore(umAnoAtras)) {
            throw new RuntimeException("A data de entrega não pode ser anterior a " + 
                umAnoAtras.toString() + " (1 ano atrás)");
        }
        
        System.out.println("Data de entrega validada: " + dataEntrega);
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

    /**
     * Método utilitário para limpar dados inconsistentes na tabela pedido_servico
     * Remove registros com quantidade nula ou zero
     */
    public void limparDadosInconsistentes() {
        System.out.println("=== LIMPANDO DADOS INCONSISTENTES ===");
        
        List<PedidoServico> todosPedidosServicos = pedidoServicoRepository.findAll();
        int removidos = 0;
        int corrigidos = 0;
        int registrosInvalidos = 0;
        
        System.out.println("Total de registros PedidoServico encontrados: " + todosPedidosServicos.size());
        
        for (PedidoServico ps : todosPedidosServicos) {
            try {
                // Verificar se serviço está presente
                if (ps.getServico() == null) {
                    System.out.println("REMOVENDO: PedidoServico sem serviço - ID: " + ps.getId());
                    pedidoServicoRepository.delete(ps);
                    removidos++;
                    continue;
                }
                
                // Verificar quantidade
                if (ps.getQuantidade() == null) {
                    System.out.println("CORRIGINDO: PedidoServico com quantidade nula - ID: " + ps.getId() + 
                        ", Serviço: " + ps.getServico().getNome() + ", Pedido: " + 
                        (ps.getPedido() != null ? ps.getPedido().getId() : "NULL"));
                    ps.setQuantidade(BigDecimal.ONE);
                    pedidoServicoRepository.save(ps);
                    corrigidos++;
                } else if (ps.getQuantidade().compareTo(BigDecimal.ZERO) <= 0) {
                    System.out.println("CORRIGINDO: PedidoServico com quantidade inválida - ID: " + ps.getId() + 
                        ", Quantidade: " + ps.getQuantidade() + 
                        ", Serviço: " + ps.getServico().getNome());
                    ps.setQuantidade(BigDecimal.ONE);
                    pedidoServicoRepository.save(ps);
                    corrigidos++;
                }
                
                // Verificar se pedido está presente
                if (ps.getPedido() == null) {
                    System.out.println("REMOVENDO: PedidoServico sem pedido - ID: " + ps.getId() + 
                        ", Serviço: " + ps.getServico().getNome());
                    pedidoServicoRepository.delete(ps);
                    removidos++;
                    continue;
                }
                
            } catch (Exception e) {
                System.out.println("ERRO ao processar PedidoServico ID: " + ps.getId() + " - " + e.getMessage());
                registrosInvalidos++;
            }
        }
        
        System.out.println("=== RESUMO DA LIMPEZA ===");
        System.out.println("Registros processados: " + todosPedidosServicos.size());
        System.out.println("Removidos: " + removidos);
        System.out.println("Corrigidos: " + corrigidos);
        System.out.println("Registros com erro: " + registrosInvalidos);
        System.out.println("=== FIM DA LIMPEZA ===");
    }
} 