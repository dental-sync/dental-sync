package com.senac.dentalsync.core.persistency.model;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class ServicoMaterialId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long servicoId;
    private Long materialId;
} 