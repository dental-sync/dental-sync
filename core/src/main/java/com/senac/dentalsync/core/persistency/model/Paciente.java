package com.senac.dentalsync.core.persistency.model;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Past;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Paciente")
public class Paciente extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O número de telefone é obrigatório")
    private String telefone;
    
    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @Past(message = "A data de nascimento não pode ser hoje ou data futura")
    private Date dataNascimento;

    private Date ultimoPedido;

    private enum status{
        ATIVO, INATIVO
    }

}
