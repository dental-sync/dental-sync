package com.senac.dentalsync.core.persistency.repository;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;

import java.util.List;

@Repository
public interface MaterialRepository extends BaseRepository<Material, Long> {
    
    Long countByStatus(StatusMaterial status);
    
    List<Material> findByStatusOrderByNomeAsc(StatusMaterial status);
    
}
