package com.senac.dentalsync.core.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.ProteticoService;

@RestController
@RequestMapping("/proteticos")
public class ProteticoController extends BaseController<Protetico, Long> {

    private static final Logger logger = LoggerFactory.getLogger(ProteticoController.class);

    @Autowired
    private ProteticoService proteticoService;
    
    @Override
    protected BaseService<Protetico, Long> getService() {
        return proteticoService;
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Protetico> findByEmail(@PathVariable String email) {
        return proteticoService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cro/{cro}")
    public ResponseEntity<Protetico> findByCro(@PathVariable String cro) {
        return proteticoService.findByCro(cro)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Protetico> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        try {
            logger.info("Recebida solicitação para atualizar status do protético ID: {}", id);
            logger.info("Payload recebido: {}", status);
            
            Boolean isActive = status.get("isActive");
            
            if (isActive == null) {
                logger.error("Campo 'isActive' não encontrado no payload");
                return ResponseEntity.badRequest().build();
            }
            
            logger.info("Atualizando status para: {}", isActive);
            Protetico protetico = proteticoService.updateStatus(id, isActive);
            logger.info("Status atualizado com sucesso para protetico: {}", id);
            
            return ResponseEntity.ok(protetico);
        } catch (Exception e) {
            logger.error("Erro ao atualizar status do protético: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
} 