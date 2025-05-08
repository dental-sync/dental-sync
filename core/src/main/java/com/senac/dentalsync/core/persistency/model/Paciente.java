package com.senac.dentalsync.core.persistency.model;

import java.sql.Date;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "paciente")
public class Paciente extends BaseEntity {

    @NotBlank(message = "O nome é obrigatório")
    @Pattern(
    regexp = "^[\\p{L}]{2,}(?:\\s[\\p{L}]{2,})+$",
    message = "Por favor, informe nome e sobrenome válidos"
)
    @Size(max = 255, message = "O nome não pode ultrapassar 255 caracteres")
    private String nome;

    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "\\(\\d{2}\\)\\s(\\d{4}-\\d{4}|\\d{5}-\\d{4})", message = "Formato de telefone inválido. Use o formato: (99) 9999-9999 ou (99) 99999-9999")
    private String telefone;
    
    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Email inválido")
    @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Email inválido")
    @Size(max = 255, message = "O e-mail não pode ultrapassar 255 caracteres")
    private String email;

    @Past(message = "A data de nascimento não pode ser hoje ou data futura")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dataNascimento;

    private LocalDate ultimoPedido;
}
