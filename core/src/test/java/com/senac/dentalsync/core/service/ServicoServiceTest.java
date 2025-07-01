package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.*;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoMaterialRepository;
import com.senac.dentalsync.core.util.ServicoCalculatorUtil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
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

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class ServicoServiceTest {

    @Mock
    private ServicoRepository servicoRepository;

    @Mock
    private MaterialService materialService;
    
    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private ServicoMaterialRepository servicoMaterialRepository;

    @InjectMocks
    private ServicoService servicoService;

    private Servico servicoTeste;
    private Material materialTeste;
    private ServicoMaterial servicoMaterialTeste;
    private Protetico proteticoLogado;
    private CategoriaServico categoriaTeste;

    @BeforeEach
    void setUp() {
        //Configura o protético logado
        proteticoLogado = new Protetico();
        proteticoLogado.setId(1L);
        proteticoLogado.setNome("Admin");

        //Configura categoria teste
        categoriaTeste = new CategoriaServico();
        categoriaTeste.setId(1L);
        categoriaTeste.setNome("Restauração");

        //Configura material teste
        materialTeste = new Material();
        materialTeste.setId(1L);
        materialTeste.setNome("Resina Composta");
        materialTeste.setQuantidade(new BigDecimal("100.00"));
        materialTeste.setValorUnitario(new BigDecimal("25.50"));

        //Configura serviço material teste
        servicoMaterialTeste = new ServicoMaterial();
        servicoMaterialTeste.setMaterial(materialTeste);
        servicoMaterialTeste.setQuantidade(new BigDecimal("2.00"));
        servicoMaterialTeste.setId(new ServicoMaterialId(1L, 1L));

        //Configura serviço teste
        servicoTeste = new Servico();
        servicoTeste.setId(1L);
        servicoTeste.setNome("Restauração Dental");
        servicoTeste.setCategoriaServico(categoriaTeste);
        servicoTeste.setPreco(new BigDecimal("150.00"));
        servicoTeste.setValorMateriais(new BigDecimal("51.00"));
        servicoTeste.setValorTotal(new BigDecimal("201.00"));
        servicoTeste.setTempoPrevisto(new BigDecimal("120"));
        servicoTeste.setDescricao("Restauração com resina composta");
        servicoTeste.setMateriais(Arrays.asList(servicoMaterialTeste));
    }

    @Test
    void deveAtualizarServicoExistente() {
        
        servicoTeste.setNome("Serviço Editado");
        servicoTeste.setPreco(new BigDecimal("300.00"));

        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servicoTeste));
        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList(servicoMaterialTeste));
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> null);

            Servico resultado = servicoService.updateServico(servicoTeste, 1L);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getNome()).isEqualTo("Serviço Editado");
            verify(servicoRepository, times(1)).findById(1L);
            verify(servicoMaterialRepository, times(1)).findByServicoId(1L);
            verify(servicoMaterialRepository, times(1)).delete(any(ServicoMaterial.class));
            verify(entityManager, times(1)).flush();
            verify(entityManager, times(1)).persist(any(ServicoMaterial.class));
        }
    }

    @Test
    void deveLancarExcecaoQuandoServicoNaoEncontradoParaEdicao() {
        
        when(servicoRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            servicoService.updateServico(servicoTeste, 999L);
        });

        assertThat(exception.getMessage()).contains("Serviço não encontrado para edição");
        verify(servicoRepository, times(1)).findById(999L);
        verify(servicoRepository, never()).save(any(Servico.class));
    }
    @Test
    void deveRecalcularValoresDeServicoEspecifico() {
      
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servicoTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> {
                         Servico servico = invocation.getArgument(0);
                         servico.setValorMateriais(new BigDecimal("60.00"));
                         servico.setValorTotal(new BigDecimal("210.00"));
                         return null;
                     });

            Servico resultado = servicoService.recalcularValores(1L);

            assertThat(resultado).isNotNull();
            verify(servicoRepository, times(1)).findById(1L);
            verify(servicoRepository, times(1)).save(any(Servico.class));
            mockedUtil.verify(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)), times(1));
        }
    }

     @Test
    void deveRecalcularValoresDeTodosOsServicos() {
        // given
        when(servicoRepository.findAll()).thenReturn(Arrays.asList(servicoTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> null);

            // when
            servicoService.recalcularTodosOsValores();

            // then
            verify(servicoRepository, times(1)).findAll();
            verify(servicoRepository, times(1)).save(any(Servico.class));
            mockedUtil.verify(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)), times(1));
        }
    }

        @Test
    void deveRemoverMateriaisAntigosAoAtualizarServico() {
        // given
        servicoTeste.setMateriais(Arrays.asList()); // Remove todos os materiais

        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servicoTeste));
        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList(servicoMaterialTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> null);

            // when
            Servico resultado = servicoService.updateServico(servicoTeste, 1L);

            // then
            assertThat(resultado).isNotNull();
            verify(servicoMaterialRepository, times(1)).delete(any(ServicoMaterial.class));
            verify(entityManager, times(1)).flush();
        }
    }

    @Test
    void deveSalvarNovoServico() {

        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> null);

            Servico resultado = servicoService.save(servicoTeste);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getId()).isEqualTo(1L);
            verify(servicoRepository, times(2)).save(any(Servico.class));
            verify(entityManager, times(1)).persist(any(ServicoMaterial.class));
            mockedUtil.verify(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)), times(1));
        }
    }

    @Test
    void deveLancarExcecaoQuandoMaterialNaoEncontrado() {
      
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.empty());
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            servicoService.save(servicoTeste);
        });

        assertThat(exception.getMessage()).contains("Material não encontrado");
        verify(entityManager, never()).persist(any(ServicoMaterial.class));
    }

    @Test
    void deveLancarExcecaoQuandoQuantidadeZeroOuNegativa() {
       
        servicoMaterialTeste.setQuantidade(BigDecimal.ZERO);
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            servicoService.save(servicoTeste);
        });

        assertThat(exception.getMessage()).contains("Quantidade deve ser maior que zero");
        verify(entityManager, never()).persist(any(ServicoMaterial.class));
    }

    @Test
    void deveLancarExcecaoQuandoQuantidadeNula() {
       
        servicoMaterialTeste.setQuantidade(null);
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoTeste);

        // when & then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            servicoService.save(servicoTeste);
        });

        assertThat(exception.getMessage()).contains("Quantidade deve ser maior que zero");
        verify(entityManager, never()).persist(any(ServicoMaterial.class));
    }

    // ========== TESTES DE ATUALIZAÇÃO DE SERVIÇO ==========

    @Test
    void deveBuscarServicoPorId() {
        // given
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servicoTeste));

        // when
        Optional<Servico> servicoEncontrado = servicoService.findById(1L);

        // then
        assertThat(servicoEncontrado).isPresent();
        assertThat(servicoEncontrado.get().getNome()).isEqualTo("Restauração Dental");
        verify(servicoRepository, times(1)).findById(1L);
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorId() {
        // given
        when(servicoRepository.findById(999L)).thenReturn(Optional.empty());

        // when
        Optional<Servico> servicoEncontrado = servicoService.findById(999L);

        // then
        assertThat(servicoEncontrado).isEmpty();
        verify(servicoRepository, times(1)).findById(999L);
    }

    @Test
    void deveListarTodosServicos() {
        // given
        Servico outroServico = new Servico();
        outroServico.setId(2L);
        outroServico.setNome("Limpeza Dental");

        when(servicoRepository.findAll()).thenReturn(Arrays.asList(servicoTeste, outroServico));

        // when
        List<Servico> servicos = servicoService.findAll();

        // then
        assertThat(servicos).hasSize(2);
        verify(servicoRepository, times(1)).findAll();
    }

    @Test
    void deveDeletarServico() {
        // given
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servicoTeste));
        doNothing().when(servicoRepository).delete(any(Servico.class));

        // when
        servicoService.delete(1L);

        // then
        verify(servicoRepository, times(1)).findById(1L);
        verify(servicoRepository, times(1)).delete(servicoTeste);
    }

    @Test
    void deveRetornarRepositoryCorreto() {
        // when
        var repository = servicoService.getRepository();

        // then
        assertThat(repository).isEqualTo(servicoRepository);
    }

    @Test
    void deveCriarServicoMaterialCorretamente() {
        // given
        Servico novoServico = new Servico();
        novoServico.setId(2L);
        novoServico.setNome("Novo Serviço");
        novoServico.setMateriais(Arrays.asList(servicoMaterialTeste));

        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(servicoRepository.save(any(Servico.class))).thenReturn(novoServico);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> null);

            // when
            Servico resultado = servicoService.save(novoServico);

            // then
            assertThat(resultado).isNotNull();
            verify(entityManager, times(1)).persist(argThat(sm -> {
                ServicoMaterial servicoMaterial = (ServicoMaterial) sm;
                return servicoMaterial.getServico().getId().equals(2L) &&
                       servicoMaterial.getMaterial().getId().equals(1L) &&
                       servicoMaterial.getQuantidade().equals(new BigDecimal("2.00")) &&
                       servicoMaterial.getId().getServicoId().equals(2L) &&
                       servicoMaterial.getId().getMaterialId().equals(1L);
            }));
        }
    }

    @Test
    void deveIgnorarValidacaoEstoqueQuandoMaterialSemQuantidade() {
        // given
        Material materialSemQuantidade = new Material();
        materialSemQuantidade.setId(1L);
        materialSemQuantidade.setNome("Material Sem Quantidade");
        materialSemQuantidade.setQuantidade(null);
        materialSemQuantidade.setValorUnitario(new BigDecimal("25.50"));

        Servico novoServico = new Servico();
        novoServico.setNome("Novo Serviço");
        novoServico.setMateriais(Arrays.asList(servicoMaterialTeste));

        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialSemQuantidade));
        when(servicoRepository.save(any(Servico.class))).thenReturn(novoServico);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> null);

            // when
            Servico resultado = servicoService.save(novoServico);

            // then
            assertThat(resultado).isNotNull();
            verify(entityManager, times(1)).persist(any(ServicoMaterial.class));
            // Não deve lançar exceção nem logar aviso
        }
    }

    @Test
    void deveProcessarListaVaziaDeMateriais() {
        // given
        Servico servicoComListaVazia = new Servico();
        servicoComListaVazia.setNome("Serviço Com Lista Vazia");
        servicoComListaVazia.setMateriais(Arrays.asList());

        when(servicoRepository.save(any(Servico.class))).thenReturn(servicoComListaVazia);

        try (MockedStatic<ServicoCalculatorUtil> mockedUtil = mockStatic(ServicoCalculatorUtil.class)) {
            mockedUtil.when(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)))
                     .thenAnswer(invocation -> null);

            // when
            Servico resultado = servicoService.save(servicoComListaVazia);

            // then
            assertThat(resultado).isNotNull();
            verify(entityManager, never()).persist(any(ServicoMaterial.class));
            mockedUtil.verify(() -> ServicoCalculatorUtil.atualizarValoresCalculados(any(Servico.class)), times(1));
        }
    }
} 