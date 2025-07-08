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
@Table(name = "endereco_laboratorio")
public class EnderecoLaboratorio extends BaseEntity {
    
    @NotBlank(message = "O CEP é obrigatório")
    private String cep;

    @NotBlank(message = "O logradouro é obrigatório")
    @Size(max = 100, message = "O logradouro deve ter no máximo 100 caracteres")
    private String logradouro;

    @NotBlank(message = "O número é obrigatório")
    @Size(max = 10, message = "O número deve ter no máximo 10 caracteres")
    private String numero;

    @NotBlank(message = "O bairro é obrigatório")
    @Size(max = 50, message = "O bairro deve ter no máximo 50 caracteres")
    private String bairro;

    @NotBlank(message = "A cidade é obrigatória")
    @Size(max = 50, message = "A cidade deve ter no máximo 50 caracteres")
    private String cidade;

    @NotBlank(message = "O estado é obrigatório")
    @Size(min = 2, max = 2, message = "O estado deve ter exatamente 2 caracteres")
    private String estado;
}