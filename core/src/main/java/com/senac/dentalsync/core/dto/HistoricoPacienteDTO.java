package com.senac.dentalsync.core.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HistoricoPacienteDTO {
    private String nomeServico;
    private String nomeDentista;
    private LocalDate dataEntrega;
    private BigDecimal valorTotal;

    public HistoricoPacienteDTO() {}

    public HistoricoPacienteDTO(String nomeServico, String nomeDentista, LocalDate dataEntrega, BigDecimal valorTotal) {
        this.nomeServico = nomeServico;
        this.nomeDentista = nomeDentista;
        this.dataEntrega = dataEntrega;
        this.valorTotal = valorTotal;
    }

    public String getNomeServico() { return nomeServico; }
    public void setNomeServico(String nomeServico) { this.nomeServico = nomeServico; }

    public String getNomeDentista() { return nomeDentista; }
    public void setNomeDentista(String nomeDentista) { this.nomeDentista = nomeDentista; }

    public LocalDate getDataEntrega() { return dataEntrega; }
    public void setDataEntrega(LocalDate dataEntrega) { this.dataEntrega = dataEntrega; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
} 