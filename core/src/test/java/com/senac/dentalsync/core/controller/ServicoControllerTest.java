package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.service.ServicoService;

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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ServicoController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class ServicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServicoService servicoService;

    private Servico servicoTeste;
    private List<Servico> listaServicos;

    @BeforeEach
    void setUp() {
        servicoTeste = new Servico();
        servicoTeste.setId(1L);
        servicoTeste.setNome("Prótese Total");
        servicoTeste.setIsActive(true);

        Servico servico2 = new Servico();
        servico2.setId(2L);
        servico2.setNome("Implante Dentário");
        servico2.setIsActive(true);

        listaServicos = Arrays.asList(servicoTeste, servico2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodosServicos() throws Exception {
        // Given
        when(servicoService.findAll()).thenReturn(listaServicos);

        // When & Then
        mockMvc.perform(get("/servico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("Prótese Total"))
            .andExpect(jsonPath("$[1].nome").value("Implante Dentário"));
    }

    @Test
    void deveListarServicosPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Servico> page = 
            new org.springframework.data.domain.PageImpl<>(listaServicos);
        when(servicoService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/servico/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarServicoPorId() throws Exception {
        // Given
        when(servicoService.findById(1L)).thenReturn(Optional.of(servicoTeste));

        // When & Then
        mockMvc.perform(get("/servico/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Prótese Total"));
    }

    @Test
    void deveRetornarNotFoundQuandoServicoNaoEncontradoPorId() throws Exception {
        // Given
        when(servicoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/servico/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoServico() throws Exception {
        // Given
        Servico novoServico = new Servico();
        novoServico.setNome("Ortodontia");

        when(servicoService.save(any(Servico.class))).thenReturn(servicoTeste);

        // When & Then
        mockMvc.perform(post("/servico")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoServico)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Prótese Total"));
    }

    @Test
    void deveAtualizarServicoExistente() throws Exception {
        // Given
        Servico servicoAtualizado = new Servico();
        servicoAtualizado.setId(1L);
        servicoAtualizado.setNome("Prótese Total Atualizada");

        when(servicoService.updateServico(any(Servico.class), eq(1L)))
            .thenReturn(servicoAtualizado);

        // When & Then
        mockMvc.perform(put("/servico/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(servicoAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Prótese Total Atualizada"));
    }

    @Test
    void deveDeletarServico() throws Exception {
        // When & Then
        mockMvc.perform(delete("/servico/1"))
            .andExpect(status().isNoContent());
    }

    // ========== Testes dos endpoints específicos do ServicoController ==========

    @Test
    void deveRecalcularValoresDeServicoEspecifico() throws Exception {
        // Given
        Servico servicoRecalculado = new Servico();
        servicoRecalculado.setId(1L);
        servicoRecalculado.setNome("Prótese Total");

        when(servicoService.recalcularValores(1L)).thenReturn(servicoRecalculado);

        // When & Then
        mockMvc.perform(post("/servico/1/recalcular-valores"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Prótese Total"));
    }

    @Test
    void deveRecalcularValoresDeTodosOsServicos() throws Exception {
        // Given
        doNothing().when(servicoService).recalcularTodosOsValores();

        // When & Then
        mockMvc.perform(post("/servico/recalcular-todos-valores"))
            .andExpect(status().isOk())
            .andExpect(content().string("Valores recalculados com sucesso para todos os serviços"));
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(servicoService.findAll()).thenReturn(listaServicos);

        // When & Then
        mockMvc.perform(get("/servico"))
            .andExpect(status().isOk());
    }
} 