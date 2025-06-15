package com.senac.dentalsync.core.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.Month;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PedidosPorMesDTO {
    private String mes;
    private Long total;

    public PedidosPorMesDTO(Integer mesNumero, Long total) {
        this.mes = Month.of(mesNumero).toString().substring(0, 3);
        this.total = total;
    }
}