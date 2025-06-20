package com.senac.dentalsync.core.persistency.model;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
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

    @ManyToMany(mappedBy = "servicos")
    @JsonIgnore
    private List<Pedido> pedidos;

    private String nome;
    
    @Column(name = "preco", precision = 10, scale = 2)
    private BigDecimal preco; // Valor da mão de obra
    
    @Column(name = "valor_materiais", precision = 10, scale = 2)
    private BigDecimal valorMateriais; // Soma do valor de todos os materiais utilizados
    
    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal; // Valor total (preço + valorMateriais)
    
    private BigDecimal tempoPrevisto;
    private String descricao;
    
    @OneToMany(mappedBy = "servico", cascade = jakarta.persistence.CascadeType.REMOVE)
    @JsonManagedReference
    private List<ServicoMaterial> materiais;
}
