package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.CategoriaMaterial;

@Repository
public interface CategoriaMaterialRepository extends BaseRepository<CategoriaMaterial, Long> {
    
    // Métodos para buscar apenas categorias ativas
    List<CategoriaMaterial> findByNomeContainingAndIsActiveTrue(String nome);
    
    Optional<CategoriaMaterial> findByNomeAndIsActiveTrue(String nome);
    
}
