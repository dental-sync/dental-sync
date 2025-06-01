package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.LaboratorioService;
import com.senac.dentalsync.core.service.ProteticoService;

@RestController
@RequestMapping("/laboratorios")
public class LaboratorioController extends BaseController<Laboratorio, Long> {

    @Autowired
    private LaboratorioService laboratorioService;
    
    @Autowired
    private ProteticoService proteticoService;

    @Override
    protected BaseService<Laboratorio, Long> getService() {
        return laboratorioService;
    }
    
    @GetMapping("/me")
    public ResponseEntity<Laboratorio> getCurrentUserLaboratorio() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.notFound().build();
        }
        
        String email = authentication.getName();
        return proteticoService.findLaboratorioByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 