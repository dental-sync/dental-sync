package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "clinica")
public class Clinica extends BaseEntity {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 255, message = "O nome não pode ultrapassar 255 caracteres")
    private String nome;

    @NotBlank(message = "O CNPJ é obrigatório")
    @Pattern(regexp = "\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}", message = "Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")
    private String cnpj;
} 