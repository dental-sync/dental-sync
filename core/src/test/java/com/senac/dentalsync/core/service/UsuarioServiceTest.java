package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuarioTeste;

    @BeforeEach
    void setUp() {
        // Configura o usuário de teste
        usuarioTeste = new Usuario();
        usuarioTeste.setId(1L);
        usuarioTeste.setName("João Silva");
        usuarioTeste.setEmail("joao.silva@email.com");
        usuarioTeste.setPassword("senha123");
        usuarioTeste.setRole("ADMIN");
        usuarioTeste.setIsActive(true);
        usuarioTeste.setCreatedAt(LocalDateTime.now());
        usuarioTeste.setUpdatedAt(LocalDateTime.now());
    }

    // Testes do método save() herdado do BaseService
    @Test
    void deveSalvarNovoUsuario() {
        // given
        Usuario novoUsuario = new Usuario();
        novoUsuario.setName("Maria Santos");
        novoUsuario.setEmail("maria.santos@email.com");
        novoUsuario.setPassword("senha456");
        novoUsuario.setRole("USER");

        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioTeste);

        // when
        Usuario usuarioSalvo = usuarioService.save(novoUsuario);

        // then
        assertThat(usuarioSalvo).isNotNull();
        assertThat(usuarioSalvo.getId()).isEqualTo(usuarioTeste.getId());
        assertThat(novoUsuario.getIsActive()).isTrue(); // BaseService define como true para novos registros
        assertThat(novoUsuario.getCreatedAt()).isNotNull(); // BaseService define a data de criação
        assertThat(novoUsuario.getUpdatedAt()).isNotNull(); // BaseService define a data de atualização
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void deveAtualizarUsuarioExistente() {
        // given
        usuarioTeste.setName("João Silva Atualizado");
        usuarioTeste.setEmail("joao.atualizado@email.com");
        
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioTeste);

        // when
        Usuario usuarioAtualizado = usuarioService.save(usuarioTeste);

        // then
        assertThat(usuarioAtualizado.getName()).isEqualTo("João Silva Atualizado");
        assertThat(usuarioAtualizado.getEmail()).isEqualTo("joao.atualizado@email.com");
        assertThat(usuarioAtualizado.getUpdatedAt()).isNotNull(); // BaseService atualiza a data
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    // Testes do método findById() herdado do BaseService
    @Test
    void deveBuscarUsuarioPorId() {
        // given
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioTeste));

        // when
        Optional<Usuario> usuarioEncontrado = usuarioService.findById(1L);

        // then
        assertThat(usuarioEncontrado).isPresent();
        assertThat(usuarioEncontrado.get().getName()).isEqualTo(usuarioTeste.getName());
        assertThat(usuarioEncontrado.get().getEmail()).isEqualTo(usuarioTeste.getEmail());
        verify(usuarioRepository, times(1)).findById(1L);
    }

    @Test
    void deveRetornarVazioQuandoUsuarioNaoEncontradoPorId() {
        // given
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        // when
        Optional<Usuario> usuarioEncontrado = usuarioService.findById(999L);

        // then
        assertThat(usuarioEncontrado).isEmpty();
        verify(usuarioRepository, times(1)).findById(999L);
    }

    // Testes do método findAll() herdado do BaseService
    @Test
    void deveListarTodosUsuarios() {
        // given
        Usuario outroUsuario = new Usuario();
        outroUsuario.setId(2L);
        outroUsuario.setName("Ana Costa");
        outroUsuario.setEmail("ana.costa@email.com");
        outroUsuario.setPassword("senha789");
        outroUsuario.setRole("USER");
        outroUsuario.setIsActive(true);

        when(usuarioRepository.findAll()).thenReturn(Arrays.asList(usuarioTeste, outroUsuario));

        // when
        List<Usuario> usuarios = usuarioService.findAll();

        // then
        assertThat(usuarios).hasSize(2);
        assertThat(usuarios.get(0).getName()).isEqualTo(usuarioTeste.getName());
        assertThat(usuarios.get(1).getName()).isEqualTo(outroUsuario.getName());
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHaUsuarios() {
        // given
        when(usuarioRepository.findAll()).thenReturn(Arrays.asList());

        // when
        List<Usuario> usuarios = usuarioService.findAll();

        // then
        assertThat(usuarios).isEmpty();
        verify(usuarioRepository, times(1)).findAll();
    }

    // Testes do método findAll(Pageable) herdado do BaseService
    @Test
    void deveListarUsuariosComPaginacao() {
        // given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Usuario> pageUsuarios = new PageImpl<>(Arrays.asList(usuarioTeste));
        
        when(usuarioRepository.findAll(pageable)).thenReturn(pageUsuarios);

        // when
        Page<Usuario> resultado = usuarioService.findAll(pageable);

        // then
        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).getName()).isEqualTo(usuarioTeste.getName());
        verify(usuarioRepository, times(1)).findAll(pageable);
    }

    // Testes do método delete() herdado do BaseService
    @Test
    void deveDeletarUsuario() {
        // given
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioTeste));

        // when
        usuarioService.delete(1L);

        // then
        verify(usuarioRepository, times(1)).findById(1L);
        verify(usuarioRepository, times(1)).delete(usuarioTeste);
    }

    @Test
    void naoDeveDeletarUsuarioInexistente() {
        // given
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        // when
        usuarioService.delete(999L);

        // then
        verify(usuarioRepository, times(1)).findById(999L);
        verify(usuarioRepository, never()).delete(any(Usuario.class));
    }

    // Testes dos métodos específicos do UsuarioService
    @Test
    void deveRetornarRepositorioCorreto() {
        // when
        var repository = usuarioService.getRepository();

        // then
        assertThat(repository).isEqualTo(usuarioRepository);
    }

    @Test
    void deveRetornarNullParaUsuarioLogado() {
        // when
        Usuario usuarioLogado = usuarioService.getUsuarioLogado();

        // then
        assertThat(usuarioLogado).isNull();
    }

    // Testes de validação de comportamento do BaseService
    @Test
    void deveDefinirCamposObrigatoriosAoSalvarNovoUsuario() {
        // given
        Usuario novoUsuario = new Usuario();
        novoUsuario.setName("Teste");
        novoUsuario.setEmail("teste@email.com");
        novoUsuario.setPassword("senha");
        novoUsuario.setRole("USER");

        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuario = invocation.getArgument(0);
            usuario.setId(1L);
            return usuario;
        });

        // when
        Usuario usuarioSalvo = usuarioService.save(novoUsuario);

        // then
        assertThat(novoUsuario.getCreatedAt()).isNotNull();
        assertThat(novoUsuario.getUpdatedAt()).isNotNull();
        assertThat(novoUsuario.getIsActive()).isTrue();
        assertThat(novoUsuario.getCreatedBy()).isNull(); // UsuarioService retorna null para getUsuarioLogado
        assertThat(novoUsuario.getUpdatedBy()).isNull(); // UsuarioService retorna null para getUsuarioLogado
        verify(usuarioRepository, times(1)).save(novoUsuario);
    }

    @Test
    void deveAtualizarCamposObrigatoriosAoSalvarUsuarioExistente() {
        // given
        usuarioTeste.setName("Nome Atualizado");
        LocalDateTime updatedAtAnterior = usuarioTeste.getUpdatedAt();

        // Simula um pequeno atraso para garantir que updatedAt seja diferente
        try {
            Thread.sleep(1);
        } catch (InterruptedException e) {
            // ignore
        }

        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        usuarioService.save(usuarioTeste);

        // then
        assertThat(usuarioTeste.getUpdatedAt()).isAfter(updatedAtAnterior);
        assertThat(usuarioTeste.getUpdatedBy()).isNull(); // UsuarioService retorna null para getUsuarioLogado
        verify(usuarioRepository, times(1)).save(usuarioTeste);
    }

    // Teste de integração com outros services
    @Test
    void deveSerUtilizadoPorOutrosServices() {
        // Este teste verifica que o UsuarioService pode ser injetado corretamente
        // em outros services que dependem dele
        
        // when/then
        assertThat(usuarioService).isNotNull();
        assertThat(usuarioService.getUsuarioLogado()).isNull();
        assertThat(usuarioService.getRepository()).isEqualTo(usuarioRepository);
    }
} 