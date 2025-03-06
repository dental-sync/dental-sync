package com.senac.dentalsync.core.persistency.dto;

import java.time.LocalDateTime;

public class BaseDTO {

    private Long id;

    private LocalDateTime criadoEm;

    private LocalDateTime atualizadoEm;

    private Boolean ativo;

    private UsuarioDTO criadoPor;

    private UsuarioDTO atualizadoPor;
}