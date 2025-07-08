package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.CategoriaMaterial;
import com.senac.dentalsync.core.service.CategoriaMaterialService;

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

@WebMvcTest(value = CategoriaMaterialController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class CategoriaMaterialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoriaMaterialService categoriaMaterialService;

    private CategoriaMaterial categoriaTeste;
    private List<CategoriaMaterial> listaCategorias;

    @BeforeEach
    void setUp() {
        categoriaTeste = new CategoriaMaterial();
        categoriaTeste.setId(1L);
        categoriaTeste.setNome("Resinas");
        categoriaTeste.setIsActive(true);

        CategoriaMaterial categoria2 = new CategoriaMaterial();
        categoria2.setId(2L);
        categoria2.setNome("Metais");
        categoria2.setIsActive(true);

        listaCategorias = Arrays.asList(categoriaTeste, categoria2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodasCategorias() throws Exception {
        // Given
        when(categoriaMaterialService.findAll()).thenReturn(listaCategorias);

        // When & Then
        mockMvc.perform(get("/categoria-material"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("Resinas"))
            .andExpect(jsonPath("$[1].nome").value("Metais"));
    }

    @Test
    void deveListarCategoriasPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<CategoriaMaterial> page = 
            new org.springframework.data.domain.PageImpl<>(listaCategorias);
        when(categoriaMaterialService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/categoria-material/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarCategoriaPorId() throws Exception {
        // Given
        when(categoriaMaterialService.findById(1L)).thenReturn(Optional.of(categoriaTeste));

        // When & Then
        mockMvc.perform(get("/categoria-material/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Resinas"));
    }

    @Test
    void deveRetornarNotFoundQuandoCategoriaNaoEncontradaPorId() throws Exception {
        // Given
        when(categoriaMaterialService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/categoria-material/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovaCategoria() throws Exception {
        // Given
        CategoriaMaterial novaCategoria = new CategoriaMaterial();
        novaCategoria.setNome("Cerâmicas");

        when(categoriaMaterialService.save(any(CategoriaMaterial.class))).thenReturn(categoriaTeste);

        // When & Then
        mockMvc.perform(post("/categoria-material")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novaCategoria)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Resinas"));
    }

    @Test
    void deveAtualizarCategoriaExistente() throws Exception {
        // Given
        CategoriaMaterial categoriaAtualizada = new CategoriaMaterial();
        categoriaAtualizada.setId(1L);
        categoriaAtualizada.setNome("Resinas Atualizadas");

        when(categoriaMaterialService.findById(1L)).thenReturn(Optional.of(categoriaTeste));
        when(categoriaMaterialService.save(any(CategoriaMaterial.class))).thenReturn(categoriaAtualizada);

        // When & Then
        mockMvc.perform(put("/categoria-material/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(categoriaAtualizada)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Resinas Atualizadas"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarCategoriaInexistente() throws Exception {
        // Given
        CategoriaMaterial categoriaAtualizada = new CategoriaMaterial();
        categoriaAtualizada.setNome("Categoria Inexistente");

        when(categoriaMaterialService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/categoria-material/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(categoriaAtualizada)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarCategoria() throws Exception {
        // When & Then
        mockMvc.perform(delete("/categoria-material/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(categoriaMaterialService.findAll()).thenReturn(listaCategorias);

        // When & Then
        mockMvc.perform(get("/categoria-material"))
            .andExpect(status().isOk());
    }
} 