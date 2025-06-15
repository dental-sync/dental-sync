package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.ClinicaService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/clinicas")
public class ClinicaController extends BaseController<Clinica, Long> {

    @Autowired
    private ClinicaService clinicaService;
    
    @Override
    protected BaseService<Clinica, Long> getService() {
        return clinicaService;
    }
    
    @GetMapping("/nome/{nome}")
    public ResponseEntity<Clinica> findByNome(@PathVariable String nome) {
        return clinicaService.findByNome(nome)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<Clinica> findByCnpj(@PathVariable String cnpj) {
        return clinicaService.findByCnpj(cnpj)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/dentistas")
    public ResponseEntity<List<Dentista>> getDentistasByClinica(@PathVariable Long id) {
        List<Dentista> dentistas = clinicaService.findDentistasByClinicaId(id);
        return ResponseEntity.ok(dentistas);
    }
} 