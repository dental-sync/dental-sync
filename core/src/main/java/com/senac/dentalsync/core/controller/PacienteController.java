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
import org.springframework.http.HttpStatus;

import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.PacienteService;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/paciente")
public class PacienteController extends BaseController<Paciente, Long> {

    private static final Logger logger = LoggerFactory.getLogger(PacienteController.class);

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
        return pacienteService.findByNome(nome)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telefone/{telefone}")
    public ResponseEntity<Paciente> findByTelefone(@PathVariable String telefone) {
        return pacienteService.findByTelefone(telefone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Map<String, String>> excluirPaciente(@PathVariable Long id) {
        pacienteService.deletePaciente(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Paciente excluído com sucesso");
        response.put("status", "success");
        
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Paciente> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        try {
            logger.info("Recebida solicitação para atualizar status do paciente ID: {}", id);
            logger.info("Payload recebido: {}", status);
            
            Boolean isActive = status.get("isActive");
            
            if (isActive == null) {
                logger.error("Campo 'isActive' não encontrado no payload");
                return ResponseEntity.badRequest().build();
            }
            
            logger.info("Atualizando status para: {}", isActive);
            Paciente paciente = pacienteService.updateStatus(id, isActive);
            logger.info("Status atualizado com sucesso para paciente: {}", id);
            
            return ResponseEntity.ok(paciente);
        } catch (Exception e) {
            logger.error("Erro ao atualizar status do paciente: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
}
