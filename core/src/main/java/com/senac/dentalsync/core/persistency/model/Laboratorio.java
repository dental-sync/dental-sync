package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "laboratorio")
public class Laboratorio extends BaseEntity {
    @NotBlank(message = "O nome do laboratório é obrigatório")
    @Size(max = 100, message = "O nome do laboratório deve ter no máximo 100 caracteres")
    private String nomeLaboratorio;

    @NotBlank(message = "O CNPJ é obrigatório")
    private String cnpj;

    @Email(message = "Email inválido")
    @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Email inválido")
    @Size(max = 255, message = "O e-mail não pode ultrapassar 255 caracteres")
    private String emailLaboratorio;

    @NotBlank(message = "O telefone é obrigatório")
    private String telefoneLaboratorio;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "endereco_id", referencedColumnName = "id")
    private EnderecoLaboratorio endereco;
}