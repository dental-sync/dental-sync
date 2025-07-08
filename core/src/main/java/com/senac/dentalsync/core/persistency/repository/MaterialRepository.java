package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;

@Repository
public interface MaterialRepository extends BaseRepository<Material, Long> {
    
    Long countByStatus(StatusMaterial status);
    
    List<Material> findByStatusOrderByNomeAsc(StatusMaterial status);
    
    // Métodos para buscar apenas materiais ativos
    Long countByStatusAndIsActiveTrue(StatusMaterial status);
    
    List<Material> findByStatusAndIsActiveTrueOrderByNomeAsc(StatusMaterial status);
    
    List<Material> findByNomeContainingAndIsActiveTrue(String nome);
    
    List<Material> findByCategoriaMaterial_IdAndIsActiveTrue(Long categoriaId);
    
    Optional<Material> findByNomeAndIsActiveTrue(String nome);
    
}
