package com.senac.dentalsync.core.persistency.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "servico_material")
@NoArgsConstructor
@AllArgsConstructor
public class ServicoMaterial {

    @EmbeddedId
    private ServicoMaterialId id = new ServicoMaterialId();

    @ManyToOne
    @MapsId("servicoId")
    @JoinColumn(name = "servico_id")
    @JsonBackReference
    private Servico servico;

    @ManyToOne
    @MapsId("materialId")
    @JoinColumn(name = "material_id")
    private Material material;

    private BigDecimal quantidade;

    public ServicoMaterial(Servico servico, Material material, BigDecimal quantidade) {
        this.servico = servico;
        this.material = material;
        this.quantidade = quantidade;
        this.id = new ServicoMaterialId(servico.getId(), material.getId());
    }
} 