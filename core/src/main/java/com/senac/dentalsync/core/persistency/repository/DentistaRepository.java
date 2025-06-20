package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Dentista;

@Repository
public interface DentistaRepository extends BaseRepository<Dentista, Long> {
    Optional<Dentista> findByEmail(String email);
    Optional<Dentista> findByCro(String cro);
    List<Dentista> findByCroContaining(String cro);
    Optional<Dentista> findByTelefone(String telefone);
    List<Dentista> findByClinicas_Id(Long clinicaId);

    //relatorio
    Long countByIsActiveTrue();
    Long countByIsActiveTrueAndCreatedAtBefore(LocalDateTime data);
    Long countByIsActiveTrueAndCreatedAtBetween(LocalDateTime dataInicio, LocalDateTime dataFim);
} 