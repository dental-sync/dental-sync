package com.senac.dentalsync.core.persistency.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne
    @JoinColumn(name = "created_by")
    @JsonIgnore  // Evita ciclo de serialização JSON
    private Protetico createdBy;

    @ManyToOne
    @JoinColumn(name = "updated_by")
    @JsonIgnore  // Evita ciclo de serialização JSON
    private Protetico updatedBy;

    // Método setId manual para resolver problema de compilação
    public void setId(Long id) {
        this.id = id;
    }

    // Método getId manual para resolver problema de compilação
    public Long getId() {
        return this.id;
    }

    // Métodos auxiliares para expor apenas os IDs dos usuários de auditoria (se necessário)
    @JsonProperty("createdById")
    public Long getCreatedById() {
        return createdBy != null ? createdBy.getId() : null;
    }

    @JsonProperty("updatedById")
    public Long getUpdatedById() {
        return updatedBy != null ? updatedBy.getId() : null;
    }

    @JsonProperty("createdByName")
    public String getCreatedByName() {
        return createdBy != null ? createdBy.getNome() : null;
    }

    @JsonProperty("updatedByName")
    public String getUpdatedByName() {
        return updatedBy != null ? updatedBy.getNome() : null;
    }

}