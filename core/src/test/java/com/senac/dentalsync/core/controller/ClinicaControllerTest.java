package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.service.ClinicaService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ClinicaController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class ClinicaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClinicaService clinicaService;

    private Clinica clinicaTeste;
    private List<Clinica> listaClinicas;
    private List<Dentista> listaDentistas;

    @BeforeEach
    void setUp() {
        clinicaTeste = new Clinica();
        clinicaTeste.setId(1L);
        clinicaTeste.setNome("Clínica Dental São Paulo");
        clinicaTeste.setCnpj("12.345.678/0001-90");
        clinicaTeste.setIsActive(true);

        Clinica clinica2 = new Clinica();
        clinica2.setId(2L);
        clinica2.setNome("Clínica Odonto Rio");
        clinica2.setCnpj("98.765.432/0001-10");
        clinica2.setIsActive(true);

        listaClinicas = Arrays.asList(clinicaTeste, clinica2);

        // Dentistas para teste
        Dentista dentista1 = new Dentista();
        dentista1.setId(1L);
        dentista1.setNome("Dr. João Silva");
        
        Dentista dentista2 = new Dentista();
        dentista2.setId(2L);
        dentista2.setNome("Dra. Maria Santos");

        listaDentistas = Arrays.asList(dentista1, dentista2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodasClinicas() throws Exception {
        // Given
        when(clinicaService.findAll()).thenReturn(listaClinicas);

        // When & Then
        mockMvc.perform(get("/clinicas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("Clínica Dental São Paulo"))
            .andExpect(jsonPath("$[1].nome").value("Clínica Odonto Rio"));
    }

    @Test
    void deveListarClinicasPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Clinica> page = 
            new org.springframework.data.domain.PageImpl<>(listaClinicas);
        when(clinicaService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/clinicas/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarClinicaPorId() throws Exception {
        // Given
        when(clinicaService.findById(1L)).thenReturn(Optional.of(clinicaTeste));

        // When & Then
        mockMvc.perform(get("/clinicas/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Clínica Dental São Paulo"));
    }

    @Test
    void deveRetornarNotFoundQuandoClinicaNaoEncontradaPorId() throws Exception {
        // Given
        when(clinicaService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/clinicas/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovaClinica() throws Exception {
        // Given
        Clinica novaClinica = new Clinica();
        novaClinica.setNome("Nova Clínica");
        novaClinica.setCnpj("11.111.111/0001-11");

        when(clinicaService.save(any(Clinica.class))).thenReturn(clinicaTeste);

        // When & Then
        mockMvc.perform(post("/clinicas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novaClinica)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Clínica Dental São Paulo"));
    }

    @Test
    void deveAtualizarClinicaExistente() throws Exception {
        // Given
        Clinica clinicaAtualizada = new Clinica();
        clinicaAtualizada.setId(1L);
        clinicaAtualizada.setNome("Clínica Dental São Paulo Atualizada");
        clinicaAtualizada.setCnpj("12.345.678/0001-90");

        when(clinicaService.findById(1L)).thenReturn(Optional.of(clinicaTeste));
        when(clinicaService.save(any(Clinica.class))).thenReturn(clinicaAtualizada);

        // When & Then
        mockMvc.perform(put("/clinicas/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clinicaAtualizada)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Clínica Dental São Paulo Atualizada"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarClinicaInexistente() throws Exception {
        // Given
        Clinica clinicaAtualizada = new Clinica();
        clinicaAtualizada.setNome("Clínica Inexistente");

        when(clinicaService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/clinicas/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clinicaAtualizada)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarClinica() throws Exception {
        // When & Then
        mockMvc.perform(delete("/clinicas/1"))
            .andExpect(status().isNoContent());
    }

    // ========== Testes dos endpoints específicos do ClinicaController ==========

    @Test
    void deveBuscarClinicaPorNome() throws Exception {
        // Given
        when(clinicaService.findByNome("Clínica Dental São Paulo"))
            .thenReturn(Optional.of(clinicaTeste));

        // When & Then
        mockMvc.perform(get("/clinicas/nome/Clínica Dental São Paulo"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Clínica Dental São Paulo"));
    }

    @Test
    void deveRetornarNotFoundQuandoClinicaNaoEncontradaPorNome() throws Exception {
        // Given
        when(clinicaService.findByNome("Clínica Inexistente"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/clinicas/nome/Clínica Inexistente"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarClinicaPorCnpj() throws Exception {
        // Given
        // Usando CNPJ sem caracteres especiais para evitar problemas de URL encoding
        String cnpj = "12345678000190";
        clinicaTeste.setCnpj(cnpj);
        
        when(clinicaService.findByCnpj(cnpj))
            .thenReturn(Optional.of(clinicaTeste));

        // When & Then
        mockMvc.perform(get("/clinicas/cnpj/" + cnpj))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.cnpj").value(cnpj));
    }

    @Test
    void deveRetornarNotFoundQuandoClinicaNaoEncontradaPorCnpj() throws Exception {
        // Given
        String cnpjInexistente = "99999999000199";
        when(clinicaService.findByCnpj(cnpjInexistente))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/clinicas/cnpj/" + cnpjInexistente))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarDentistasPorClinica() throws Exception {
        // Given
        when(clinicaService.findDentistasByClinicaId(1L))
            .thenReturn(listaDentistas);

        // When & Then
        mockMvc.perform(get("/clinicas/1/dentistas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("Dr. João Silva"))
            .andExpect(jsonPath("$[1].nome").value("Dra. Maria Santos"));
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHouverDentistasNaClinica() throws Exception {
        // Given
        when(clinicaService.findDentistasByClinicaId(1L))
            .thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/clinicas/1/dentistas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(clinicaService.findAll()).thenReturn(listaClinicas);

        // When & Then
        mockMvc.perform(get("/clinicas"))
            .andExpect(status().isOk());
    }
} 