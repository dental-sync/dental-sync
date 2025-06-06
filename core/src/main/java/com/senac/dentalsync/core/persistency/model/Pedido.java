package com.senac.dentalsync.core.persistency.model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "pedidos")
@NoArgsConstructor
@AllArgsConstructor
public class Pedido extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    @NotNull(message = "O cliente é obrigatório")
    private Paciente cliente;

    @ManyToOne
    @JoinColumn(name = "dentista_id")
    @NotNull(message = "O dentista é obrigatório")
    private Dentista dentista;

    @ManyToOne
    @JoinColumn(name = "protetico_id")
    @NotNull(message = "O protético é obrigatório")
    private Protetico protetico;

    @ManyToOne
    @JoinColumn(name = "servico_id")
    @NotNull(message = "O serviço é obrigatório")
    private Servico servico;

    @NotNull(message = "A data de entrega é obrigatória")
    @Column(name = "data_entrega")
    private LocalDate dataEntrega;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "A prioridade é obrigatória")
    private Prioridade prioridade;

    @ElementCollection
    @Column(name = "odontograma")
    private List<Integer> odontograma;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public enum Prioridade {
        BAIXA, MEDIA, ALTA, URGENTE
    }
} 