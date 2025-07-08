package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoMaterialRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MaterialService extends BaseService<Material, Long> {

    @Autowired
    private MaterialRepository materialRepository;
    
    @Autowired
    private ServicoMaterialRepository servicoMaterialRepository;

    @Override
    public MaterialRepository getRepository() {
        return materialRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService
    
    public void delete(Long id) {
        // Primeiro, buscar o material
        Optional<Material> materialOpt = materialRepository.findById(id);
        
        if (materialOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Material não encontrado");
        }
        
        // Deletar todos os ServicoMaterial que referenciam este material
        servicoMaterialRepository.deleteByMaterialId(id);
        
        // Agora pode deletar o material
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

    public Material updateStatus(Long id, Boolean isActive) {
        Optional<Material> materialOpt = materialRepository.findById(id);
        
        if (materialOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Material não encontrado");
        }
        
        Material material = materialOpt.get();
        material.setIsActive(isActive);
        
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
