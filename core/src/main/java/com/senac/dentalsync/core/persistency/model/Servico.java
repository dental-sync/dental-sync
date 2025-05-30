package com.senac.dentalsync.core.persistency.model;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
    
    @OneToMany(mappedBy = "servico", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ServicoMaterial> materiais;
}
