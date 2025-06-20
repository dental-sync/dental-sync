package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.service.LaboratorioService;
import com.senac.dentalsync.core.service.ProteticoService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = LaboratorioController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class LaboratorioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LaboratorioService laboratorioService;

    @MockBean
    private ProteticoService proteticoService;

    private Laboratorio laboratorioTeste;
    private List<Laboratorio> listaLaboratorios;

    @BeforeEach
    void setUp() {
        laboratorioTeste = new Laboratorio();
        laboratorioTeste.setId(1L);
        laboratorioTeste.setNomeLaboratorio("Laboratório Dental Premium");
        laboratorioTeste.setIsActive(true);

        Laboratorio laboratorio2 = new Laboratorio();
        laboratorio2.setId(2L);
        laboratorio2.setNomeLaboratorio("Lab Próteses Modernas");
        laboratorio2.setIsActive(true);

        listaLaboratorios = Arrays.asList(laboratorioTeste, laboratorio2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodosLaboratorios() throws Exception {
        // Given
        when(laboratorioService.findAll()).thenReturn(listaLaboratorios);

        // When & Then
        mockMvc.perform(get("/laboratorios"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nomeLaboratorio").value("Laboratório Dental Premium"))
            .andExpect(jsonPath("$[1].nomeLaboratorio").value("Lab Próteses Modernas"));
    }

    @Test
    void deveListarLaboratoriosPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Laboratorio> page = 
            new org.springframework.data.domain.PageImpl<>(listaLaboratorios);
        when(laboratorioService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/laboratorios/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarLaboratorioPorId() throws Exception {
        // Given
        when(laboratorioService.findById(1L)).thenReturn(Optional.of(laboratorioTeste));

        // When & Then
        mockMvc.perform(get("/laboratorios/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nomeLaboratorio").value("Laboratório Dental Premium"));
    }

    @Test
    void deveRetornarNotFoundQuandoLaboratorioNaoEncontradoPorId() throws Exception {
        // Given
        when(laboratorioService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/laboratorios/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoLaboratorio() throws Exception {
        // Given
        Laboratorio novoLaboratorio = new Laboratorio();
        novoLaboratorio.setNomeLaboratorio("Novo Laboratório");

        when(laboratorioService.save(any(Laboratorio.class))).thenReturn(laboratorioTeste);

        // When & Then
        mockMvc.perform(post("/laboratorios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoLaboratorio)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nomeLaboratorio").value("Laboratório Dental Premium"));
    }

    @Test
    void deveAtualizarLaboratorioExistente() throws Exception {
        // Given
        Laboratorio laboratorioAtualizado = new Laboratorio();
        laboratorioAtualizado.setId(1L);
        laboratorioAtualizado.setNomeLaboratorio("Laboratório Dental Premium Atualizado");

        when(laboratorioService.findById(1L)).thenReturn(Optional.of(laboratorioTeste));
        when(laboratorioService.save(any(Laboratorio.class))).thenReturn(laboratorioAtualizado);

        // When & Then
        mockMvc.perform(put("/laboratorios/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(laboratorioAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nomeLaboratorio").value("Laboratório Dental Premium Atualizado"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarLaboratorioInexistente() throws Exception {
        // Given
        Laboratorio laboratorioAtualizado = new Laboratorio();
        laboratorioAtualizado.setNomeLaboratorio("Laboratório Inexistente");

        when(laboratorioService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/laboratorios/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(laboratorioAtualizado)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarLaboratorio() throws Exception {
        // When & Then
        mockMvc.perform(delete("/laboratorios/1"))
            .andExpect(status().isNoContent());
    }

    // ========== Testes dos endpoints específicos do LaboratorioController ==========

    @Test
    void deveBuscarLaboratorioDoUsuarioAtual() throws Exception {
        // Given
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("protetico@email.com");
        SecurityContextHolder.setContext(securityContext);

        when(proteticoService.findLaboratorioByEmail("protetico@email.com"))
            .thenReturn(Optional.of(laboratorioTeste));

        // When & Then
        mockMvc.perform(get("/laboratorios/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nomeLaboratorio").value("Laboratório Dental Premium"));
    }

    @Test
    void deveRetornarNotFoundQuandoUsuarioNaoAutenticado() throws Exception {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(get("/laboratorios/me"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveRetornarNotFoundQuandoUsuarioNaoEstaAutenticado() throws Exception {
        // Given
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(false);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(get("/laboratorios/me"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveRetornarNotFoundQuandoLaboratorioNaoEncontradoParaUsuario() throws Exception {
        // Given
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("protetico@email.com");
        SecurityContextHolder.setContext(securityContext);

        when(proteticoService.findLaboratorioByEmail("protetico@email.com"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/laboratorios/me"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(laboratorioService.findAll()).thenReturn(listaLaboratorios);

        // When & Then
        mockMvc.perform(get("/laboratorios"))
            .andExpect(status().isOk());
    }
} 