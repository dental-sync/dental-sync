package com.senac.dentalsync.core.persistency.model;

public enum StatusMaterial {
    EM_ESTOQUE("Em Estoque"),
    BAIXO_ESTOQUE("Baixo Estoque"),
    SEM_ESTOQUE("Sem Estoque");

    private final String descricao;

    StatusMaterial(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
} 