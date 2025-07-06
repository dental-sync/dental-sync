package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;  
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

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

    @Override
    public Material save(Material material) {
        return super.save(material);
    }
    
    public void delete(Long id) {
        materialRepository.deleteById(id);
    }

    public Map<String, Object> getNotificacaoEstoque() {
        try {
            Long baixoEstoque = materialRepository.countByStatus(StatusMaterial.BAIXO_ESTOQUE);
            Long semEstoque = materialRepository.countByStatus(StatusMaterial.SEM_ESTOQUE);
            Long total = baixoEstoque + semEstoque;

            Map<String, Object> notificacoes = new HashMap<>();
            notificacoes.put("baixoEstoque", baixoEstoque);
            notificacoes.put("semEstoque", semEstoque);
            notificacoes.put("total", total);
            notificacoes.put("materiaisBaixoEstoque", new ArrayList<>());
            notificacoes.put("materiaisSemEstoque", new ArrayList<>());

            return notificacoes;
        } catch (Exception e) {
            // Retornar dados zerados em caso de erro
            Map<String, Object> notificacoes = new HashMap<>();
            notificacoes.put("baixoEstoque", 0L);
            notificacoes.put("semEstoque", 0L);
            notificacoes.put("total", 0L);
            notificacoes.put("materiaisBaixoEstoque", new ArrayList<>());
            notificacoes.put("materiaisSemEstoque", new ArrayList<>());
            return notificacoes;
        }
    }
}
