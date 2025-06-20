package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.CategoriaServico;
import com.senac.dentalsync.core.service.CategoriaServicoService;

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

@WebMvcTest(value = CategoriaServicoController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class CategoriaServicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoriaServicoService categoriaServicoService;

    private CategoriaServico categoriaTeste;
    private List<CategoriaServico> listaCategorias;

    @BeforeEach
    void setUp() {
        categoriaTeste = new CategoriaServico();
        categoriaTeste.setId(1L);
        categoriaTeste.setNome("Próteses");
        categoriaTeste.setIsActive(true);

        CategoriaServico categoria2 = new CategoriaServico();
        categoria2.setId(2L);
        categoria2.setNome("Implantes");
        categoria2.setIsActive(true);

        listaCategorias = Arrays.asList(categoriaTeste, categoria2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodasCategorias() throws Exception {
        // Given
        when(categoriaServicoService.findAll()).thenReturn(listaCategorias);

        // When & Then
        mockMvc.perform(get("/categoria-servico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("Próteses"))
            .andExpect(jsonPath("$[1].nome").value("Implantes"));
    }

    @Test
    void deveListarCategoriasPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<CategoriaServico> page = 
            new org.springframework.data.domain.PageImpl<>(listaCategorias);
        when(categoriaServicoService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/categoria-servico/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarCategoriaPorId() throws Exception {
        // Given
        when(categoriaServicoService.findById(1L)).thenReturn(Optional.of(categoriaTeste));

        // When & Then
        mockMvc.perform(get("/categoria-servico/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Próteses"));
    }

    @Test
    void deveRetornarNotFoundQuandoCategoriaNaoEncontradaPorId() throws Exception {
        // Given
        when(categoriaServicoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/categoria-servico/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovaCategoria() throws Exception {
        // Given
        CategoriaServico novaCategoria = new CategoriaServico();
        novaCategoria.setNome("Ortodontia");

        when(categoriaServicoService.save(any(CategoriaServico.class))).thenReturn(categoriaTeste);

        // When & Then
        mockMvc.perform(post("/categoria-servico")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novaCategoria)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Próteses"));
    }

    @Test
    void deveAtualizarCategoriaExistente() throws Exception {
        // Given
        CategoriaServico categoriaAtualizada = new CategoriaServico();
        categoriaAtualizada.setId(1L);
        categoriaAtualizada.setNome("Próteses Atualizadas");

        when(categoriaServicoService.findById(1L)).thenReturn(Optional.of(categoriaTeste));
        when(categoriaServicoService.save(any(CategoriaServico.class))).thenReturn(categoriaAtualizada);

        // When & Then
        mockMvc.perform(put("/categoria-servico/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(categoriaAtualizada)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Próteses Atualizadas"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarCategoriaInexistente() throws Exception {
        // Given
        CategoriaServico categoriaAtualizada = new CategoriaServico();
        categoriaAtualizada.setNome("Categoria Inexistente");

        when(categoriaServicoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/categoria-servico/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(categoriaAtualizada)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarCategoria() throws Exception {
        // When & Then
        mockMvc.perform(delete("/categoria-servico/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(categoriaServicoService.findAll()).thenReturn(listaCategorias);

        // When & Then
        mockMvc.perform(get("/categoria-servico"))
            .andExpect(status().isOk());
    }
} 