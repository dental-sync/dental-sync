package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.PacienteService;
import com.senac.dentalsync.core.dto.HistoricoPacienteDTO;
import com.senac.dentalsync.core.service.PedidoService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/paciente")
public class PacienteController extends BaseController<Paciente, Long> {

    @Autowired
    private PacienteService pacienteService;
    
    @Autowired
    private PedidoService pedidoService;
    
    @Override
    protected BaseService<Paciente, Long> getService() {
        return pacienteService;
    }
    
    // Endpoints para consultas ativas (uso público)
    @GetMapping("/email/{email}")
    public ResponseEntity<Paciente> findByEmail(@PathVariable @Valid String email) {
        return pacienteService.findByEmailActive(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/nome/{nome}")
    public ResponseEntity<Paciente> findByNome(@PathVariable @Valid String nome) {
        return pacienteService.findByNomeActive(nome)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telefone/{telefone}")
    public ResponseEntity<Paciente> findByTelefone(@PathVariable @Valid String telefone) {
        return pacienteService.findByTelefoneActive(telefone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Paciente>> findByNomeContaining(@RequestParam String nome) {
        return ResponseEntity.ok(pacienteService.findByNomeContainingActive(nome));
    }
    
    // Endpoints para consultas incluindo inativos (uso administrativo)
    @GetMapping("/all/email/{email}")
    public ResponseEntity<Paciente> findByEmailIncludingInactive(@PathVariable @Valid String email) {
        return pacienteService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/all/nome/{nome}")
    public ResponseEntity<Paciente> findByNomeIncludingInactive(@PathVariable @Valid String nome) {
        return pacienteService.findByNome(nome)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all/telefone/{telefone}")
    public ResponseEntity<Paciente> findByTelefoneIncludingInactive(@PathVariable @Valid String telefone) {
        return pacienteService.findByTelefone(telefone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Paciente>> findAllIncludingInactive() {
        return ResponseEntity.ok(pacienteService.findAllIncludingInactive());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pacienteService.deletePaciente(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Paciente> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
            Paciente paciente = pacienteService.updateStatus(id, status.get("isActive"));
            return ResponseEntity.ok(paciente);
       
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<List<HistoricoPacienteDTO>> getHistoricoPaciente(@PathVariable Long id) {
        List<HistoricoPacienteDTO> historico = pedidoService.buscarHistoricoPorPaciente(id);
        return ResponseEntity.ok(historico);
    }

    // Endpoints para consultas apenas inativas (uso administrativo)
    @GetMapping("/inactive/email/{email}")
    public ResponseEntity<Paciente> findByEmailInactive(@PathVariable @Valid String email) {
        return pacienteService.findByEmailInactive(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/inactive/nome/{nome}")
    public ResponseEntity<Paciente> findByNomeInactive(@PathVariable @Valid String nome) {
        return pacienteService.findByNomeInactive(nome)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/inactive/telefone/{telefone}")
    public ResponseEntity<Paciente> findByTelefoneInactive(@PathVariable @Valid String telefone) {
        return pacienteService.findByTelefoneInactive(telefone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/inactive/search")
    public ResponseEntity<List<Paciente>> findByNomeContainingInactive(@RequestParam String nome) {
        return ResponseEntity.ok(pacienteService.findByNomeContainingInactive(nome));
    }
}
