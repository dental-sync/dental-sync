package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.CategoriaMaterial;
import com.senac.dentalsync.core.persistency.repository.CategoriaMaterialRepository;
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

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class CategoriaMaterialServiceTest {

    @Mock
    private CategoriaMaterialRepository categoriaMaterialRepository;

    @InjectMocks
    private CategoriaMaterialService categoriaMaterialService;

    private CategoriaMaterial categoriaTeste;

    @BeforeEach
    void setUp() {
        // Configura a categoria de teste
        categoriaTeste = new CategoriaMaterial();
        categoriaTeste.setId(1L);
        categoriaTeste.setNome("Resinas");
        categoriaTeste.setIsActive(true);
    }

    @Test
    void deveSalvarCategoriaMaterialNova() {
        // given
        CategoriaMaterial novaCategoria = new CategoriaMaterial();
        novaCategoria.setNome("Resinas");

        when(categoriaMaterialRepository.save(any(CategoriaMaterial.class))).thenReturn(categoriaTeste);

        // when
        CategoriaMaterial categoriaSalva = categoriaMaterialService.save(novaCategoria);

        // then
        assertThat(categoriaSalva).isNotNull();
        assertThat(categoriaSalva.getId()).isEqualTo(categoriaTeste.getId());
        verify(categoriaMaterialRepository, times(1)).save(any(CategoriaMaterial.class));
    }

    @Test
    void deveBuscarCategoriaMaterialPorId() {
        // given
        when(categoriaMaterialRepository.findById(1L)).thenReturn(Optional.of(categoriaTeste));

        // when
        Optional<CategoriaMaterial> categoriaEncontrada = categoriaMaterialService.findById(1L);

        // then
        assertThat(categoriaEncontrada).isPresent();
        assertThat(categoriaEncontrada.get().getNome()).isEqualTo(categoriaTeste.getNome());
        verify(categoriaMaterialRepository, times(1)).findById(1L);
    }

    @Test
    void deveListarTodasCategoriasMaterial() {
        // given
        CategoriaMaterial outraCategoria = new CategoriaMaterial();
        outraCategoria.setId(2L);
        outraCategoria.setNome("Cimentos");
        outraCategoria.setIsActive(true);

        when(categoriaMaterialRepository.findAll()).thenReturn(Arrays.asList(categoriaTeste, outraCategoria));

        // when
        List<CategoriaMaterial> categorias = categoriaMaterialService.findAll();

        // then
        assertThat(categorias).hasSize(2);
        verify(categoriaMaterialRepository, times(1)).findAll();
    }

    @Test
    void deveAtualizarCategoriaMaterial() {
        // given
        String novoNome = "Resinas Premium";
        categoriaTeste.setNome(novoNome);
        
        when(categoriaMaterialRepository.save(any(CategoriaMaterial.class))).thenReturn(categoriaTeste);

        // when
        CategoriaMaterial categoriaAtualizada = categoriaMaterialService.save(categoriaTeste);

        // then
        assertThat(categoriaAtualizada.getNome()).isEqualTo(novoNome);
        verify(categoriaMaterialRepository, times(1)).save(any(CategoriaMaterial.class));
    }

    @Test
    void deveDeletarCategoriaMaterial() {
        // given
        when(categoriaMaterialRepository.findById(1L)).thenReturn(Optional.of(categoriaTeste));

        // when
        categoriaMaterialService.delete(1L);

        // then
        verify(categoriaMaterialRepository, times(1)).findById(1L);
        verify(categoriaMaterialRepository, times(1)).delete(categoriaTeste);
    }
} 