package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.service.MaterialService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = MaterialController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class MaterialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MaterialService materialService;

    private Material materialTeste;
    private List<Material> listaMateriais;

    @BeforeEach
    void setUp() {
        materialTeste = new Material();
        materialTeste.setId(1L);
        materialTeste.setNome("Resina Composta");
        // materialTeste.setDescricao("Material para restaurações");
        // materialTeste.setPreco(BigDecimal.valueOf(150.00));
        materialTeste.setIsActive(true);

        Material material2 = new Material();
        material2.setId(2L);
        material2.setNome("Amálgama");
        // material2.setDescricao("Material metálico");
        // material2.setPreco(BigDecimal.valueOf(80.00));
        material2.setIsActive(true);

        listaMateriais = Arrays.asList(materialTeste, material2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodosMateriais() throws Exception {
        // Given
        when(materialService.findAll()).thenReturn(listaMateriais);

        // When & Then
        mockMvc.perform(get("/material"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("Resina Composta"))
            .andExpect(jsonPath("$[1].nome").value("Amálgama"));
    }

    @Test
    void deveListarMateriaisPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Material> page = 
            new org.springframework.data.domain.PageImpl<>(listaMateriais);
        when(materialService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/material/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarMaterialPorId() throws Exception {
        // Given
        when(materialService.findById(1L)).thenReturn(Optional.of(materialTeste));

        // When & Then
        mockMvc.perform(get("/material/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Resina Composta"));
    }

    @Test
    void deveRetornarNotFoundQuandoMaterialNaoEncontradoPorId() throws Exception {
        // Given
        when(materialService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/material/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoMaterial() throws Exception {
        // Given
        Material novoMaterial = new Material();
        novoMaterial.setNome("Cerâmica");
        // novoMaterial.setDescricao("Material cerâmico");
        // novoMaterial.setPreco(BigDecimal.valueOf(200.00));

        when(materialService.save(any(Material.class))).thenReturn(materialTeste);

        // When & Then
        mockMvc.perform(post("/material")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoMaterial)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Resina Composta"));
    }

    @Test
    void deveAtualizarMaterialExistente() throws Exception {
        // Given
        Material materialAtualizado = new Material();
        materialAtualizado.setId(1L);
        materialAtualizado.setNome("Resina Composta Atualizada");
        // materialAtualizado.setDescricao("Material atualizado");
        // materialAtualizado.setPreco(BigDecimal.valueOf(180.00));

        when(materialService.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(materialService.save(any(Material.class))).thenReturn(materialAtualizado);

        // When & Then
        mockMvc.perform(put("/material/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(materialAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Resina Composta Atualizada"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarMaterialInexistente() throws Exception {
        // Given
        Material materialAtualizado = new Material();
        materialAtualizado.setNome("Material Inexistente");

        when(materialService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/material/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(materialAtualizado)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarMaterial() throws Exception {
        // When & Then
        mockMvc.perform(delete("/material/1"))
            .andExpect(status().isNoContent());
    }

    // ========== Testes dos endpoints específicos do MaterialController ==========

    @Test
    void deveAtualizarStatusDoMaterial() throws Exception {
        // Given
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isActive", false);

        Material materialInativo = new Material();
        materialInativo.setId(1L);
        materialInativo.setNome("Resina Composta");
        materialInativo.setIsActive(false);

        when(materialService.updateStatus(eq(1L), eq(false)))
            .thenReturn(materialInativo);

        // When & Then
        mockMvc.perform(patch("/material/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    void deveAtualizarStatusParaAtivo() throws Exception {
        // Given
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isActive", true);

        when(materialService.updateStatus(eq(1L), eq(true)))
            .thenReturn(materialTeste);

        // When & Then
        mockMvc.perform(patch("/material/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    void deveRetornarNotFoundQuandoOcorrerExcecaoNoUpdateStatus() throws Exception {
        // Given
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isActive", false);

        when(materialService.updateStatus(eq(999L), eq(false)))
            .thenThrow(new RuntimeException("Material não encontrado"));

        // When & Then
        mockMvc.perform(patch("/material/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(materialService.findAll()).thenReturn(listaMateriais);

        // When & Then
        mockMvc.perform(get("/material"))
            .andExpect(status().isOk());
    }
} 