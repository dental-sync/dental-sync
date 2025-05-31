package com.senac.dentalsync.core.persistency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.model.ServicoMaterialId;

@Repository
public interface ServicoMaterialRepository extends JpaRepository<ServicoMaterial, ServicoMaterialId> {

} 