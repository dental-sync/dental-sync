package com.senac.dentalsync.core.persistency.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.senac.dentalsync.core.dto.PedidosPorMesDTO;
import com.senac.dentalsync.core.dto.PedidosPorTipoDTO;
import com.senac.dentalsync.core.dto.StatusPedidosDTO;
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

    // Métodos para o relatório
    Long countByStatus(Pedido.Status status);
    Long countByCreatedAtBefore(LocalDateTime data);

    @Query(value = "SELECT EXTRACT(MONTH FROM created_at) as mes, COUNT(*) as total " +
           "FROM pedidos " +
           "WHERE created_at >= :dataReferencia " +
           "GROUP BY EXTRACT(MONTH FROM created_at) " +
           "ORDER BY EXTRACT(MONTH FROM created_at)", nativeQuery = true)
    List<Object[]> findPedidosPorMes(@Param("dataReferencia") LocalDateTime dataReferencia);

    @Query("SELECT new com.senac.dentalsync.core.dto.PedidosPorTipoDTO(" +
           "s.nome, " +
           "COUNT(p) * 100.0 / (SELECT COUNT(p2) FROM Pedido p2)) " +
           "FROM Pedido p JOIN p.servicos s " +
           "GROUP BY s.nome")
    List<PedidosPorTipoDTO> findPedidosPorTipo();

    @Query("SELECT new com.senac.dentalsync.core.dto.StatusPedidosDTO(" +
           "CAST(p.status AS string), " +
           "COUNT(p) * 100.0 / (SELECT COUNT(p2) FROM Pedido p2)) " +
           "FROM Pedido p " +
           "GROUP BY p.status")
    List<StatusPedidosDTO> findStatusPedidos();

    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.dentista " +
           "JOIN FETCH p.cliente " +
           "JOIN FETCH p.servicos " +
           "ORDER BY p.createdAt DESC " +
           "LIMIT 8")
    List<Pedido> findPedidosRecentes();
} 