package com.senac.dentalsync.core.persistency.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Dentista;

@Repository
public interface DentistaRepository extends BaseRepository<Dentista, Long> {
    Optional<Dentista> findByEmail(String email);
    Optional<Dentista> findByCro(String cro);
    List<Dentista> findByCroContaining(String cro);
    Optional<Dentista> findByTelefone(String telefone);
    List<Dentista> findByClinicas_Id(Long clinicaId);
    
    // Métodos para buscar apenas dentistas ativos
    Optional<Dentista> findByEmailAndIsActiveTrue(String email);
    Optional<Dentista> findByCroAndIsActiveTrue(String cro);
    List<Dentista> findByCroContainingAndIsActiveTrue(String cro);
    Optional<Dentista> findByTelefoneAndIsActiveTrue(String telefone);
    List<Dentista> findByClinicas_IdAndIsActiveTrue(Long clinicaId);
    
    // Métodos para buscar apenas dentistas inativos
    Optional<Dentista> findByEmailAndIsActiveFalse(String email);
    Optional<Dentista> findByCroAndIsActiveFalse(String cro);
    List<Dentista> findByCroContainingAndIsActiveFalse(String cro);
    Optional<Dentista> findByTelefoneAndIsActiveFalse(String telefone);
    List<Dentista> findByClinicas_IdAndIsActiveFalse(Long clinicaId);

    //relatorio
    Long countByIsActiveTrue();
    Long countByIsActiveTrueAndCreatedAtBefore(LocalDateTime data);
    Long countByIsActiveTrueAndCreatedAtBetween(LocalDateTime dataInicio, LocalDateTime dataFim);
} 