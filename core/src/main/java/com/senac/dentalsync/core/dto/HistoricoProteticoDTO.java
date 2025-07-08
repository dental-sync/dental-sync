package com.senac.dentalsync.core.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HistoricoProteticoDTO {
    private String nomeServico;
    private String nomePaciente;
    private String nomeDentista;
    private LocalDate dataEntrega;
    private BigDecimal valorTotal;

    public HistoricoProteticoDTO() {}

    public HistoricoProteticoDTO(String nomeServico, String nomePaciente, String nomeDentista, LocalDate dataEntrega, BigDecimal valorTotal) {
        this.nomeServico = nomeServico;
        this.nomePaciente = nomePaciente;
        this.nomeDentista = nomeDentista;
        this.dataEntrega = dataEntrega;
        this.valorTotal = valorTotal;
    }

    public String getNomeServico() { return nomeServico; }
    public void setNomeServico(String nomeServico) { this.nomeServico = nomeServico; }

    public String getNomePaciente() { return nomePaciente; }
    public void setNomePaciente(String nomePaciente) { this.nomePaciente = nomePaciente; }

    public String getNomeDentista() { return nomeDentista; }
    public void setNomeDentista(String nomeDentista) { this.nomeDentista = nomeDentista; }

    public LocalDate getDataEntrega() { return dataEntrega; }
    public void setDataEntrega(LocalDate dataEntrega) { this.dataEntrega = dataEntrega; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
} 