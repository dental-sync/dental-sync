package com.senac.dentalsync.core.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class ServicoDTO {
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private BigDecimal tempoPrevisto;
    private CategoriaDTO categoria;
    private List<MaterialDTO> materiais;
    
    @Data
    public static class CategoriaDTO {
        private Long id;
    }
    
    @Data
    public static class MaterialDTO {
        private MaterialRefDTO material;
        private BigDecimal quantidade;
        
        @Data
        public static class MaterialRefDTO {
            private Long id;
        }
    }
} 