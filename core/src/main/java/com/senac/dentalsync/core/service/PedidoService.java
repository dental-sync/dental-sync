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
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import com.senac.dentalsync.core.dto.HistoricoProteticoDTO;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.dto.HistoricoPacienteDTO;
import com.senac.dentalsync.core.dto.HistoricoDentistaDTO;

@Service
public class PedidoService extends BaseService<Pedido, Long> {

    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private UsuarioService usuarioService;

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
        // Se for um novo pedido, garantir que o status seja PENDENTE
        if (pedido.getId() == null && pedido.getStatus() == null) {
            pedido.setStatus(Pedido.Status.PENDENTE);
        }
        return super.save(pedido);
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
                .map(Servico::getPreco)
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
                .map(Servico::getPreco)
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
                .map(Servico::getPreco)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setValorTotal(valorTotal);
            historico.add(dto);
        }
        return historico;
    }
} 