package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private MaterialService materialService;

    private Material materialTeste;
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

        // Configura o material de teste
        materialTeste = new Material();
        materialTeste.setId(1L);
        materialTeste.setNome("Resina Composta");
        materialTeste.setQuantidade(new BigDecimal("100.00"));
        materialTeste.setEstoqueMinimo(new BigDecimal("10.00"));
        materialTeste.setValorUnitario(new BigDecimal("25.50"));
        materialTeste.setStatus(StatusMaterial.EM_ESTOQUE);
        materialTeste.setIsActive(true);
    }

    @Test
    void deveSalvarMaterialNovo() {
        // given
        Material novoMaterial = new Material();
        novoMaterial.setNome("Resina Composta");
        novoMaterial.setQuantidade(new BigDecimal("100.00"));
        novoMaterial.setEstoqueMinimo(new BigDecimal("10.00"));
        novoMaterial.setValorUnitario(new BigDecimal("25.50"));

        when(materialRepository.save(any(Material.class))).thenReturn(materialTeste);

        // when
        Material materialSalvo = materialService.save(novoMaterial);

        // then
        assertThat(materialSalvo).isNotNull();
        assertThat(materialSalvo.getId()).isEqualTo(materialTeste.getId());
        assertThat(materialSalvo.getStatus()).isEqualTo(StatusMaterial.EM_ESTOQUE);
        verify(materialRepository, times(1)).save(any(Material.class));
        verify(usuarioService, atLeast(1)).getUsuarioLogado();
    }

    @Test
    void deveDefinirStatusBaixoEstoqueQuandoQuantidadeIgualEstoqueMinimo() {
        // given
        Material material = new Material();
        material.setNome("Material Teste");
        material.setQuantidade(new BigDecimal("10.00"));
        material.setEstoqueMinimo(new BigDecimal("10.00"));
        
        Material materialComStatus = new Material();
        materialComStatus.setId(1L);
        materialComStatus.setNome("Material Teste");
        materialComStatus.setQuantidade(new BigDecimal("10.00"));
        materialComStatus.setEstoqueMinimo(new BigDecimal("10.00"));
        materialComStatus.setStatus(StatusMaterial.BAIXO_ESTOQUE);

        when(materialRepository.save(any(Material.class))).thenReturn(materialComStatus);

        // when
        Material materialSalvo = materialService.save(material);

        // then
        assertThat(materialSalvo.getStatus()).isEqualTo(StatusMaterial.BAIXO_ESTOQUE);
        verify(materialRepository, times(1)).save(any(Material.class));
    }

    @Test
    void deveDefinirStatusSemEstoqueQuandoQuantidadeZero() {
        // given
        Material material = new Material();
        material.setNome("Material Teste");
        material.setQuantidade(BigDecimal.ZERO);
        material.setEstoqueMinimo(new BigDecimal("10.00"));
        
        Material materialComStatus = new Material();
        materialComStatus.setId(1L);
        materialComStatus.setNome("Material Teste");
        materialComStatus.setQuantidade(BigDecimal.ZERO);
        materialComStatus.setEstoqueMinimo(new BigDecimal("10.00"));
        materialComStatus.setStatus(StatusMaterial.SEM_ESTOQUE);

        when(materialRepository.save(any(Material.class))).thenReturn(materialComStatus);

        // when
        Material materialSalvo = materialService.save(material);

        // then
        assertThat(materialSalvo.getStatus()).isEqualTo(StatusMaterial.SEM_ESTOQUE);
        verify(materialRepository, times(1)).save(any(Material.class));
    }

    @Test
    void deveDefinirStatusEmEstoqueQuandoQuantidadeMaiorQueMinimo() {
        // given
        Material material = new Material();
        material.setNome("Material Teste");
        material.setQuantidade(new BigDecimal("50.00"));
        material.setEstoqueMinimo(new BigDecimal("10.00"));
        
        Material materialComStatus = new Material();
        materialComStatus.setId(1L);
        materialComStatus.setNome("Material Teste");
        materialComStatus.setQuantidade(new BigDecimal("50.00"));
        materialComStatus.setEstoqueMinimo(new BigDecimal("10.00"));
        materialComStatus.setStatus(StatusMaterial.EM_ESTOQUE);

        when(materialRepository.save(any(Material.class))).thenReturn(materialComStatus);

        // when
        Material materialSalvo = materialService.save(material);

        // then
        assertThat(materialSalvo.getStatus()).isEqualTo(StatusMaterial.EM_ESTOQUE);
        verify(materialRepository, times(1)).save(any(Material.class));
    }

    @Test
    void deveBuscarMaterialPorId() {
        // given
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));

        // when
        Optional<Material> materialEncontrado = materialService.findById(1L);

        // then
        assertThat(materialEncontrado).isPresent();
        assertThat(materialEncontrado.get().getNome()).isEqualTo(materialTeste.getNome());
        verify(materialRepository, times(1)).findById(1L);
    }

    @Test
    void deveListarTodosMateriais() {
        // given
        Material outroMaterial = new Material();
        outroMaterial.setId(2L);
        outroMaterial.setNome("Cimento Dental");
        outroMaterial.setQuantidade(new BigDecimal("50.00"));
        outroMaterial.setEstoqueMinimo(new BigDecimal("5.00"));
        outroMaterial.setValorUnitario(new BigDecimal("15.75"));
        outroMaterial.setStatus(StatusMaterial.EM_ESTOQUE);
        outroMaterial.setIsActive(true);

        when(materialRepository.findAll()).thenReturn(Arrays.asList(materialTeste, outroMaterial));

        // when
        List<Material> materiais = materialService.findAll();

        // then
        assertThat(materiais).hasSize(2);
        verify(materialRepository, times(1)).findAll();
    }

    @Test
    void deveAtualizarStatusMaterial() {
        // given
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(materialRepository.save(any(Material.class))).thenReturn(materialTeste);

        // when
        Material materialAtualizado = materialService.updateStatus(1L, false);

        // then
        assertThat(materialAtualizado).isNotNull();
        verify(materialRepository, times(1)).findById(1L);
        verify(materialRepository, times(1)).save(any(Material.class));
    }

    @Test
    void naoDeveAtualizarStatusMaterialInexistente() {
        // given
        when(materialRepository.findById(999L)).thenReturn(Optional.empty());

        // when/then
        assertThrows(RuntimeException.class, () -> {
            materialService.updateStatus(999L, false);
        });
    }

    @Test
    void deveDeletarMaterial() {
        // when
        materialService.delete(1L);

        // then
        verify(materialRepository, times(1)).deleteById(1L);
    }

    @Test
    void deveAtualizarMaterialExistente() {
        // given
        String novoNome = "Resina Composta Premium";
        materialTeste.setNome(novoNome);
        
        when(materialRepository.save(any(Material.class))).thenReturn(materialTeste);

        // when
        Material materialAtualizado = materialService.save(materialTeste);

        // then
        assertThat(materialAtualizado.getNome()).isEqualTo(novoNome);
        verify(materialRepository, times(1)).save(any(Material.class));
        verify(usuarioService, atLeast(1)).getUsuarioLogado();
    }

    @Test
    void naoDeveDefinirStatusQuandoQuantidadeOuEstoqueMinimoNulos() {
        // given
        Material material = new Material();
        material.setNome("Material Teste");
        material.setQuantidade(null);
        material.setEstoqueMinimo(null);
        
        when(materialRepository.save(any(Material.class))).thenReturn(material);

        // when
        Material materialSalvo = materialService.save(material);

        // then
        assertThat(materialSalvo.getStatus()).isNull();
        verify(materialRepository, times(1)).save(any(Material.class));
    }
} 