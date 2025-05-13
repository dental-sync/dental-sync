package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "categoria_servico")
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaServico extends BaseEntity {

    @Size(max = 40, message = "O nome da categoria deve ter no máximo 40 caracteres")
    private String nome;
}

