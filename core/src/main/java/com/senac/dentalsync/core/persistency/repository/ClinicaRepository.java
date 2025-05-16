package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Clinica;

@Repository
public interface ClinicaRepository extends BaseRepository<Clinica, Long> {
    Optional<Clinica> findByNome(String nome);
    Optional<Clinica> findByCnpj(String cnpj);
    List<Clinica> findByNomeContaining(String nome);
} 