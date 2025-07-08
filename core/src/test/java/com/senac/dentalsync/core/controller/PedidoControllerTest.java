package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.PedidoService;
import com.senac.dentalsync.core.service.DentistaService;
import com.senac.dentalsync.core.service.PacienteService;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.dto.AtualizarStatusPedidoDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = PedidoController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class PedidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PedidoService pedidoService;

    @MockBean
    private DentistaService dentistaService;

    @MockBean
    private PacienteService pacienteService;

    @MockBean
    private ProteticoService proteticoService;

    private Pedido pedidoTeste;
    private List<Pedido> listaPedidos;
    private Dentista dentistaTeste;
    private Paciente pacienteTeste;
    private Protetico proteticoTeste;

    @BeforeEach
    void setUp() {
        pedidoTeste = new Pedido();
        pedidoTeste.setId(1L);
        pedidoTeste.setObservacao("Prótese Total Superior");
        pedidoTeste.setStatus(Pedido.Status.PENDENTE);
        pedidoTeste.setPrioridade(Pedido.Prioridade.MEDIA);
        pedidoTeste.setDataEntrega(LocalDate.now().plusDays(7));

        Pedido pedido2 = new Pedido();
        pedido2.setId(2L);
        pedido2.setObservacao("Implante Dentário");
        pedido2.setStatus(Pedido.Status.EM_ANDAMENTO);
        pedido2.setPrioridade(Pedido.Prioridade.ALTA);

        listaPedidos = Arrays.asList(pedidoTeste, pedido2);

        // Entidades relacionadas
        dentistaTeste = new Dentista();
        dentistaTeste.setId(1L);
        dentistaTeste.setNome("Dr. João Silva");

        pacienteTeste = new Paciente();
        pacienteTeste.setId(1L);
        pacienteTeste.setNome("Maria Santos");

        proteticoTeste = new Protetico();
        proteticoTeste.setId(1L);
        proteticoTeste.setNome("Carlos Protético");
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodosPedidos() throws Exception {
        // Given
        when(pedidoService.findAll()).thenReturn(listaPedidos);

        // When & Then
        mockMvc.perform(get("/pedidos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].observacao").value("Prótese Total Superior"))
            .andExpect(jsonPath("$[1].observacao").value("Implante Dentário"));
    }

    @Test
    void deveListarPedidosPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Pedido> page = 
            new org.springframework.data.domain.PageImpl<>(listaPedidos);
        when(pedidoService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/pedidos/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarPedidoPorId() throws Exception {
        // Given
        when(pedidoService.findById(1L)).thenReturn(Optional.of(pedidoTeste));

        // When & Then
        mockMvc.perform(get("/pedidos/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.observacao").value("Prótese Total Superior"));
    }

    @Test
    void deveRetornarNotFoundQuandoPedidoNaoEncontradoPorId() throws Exception {
        // Given
        when(pedidoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/pedidos/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoPedido() throws Exception {
        // Given
        Pedido novoPedido = new Pedido();
        novoPedido.setObservacao("Nova Prótese");

        when(pedidoService.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // When & Then
        mockMvc.perform(post("/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoPedido)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.observacao").value("Prótese Total Superior"));
    }

    @Test
    void deveAtualizarPedidoExistente() throws Exception {
        // Given
        Pedido pedidoAtualizado = new Pedido();
        pedidoAtualizado.setId(1L);
        pedidoAtualizado.setObservacao("Prótese Total Superior Atualizada");

        when(pedidoService.findById(1L)).thenReturn(Optional.of(pedidoTeste));
        when(pedidoService.save(any(Pedido.class))).thenReturn(pedidoAtualizado);

        // When & Then
        mockMvc.perform(put("/pedidos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pedidoAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.observacao").value("Prótese Total Superior Atualizada"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarPedidoInexistente() throws Exception {
        // Given
        Pedido pedidoAtualizado = new Pedido();
        pedidoAtualizado.setObservacao("Pedido Inexistente");

        when(pedidoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/pedidos/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pedidoAtualizado)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarPedido() throws Exception {
        // When & Then
        mockMvc.perform(delete("/pedidos/1"))
            .andExpect(status().isNoContent());
    }

    // ========== Testes dos endpoints específicos do PedidoController ==========

    @Test
    void deveBuscarPedidosPorDentista() throws Exception {
        // Given
        when(dentistaService.findById(1L)).thenReturn(Optional.of(dentistaTeste));
        when(pedidoService.findByDentista(dentistaTeste)).thenReturn(listaPedidos);

        // When & Then
        mockMvc.perform(get("/pedidos/dentista/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void deveRetornarNotFoundQuandoDentistaNaoEncontrado() throws Exception {
        // Given
        when(dentistaService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/pedidos/dentista/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarPedidosPorCliente() throws Exception {
        // Given
        when(pacienteService.findById(1L)).thenReturn(Optional.of(pacienteTeste));
        when(pedidoService.findByCliente(pacienteTeste)).thenReturn(listaPedidos);

        // When & Then
        mockMvc.perform(get("/pedidos/cliente/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void deveRetornarNotFoundQuandoClienteNaoEncontrado() throws Exception {
        // Given
        when(pacienteService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/pedidos/cliente/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarPedidosPorProtetico() throws Exception {
        // Given
        when(proteticoService.findById(1L)).thenReturn(Optional.of(proteticoTeste));
        when(pedidoService.findByProtetico(proteticoTeste)).thenReturn(listaPedidos);

        // When & Then
        mockMvc.perform(get("/pedidos/protetico/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void deveRetornarNotFoundQuandoProteticoNaoEncontrado() throws Exception {
        // Given
        when(proteticoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/pedidos/protetico/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarPedidosPorDataEntrega() throws Exception {
        // Given
        LocalDate dataEntrega = LocalDate.of(2024, 12, 25);
        when(pedidoService.findByDataEntrega(dataEntrega)).thenReturn(listaPedidos);

        // When & Then
        mockMvc.perform(get("/pedidos/data-entrega?dataEntrega=2024-12-25"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void deveBuscarPedidosPorPrioridade() throws Exception {
        // Given
        when(pedidoService.findByPrioridade(Pedido.Prioridade.ALTA)).thenReturn(listaPedidos);

        // When & Then
        mockMvc.perform(get("/pedidos/prioridade/ALTA"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void deveAtualizarStatusDoPedido() throws Exception {
        // Given
        AtualizarStatusPedidoDTO dto = new AtualizarStatusPedidoDTO();
        dto.setStatus(Pedido.Status.CONCLUIDO);

        when(pedidoService.findById(1L)).thenReturn(Optional.of(pedidoTeste));
        when(pedidoService.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // When & Then
        mockMvc.perform(patch("/pedidos/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk());
    }

    @Test
    void deveRetornarNotFoundAoAtualizarStatusDePedidoInexistente() throws Exception {
        // Given
        AtualizarStatusPedidoDTO dto = new AtualizarStatusPedidoDTO();
        dto.setStatus(Pedido.Status.CONCLUIDO);

        when(pedidoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(patch("/pedidos/999/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(pedidoService.findAll()).thenReturn(listaPedidos);

        // When & Then
        mockMvc.perform(get("/pedidos"))
            .andExpect(status().isOk());
    }
} 