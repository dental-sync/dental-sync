package com.senac.dentalsync.core.persistency.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
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
    Long countByStatus(String status);

    Long countByDataCriacaoBefore(LocalDateTime data);

    @Query("SELECT new com.senac.dentalsync.core.dto.PedidosPorMesDTO(" +
           "TO_CHAR(p.dataCriacao, 'Mon'), COUNT(p)) " +
           "FROM Pedido p " +
           "WHERE p.dataCriacao >= :dataInicio " +
           "GROUP BY TO_CHAR(p.dataCriacao, 'Mon') " +
           "ORDER BY MIN(p.dataCriacao)")
    List<PedidosPorMesDTO> findPedidosPorMes(@Param("dataInicio") LocalDateTime dataInicio);

    @Query("SELECT new com.senac.dentalsync.core.dto.PedidosPorTipoDTO(" +
           "p.tipo, " +
           "COUNT(p) * 100.0 / (SELECT COUNT(p2) FROM Pedido p2)) " +
           "FROM Pedido p " +
           "GROUP BY p.tipo")
    List<PedidosPorTipoDTO> findPedidosPorTipo();

    @Query("SELECT new com.senac.dentalsync.core.dto.StatusPedidosDTO(" +
           "p.status, " +
           "COUNT(p) * 100.0 / (SELECT COUNT(p2) FROM Pedido p2)) " +
           "FROM Pedido p " +
           "GROUP BY p.status")
    List<StatusPedidosDTO> findStatusPedidos();

    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.dentista " +
           "JOIN FETCH p.cliente " +
           "ORDER BY p.dataCriacao DESC " +
           "LIMIT 8")
    List<Pedido> findPedidosRecentes();
} 