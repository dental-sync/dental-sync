package com.senac.dentalsync.core.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.MaterialService;

@RestController
@RequestMapping("/material")
public class MaterialController extends BaseController<Material, Long> {

    @Autowired
    private MaterialService materialService;

    @Override
    protected BaseService<Material, Long> getService() {
        return materialService;
    }

    @GetMapping("/notificacoes/estoque")
    public ResponseEntity<Map<String, Object>> getNotificacaoEstoque() {
        try {
            Map<String, Object> notificacoes = materialService.getNotificacaoEstoque();
            return ResponseEntity.ok(notificacoes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }    
    
}
