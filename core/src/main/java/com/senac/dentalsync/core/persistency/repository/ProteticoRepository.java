package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Protetico;

@Repository
public interface ProteticoRepository extends BaseRepository<Protetico, Long> {
    Optional<Protetico> findByEmail(String email);
    Optional<Protetico> findByCro(String cro);
    List<Protetico> findByCroContaining(String cro);
} 