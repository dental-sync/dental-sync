package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.PacienteService;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

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
    public ResponseEntity<Paciente> findByEmail(@PathVariable @Valid String email) {
        return pacienteService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/nome/{nome}")
    public ResponseEntity<Paciente> findByNome(@PathVariable @Valid String nome) {
        return pacienteService.findByNome(nome)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telefone/{telefone}")
    public ResponseEntity<Paciente> findByTelefone(@PathVariable @Valid String telefone) {
        return pacienteService.findByTelefone(telefone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Map<String, String>> excluirPaciente(@PathVariable Long id) {
        pacienteService.deletePaciente(id);
        Map<String, String> response = new HashMap<>();
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Paciente> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
            Paciente paciente = pacienteService.updateStatus(id, status.get("isActive"));
            return ResponseEntity.ok(paciente);
       
    }
}
