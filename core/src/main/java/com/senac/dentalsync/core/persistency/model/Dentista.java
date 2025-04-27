package com.senac.dentalsync.core.persistency.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dentista")
public class Dentista extends BaseEntity {

    @NotBlank(message = "O nome é obrigatório")
    @Pattern(regexp = "^[\\p{L}\\s]{2,}(\\s[\\p{L}\\s]{2,})+$", message = "Por favor, informe o nome e sobrenome")
    private String nome;

    @NotBlank(message = "O CRO é obrigatório")
    @Pattern(regexp = "CRO-[A-Z]{2}-[A-Z]{2,3}-\\d{4,5}", message = "Formato de CRO inválido. Use o formato: CRO-SC-CD-12345 ou CRO-SC-TPD-1234")
    private String cro;

    @ManyToMany
    private List<Clinica> clinicas;

    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "\\(\\d{2}\\)\\s\\d{5}-\\d{4}", message = "Formato de telefone inválido. Use o formato: (99) 99999-9999")
    private String telefone;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.com$", message = "O email deve terminar com .com")
    private String email;
    
    private Boolean status;
} 