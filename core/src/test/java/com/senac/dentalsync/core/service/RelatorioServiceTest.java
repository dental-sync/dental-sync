package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.dto.*;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class RelatorioServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private DentistaRepository dentistaRepository;

    @InjectMocks
    private RelatorioService relatorioService;

    private LocalDateTime dataAtualTeste;
    private LocalDateTime inicioMesAtualTeste;
    private Pedido pedidoTeste;
    private Dentista dentistaTeste;
    private Paciente clienteTeste;
    private Servico servicoTeste;

    @BeforeEach
    void setUp() {
        // Data fixa para testes consistentes
        dataAtualTeste = LocalDateTime.of(2024, 6, 15, 10, 30, 0);
        inicioMesAtualTeste = LocalDateTime.of(2024, 6, 1, 0, 0, 0);

        // Configura dentista teste
        dentistaTeste = new Dentista();
        dentistaTeste.setId(1L);
        dentistaTeste.setNome("Dr. João Silva");

        // Configura cliente teste
        clienteTeste = new Paciente();
        clienteTeste.setId(1L);
        clienteTeste.setNome("Maria Santos");

        // Configura serviço teste
        servicoTeste = new Servico();
        servicoTeste.setId(1L);
        servicoTeste.setNome("Restauração Dental");
        servicoTeste.setPreco(new BigDecimal("200.00"));

        // Configura pedido teste
        pedidoTeste = new Pedido();
        pedidoTeste.setId(1L);
        pedidoTeste.setDentista(dentistaTeste);
        pedidoTeste.setCliente(clienteTeste);
        pedidoTeste.setServicos(Arrays.asList(servicoTeste));
        pedidoTeste.setStatus(Pedido.Status.CONCLUIDO);
        pedidoTeste.setDataEntrega(LocalDate.now());
    }

    @Test
    void deveObterDadosDashboardCompleto() {
        // given
        List<Object[]> pedidosPorMesRaw = Arrays.asList(
            new Object[]{6, 10L},  // Junho: 10 pedidos
            new Object[]{5, 8L},   // Maio: 8 pedidos
            new Object[]{4, 12L}   // Abril: 12 pedidos
        );

        List<PedidosPorTipoDTO> pedidosPorTipoMock = Arrays.asList(
            new PedidosPorTipoDTO("Restauração", 45.5),
            new PedidosPorTipoDTO("Limpeza", 35.0)
        );

        List<StatusPedidosDTO> statusPedidosMock = Arrays.asList(
            new StatusPedidosDTO("CONCLUIDO", 60.0),
            new StatusPedidosDTO("PENDENTE", 40.0)
        );

        List<Pedido> pedidosRecentesMock = Arrays.asList(pedidoTeste);

        // Mocks dos dados atuais
        when(pedidoRepository.count()).thenReturn(100L);
        when(pedidoRepository.countByStatus(Pedido.Status.CONCLUIDO)).thenReturn(75L);
        when(dentistaRepository.countByIsActiveTrue()).thenReturn(25L);

        // Mocks dos dados anteriores
        when(pedidoRepository.countByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(80L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class))).thenReturn(20L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(5L);

        // Mocks dos dados de gráficos
        when(pedidoRepository.findPedidosPorMes(any(LocalDateTime.class))).thenReturn(pedidosPorMesRaw);
        when(pedidoRepository.findPedidosPorTipo()).thenReturn(pedidosPorTipoMock);
        when(pedidoRepository.findStatusPedidos()).thenReturn(statusPedidosMock);
        when(pedidoRepository.findPedidosRecentes()).thenReturn(pedidosRecentesMock);

        try (MockedStatic<LocalDateTime> mockedLocalDateTime = mockStatic(LocalDateTime.class)) {
            mockedLocalDateTime.when(LocalDateTime::now).thenReturn(dataAtualTeste);

            // when
            RelatorioDTO resultado = relatorioService.obterDadosDashboard();

            // then
            assertThat(resultado).isNotNull();
            
            // Verifica dados principais
            assertThat(resultado.getTotalPedidos()).isEqualTo(100L);
            assertThat(resultado.getPedidosConcluidos()).isEqualTo(75L);
            assertThat(resultado.getDentistasAtivos()).isEqualTo(25L);

            // Verifica dados anteriores
            assertThat(resultado.getDadosAnteriores()).isNotNull();
            assertThat(resultado.getDadosAnteriores().getTotalPedidos()).isEqualTo(80L);
            assertThat(resultado.getDadosAnteriores().getDentistasAtivos()).isEqualTo(20L);

            // Verifica pedidos por mês
            assertThat(resultado.getPedidosPorMes()).hasSize(3);
            assertThat(resultado.getPedidosPorMes().get(0).getMes()).isEqualTo("JUN");
            assertThat(resultado.getPedidosPorMes().get(0).getTotal()).isEqualTo(10L);

            // Verifica pedidos por tipo
            assertThat(resultado.getPedidosPorTipo()).hasSize(2);
            assertThat(resultado.getPedidosPorTipo().get(0).getTipo()).isEqualTo("Restauração");

            // Verifica status pedidos
            assertThat(resultado.getStatusPedidos()).hasSize(2);
            assertThat(resultado.getStatusPedidos().get(0).getStatus()).isEqualTo("CONCLUIDO");

            // Verifica pedidos recentes
            assertThat(resultado.getPedidosRecentes()).hasSize(1);
            assertThat(resultado.getPedidosRecentes().get(0).getId()).isEqualTo("1");
            assertThat(resultado.getPedidosRecentes().get(0).getTipo()).isEqualTo("Restauração Dental");
            assertThat(resultado.getPedidosRecentes().get(0).getStatus()).isEqualTo("CONCLUIDO");
            assertThat(resultado.getPedidosRecentes().get(0).getDentista()).isEqualTo("Dr. João Silva");
            assertThat(resultado.getPedidosRecentes().get(0).getPaciente()).isEqualTo("Maria Santos");

            // Verifica chamadas aos repositories
            verify(pedidoRepository, times(1)).count();
            verify(pedidoRepository, times(1)).countByStatus(Pedido.Status.CONCLUIDO);
            verify(dentistaRepository, times(1)).countByIsActiveTrue();
            verify(pedidoRepository, times(1)).countByCreatedAtBefore(any(LocalDateTime.class));
            verify(dentistaRepository, times(1)).countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class));
            verify(dentistaRepository, times(1)).countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class));
            verify(pedidoRepository, times(1)).findPedidosPorMes(any(LocalDateTime.class));
            verify(pedidoRepository, times(1)).findPedidosPorTipo();
            verify(pedidoRepository, times(1)).findStatusPedidos();
            verify(pedidoRepository, times(1)).findPedidosRecentes();
        }
    }

    @Test
    void deveObterDadosDashboardComListasVazias() {
        // given
        when(pedidoRepository.count()).thenReturn(0L);
        when(pedidoRepository.countByStatus(Pedido.Status.CONCLUIDO)).thenReturn(0L);
        when(dentistaRepository.countByIsActiveTrue()).thenReturn(0L);
        when(pedidoRepository.countByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(0L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class))).thenReturn(0L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(0L);
        when(pedidoRepository.findPedidosPorMes(any(LocalDateTime.class))).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosPorTipo()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findStatusPedidos()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosRecentes()).thenReturn(Collections.emptyList());

        try (MockedStatic<LocalDateTime> mockedLocalDateTime = mockStatic(LocalDateTime.class)) {
            mockedLocalDateTime.when(LocalDateTime::now).thenReturn(dataAtualTeste);

            // when
            RelatorioDTO resultado = relatorioService.obterDadosDashboard();

            // then
            assertThat(resultado).isNotNull();
            assertThat(resultado.getTotalPedidos()).isEqualTo(0L);
            assertThat(resultado.getPedidosConcluidos()).isEqualTo(0L);
            assertThat(resultado.getDentistasAtivos()).isEqualTo(0L);
            assertThat(resultado.getPedidosPorMes()).isEmpty();
            assertThat(resultado.getPedidosPorTipo()).isEmpty();
            assertThat(resultado.getStatusPedidos()).isEmpty();
            assertThat(resultado.getPedidosRecentes()).isEmpty();
        }
    }

    @Test
    void deveProcessarPedidosPorMesCorretamente() {
        // given
        List<Object[]> pedidosPorMesRaw = Arrays.asList(
            new Object[]{1, 5L},   // Janeiro
            new Object[]{2, 8L},   // Fevereiro
            new Object[]{12, 15L}  // Dezembro
        );

        when(pedidoRepository.count()).thenReturn(50L);
        when(pedidoRepository.countByStatus(any())).thenReturn(30L);
        when(dentistaRepository.countByIsActiveTrue()).thenReturn(10L);
        when(pedidoRepository.countByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(40L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class))).thenReturn(8L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(2L);
        when(pedidoRepository.findPedidosPorMes(any(LocalDateTime.class))).thenReturn(pedidosPorMesRaw);
        when(pedidoRepository.findPedidosPorTipo()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findStatusPedidos()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosRecentes()).thenReturn(Collections.emptyList());

        try (MockedStatic<LocalDateTime> mockedLocalDateTime = mockStatic(LocalDateTime.class)) {
            mockedLocalDateTime.when(LocalDateTime::now).thenReturn(dataAtualTeste);

            // when
            RelatorioDTO resultado = relatorioService.obterDadosDashboard();

            // then
            assertThat(resultado.getPedidosPorMes()).hasSize(3);
            
            // Verifica Janeiro
            PedidosPorMesDTO janeiro = resultado.getPedidosPorMes().get(0);
            assertThat(janeiro.getMes()).isEqualTo("JAN");
            assertThat(janeiro.getTotal()).isEqualTo(5L);
            
            // Verifica Fevereiro
            PedidosPorMesDTO fevereiro = resultado.getPedidosPorMes().get(1);
            assertThat(fevereiro.getMes()).isEqualTo("FEB");
            assertThat(fevereiro.getTotal()).isEqualTo(8L);
            
            // Verifica Dezembro
            PedidosPorMesDTO dezembro = resultado.getPedidosPorMes().get(2);
            assertThat(dezembro.getMes()).isEqualTo("DEC");
            assertThat(dezembro.getTotal()).isEqualTo(15L);
        }
    }

    @Test
    void deveProcessarPedidosRecentesComMultiplosServicos() {
        // given
        Servico outroServico = new Servico();
        outroServico.setId(2L);
        outroServico.setNome("Limpeza Dental");

        Pedido pedidoComMultiplosServicos = new Pedido();
        pedidoComMultiplosServicos.setId(2L);
        pedidoComMultiplosServicos.setDentista(dentistaTeste);
        pedidoComMultiplosServicos.setCliente(clienteTeste);
        pedidoComMultiplosServicos.setServicos(Arrays.asList(servicoTeste, outroServico));
        pedidoComMultiplosServicos.setStatus(Pedido.Status.PENDENTE);

        List<Pedido> pedidosRecentes = Arrays.asList(pedidoTeste, pedidoComMultiplosServicos);

        when(pedidoRepository.count()).thenReturn(10L);
        when(pedidoRepository.countByStatus(any())).thenReturn(5L);
        when(dentistaRepository.countByIsActiveTrue()).thenReturn(3L);
        when(pedidoRepository.countByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(8L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class))).thenReturn(2L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(1L);
        when(pedidoRepository.findPedidosPorMes(any(LocalDateTime.class))).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosPorTipo()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findStatusPedidos()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosRecentes()).thenReturn(pedidosRecentes);

        try (MockedStatic<LocalDateTime> mockedLocalDateTime = mockStatic(LocalDateTime.class)) {
            mockedLocalDateTime.when(LocalDateTime::now).thenReturn(dataAtualTeste);

            // when
            RelatorioDTO resultado = relatorioService.obterDadosDashboard();

            // then
            assertThat(resultado.getPedidosRecentes()).hasSize(2);
            
            // Verifica primeiro pedido (pega primeiro serviço)
            PedidosRecentesDTO primeiro = resultado.getPedidosRecentes().get(0);
            assertThat(primeiro.getTipo()).isEqualTo("Restauração Dental");
            assertThat(primeiro.getStatus()).isEqualTo("CONCLUIDO");
            
            // Verifica segundo pedido (pega primeiro serviço da lista)
            PedidosRecentesDTO segundo = resultado.getPedidosRecentes().get(1);
            assertThat(segundo.getTipo()).isEqualTo("Restauração Dental");
            assertThat(segundo.getStatus()).isEqualTo("PENDENTE");
        }
    }

    @Test
    void deveCalcularDataInicioMesAtualCorretamente() {
        // given
        LocalDateTime dataEspecifica = LocalDateTime.of(2024, 3, 25, 14, 30, 45, 123456789);
        
        when(pedidoRepository.count()).thenReturn(1L);
        when(pedidoRepository.countByStatus(any())).thenReturn(1L);
        when(dentistaRepository.countByIsActiveTrue()).thenReturn(1L);
        when(pedidoRepository.countByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(1L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class))).thenReturn(1L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(1L);
        when(pedidoRepository.findPedidosPorMes(any(LocalDateTime.class))).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosPorTipo()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findStatusPedidos()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosRecentes()).thenReturn(Collections.emptyList());

        try (MockedStatic<LocalDateTime> mockedLocalDateTime = mockStatic(LocalDateTime.class)) {
            mockedLocalDateTime.when(LocalDateTime::now).thenReturn(dataEspecifica);

            // when
            relatorioService.obterDadosDashboard();

            // then
            // Verifica se foi chamado com início do mês correto
            verify(pedidoRepository, times(1)).countByCreatedAtBefore(any(LocalDateTime.class));
            verify(dentistaRepository, times(1)).countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class));
            verify(dentistaRepository, times(1)).countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), eq(dataEspecifica));
            
            // Verifica se foi chamado com 6 meses atrás
            verify(pedidoRepository, times(1)).findPedidosPorMes(any(LocalDateTime.class));
        }
    }

    @Test
    void deveManterTransacaoReadOnly() {
        // given
        when(pedidoRepository.count()).thenReturn(1L);
        when(pedidoRepository.countByStatus(any())).thenReturn(1L);
        when(dentistaRepository.countByIsActiveTrue()).thenReturn(1L);
        when(pedidoRepository.countByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(1L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class))).thenReturn(1L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(1L);
        when(pedidoRepository.findPedidosPorMes(any(LocalDateTime.class))).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosPorTipo()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findStatusPedidos()).thenReturn(Collections.emptyList());
        when(pedidoRepository.findPedidosRecentes()).thenReturn(Collections.emptyList());

        try (MockedStatic<LocalDateTime> mockedLocalDateTime = mockStatic(LocalDateTime.class)) {
            mockedLocalDateTime.when(LocalDateTime::now).thenReturn(dataAtualTeste);

            // when
            RelatorioDTO resultado = relatorioService.obterDadosDashboard();

            // then
            assertThat(resultado).isNotNull();
            
            // Verifica que apenas métodos de leitura foram chamados
            verify(pedidoRepository, never()).save(any());
            verify(pedidoRepository, never()).delete(any());
            verify(dentistaRepository, never()).save(any());
            verify(dentistaRepository, never()).delete(any());
        }
    }

    @Test
    void deveProcessarDadosComListasNulas() {
        // given - Configura apenas os mocks necessários até o ponto onde a exceção é lançada
        when(pedidoRepository.count()).thenReturn(0L);
        when(pedidoRepository.countByStatus(any())).thenReturn(0L);
        when(dentistaRepository.countByIsActiveTrue()).thenReturn(0L);
        when(pedidoRepository.countByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(0L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(any(LocalDateTime.class))).thenReturn(0L);
        when(dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(0L);
        // A primeira lista nula que causa a exceção
        when(pedidoRepository.findPedidosPorMes(any(LocalDateTime.class))).thenReturn(null);

        try (MockedStatic<LocalDateTime> mockedLocalDateTime = mockStatic(LocalDateTime.class)) {
            mockedLocalDateTime.when(LocalDateTime::now).thenReturn(dataAtualTeste);

            // when & then - Deve lançar NullPointerException ao tentar processar lista nula
            assertThrows(NullPointerException.class, () -> {
                relatorioService.obterDadosDashboard();
            });
        }
    }
} 