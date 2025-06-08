package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
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
}
