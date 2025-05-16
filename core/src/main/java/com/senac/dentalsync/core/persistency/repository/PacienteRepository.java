package com.senac.dentalsync.core.persistency.repository;


import com.senac.dentalsync.core.persistency.model.Paciente;
import java.util.Optional;

public interface PacienteRepository extends BaseRepository<Paciente, Long> {

    Optional<Paciente> findByTelefone(String telefone);
    Optional<Paciente> findByNome(String nome);
    Optional<Paciente> findByEmail(String email);
} 