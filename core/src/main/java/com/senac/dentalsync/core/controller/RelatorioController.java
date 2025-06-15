package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.dto.RelatorioDTO;
import com.senac.dentalsync.core.service.RelatorioService;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    @GetMapping("/dashboard")
    public ResponseEntity<RelatorioDTO> obterDadosDashboard() {
        return ResponseEntity.ok(relatorioService.obterDadosDashboard());
    }
} 