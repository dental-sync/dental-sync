package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
} 