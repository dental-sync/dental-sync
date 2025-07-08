package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Servico;

@Repository
public interface ServicoRepository extends BaseRepository<Servico, Long>{
    
    // Métodos para buscar apenas serviços ativos
    List<Servico> findByNomeContainingAndIsActiveTrue(String nome);
    
    Optional<Servico> findByNomeAndIsActiveTrue(String nome);
    
    List<Servico> findByCategoriaServico_IdAndIsActiveTrue(Long categoriaId);
    
}
