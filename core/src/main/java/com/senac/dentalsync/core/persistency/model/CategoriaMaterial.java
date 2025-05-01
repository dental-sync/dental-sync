package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "categoria_material")
public class CategoriaMaterial extends BaseEntity{
    
    // Adiciona limitacao de caracteres
    @Size(max = 40, message = "O nome da categoria deve ter no máximo 40 caracteres")
    private String nome; 
}
