package com.senac.dentalsync.core.persistency.repository;

import java.util.List;
import java.util.Optional;

import com.senac.dentalsync.core.persistency.model.Paciente;

public interface PacienteRepository extends BaseRepository<Paciente, Long> {

    Optional<Paciente> findByTelefone(String telefone);
    Optional<Paciente> findByNome(String nome);
    Optional<Paciente> findByEmail(String email);
    
    // Métodos para buscar apenas pacientes ativos
    Optional<Paciente> findByTelefoneAndIsActiveTrue(String telefone);
    Optional<Paciente> findByNomeAndIsActiveTrue(String nome);
    Optional<Paciente> findByEmailAndIsActiveTrue(String email);
    List<Paciente> findByNomeContainingAndIsActiveTrue(String nome);
    
    // Métodos para buscar apenas pacientes inativos
    Optional<Paciente> findByTelefoneAndIsActiveFalse(String telefone);
    Optional<Paciente> findByNomeAndIsActiveFalse(String nome);
    Optional<Paciente> findByEmailAndIsActiveFalse(String email);
    List<Paciente> findByNomeContainingAndIsActiveFalse(String nome);
} 