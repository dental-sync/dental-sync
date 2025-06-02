package com.senac.dentalsync.core.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
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

    @Autowired
    private ProteticoService proteticoService;
    
    @Override
    protected BaseService<Protetico, Long> getService() {
        return proteticoService;
    }
    
    @GetMapping("/me")
    public ResponseEntity<Protetico> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = authentication.getName();
        return proteticoService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
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
        Boolean isActive = status.get("isActive");
        
        if (isActive == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Protetico protetico = proteticoService.updateStatus(id, isActive);
        return ResponseEntity.ok(protetico);
    }
    
    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        proteticoService.deleteProtetico(id);
        return ResponseEntity.noContent().build();
    }
} 