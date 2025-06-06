package com.senac.dentalsync.core.persistency.model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import com.fasterxml.jackson.annotation.JsonManagedReference;

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

    @ManyToMany
    @JoinTable(
        name = "pedido_servico",
        joinColumns = @JoinColumn(name = "pedido_id"),
        inverseJoinColumns = @JoinColumn(name = "servico_id")
    )
    @NotNull(message = "O pedido deve ter pelo menos um serviço")
    @JsonManagedReference
    private List<Servico> servicos;

    @NotNull(message = "A data de entrega é obrigatória")
    @Column(name = "data_entrega")
    private LocalDate dataEntrega;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "A prioridade é obrigatória")
    private Prioridade prioridade;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "O status é obrigatório")
    private Status status;

    @ElementCollection
    @Column(name = "odontograma")
    private List<Integer> odontograma;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public enum Prioridade {
        BAIXA, MEDIA, ALTA, URGENTE
    }

    public enum Status {
        PENDENTE, EM_ANDAMENTO, CONCLUIDO, CANCELADO
    }
} 