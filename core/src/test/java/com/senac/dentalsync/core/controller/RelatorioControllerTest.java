package com.senac.dentalsync.core.controller;

import com.senac.dentalsync.core.dto.RelatorioDTO;
import com.senac.dentalsync.core.service.RelatorioService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = RelatorioController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class RelatorioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RelatorioService relatorioService;

    private RelatorioDTO relatorioTeste;

    @BeforeEach
    void setUp() {
        relatorioTeste = new RelatorioDTO();
        // Assumindo que RelatorioDTO tem alguns campos básicos
        // Se houver métodos setters específicos, eles podem ser adicionados aqui
    }

    @Test
    void deveObterDadosDashboard() throws Exception {
        // Given
        when(relatorioService.obterDadosDashboard()).thenReturn(relatorioTeste);

        // When & Then
        mockMvc.perform(get("/relatorios/dashboard"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").exists());
    }

    @Test
    void deveRetornarOkMesmoComDadosVazios() throws Exception {
        // Given
        RelatorioDTO relatorioVazio = new RelatorioDTO();
        when(relatorioService.obterDadosDashboard()).thenReturn(relatorioVazio);

        // When & Then
        mockMvc.perform(get("/relatorios/dashboard"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").exists());
    }
} 