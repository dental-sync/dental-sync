package com.senac.dentalsync.core.persistency.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.Protetico;

@Repository
public interface PedidoRepository extends BaseRepository<Pedido, Long> {
    
    List<Pedido> findByDentista(Dentista dentista);
    
    List<Pedido> findByCliente(Paciente cliente);
    
    List<Pedido> findByProtetico(Protetico protetico);
    
    List<Pedido> findByDataEntrega(LocalDate dataEntrega);
    
    List<Pedido> findByPrioridade(Pedido.Prioridade prioridade);
} 