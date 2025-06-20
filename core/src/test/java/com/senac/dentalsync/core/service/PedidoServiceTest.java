package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.dto.HistoricoDentistaDTO;
import com.senac.dentalsync.core.dto.HistoricoPacienteDTO;
import com.senac.dentalsync.core.dto.HistoricoProteticoDTO;
import com.senac.dentalsync.core.persistency.model.*;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private MaterialService materialService;
    
    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private ServicoMaterialRepository servicoMaterialRepository;

    @InjectMocks
    private PedidoService pedidoService;

    private Pedido pedidoTeste;
    private Paciente clienteTeste;
    private Dentista dentistaTeste;
    private Protetico proteticoTeste;
    private Servico servicoTeste;
    private Material materialTeste;
    private ServicoMaterial servicoMaterialTeste;
    private Usuario usuarioLogado;

    @BeforeEach
    void setUp() {
        // Configura o usuário logado
        usuarioLogado = new Usuario();
        usuarioLogado.setId(1L);
        usuarioLogado.setName("Usuario Teste");
        usuarioLogado.setEmail("usuario@teste.com");
        
        // Configura o mock do usuarioService
        lenient().when(usuarioService.getUsuarioLogado()).thenReturn(usuarioLogado);

        // Configura cliente teste
        clienteTeste = new Paciente();
        clienteTeste.setId(1L);
        clienteTeste.setNome("João Silva");

        // Configura dentista teste
        dentistaTeste = new Dentista();
        dentistaTeste.setId(1L);
        dentistaTeste.setNome("Dr. Maria Santos");

        // Configura protético teste
        proteticoTeste = new Protetico();
        proteticoTeste.setId(1L);
        proteticoTeste.setNome("Carlos Protético");

        // Configura material teste
        materialTeste = new Material();
        materialTeste.setId(1L);
        materialTeste.setNome("Resina Composta");
        materialTeste.setQuantidade(new BigDecimal("100.00"));
        materialTeste.setValorUnitario(new BigDecimal("25.50"));

        // Configura serviço material teste
        servicoMaterialTeste = new ServicoMaterial();
        servicoMaterialTeste.setMaterial(materialTeste);
        servicoMaterialTeste.setQuantidade(new BigDecimal("5.00"));

        // Configura serviço teste
        servicoTeste = new Servico();
        servicoTeste.setId(1L);
        servicoTeste.setNome("Restauração");
        servicoTeste.setPreco(new BigDecimal("150.00"));
        servicoTeste.setValorTotal(new BigDecimal("277.50"));

        // Configura pedido teste
        pedidoTeste = new Pedido();
        pedidoTeste.setId(1L);
        pedidoTeste.setCliente(clienteTeste);
        pedidoTeste.setDentista(dentistaTeste);
        pedidoTeste.setProtetico(proteticoTeste);
        pedidoTeste.setServicos(Arrays.asList(servicoTeste));
        pedidoTeste.setDataEntrega(LocalDate.now().plusDays(7));
        pedidoTeste.setPrioridade(Pedido.Prioridade.MEDIA);
        pedidoTeste.setStatus(Pedido.Status.PENDENTE);
        pedidoTeste.setObservacao("Observação teste");
    }

    @Test
    void deveSalvarNovoPedidoComStatusPendente() {
        // given
        Pedido novoPedido = new Pedido();
        novoPedido.setCliente(clienteTeste);
        novoPedido.setDentista(dentistaTeste);
        novoPedido.setProtetico(proteticoTeste);
        novoPedido.setServicos(Arrays.asList(servicoTeste));
        novoPedido.setDataEntrega(LocalDate.now().plusDays(7));
        novoPedido.setPrioridade(Pedido.Prioridade.MEDIA);

        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList(servicoMaterialTeste));
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(materialService.save(any(Material.class))).thenReturn(materialTeste);
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // when
        Pedido pedidoSalvo = pedidoService.save(novoPedido);

        // then
        assertThat(pedidoSalvo).isNotNull();
        assertThat(pedidoSalvo.getStatus()).isEqualTo(Pedido.Status.PENDENTE);
        verify(pedidoRepository, times(1)).save(any(Pedido.class));
        verify(servicoMaterialRepository, times(1)).findByServicoId(1L);
        verify(materialService, times(1)).save(any(Material.class));
    }

    @Test
    void deveSalvarPedidoExistenteSemDescontarEstoque() {
        // given
        pedidoTeste.setStatus(Pedido.Status.EM_ANDAMENTO);
        
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // when
        Pedido pedidoSalvo = pedidoService.save(pedidoTeste);

        // then
        assertThat(pedidoSalvo).isNotNull();
        assertThat(pedidoSalvo.getStatus()).isEqualTo(Pedido.Status.EM_ANDAMENTO);
        verify(pedidoRepository, times(1)).save(any(Pedido.class));
        verify(servicoMaterialRepository, never()).findByServicoId(any());
        verify(materialService, never()).save(any(Material.class));
    }

    @Test
    void deveDescontarEstoqueMaterialsAoSalvarNovoPedido() {
        // given
        Pedido novoPedido = new Pedido();
        novoPedido.setServicos(Arrays.asList(servicoTeste));
        
        Material materialAtualizado = new Material();
        materialAtualizado.setId(1L);
        materialAtualizado.setNome("Resina Composta");
        materialAtualizado.setQuantidade(new BigDecimal("95.00")); // 100 - 5

        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList(servicoMaterialTeste));
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialTeste));
        when(materialService.save(any(Material.class))).thenReturn(materialAtualizado);
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // when
        Pedido pedidoSalvo = pedidoService.save(novoPedido);

        // then
        assertThat(pedidoSalvo).isNotNull();
        verify(materialService, times(1)).save(any(Material.class));
        verify(servicoMaterialRepository, times(1)).findByServicoId(1L);
    }

    @Test
    void deveLancarExcecaoQuandoEstoqueInsuficiente() {
        // given
        Pedido novoPedido = new Pedido();
        novoPedido.setServicos(Arrays.asList(servicoTeste));
        
        // Material com estoque insuficiente
        Material materialInsuficiente = new Material();
        materialInsuficiente.setId(1L);
        materialInsuficiente.setNome("Resina Composta");
        materialInsuficiente.setQuantidade(new BigDecimal("2.00")); // Menor que necessário (5.00)

        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList(servicoMaterialTeste));
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(materialInsuficiente));

        // when & then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            pedidoService.save(novoPedido);
        });
        
        assertThat(exception.getMessage()).contains("Estoque insuficiente");
        verify(materialService, never()).save(any(Material.class));
    }

    @Test
    void deveIgnorarMaterialComQuantidadeZeroOuNula() {
        // given
        Pedido novoPedido = new Pedido();
        novoPedido.setServicos(Arrays.asList(servicoTeste));
        
        ServicoMaterial servicoMaterialZero = new ServicoMaterial();
        servicoMaterialZero.setMaterial(materialTeste);
        servicoMaterialZero.setQuantidade(BigDecimal.ZERO);

        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList(servicoMaterialZero));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // when
        Pedido pedidoSalvo = pedidoService.save(novoPedido);

        // then
        assertThat(pedidoSalvo).isNotNull();
        verify(materialService, never()).save(any(Material.class));
    }

    @Test
    void deveProcessarPedidoSemServicos() {
        // given
        Pedido novoPedido = new Pedido();
        novoPedido.setServicos(null);

        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // when
        Pedido pedidoSalvo = pedidoService.save(novoPedido);

        // then
        assertThat(pedidoSalvo).isNotNull();
        verify(servicoMaterialRepository, never()).findByServicoId(any());
        verify(materialService, never()).save(any(Material.class));
    }

    @Test
    void deveProcessarServicoSemMateriais() {
        // given
        Pedido novoPedido = new Pedido();
        novoPedido.setServicos(Arrays.asList(servicoTeste));

        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList());
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedidoTeste);

        // when
        Pedido pedidoSalvo = pedidoService.save(novoPedido);

        // then
        assertThat(pedidoSalvo).isNotNull();
        verify(materialService, never()).save(any(Material.class));
    }

    @Test
    void deveLancarExcecaoQuandoMaterialNaoEncontrado() {
        // given
        Pedido novoPedido = new Pedido();
        novoPedido.setServicos(Arrays.asList(servicoTeste));

        when(servicoMaterialRepository.findByServicoId(1L)).thenReturn(Arrays.asList(servicoMaterialTeste));
        when(materialService.getRepository()).thenReturn(materialRepository);
        when(materialRepository.findById(1L)).thenReturn(Optional.empty());

        // when & then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            pedidoService.save(novoPedido);
        });
        
        assertThat(exception.getMessage()).contains("Material não encontrado");
    }

    @Test
    void deveBuscarPedidosPorDentista() {
        // given
        when(pedidoRepository.findByDentista(dentistaTeste)).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<Pedido> pedidos = pedidoService.findByDentista(dentistaTeste);

        // then
        assertThat(pedidos).hasSize(1);
        assertThat(pedidos.get(0).getDentista().getNome()).isEqualTo("Dr. Maria Santos");
        verify(pedidoRepository, times(1)).findByDentista(dentistaTeste);
    }

    @Test
    void deveBuscarPedidosPorCliente() {
        // given
        when(pedidoRepository.findByCliente(clienteTeste)).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<Pedido> pedidos = pedidoService.findByCliente(clienteTeste);

        // then
        assertThat(pedidos).hasSize(1);
        assertThat(pedidos.get(0).getCliente().getNome()).isEqualTo("João Silva");
        verify(pedidoRepository, times(1)).findByCliente(clienteTeste);
    }

    @Test
    void deveBuscarPedidosPorProtetico() {
        // given
        when(pedidoRepository.findByProtetico(proteticoTeste)).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<Pedido> pedidos = pedidoService.findByProtetico(proteticoTeste);

        // then
        assertThat(pedidos).hasSize(1);
        assertThat(pedidos.get(0).getProtetico().getNome()).isEqualTo("Carlos Protético");
        verify(pedidoRepository, times(1)).findByProtetico(proteticoTeste);
    }

    @Test
    void deveBuscarPedidosPorDataEntrega() {
        // given
        LocalDate dataEntrega = LocalDate.now().plusDays(7);
        when(pedidoRepository.findByDataEntrega(dataEntrega)).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<Pedido> pedidos = pedidoService.findByDataEntrega(dataEntrega);

        // then
        assertThat(pedidos).hasSize(1);
        assertThat(pedidos.get(0).getDataEntrega()).isEqualTo(dataEntrega);
        verify(pedidoRepository, times(1)).findByDataEntrega(dataEntrega);
    }

    @Test
    void deveBuscarPedidosPorPrioridade() {
        // given
        when(pedidoRepository.findByPrioridade(Pedido.Prioridade.ALTA)).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<Pedido> pedidos = pedidoService.findByPrioridade(Pedido.Prioridade.ALTA);

        // then
        assertThat(pedidos).hasSize(1);
        verify(pedidoRepository, times(1)).findByPrioridade(Pedido.Prioridade.ALTA);
    }

    @Test
    void deveBuscarHistoricoPorProtetico() {
        // given
        when(pedidoRepository.findByProtetico(any(Protetico.class))).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<HistoricoProteticoDTO> historico = pedidoService.buscarHistoricoPorProtetico(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoProteticoDTO dto = historico.get(0);
        assertThat(dto.getNomeServico()).isEqualTo("Restauração");
        assertThat(dto.getNomePaciente()).isEqualTo("João Silva");
        assertThat(dto.getNomeDentista()).isEqualTo("Dr. Maria Santos");
        assertThat(dto.getValorTotal()).isEqualTo(new BigDecimal("277.50"));
        verify(pedidoRepository, times(1)).findByProtetico(any(Protetico.class));
    }

    @Test
    void deveBuscarHistoricoPorProteticoComServicoSemNome() {
        // given
        Pedido pedidoSemServico = new Pedido();
        pedidoSemServico.setCliente(clienteTeste);
        pedidoSemServico.setDentista(dentistaTeste);
        pedidoSemServico.setServicos(Arrays.asList()); // Lista vazia

        when(pedidoRepository.findByProtetico(any(Protetico.class))).thenReturn(Arrays.asList(pedidoSemServico));

        // when
        List<HistoricoProteticoDTO> historico = pedidoService.buscarHistoricoPorProtetico(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoProteticoDTO dto = historico.get(0);
        assertThat(dto.getNomeServico()).isEqualTo("Serviço não informado");
    }

    @Test
    void deveBuscarHistoricoPorPaciente() {
        // given
        when(pedidoRepository.findByCliente(any(Paciente.class))).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<HistoricoPacienteDTO> historico = pedidoService.buscarHistoricoPorPaciente(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoPacienteDTO dto = historico.get(0);
        assertThat(dto.getNomeServico()).isEqualTo("Restauração");
        assertThat(dto.getNomeDentista()).isEqualTo("Dr. Maria Santos");
        assertThat(dto.getValorTotal()).isEqualTo(new BigDecimal("277.50"));
        verify(pedidoRepository, times(1)).findByCliente(any(Paciente.class));
    }

    @Test
    void deveBuscarHistoricoPorPacienteComServicoSemNome() {
        // given
        Pedido pedidoSemServico = new Pedido();
        pedidoSemServico.setDentista(dentistaTeste);
        pedidoSemServico.setServicos(Arrays.asList()); // Lista vazia ao invés de nula

        when(pedidoRepository.findByCliente(any(Paciente.class))).thenReturn(Arrays.asList(pedidoSemServico));

        // when
        List<HistoricoPacienteDTO> historico = pedidoService.buscarHistoricoPorPaciente(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoPacienteDTO dto = historico.get(0);
        assertThat(dto.getNomeServico()).isEqualTo("Serviço não informado");
    }

    @Test
    void deveBuscarHistoricoPorDentista() {
        // given
        when(pedidoRepository.findByDentista(any(Dentista.class))).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<HistoricoDentistaDTO> historico = pedidoService.buscarHistoricoPorDentista(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoDentistaDTO dto = historico.get(0);
        assertThat(dto.getNomeServico()).isEqualTo("Restauração");
        assertThat(dto.getNomePaciente()).isEqualTo("João Silva");
        assertThat(dto.getValorTotal()).isEqualTo(new BigDecimal("277.50"));
        verify(pedidoRepository, times(1)).findByDentista(any(Dentista.class));
    }

    @Test
    void deveBuscarHistoricoPorDentistaComServicoSemNome() {
        // given
        Pedido pedidoSemServico = new Pedido();
        pedidoSemServico.setCliente(clienteTeste);
        pedidoSemServico.setServicos(Arrays.asList()); // Lista vazia

        when(pedidoRepository.findByDentista(any(Dentista.class))).thenReturn(Arrays.asList(pedidoSemServico));

        // when
        List<HistoricoDentistaDTO> historico = pedidoService.buscarHistoricoPorDentista(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoDentistaDTO dto = historico.get(0);
        assertThat(dto.getNomeServico()).isEqualTo("Serviço não informado");
    }

    @Test
    void deveCalcularValorTotalComValorTotalDoServico() {
        // given
        Servico servicoComValorTotal = new Servico();
        servicoComValorTotal.setNome("Serviço Teste");
        servicoComValorTotal.setPreco(new BigDecimal("100.00"));
        servicoComValorTotal.setValorTotal(new BigDecimal("150.00"));

        Pedido pedidoTeste = new Pedido();
        pedidoTeste.setCliente(clienteTeste);
        pedidoTeste.setDentista(dentistaTeste);
        pedidoTeste.setServicos(Arrays.asList(servicoComValorTotal));

        when(pedidoRepository.findByProtetico(any(Protetico.class))).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<HistoricoProteticoDTO> historico = pedidoService.buscarHistoricoPorProtetico(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoProteticoDTO dto = historico.get(0);
        assertThat(dto.getValorTotal()).isEqualTo(new BigDecimal("150.00"));
    }

    @Test
    void deveCalcularValorTotalComPrecoQuandoValorTotalNulo() {
        // given
        Servico servicoSemValorTotal = new Servico();
        servicoSemValorTotal.setNome("Serviço Teste");
        servicoSemValorTotal.setPreco(new BigDecimal("100.00"));
        servicoSemValorTotal.setValorTotal(null);

        Pedido pedidoTeste = new Pedido();
        pedidoTeste.setCliente(clienteTeste);
        pedidoTeste.setDentista(dentistaTeste);
        pedidoTeste.setServicos(Arrays.asList(servicoSemValorTotal));

        when(pedidoRepository.findByProtetico(any(Protetico.class))).thenReturn(Arrays.asList(pedidoTeste));

        // when
        List<HistoricoProteticoDTO> historico = pedidoService.buscarHistoricoPorProtetico(1L);

        // then
        assertThat(historico).hasSize(1);
        HistoricoProteticoDTO dto = historico.get(0);
        assertThat(dto.getValorTotal()).isEqualTo(new BigDecimal("100.00"));
    }

    @Test
    void deveBuscarPedidoPorId() {
        // given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoTeste));

        // when
        Optional<Pedido> pedidoEncontrado = pedidoService.findById(1L);

        // then
        assertThat(pedidoEncontrado).isPresent();
        assertThat(pedidoEncontrado.get().getId()).isEqualTo(1L);
        verify(pedidoRepository, times(1)).findById(1L);
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorId() {
        // given
        when(pedidoRepository.findById(999L)).thenReturn(Optional.empty());

        // when
        Optional<Pedido> pedidoEncontrado = pedidoService.findById(999L);

        // then
        assertThat(pedidoEncontrado).isEmpty();
        verify(pedidoRepository, times(1)).findById(999L);
    }

    @Test
    void deveListarTodosPedidos() {
        // given
        Pedido outroPedido = new Pedido();
        outroPedido.setId(2L);
        outroPedido.setCliente(clienteTeste);
        outroPedido.setDentista(dentistaTeste);
        outroPedido.setProtetico(proteticoTeste);

        when(pedidoRepository.findAll()).thenReturn(Arrays.asList(pedidoTeste, outroPedido));

        // when
        List<Pedido> pedidos = pedidoService.findAll();

        // then
        assertThat(pedidos).hasSize(2);
        verify(pedidoRepository, times(1)).findAll();
    }

        @Test
    void deveDeletarPedido() {
        // given
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoTeste));
        doNothing().when(pedidoRepository).delete(any(Pedido.class));

        // when
        pedidoService.delete(1L);

        // then
        verify(pedidoRepository, times(1)).findById(1L);
        verify(pedidoRepository, times(1)).delete(pedidoTeste);
    }

    @Test
    void deveRetornarRepositoryCorreto() {
        // when
        var repository = pedidoService.getRepository();

        // then
        assertThat(repository).isEqualTo(pedidoRepository);
    }

    @Test
    void deveRetornarUsuarioLogadoNulo() {
        // when
        Usuario usuario = pedidoService.getUsuarioLogado();

        // then
        assertThat(usuario).isNull();
    }
} 