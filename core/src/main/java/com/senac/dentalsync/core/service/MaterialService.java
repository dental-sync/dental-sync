package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;  
import java.math.BigDecimal;

@Service
public class MaterialService extends BaseService<Material, Long> {

    @Autowired
    private MaterialRepository materialRepository;

    @Override
    public MaterialRepository getRepository() {
        return materialRepository;
    }

    @Override
    public Protetico getUsuarioLogado() {
        return null;
    }

    private void atualizarStatusMaterial(Material material) {
        if (material.getQuantidade() == null || material.getEstoqueMinimo() == null) {
            return;
        }

        if (material.getQuantidade().compareTo(BigDecimal.ZERO) == 0) {
            material.setStatus(StatusMaterial.SEM_ESTOQUE);
        } else if (material.getQuantidade().compareTo(material.getEstoqueMinimo()) <= 0) {
            material.setStatus(StatusMaterial.BAIXO_ESTOQUE);
        } else {
            material.setStatus(StatusMaterial.EM_ESTOQUE);
        }
    }

    @Override
    public Material save(Material material) {
        atualizarStatusMaterial(material);
        return super.save(material);
    }

    public Material updateStatus(Long id, Boolean status) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material não encontrado"));
        material.setIsActive(status);
        return materialRepository.save(material);
    }
    
    public void delete(Long id) {
        materialRepository.deleteById(id);
    }
}
