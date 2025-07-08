package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.CategoriaServico;

@Repository
public interface CategoriaServicoRepository extends BaseRepository<CategoriaServico, Long> {
    
    // Métodos para buscar apenas categorias ativas
    List<CategoriaServico> findByNomeContainingAndIsActiveTrue(String nome);
    
    Optional<CategoriaServico> findByNomeAndIsActiveTrue(String nome);
    
}
