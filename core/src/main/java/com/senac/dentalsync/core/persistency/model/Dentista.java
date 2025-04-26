package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dentista")
public class Dentista extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O CRO é obrigatório")
    @Pattern(regexp = "(CRO-[A-Z]{2}\\s?\\d{1,6})|(\\d{1,6}\\s?CRO-[A-Z]{2})", message = "Formato de CRO inválido. Use o formato: CRO-XX NNNNNN ou NNNNNN CRO-XX")
    private String cro;

    @ManyToMany
    private List<Clinica> clinicas;

    private String telefone;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String email;
    
    private Boolean status;
} 