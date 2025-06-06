package com.senac.dentalsync.core.service;

import java.time.LocalDate;
import java.util.List;

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
} 