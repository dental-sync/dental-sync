package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.dto.*;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
import com.senac.dentalsync.core.persistency.model.Pedido;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioService {
    private final PedidoRepository pedidoRepository;
    private final DentistaRepository dentistaRepository;

    @Transactional(readOnly = true)
    public RelatorioDTO obterDadosDashboard() {
        LocalDateTime dataAtual = LocalDateTime.now();
        LocalDateTime inicioMesAtual = dataAtual.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime inicioMesAnterior = inicioMesAtual.minusMonths(1);

        // Obtém dados atuais
        Long totalPedidos = pedidoRepository.count();
        Long pedidosConcluidos = pedidoRepository.countByStatus(Pedido.Status.CONCLUIDO);
        Long dentistasAtivos = dentistaRepository.countByIsActiveTrue();

        // Obtém dados do mês anterior (final do mês anterior)
        Long totalPedidosAnterior = pedidoRepository.countByCreatedAtBefore(inicioMesAtual);
        Long dentistasAtivosAnterior = dentistaRepository.countByIsActiveTrueAndCreatedAtBefore(inicioMesAtual);
        
        // Conta dentistas criados ESTE MÊS especificamente
        Long dentistasNovosMes = dentistaRepository.countByIsActiveTrueAndCreatedAtBetween(inicioMesAtual, dataAtual);
        
        System.out.println("=== DEBUG RELATÓRIO DENTISTAS ===");
        System.out.println("Data atual: " + dataAtual);
        System.out.println("Início mês atual: " + inicioMesAtual);
        System.out.println("Dentistas ativos total: " + dentistasAtivos);
        System.out.println("Dentistas ativos anterior: " + dentistasAtivosAnterior);
        System.out.println("Dentistas novos este mês: " + dentistasNovosMes);
        System.out.println("===============================");

        // Monta o DTO
        RelatorioDTO relatorio = new RelatorioDTO();
        relatorio.setTotalPedidos(totalPedidos);
        relatorio.setPedidosConcluidos(pedidosConcluidos);
        relatorio.setDentistasAtivos(dentistasAtivos);
        
        // Dados anteriores
        DadosAnterioresDTO dadosAnteriores = new DadosAnterioresDTO();
        dadosAnteriores.setTotalPedidos(totalPedidosAnterior);
        dadosAnteriores.setDentistasAtivos(dentistasAtivosAnterior);
        relatorio.setDadosAnteriores(dadosAnteriores);
        
        // Dados dos gráficos
        System.out.println("=== DEBUG PEDIDOS POR MÊS ===");
        System.out.println("Data para consulta: " + dataAtual);
        System.out.println("Total de pedidos: " + totalPedidos);
        
        // Buscar dados dos últimos 6 meses
        LocalDateTime inicioConsulta = dataAtual.minusMonths(6);
        List<Object[]> pedidosPorMesRaw = pedidoRepository.findPedidosPorMes(inicioConsulta);
        System.out.println("Resultados raw da query pedidos por mês: " + pedidosPorMesRaw.size() + " registros");
        
        for (Object[] row : pedidosPorMesRaw) {
            System.out.println("Mês: " + row[0] + ", Total: " + row[1]);
        }
        
        List<PedidosPorMesDTO> pedidosPorMes = pedidosPorMesRaw.stream()
            .map(row -> new PedidosPorMesDTO(
                ((Number) row[0]).intValue(),
                ((Number) row[1]).longValue()
            ))
            .collect(Collectors.toList());
        relatorio.setPedidosPorMes(pedidosPorMes);
        
        relatorio.setPedidosPorTipo(pedidoRepository.findPedidosPorTipo());
        relatorio.setStatusPedidos(pedidoRepository.findStatusPedidos());
        
        // Pedidos recentes
        List<PedidosRecentesDTO> pedidosRecentes = pedidoRepository.findPedidosRecentes()
            .stream()
            .map(pedido -> new PedidosRecentesDTO(
                pedido.getId().toString(),
                pedido.getServicos().get(0).getNome(),
                pedido.getStatus().toString(),
                pedido.getDentista().getNome(),
                pedido.getCliente().getNome()
            ))
            .collect(Collectors.toList());
        relatorio.setPedidosRecentes(pedidosRecentes);

        return relatorio;
    }
}