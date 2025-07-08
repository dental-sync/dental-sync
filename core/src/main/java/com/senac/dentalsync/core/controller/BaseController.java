package com.senac.dentalsync.core.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.senac.dentalsync.core.persistency.model.BaseEntity;
import com.senac.dentalsync.core.service.BaseService;

public abstract class BaseController<T extends BaseEntity, ID> {

    protected abstract BaseService<T, ID> getService();

    @GetMapping
    public ResponseEntity<List<T>> findAll() {
        return ResponseEntity.ok(getService().findAll());
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<T>> findAllIncludingInactive() {
        return ResponseEntity.ok(getService().findAllIncludingInactive());
    }
    
    @GetMapping("/inactive")
    public ResponseEntity<List<T>> findAllInactive() {
        return ResponseEntity.ok(getService().findAllInactive());
    }

    @GetMapping("/paginado")
    public ResponseEntity<Page<T>> findAll(Pageable pageable) {
        return ResponseEntity.ok(getService().findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<T> findById(@PathVariable ID id) {
        return getService().findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<T> save(@RequestBody T entity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(getService().save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<T> update(@PathVariable ID id, @RequestBody T entity) {
        return getService().findById(id)
                .map(existingEntity -> {
                    // Preservar campos de auditoria da entidade existente
                    entity.setId((Long) id);
                    entity.setCreatedAt(existingEntity.getCreatedAt());
                    entity.setCreatedBy(existingEntity.getCreatedBy());
                    entity.setIsActive(existingEntity.getIsActive());
                    
                    return ResponseEntity.ok(getService().save(entity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        getService().delete(id);
        return ResponseEntity.noContent().build();
    }
} 