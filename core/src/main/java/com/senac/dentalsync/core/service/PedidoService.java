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
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import com.senac.dentalsync.core.dto.HistoricoProteticoDTO;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.dto.HistoricoPacienteDTO;
import com.senac.dentalsync.core.dto.HistoricoDentistaDTO;
import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.repository.ServicoMaterialRepository;

@Service
public class PedidoService extends BaseService<Pedido, Long> {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private ServicoMaterialRepository servicoMaterialRepository;

    @Override
    protected BaseRepository<Pedido, Long> getRepository() {
        return pedidoRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService

    @Override
    @Transactional
    public Pedido save(Pedido pedido) {
        // Se é um pedido novo, desconta material do estoque
        if (pedido.getId() == null) {
            descontarMaterialDoEstoque(pedido);
        }
        
        return super.save(pedido);
    }

    /**
     * Desconta os materiais do estoque quando um novo pedido é criado
     */
    private void descontarMaterialDoEstoque(Pedido pedido) {
        if (pedido.getServicos() == null || pedido.getServicos().isEmpty()) {
            return; // Não há serviços, não precisa descontar material
        }

        for (Servico servico : pedido.getServicos()) {
            // Busca todos os materiais associados ao serviço
            List<ServicoMaterial> servicoMateriais = servicoMaterialRepository.findByServicoId(servico.getId());
            
            for (ServicoMaterial servicoMaterial : servicoMateriais) {
                descontarMaterial(servicoMaterial);
            }
        }
    }

    /**
     * Desconta a quantidade de um material específico do estoque
     */
    private void descontarMaterial(ServicoMaterial servicoMaterial) {
        BigDecimal quantidadeNecessaria = servicoMaterial.getQuantidade();
        
        // Ignora materiais com quantidade zero ou nula
        if (quantidadeNecessaria == null || quantidadeNecessaria.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        // Busca o material atual no banco
        Material material = materialService.getRepository()
                .findById(servicoMaterial.getMaterial().getId())
                .orElseThrow(() -> new RuntimeException("Material não encontrado: " + servicoMaterial.getMaterial().getId()));

        // Verifica se há estoque suficiente
        BigDecimal estoqueAtual = material.getQuantidade();
        if (estoqueAtual == null || estoqueAtual.compareTo(quantidadeNecessaria) < 0) {
            throw new RuntimeException("Estoque insuficiente para o material: " + material.getNome() + 
                                     " (Disponível: " + estoqueAtual + ", Necessário: " + quantidadeNecessaria + ")");
        }

        // Desconta a quantidade do estoque
        BigDecimal novoEstoque = estoqueAtual.subtract(quantidadeNecessaria);
        material.setQuantidade(novoEstoque);
        
        // Salva o material com o novo estoque
        materialService.save(material);
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
} 