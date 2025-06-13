package com.senac.dentalsync.core.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PedidosPorMesDTO {
    private String mes;
    private Long total;
}