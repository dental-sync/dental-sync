package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.ServicoService;

@RestController
@RequestMapping("/servico")
public class ServicoController extends BaseController<Servico, Long> {

    @Autowired
    private ServicoService servicoService;

    @Override
    protected BaseService<Servico, Long> getService() {
        return servicoService;
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<Servico> update(@PathVariable Long id, @RequestBody Servico servico) {
        return ResponseEntity.ok(servicoService.updateServico(servico, id));
    }

    /**
     * Recalcula os valores de um serviço específico
     */
    @PostMapping("/{id}/recalcular-valores")
    public ResponseEntity<Servico> recalcularValores(@PathVariable Long id) {
        Servico servico = servicoService.recalcularValores(id);
        return ResponseEntity.ok(servico);
    }

    /**
     * Recalcula os valores de todos os serviços
     * Endpoint útil para migração ou correção de dados
     */
    @PostMapping("/recalcular-todos-valores")
    public ResponseEntity<String> recalcularTodosOsValores() {
        servicoService.recalcularTodosOsValores();
        return ResponseEntity.ok("Valores recalculados com sucesso para todos os serviços");
    }
}
