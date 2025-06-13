package com.senac.dentalsync.core.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PedidosRecentesDTO {
    private String id;
    private String tipo;
    private String status;
    private String dentista;
    private String paciente;
}