package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.PacienteService;
import com.senac.dentalsync.core.service.ProteticoService;

import java.util.Optional;

@RestController
@RequestMapping("/paciente")
public class PacienteController extends BaseController<Paciente, Long> {

    @Autowired
    private PacienteService pacienteService;
    
    @Override
    protected BaseService<Paciente, Long> getService() {
        return pacienteService;
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Paciente> findByEmail(@PathVariable String email) {
        return pacienteService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/nome/{nome}")
    public ResponseEntity<Paciente> findByNome(@PathVariable String nome) {
        return pacienteService.findByEmail(nome)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telefone/{telefone}")
    public ResponseEntity<Paciente> findByTelefone(@PathVariable String telefone) {
        return pacienteService.findByTelefone(telefone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 
