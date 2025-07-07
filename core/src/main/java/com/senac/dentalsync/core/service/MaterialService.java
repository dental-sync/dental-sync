package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;  
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MaterialService extends BaseService<Material, Long> {

    @Autowired
    private MaterialRepository materialRepository;

    @Override
    public MaterialRepository getRepository() {
        return materialRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService
    
    public void delete(Long id) {
        materialRepository.deleteById(id);
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

    public Map<String, Object> getNotificacaoEstoque() {
        Map<String, Object> notificacoes = new HashMap<>();
        
        try {
            // Buscar contadores
            Long semEstoque = materialRepository.countByStatus(StatusMaterial.SEM_ESTOQUE);
            Long baixoEstoque = materialRepository.countByStatus(StatusMaterial.BAIXO_ESTOQUE);
            
            // Buscar listas de materiais
            List<Material> materiaisSemEstoque = materialRepository.findByStatusOrderByNomeAsc(StatusMaterial.SEM_ESTOQUE);
            List<Material> materiaisBaixoEstoque = materialRepository.findByStatusOrderByNomeAsc(StatusMaterial.BAIXO_ESTOQUE);
            
            // Montar resposta
            notificacoes.put("semEstoque", semEstoque != null ? semEstoque.intValue() : 0);
            notificacoes.put("baixoEstoque", baixoEstoque != null ? baixoEstoque.intValue() : 0);
            notificacoes.put("total", (semEstoque != null ? semEstoque.intValue() : 0) + (baixoEstoque != null ? baixoEstoque.intValue() : 0));
            notificacoes.put("materiaisSemEstoque", materiaisSemEstoque);
            notificacoes.put("materiaisBaixoEstoque", materiaisBaixoEstoque);
            
        } catch (Exception e) {
            // Em caso de erro, retornar valores padrão
            notificacoes.put("semEstoque", 0);
            notificacoes.put("baixoEstoque", 0);
            notificacoes.put("total", 0);
            notificacoes.put("materiaisSemEstoque", List.of());
            notificacoes.put("materiaisBaixoEstoque", List.of());
        }
        
        return notificacoes;
    }
}
