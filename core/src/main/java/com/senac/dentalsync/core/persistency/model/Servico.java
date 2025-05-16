package com.senac.dentalsync.core.persistency.model;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "servicos")
@NoArgsConstructor
@AllArgsConstructor
public class Servico extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "categoria_servico_id")
    private CategoriaServico categoriaServico;

    private String nome;
    private BigDecimal preco;
    private BigDecimal tempoPrevisto;
    private String descricao;
    
    @ManyToMany
    @JoinTable(
        name = "servico_material",
        joinColumns = @JoinColumn(name = "servico_id"),
        inverseJoinColumns = @JoinColumn(name = "material_id")
    )
    private List<Material> materiaisNecessarios;
}
