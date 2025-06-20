package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.service.DentistaService;
import com.senac.dentalsync.core.service.PedidoService;
import com.senac.dentalsync.core.dto.HistoricoDentistaDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

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

@WebMvcTest(value = DentistaController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class DentistaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DentistaService dentistaService;

    @MockBean
    private PedidoService pedidoService;

    private Dentista dentistaTeste;
    private List<Dentista> listaDentistas;

    @BeforeEach
    void setUp() {
        dentistaTeste = new Dentista();
        dentistaTeste.setId(1L);
        dentistaTeste.setNome("Dr. João Silva");
        dentistaTeste.setEmail("joao@email.com");
        dentistaTeste.setCro("12345-SP");
        dentistaTeste.setTelefone("(11) 99999-9999");
        dentistaTeste.setIsActive(true);

        Dentista dentista2 = new Dentista();
        dentista2.setId(2L);
        dentista2.setNome("Dra. Maria Santos");
        dentista2.setEmail("maria@email.com");
        dentista2.setCro("67890-SP");
        dentista2.setTelefone("(11) 88888-8888");
        dentista2.setIsActive(true);

        listaDentistas = Arrays.asList(dentistaTeste, dentista2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodosDentistas() throws Exception {
        // Given
        when(dentistaService.findAll()).thenReturn(listaDentistas);

        // When & Then
        mockMvc.perform(get("/dentistas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("Dr. João Silva"))
            .andExpect(jsonPath("$[1].nome").value("Dra. Maria Santos"));
    }

    @Test
    void deveListarDentistasPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Dentista> page = 
            new org.springframework.data.domain.PageImpl<>(listaDentistas);
        when(dentistaService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/dentistas/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarDentistaPorId() throws Exception {
        // Given
        when(dentistaService.findById(1L)).thenReturn(Optional.of(dentistaTeste));

        // When & Then
        mockMvc.perform(get("/dentistas/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Dr. João Silva"));
    }

    @Test
    void deveRetornarNotFoundQuandoDentistaNaoEncontradoPorId() throws Exception {
        // Given
        when(dentistaService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/dentistas/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoDentista() throws Exception {
        // Given
        Dentista novoDentista = new Dentista();
        novoDentista.setNome("Dr. Carlos Oliveira");
        novoDentista.setEmail("carlos@email.com");
        novoDentista.setCro("11111-SP");

        when(dentistaService.save(any(Dentista.class))).thenReturn(dentistaTeste);

        // When & Then
        mockMvc.perform(post("/dentistas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoDentista)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Dr. João Silva"));
    }

    @Test
    void deveAtualizarDentistaExistente() throws Exception {
        // Given
        Dentista dentistaAtualizado = new Dentista();
        dentistaAtualizado.setId(1L);
        dentistaAtualizado.setNome("Dr. João Silva Atualizado");
        dentistaAtualizado.setEmail("joao.atualizado@email.com");

        when(dentistaService.findById(1L)).thenReturn(Optional.of(dentistaTeste));
        when(dentistaService.save(any(Dentista.class))).thenReturn(dentistaAtualizado);

        // When & Then
        mockMvc.perform(put("/dentistas/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dentistaAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Dr. João Silva Atualizado"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarDentistaInexistente() throws Exception {
        // Given
        Dentista dentistaAtualizado = new Dentista();
        dentistaAtualizado.setNome("Dentista Inexistente");

        when(dentistaService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/dentistas/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dentistaAtualizado)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarDentista() throws Exception {
        // When & Then
        mockMvc.perform(delete("/dentistas/1"))
            .andExpect(status().isNoContent());
    }

    // ========== Testes dos endpoints específicos do DentistaController ==========

    @Test
    void deveBuscarDentistaPorEmail() throws Exception {
        // Given
        when(dentistaService.findByEmail("joao@email.com"))
            .thenReturn(Optional.of(dentistaTeste));

        // When & Then
        mockMvc.perform(get("/dentistas/email/joao@email.com"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Dr. João Silva"))
            .andExpect(jsonPath("$.email").value("joao@email.com"));
    }

    @Test
    void deveRetornarNotFoundQuandoDentistaNaoEncontradoPorEmail() throws Exception {
        // Given
        when(dentistaService.findByEmail("inexistente@email.com"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/dentistas/email/inexistente@email.com"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarDentistaPorCro() throws Exception {
        // Given
        when(dentistaService.findByCro("12345-SP"))
            .thenReturn(Optional.of(dentistaTeste));

        // When & Then
        mockMvc.perform(get("/dentistas/cro/12345-SP"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("Dr. João Silva"))
            .andExpect(jsonPath("$.cro").value("12345-SP"));
    }

    @Test
    void deveRetornarNotFoundQuandoDentistaNaoEncontradoPorCro() throws Exception {
        // Given
        when(dentistaService.findByCro("99999-SP"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/dentistas/cro/99999-SP"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarDentistaPorTelefone() throws Exception {
        // Given
        when(dentistaService.findByTelefone("(11) 99999-9999"))
            .thenReturn(Optional.of(dentistaTeste));

        // When & Then
        mockMvc.perform(get("/dentistas/telefone/(11) 99999-9999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.telefone").value("(11) 99999-9999"));
    }

    @Test
    void deveRetornarNotFoundQuandoDentistaNaoEncontradoPorTelefone() throws Exception {
        // Given
        when(dentistaService.findByTelefone("(11) 00000-0000"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/dentistas/telefone/(11) 00000-0000"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveAtualizarStatusDoDentista() throws Exception {
        // Given
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isActive", false);

        Dentista dentistaInativo = new Dentista();
        dentistaInativo.setId(1L);
        dentistaInativo.setNome("Dr. João Silva");
        dentistaInativo.setIsActive(false);

        when(dentistaService.updateStatus(eq(1L), eq(false)))
            .thenReturn(dentistaInativo);

        // When & Then
        mockMvc.perform(patch("/dentistas/1")
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

        when(dentistaService.updateStatus(eq(1L), eq(true)))
            .thenReturn(dentistaTeste);

        // When & Then
        mockMvc.perform(patch("/dentistas/1")
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

        when(dentistaService.updateStatus(eq(999L), eq(false)))
            .thenThrow(new RuntimeException("Dentista não encontrado"));

        // When & Then
        mockMvc.perform(patch("/dentistas/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarHistoricoDoDentista() throws Exception {
        // Given
        HistoricoDentistaDTO historico = new HistoricoDentistaDTO();
        
        when(pedidoService.buscarHistoricoPorDentista(1L))
            .thenReturn(Arrays.asList(historico));

        // When & Then
        mockMvc.perform(get("/dentistas/1/historico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHouverHistoricoDentista() throws Exception {
        // Given
        when(pedidoService.buscarHistoricoPorDentista(1L))
            .thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/dentistas/1/historico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(dentistaService.findAll()).thenReturn(listaDentistas);

        // When & Then
        mockMvc.perform(get("/dentistas"))
            .andExpect(status().isOk());
    }
} 