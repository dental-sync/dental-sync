package com.senac.dentalsync.core.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HistoricoDentistaDTO {
    private String nomeServico;
    private String nomePaciente;
    private LocalDate dataEntrega;
    private BigDecimal valorTotal;

    public HistoricoDentistaDTO() {}

    public HistoricoDentistaDTO(String nomeServico, String nomePaciente, LocalDate dataEntrega, BigDecimal valorTotal) {
        this.nomeServico = nomeServico;
        this.nomePaciente = nomePaciente;
        this.dataEntrega = dataEntrega;
        this.valorTotal = valorTotal;
    }

    public String getNomeServico() { return nomeServico; }
    public void setNomeServico(String nomeServico) { this.nomeServico = nomeServico; }

    public String getNomePaciente() { return nomePaciente; }
    public void setNomePaciente(String nomePaciente) { this.nomePaciente = nomePaciente; }

    public LocalDate getDataEntrega() { return dataEntrega; }
    public void setDataEntrega(LocalDate dataEntrega) { this.dataEntrega = dataEntrega; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
} 