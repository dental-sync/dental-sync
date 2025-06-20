package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.service.PacienteService;
import com.senac.dentalsync.core.service.PedidoService;
import com.senac.dentalsync.core.dto.HistoricoPacienteDTO;

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
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(value = PacienteController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class PacienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PacienteService pacienteService;

    @MockBean
    private PedidoService pedidoService;

    private Paciente pacienteTeste;
    private List<Paciente> listaPacientes;



    @BeforeEach
    void setUp() {
        pacienteTeste = new Paciente();
        pacienteTeste.setId(1L);
        pacienteTeste.setNome("João Silva");
        pacienteTeste.setEmail("joao@email.com");
        pacienteTeste.setTelefone("(11) 99999-9999");
        pacienteTeste.setIsActive(true);

        Paciente paciente2 = new Paciente();
        paciente2.setId(2L);
        paciente2.setNome("Maria Santos");
        paciente2.setEmail("maria@email.com");
        paciente2.setTelefone("(11) 88888-8888");
        paciente2.setIsActive(true);

        listaPacientes = Arrays.asList(pacienteTeste, paciente2);
    }

    @Test
    void deveBuscarPacientePorEmail() throws Exception {
        // Given
        when(pacienteService.findByEmail("joao@email.com"))
            .thenReturn(Optional.of(pacienteTeste));

        // When & Then
        mockMvc.perform(get("/paciente/email/joao@email.com"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Silva"))
            .andExpect(jsonPath("$.email").value("joao@email.com"));
    }

    @Test
    void deveRetornarNotFoundQuandoPacienteNaoEncontradoPorEmail() throws Exception {
        // Given
        when(pacienteService.findByEmail("inexistente@email.com"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/paciente/email/inexistente@email.com"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarPacientePorId() throws Exception {
        // Given
        when(pacienteService.findById(1L)).thenReturn(Optional.of(pacienteTeste));

        // When & Then
        mockMvc.perform(get("/paciente/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Silva"));
    }

    @Test
    void deveAtualizarStatusDoPaciente() throws Exception {
        // Given
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isActive", false);

        when(pacienteService.updateStatus(eq(1L), eq(false)))
            .thenReturn(pacienteTeste);

        // When & Then
        mockMvc.perform(patch("/paciente/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Silva"));
    }

    @Test
    void deveBuscarHistoricoDoPaciente() throws Exception {
        // Given
        HistoricoPacienteDTO historico = new HistoricoPacienteDTO();
        
        when(pedidoService.buscarHistoricoPorPaciente(1L))
            .thenReturn(Arrays.asList(historico));

        // When & Then
        mockMvc.perform(get("/paciente/1/historico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveListarTodosPacientes() throws Exception {
        // Given
        when(pacienteService.findAll()).thenReturn(listaPacientes);

        // When & Then
        mockMvc.perform(get("/paciente"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarPacientesPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Paciente> page = 
            new org.springframework.data.domain.PageImpl<>(listaPacientes);
        when(pacienteService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/paciente/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveRetornarNotFoundQuandoPacienteNaoEncontradoPorId() throws Exception {
        // Given
        when(pacienteService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/paciente/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoPaciente() throws Exception {
        // Given
        Paciente novoPaciente = new Paciente();
        novoPaciente.setNome("Carlos Oliveira");
        novoPaciente.setEmail("carlos@email.com");
        novoPaciente.setTelefone("(11) 77777-7777");

        when(pacienteService.save(any(Paciente.class))).thenReturn(pacienteTeste);

        // When & Then
        mockMvc.perform(post("/paciente")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoPaciente)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Silva"));
    }

    @Test
    void deveAtualizarPacienteExistente() throws Exception {
        // Given
        Paciente pacienteAtualizado = new Paciente();
        pacienteAtualizado.setId(1L);
        pacienteAtualizado.setNome("João Silva Atualizado");
        pacienteAtualizado.setEmail("joao.atualizado@email.com");
        pacienteAtualizado.setTelefone("(11) 99999-9999");

        when(pacienteService.findById(1L)).thenReturn(Optional.of(pacienteTeste));
        when(pacienteService.save(any(Paciente.class))).thenReturn(pacienteAtualizado);

        // When & Then
        mockMvc.perform(put("/paciente/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pacienteAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("João Silva Atualizado"))
            .andExpect(jsonPath("$.email").value("joao.atualizado@email.com"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarPacienteInexistente() throws Exception {
        // Given
        Paciente pacienteAtualizado = new Paciente();
        pacienteAtualizado.setNome("Paciente Inexistente");

        when(pacienteService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/paciente/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pacienteAtualizado)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarPaciente() throws Exception {
        // When & Then
        mockMvc.perform(delete("/paciente/1"))
            .andExpect(status().isNoContent());
    }

    // ========== Testes dos endpoints específicos do PacienteController ==========

    @Test
    void deveBuscarPacientePorNome() throws Exception {
        // Given
        when(pacienteService.findByNome("João Silva"))
            .thenReturn(Optional.of(pacienteTeste));

        // When & Then
        mockMvc.perform(get("/paciente/nome/João Silva"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Silva"));
    }

    @Test
    void deveRetornarNotFoundQuandoPacienteNaoEncontradoPorNome() throws Exception {
        // Given
        when(pacienteService.findByNome("Nome Inexistente"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/paciente/nome/Nome Inexistente"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarPacientePorTelefone() throws Exception {
        // Given
        when(pacienteService.findByTelefone("(11) 99999-9999"))
            .thenReturn(Optional.of(pacienteTeste));

        // When & Then
        mockMvc.perform(get("/paciente/telefone/(11) 99999-9999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.telefone").value("(11) 99999-9999"));
    }

    @Test
    void deveRetornarNotFoundQuandoPacienteNaoEncontradoPorTelefone() throws Exception {
        // Given
        when(pacienteService.findByTelefone("(11) 00000-0000"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/paciente/telefone/(11) 00000-0000"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveExcluirPaciente() throws Exception {
        // When & Then
        mockMvc.perform(delete("/paciente/excluir/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isMap());
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHouverHistorico() throws Exception {
        // Given
        when(pedidoService.buscarHistoricoPorPaciente(1L))
            .thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/paciente/1/historico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(0));
    }

    // ========== Testes de validação e casos extremos ==========

    @Test
    void deveAtualizarStatusParaInativo() throws Exception {
        // Given
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isActive", false);
        
        Paciente pacienteInativo = new Paciente();
        pacienteInativo.setId(1L);
        pacienteInativo.setNome("João Silva");
        pacienteInativo.setIsActive(false);

        when(pacienteService.updateStatus(eq(1L), eq(false)))
            .thenReturn(pacienteInativo);

        // When & Then
        mockMvc.perform(patch("/paciente/1")
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

        when(pacienteService.updateStatus(eq(1L), eq(true)))
            .thenReturn(pacienteTeste);

        // When & Then
        mockMvc.perform(patch("/paciente/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Este teste garante que o método getService() é coberto
        // Já é testado indiretamente pelos outros testes, mas vamos garantir
        when(pacienteService.findAll()).thenReturn(listaPacientes);

        mockMvc.perform(get("/paciente"))
            .andExpect(status().isOk());
    }
} 