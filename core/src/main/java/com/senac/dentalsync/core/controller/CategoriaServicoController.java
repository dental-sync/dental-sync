package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.CategoriaServico;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.CategoriaServicoService;

@RestController
@RequestMapping("/categoria-servico")
public class CategoriaServicoController extends BaseController<CategoriaServico, Long>{

    @Autowired
    private CategoriaServicoService categoriaServicoService;

    @Override
    protected BaseService<CategoriaServico, Long> getService() {
        return categoriaServicoService;
    }
}