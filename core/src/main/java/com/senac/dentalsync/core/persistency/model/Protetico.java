package com.senac.dentalsync.core.persistency.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "protetico")
public class Protetico extends BaseEntity {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O CRO é obrigatório")
    @Pattern(regexp = "CRO-[A-Z]{2}-\\d{1,6}", message = "Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")
    @Column(unique = true)
    private String cro;

    @Column(columnDefinition = "BOOLEAN")
    private Boolean isAdmin;

    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}", message = "Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")
    @Column(unique = true)
    private String telefone;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Column(nullable = false)
    private String senha;

    @ManyToOne
    @JoinColumn(name = "laboratorio_id")
    private Laboratorio laboratorio;
    
    // Campos para autenticação 2FA
    @Column(name = "two_factor_secret")
    private String twoFactorSecret;
    
    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = false;
    
    // Getters e Setters para 2FA (adicionados manualmente)
    public String getTwoFactorSecret() {
        return twoFactorSecret;
    }
    
    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
    }
    
    public Boolean getTwoFactorEnabled() {
        return twoFactorEnabled;
    }
    
    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }
    
    // Getter para email (usado pelo SecurityController)
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    // Getter e setter para senha (usado pelo SecurityController)
    public String getSenha() {
        return senha;
    }
    
    public void setSenha(String senha) {
        this.senha = senha;
    }
    
    // Outros getters essenciais
    public String getCro() {
        return cro;
    }
    
    public String getTelefone() {
        return telefone;
    }
    
    public Boolean getIsAdmin() {
        return isAdmin;
    }
    
    public Laboratorio getLaboratorio() {
        return laboratorio;
    }
} 