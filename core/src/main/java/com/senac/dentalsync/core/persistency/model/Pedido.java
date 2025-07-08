package com.senac.dentalsync.core.persistency.model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
    @JoinColumn(name = "clinica_id")
    private Clinica clinica;

    @ManyToOne
    @JoinColumn(name = "protetico_id")
    @NotNull(message = "O protético é obrigatório")
    private Protetico protetico;

    @ManyToMany
    @JoinTable(
        name = "pedido_servico",
        joinColumns = @JoinColumn(name = "pedido_id"),
        inverseJoinColumns = @JoinColumn(name = "servico_id")
    )
    @NotNull(message = "O pedido deve ter pelo menos um serviço")
    private List<Servico> servicos;

    @NotNull(message = "A data de entrega é obrigatória")
    @ValidDateRange(message = "A data de entrega deve estar entre 1 ano atrás e futuro")
    @Column(name = "data_entrega")
    private LocalDate dataEntrega;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "A prioridade é obrigatória")
    private Prioridade prioridade;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "O status é obrigatório")
    private Status status;

    @Column(name = "odontograma", columnDefinition = "TEXT")
    private String odontograma;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public enum Prioridade {
        BAIXA, MEDIA, ALTA
    }

    public enum Status {
        PENDENTE, EM_ANDAMENTO, CONCLUIDO, CANCELADO
    }
}

 