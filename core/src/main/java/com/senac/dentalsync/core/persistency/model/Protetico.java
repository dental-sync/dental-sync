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
    
    // Campos para dispositivo confiável
    @Column(name = "trusted_device_fingerprint")
    private String trustedDeviceFingerprint;
    
    @Column(name = "trusted_device_token")
    private String trustedDeviceToken;
    
    @Column(name = "trusted_device_timestamp")
    private Long trustedDeviceTimestamp;
    
    // Campos para "Lembrar de mim" (login persistente)
    @Column(name = "remember_me_token")
    private String rememberMeToken;
    
    @Column(name = "remember_me_timestamp")
    private Long rememberMeTimestamp;
    
    @Column(name = "remember_me_duration_days")
    private Integer rememberMeDurationDays;
    
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
    
    // Getters e Setters para dispositivo confiável
    public String getTrustedDeviceFingerprint() {
        return trustedDeviceFingerprint;
    }
    
    public void setTrustedDeviceFingerprint(String trustedDeviceFingerprint) {
        this.trustedDeviceFingerprint = trustedDeviceFingerprint;
    }
    
    public String getTrustedDeviceToken() {
        return trustedDeviceToken;
    }
    
    public void setTrustedDeviceToken(String trustedDeviceToken) {
        this.trustedDeviceToken = trustedDeviceToken;
    }
    
    public Long getTrustedDeviceTimestamp() {
        return trustedDeviceTimestamp;
    }
    
    public void setTrustedDeviceTimestamp(Long trustedDeviceTimestamp) {
        this.trustedDeviceTimestamp = trustedDeviceTimestamp;
    }
    
    // Getters e Setters para "Lembrar de mim"
    public String getRememberMeToken() {
        return rememberMeToken;
    }
    
    public void setRememberMeToken(String rememberMeToken) {
        this.rememberMeToken = rememberMeToken;
    }
    
    public Long getRememberMeTimestamp() {
        return rememberMeTimestamp;
    }
    
    public void setRememberMeTimestamp(Long rememberMeTimestamp) {
        this.rememberMeTimestamp = rememberMeTimestamp;
    }
    
    public Integer getRememberMeDurationDays() {
        return rememberMeDurationDays;
    }
    
    public void setRememberMeDurationDays(Integer rememberMeDurationDays) {
        this.rememberMeDurationDays = rememberMeDurationDays;
    }
} 