package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.ServicoService;

@RestController
@RequestMapping("/servicos")
public class ServicoController extends BaseController<Servico, Long> {

    @Autowired
    private ServicoService servicoService;

    @Override
    protected BaseService<Servico, Long> getService() {
        return servicoService;
    }

}
