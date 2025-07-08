package com.senac.dentalsync.core.dto;

import java.util.List;
import lombok.Data;


@Data
public class RelatorioDTO {
    private Long totalPedidos;
    private Long pedidosConcluidos;
    private Long dentistasAtivos;
    private DadosAnterioresDTO dadosAnteriores;
    private List<PedidosPorMesDTO> pedidosPorMes;
    private List<PedidosPorTipoDTO> pedidosPorTipo;
    private List<StatusPedidosDTO> statusPedidos;
    private List<PedidosRecentesDTO> pedidosRecentes;
}
