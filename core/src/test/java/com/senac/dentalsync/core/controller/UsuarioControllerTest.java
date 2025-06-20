package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.service.UsuarioService;

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

@WebMvcTest(value = UsuarioController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsuarioService usuarioService;

    private Usuario usuarioTeste;
    private List<Usuario> listaUsuarios;

    @BeforeEach
    void setUp() {
        usuarioTeste = new Usuario();
        usuarioTeste.setId(1L);
        usuarioTeste.setEmail("usuario@email.com");
        usuarioTeste.setIsActive(true);

        Usuario usuario2 = new Usuario();
        usuario2.setId(2L);
        usuario2.setEmail("usuario2@email.com");
        usuario2.setIsActive(true);

        listaUsuarios = Arrays.asList(usuarioTeste, usuario2);
    }

    // ========== Testes dos endpoints do BaseController ==========

    @Test
    void deveListarTodosUsuarios() throws Exception {
        // Given
        when(usuarioService.findAll()).thenReturn(listaUsuarios);

        // When & Then
        mockMvc.perform(get("/usuarios"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].email").value("usuario@email.com"))
            .andExpect(jsonPath("$[1].email").value("usuario2@email.com"));
    }

    @Test
    void deveListarUsuariosPaginado() throws Exception {
        // Given
        org.springframework.data.domain.Page<Usuario> page = 
            new org.springframework.data.domain.PageImpl<>(listaUsuarios);
        when(usuarioService.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/usuarios/paginado?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void deveBuscarUsuarioPorId() throws Exception {
        // Given
        when(usuarioService.findById(1L)).thenReturn(Optional.of(usuarioTeste));

        // When & Then
        mockMvc.perform(get("/usuarios/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("usuario@email.com"));
    }

    @Test
    void deveRetornarNotFoundQuandoUsuarioNaoEncontradoPorId() throws Exception {
        // Given
        when(usuarioService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/usuarios/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveCriarNovoUsuario() throws Exception {
        // Given
        Usuario novoUsuario = new Usuario();
        novoUsuario.setEmail("novo@email.com");

        when(usuarioService.save(any(Usuario.class))).thenReturn(usuarioTeste);

        // When & Then
        mockMvc.perform(post("/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoUsuario)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("usuario@email.com"));
    }

    @Test
    void deveAtualizarUsuarioExistente() throws Exception {
        // Given
        Usuario usuarioAtualizado = new Usuario();
        usuarioAtualizado.setId(1L);
        usuarioAtualizado.setEmail("usuario.atualizado@email.com");

        when(usuarioService.findById(1L)).thenReturn(Optional.of(usuarioTeste));
        when(usuarioService.save(any(Usuario.class))).thenReturn(usuarioAtualizado);

        // When & Then
        mockMvc.perform(put("/usuarios/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioAtualizado)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("usuario.atualizado@email.com"));
    }

    @Test
    void deveRetornarNotFoundAoAtualizarUsuarioInexistente() throws Exception {
        // Given
        Usuario usuarioAtualizado = new Usuario();
        usuarioAtualizado.setEmail("inexistente@email.com");

        when(usuarioService.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/usuarios/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioAtualizado)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deveDeletarUsuario() throws Exception {
        // When & Then
        mockMvc.perform(delete("/usuarios/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void deveTestarGetService() throws Exception {
        // Given
        when(usuarioService.findAll()).thenReturn(listaUsuarios);

        // When & Then
        mockMvc.perform(get("/usuarios"))
            .andExpect(status().isOk());
    }
} 