package com.senac.dentalsync.core.persistency.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
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
@Table(name = "dentista")
public class Dentista extends BaseEntity {

    @NotBlank(message = "O nome é obrigatório")
    @Pattern(regexp = "^[\\p{L}]{2,}(?:\\s[\\p{L}]{1,})+$", message = "Por favor, informe um nome válido. O primeiro nome deve ter no mínimo 2 letras e pelo menos um sobrenome com no mínimo 1 letra")
    @Size(max = 255, message = "O nome não pode ultrapassar 255 caracteres")
    private String nome;

    @NotBlank(message = "O CRO é obrigatório")
    @Pattern(regexp = "CRO-[A-Z]{2}-\\d{1,6}", message = "Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")
    private String cro;

    @ManyToMany
    @JoinTable(
        name = "dentista_clinica",
        joinColumns = @JoinColumn(name = "dentista_id"),
        inverseJoinColumns = @JoinColumn(name = "clinica_id")
    )
    private List<Clinica> clinicas;

    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}", message = "Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")
    private String telefone;

    @NotBlank(message = "O email é obrigatório")
    @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.com$", message = "O email deve terminar com .com")
    @Size(max = 255, message = "O email não pode ultrapassar 255 caracteres")
    private String email;
} 