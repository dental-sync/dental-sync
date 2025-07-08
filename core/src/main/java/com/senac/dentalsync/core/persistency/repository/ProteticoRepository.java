package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Protetico;

@Repository
public interface ProteticoRepository extends BaseRepository<Protetico, Long> {
    Optional<Protetico> findByEmail(String email);
    Optional<Protetico> findFirstByCro(String cro);
    Optional<Protetico> findFirstByTelefone(String telefone);
    List<Protetico> findByCroContaining(String cro);
    
    // Métodos para buscar apenas protéticos ativos
    Optional<Protetico> findByEmailAndIsActiveTrue(String email);
    Optional<Protetico> findFirstByCroAndIsActiveTrue(String cro);
    Optional<Protetico> findFirstByTelefoneAndIsActiveTrue(String telefone);
    List<Protetico> findByCroContainingAndIsActiveTrue(String cro);
    
    // Métodos para buscar apenas protéticos inativos
    Optional<Protetico> findByEmailAndIsActiveFalse(String email);
    Optional<Protetico> findFirstByCroAndIsActiveFalse(String cro);
    Optional<Protetico> findFirstByTelefoneAndIsActiveFalse(String telefone);
    List<Protetico> findByCroContainingAndIsActiveFalse(String cro);
}