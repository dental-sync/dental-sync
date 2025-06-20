package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.service.PedidoService;
import com.senac.dentalsync.core.dto.HistoricoProteticoDTO;

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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ProteticoController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class ProteticoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProteticoService proteticoService;

    @MockBean
    private PedidoService pedidoService;

    private Protetico proteticoTeste;
    private List<Protetico> listaProteticos;

    @BeforeEach
    void setUp() {
        proteticoTeste = new Protetico();
        proteticoTeste.setId(1L);
        proteticoTeste.setNome("João Protético");
        proteticoTeste.setEmail("joao@protetico.com");
        proteticoTeste.setCro("12345-SP");
        proteticoTeste.setIsActive(true);

        Protetico protetico2 = new Protetico();
        protetico2.setId(2L);
        protetico2.setNome("Maria Protético");
        protetico2.setEmail("maria@protetico.com");
        protetico2.setCro("67890-SP");
        protetico2.setIsActive(true);

        listaProteticos = Arrays.asList(proteticoTeste, protetico2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodosProteticos() throws Exception {
        // Given
        when(proteticoService.findAll()).thenReturn(listaProteticos);

        // When & Then
        mockMvc.perform(get("/proteticos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nome").value("João Protético"))
            .andExpect(jsonPath("$[1].nome").value("Maria Protético"));
    }

    @Test
    void deveListarProteticosPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Protetico> page = 
            new org.springframework.data.domain.PageImpl<>(listaProteticos);
        when(proteticoService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/proteticos/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarProteticoPorId() throws Exception {
        // Given
        when(proteticoService.findById(1L)).thenReturn(Optional.of(proteticoTeste));

        // When & Then
        mockMvc.perform(get("/proteticos/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Protético"));
    }

    @Test
    void deveRetornarNotFoundQuandoProteticoNaoEncontradoPorId() throws Exception {
        // Given
        when(proteticoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/proteticos/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoProtetico() throws Exception {
        // Given
        Protetico novoProtetico = new Protetico();
        novoProtetico.setNome("Carlos Protético");
        novoProtetico.setEmail("carlos@protetico.com");
        novoProtetico.setCro("11111-SP");

        when(proteticoService.save(any(Protetico.class))).thenReturn(proteticoTeste);

        // When & Then
        mockMvc.perform(post("/proteticos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoProtetico)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Protético"));
    }

    @Test
    void deveAtualizarProteticoExistente() throws Exception {
        // Given
        Protetico proteticoAtualizado = new Protetico();
        proteticoAtualizado.setId(1L);
        proteticoAtualizado.setNome("João Protético Atualizado");
        proteticoAtualizado.setEmail("joao.atualizado@protetico.com");

        when(proteticoService.findById(1L)).thenReturn(Optional.of(proteticoTeste));
        when(proteticoService.save(any(Protetico.class))).thenReturn(proteticoAtualizado);

        // When & Then
        mockMvc.perform(put("/proteticos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(proteticoAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("João Protético Atualizado"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarProteticoInexistente() throws Exception {
        // Given
        Protetico proteticoAtualizado = new Protetico();
        proteticoAtualizado.setNome("Protético Inexistente");

        when(proteticoService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/proteticos/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(proteticoAtualizado)))
            .andExpect(status().isNotFound());
    }

    // ========== Testes dos endpoints específicos do ProteticoController ==========

    @Test
    void deveBuscarProteticoUsuarioAtual() throws Exception {
        // Given
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("joao@protetico.com");
        SecurityContextHolder.setContext(securityContext);

        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));

        // When & Then
        mockMvc.perform(get("/proteticos/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("João Protético"));
    }

    @Test
    void deveRetornarNotFoundQuandoUsuarioNaoAutenticado() throws Exception {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(get("/proteticos/me"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarProteticoPorEmail() throws Exception {
        // Given
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));

        // When & Then
        mockMvc.perform(get("/proteticos/email/joao@protetico.com"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("joao@protetico.com"));
    }

    @Test
    void deveRetornarNotFoundQuandoProteticoNaoEncontradoPorEmail() throws Exception {
        // Given
        when(proteticoService.findByEmail("inexistente@protetico.com"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/proteticos/email/inexistente@protetico.com"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveBuscarProteticoPorCro() throws Exception {
        // Given
        when(proteticoService.findByCro("12345-SP"))
            .thenReturn(Optional.of(proteticoTeste));

        // When & Then
        mockMvc.perform(get("/proteticos/cro/12345-SP"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.cro").value("12345-SP"));
    }

    @Test
    void deveRetornarNotFoundQuandoProteticoNaoEncontradoPorCro() throws Exception {
        // Given
        when(proteticoService.findByCro("99999-SP"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/proteticos/cro/99999-SP"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveAtualizarStatusDoProtetico() throws Exception {
        // Given
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isActive", false);

        Protetico proteticoInativo = new Protetico();
        proteticoInativo.setId(1L);
        proteticoInativo.setNome("João Protético");
        proteticoInativo.setIsActive(false);

        when(proteticoService.updateStatus(eq(1L), eq(false)))
            .thenReturn(proteticoInativo);

        // When & Then
        mockMvc.perform(patch("/proteticos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    void deveRetornarBadRequestQuandoIsActiveForNull() throws Exception {
        // Given
        Map<String, String> statusUpdate = new HashMap<>();
        statusUpdate.put("status", "invalid");

        // When & Then
        mockMvc.perform(patch("/proteticos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void deveDeletarProteticoUsandoMetodoEspecifico() throws Exception {
        // Given
        doNothing().when(proteticoService).deleteProtetico(1L);

        // When & Then
        mockMvc.perform(delete("/proteticos/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void deveBuscarHistoricoDoProtetico() throws Exception {
        // Given
        HistoricoProteticoDTO historico = new HistoricoProteticoDTO();
        
        when(pedidoService.buscarHistoricoPorProtetico(1L))
            .thenReturn(Arrays.asList(historico));

        // When & Then
        mockMvc.perform(get("/proteticos/1/historico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHouverHistoricoProtetico() throws Exception {
        // Given
        when(pedidoService.buscarHistoricoPorProtetico(1L))
            .thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/proteticos/1/historico"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(proteticoService.findAll()).thenReturn(listaProteticos);

        // When & Then
        mockMvc.perform(get("/proteticos"))
            .andExpect(status().isOk());
    }
} 