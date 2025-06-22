package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.PedidoServico;

@Repository
public interface PedidoServicoRepository extends JpaRepository<PedidoServico, Long> {
    
    List<PedidoServico> findByPedidoId(Long pedidoId);
    
    Optional<PedidoServico> findByPedidoIdAndServicoId(Long pedidoId, Long servicoId);
    
    void deleteByPedidoId(Long pedidoId);
} 