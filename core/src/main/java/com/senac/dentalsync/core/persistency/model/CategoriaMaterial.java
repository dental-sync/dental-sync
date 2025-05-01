package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "categoria_material")
public class CategoriaMaterial extends BaseEntity{
    
    private String nome; 
}
