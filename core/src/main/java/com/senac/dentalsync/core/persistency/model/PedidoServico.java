package com.senac.dentalsync.core.persistency.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "pedido_servico")
@NoArgsConstructor
public class PedidoServico extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @Column(name = "quantidade", precision = 10, scale = 2)
    private BigDecimal quantidade;

    public PedidoServico(Pedido pedido, Servico servico, BigDecimal quantidade) {
        this.pedido = pedido;
        this.servico = servico;
        this.quantidade = quantidade;
    }
} 