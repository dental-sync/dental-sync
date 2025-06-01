package com.senac.dentalsync.core.controller;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.LaboratorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/laboratorios")
public class LaboratorioController extends BaseController<Laboratorio, Long> {

    @Autowired
    private LaboratorioService laboratorioService;

    @Override
    protected BaseService<Laboratorio, Long> getService() {
        return laboratorioService;
    }
} 