package com.senac.dentalsync.core.controller;

import com.senac.dentalsync.core.persistency.model.BaseEntity;
import com.senac.dentalsync.core.persistency.dto.BaseDTO;
import com.senac.dentalsync.core.service.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public abstract class BaseController<T extends BaseEntity, D extends BaseDTO, ID> {

    protected abstract BaseService<T, D, ID> getService();

    @GetMapping
    public ResponseEntity<List<T>> findAll() {
        return ResponseEntity.ok(getService().findAll());
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
                    entity.setId((Long) id); // Aqui fazemos um cast para Long, já que nosso BaseEntity usa Long
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