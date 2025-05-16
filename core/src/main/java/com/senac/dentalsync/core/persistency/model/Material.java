package com.senac.dentalsync.core.persistency.model;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "material")
public class Material extends BaseEntity {

    private String nome;

    @ManyToOne
    @JoinColumn(name = "categoria_material_id")
    private CategoriaMaterial categoriaMaterial;
    private BigDecimal quantidade;
    private String unidadeMedida;
    private BigDecimal valorUnitario;
    private BigDecimal estoqueMinimo;

    @Enumerated(EnumType.STRING)
    private StatusMaterial status;

    @Transient
    private BigDecimal qtdUsada;
}
