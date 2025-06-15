package com.senac.dentalsync.core.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatusPedidosDTO {
    private String status;
    private Double percentual;
}