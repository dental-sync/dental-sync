package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.DentistaService;

import java.util.Optional;

@RestController
@RequestMapping("/dentistas")
public class DentistaController extends BaseController<Dentista, Long> {

    @Autowired
    private DentistaService dentistaService;
    
    @Override
    protected BaseService<Dentista, Long> getService() {
        return dentistaService;
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Dentista> findByEmail(@PathVariable String email) {
        return dentistaService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cro/{cro}")
    public ResponseEntity<Dentista> findByCro(@PathVariable String cro) {
        return dentistaService.findByCro(cro)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 