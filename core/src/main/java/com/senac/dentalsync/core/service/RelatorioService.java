package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.dto.*;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
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
        LocalDateTime mesAnterior = dataAtual.minusMonths(1);

        // Obtém dados atuais
        Long totalPedidos = pedidoRepository.count();
        Long pedidosConcluidos = pedidoRepository.countByStatus("CONCLUIDO");
        Long dentistasAtivos = dentistaRepository.countByAtivoTrue();

        // Obtém dados do mês anterior
        Long totalPedidosAnterior = pedidoRepository.countByDataCriacaoBefore(mesAnterior);
        Long dentistasAtivosAnterior = dentistaRepository.countByAtivoTrueAndDataCadastroBefore(mesAnterior);

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
        relatorio.setPedidosPorMes(pedidoRepository.findPedidosPorMes(dataAtual));
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