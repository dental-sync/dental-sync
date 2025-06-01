package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "laboratorio")
public class Laboratorio extends BaseEntity {
    private String nomeLaboratorio;
    private String cnpj;
    private String emailLaboratorio;
    private String telefoneLaboratorio;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "endereco_id", referencedColumnName = "id")
    private EnderecoLaboratorio endereco;
} 