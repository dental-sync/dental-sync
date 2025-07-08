package com.senac.dentalsync.core.persistency.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.Laboratorio;

@Repository
public interface LaboratorioRepository extends BaseRepository<Laboratorio, Long> {
    
    Optional<Laboratorio> findByCnpj(String cnpj);
    Optional<Laboratorio> findByCnpjAndIsActiveTrue(String cnpj);
} 