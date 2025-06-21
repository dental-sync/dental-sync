package com.senac.dentalsync.core.dto;

import java.time.LocalDate;
import java.util.List;

import com.senac.dentalsync.core.persistency.model.Pedido;

import lombok.Data;

@Data
public class PedidoDTO {
    
    private ClienteDTO cliente;
    private DentistaDTO dentista;
    private ProteticoDTO protetico;
    private List<ServicoComQuantidadeDTO> servicos;
    private LocalDate dataEntrega;
    private Pedido.Prioridade prioridade;
    private Pedido.Status status;
    private String odontograma;
    private String observacao;
    
    @Data
    public static class ClienteDTO {
        private Long id;
    }
    
    @Data
    public static class DentistaDTO {
        private Long id;
    }
    
    @Data
    public static class ProteticoDTO {
        private Long id;
    }
    
    @Data
    public static class ServicoComQuantidadeDTO {
        private Long id;
        private Integer quantidade;
    }
} 