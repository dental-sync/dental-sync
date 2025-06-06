package com.senac.dentalsync.core.dto;

import com.senac.dentalsync.core.persistency.model.Pedido;

public class AtualizarStatusPedidoDTO {
    private Pedido.Status status;

    public Pedido.Status getStatus() { return status; }
    public void setStatus(Pedido.Status status) { this.status = status; }
} 