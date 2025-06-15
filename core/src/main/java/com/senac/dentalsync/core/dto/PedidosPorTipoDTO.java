package com.senac.dentalsync.core.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PedidosPorTipoDTO {
    private String tipo;
    private Double percentual;
}