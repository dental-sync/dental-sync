package com.senac.dentalsync.core.persistency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.ServicoMaterial;

@Repository
public interface ServicoMaterialRepository extends JpaRepository<ServicoMaterial, Long> {

} 