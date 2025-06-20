package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.CategoriaServico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.CategoriaServicoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class CategoriaServicoServiceTest {

    @Mock
    private CategoriaServicoRepository categoriaServicoRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private CategoriaServicoService categoriaServicoService;

    private CategoriaServico categoriaTeste;
    private Usuario usuarioLogado;

    @BeforeEach
    void setUp() {
        // Configura o usuário logado
        usuarioLogado = new Usuario();
        usuarioLogado.setId(1L);
        usuarioLogado.setName("Usuario Teste");
        usuarioLogado.setEmail("usuario@teste.com");
        
        // Configura o mock do usuarioService para sempre retornar o usuário logado
        lenient().when(usuarioService.getUsuarioLogado()).thenReturn(usuarioLogado);

        // Configura a categoria de teste
        categoriaTeste = new CategoriaServico();
        categoriaTeste.setId(1L);
        categoriaTeste.setNome("Próteses");
        categoriaTeste.setIsActive(true);
    }

    @Test
    void deveSalvarCategoriaServicoNova() {
        // given
        CategoriaServico novaCategoria = new CategoriaServico();
        novaCategoria.setNome("Próteses");

        when(categoriaServicoRepository.save(any(CategoriaServico.class))).thenReturn(categoriaTeste);

        // when
        CategoriaServico categoriaSalva = categoriaServicoService.save(novaCategoria);

        // then
        assertThat(categoriaSalva).isNotNull();
        assertThat(categoriaSalva.getId()).isEqualTo(categoriaTeste.getId());
        verify(categoriaServicoRepository, times(1)).save(any(CategoriaServico.class));
        verify(usuarioService, atLeast(1)).getUsuarioLogado();
    }

    @Test
    void deveBuscarCategoriaServicoPorId() {
        // given
        when(categoriaServicoRepository.findById(1L)).thenReturn(Optional.of(categoriaTeste));

        // when
        Optional<CategoriaServico> categoriaEncontrada = categoriaServicoService.findById(1L);

        // then
        assertThat(categoriaEncontrada).isPresent();
        assertThat(categoriaEncontrada.get().getNome()).isEqualTo(categoriaTeste.getNome());
        verify(categoriaServicoRepository, times(1)).findById(1L);
    }

    @Test
    void deveListarTodasCategoriasServico() {
        // given
        CategoriaServico outraCategoria = new CategoriaServico();
        outraCategoria.setId(2L);
        outraCategoria.setNome("Implantes");
        outraCategoria.setIsActive(true);

        when(categoriaServicoRepository.findAll()).thenReturn(Arrays.asList(categoriaTeste, outraCategoria));

        // when
        List<CategoriaServico> categorias = categoriaServicoService.findAll();

        // then
        assertThat(categorias).hasSize(2);
        verify(categoriaServicoRepository, times(1)).findAll();
    }

    @Test
    void deveAtualizarCategoriaServico() {
        // given
        String novoNome = "Próteses Premium";
        categoriaTeste.setNome(novoNome);
        
        when(categoriaServicoRepository.save(any(CategoriaServico.class))).thenReturn(categoriaTeste);

        // when
        CategoriaServico categoriaAtualizada = categoriaServicoService.save(categoriaTeste);

        // then
        assertThat(categoriaAtualizada.getNome()).isEqualTo(novoNome);
        verify(categoriaServicoRepository, times(1)).save(any(CategoriaServico.class));
        verify(usuarioService, atLeast(1)).getUsuarioLogado();
    }

    @Test
    void deveDeletarCategoriaServico() {
        // given
        when(categoriaServicoRepository.findById(1L)).thenReturn(Optional.of(categoriaTeste));

        // when
        categoriaServicoService.delete(1L);

        // then
        verify(categoriaServicoRepository, times(1)).findById(1L);
        verify(categoriaServicoRepository, times(1)).delete(categoriaTeste);
    }
} 