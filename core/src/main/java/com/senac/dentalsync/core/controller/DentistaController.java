package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.DentistaService;
import com.senac.dentalsync.core.dto.HistoricoDentistaDTO;
import com.senac.dentalsync.core.service.PedidoService;

import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/dentistas")
public class DentistaController extends BaseController<Dentista, Long> {

    @Autowired
    private DentistaService dentistaService;
    
    @Autowired
    private PedidoService pedidoService;
    
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

    @GetMapping("/telefone/{telefone}")
    public ResponseEntity<Dentista> findByTelefone(@PathVariable String telefone) {
        return dentistaService.findByTelefone(telefone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Dentista> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        try {
            Dentista dentista = dentistaService.updateStatus(id, status.get("isActive"));
            return ResponseEntity.ok(dentista);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<List<HistoricoDentistaDTO>> getHistoricoDentista(@PathVariable Long id) {
        List<HistoricoDentistaDTO> historico = pedidoService.buscarHistoricoPorDentista(id);
        return ResponseEntity.ok(historico);
    }
} 