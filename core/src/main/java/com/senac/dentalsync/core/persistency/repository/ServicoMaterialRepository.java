package com.senac.dentalsync.core.persistency.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.model.ServicoMaterialId;

@Repository
public interface ServicoMaterialRepository extends JpaRepository<ServicoMaterial, ServicoMaterialId> {

    @Query("SELECT sm FROM ServicoMaterial sm WHERE sm.servico.id = :servicoId")
    List<ServicoMaterial> findByServicoId(@Param("servicoId") Long servicoId);

    @Query("SELECT sm FROM ServicoMaterial sm WHERE sm.material.id = :materialId")
    List<ServicoMaterial> findByMaterialId(@Param("materialId") Long materialId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ServicoMaterial sm WHERE sm.material.id = :materialId")
    void deleteByMaterialId(@Param("materialId") Long materialId);

} 