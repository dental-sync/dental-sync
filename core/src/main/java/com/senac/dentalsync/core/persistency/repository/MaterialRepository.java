package com.senac.dentalsync.core.persistency.repository;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Material;

@Repository
public interface MaterialRepository extends BaseRepository<Material, Long> {
    
}
