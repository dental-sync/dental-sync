package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.dto.BaseDTO;
import com.senac.dentalsync.core.persistency.model.BaseEntity;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public abstract class BaseService<T extends BaseEntity, D extends BaseDTO, ID> {

    protected abstract BaseRepository<T, ID> getRepository();
    
    protected abstract Usuario getUsuarioLogado();

    public T save(T entity) {
        if (entity.getId() == null) {
            entity.setCriadoEm(LocalDateTime.now());
            entity.setCriadoPor(getUsuarioLogado());
            entity.setAtivo(true);
        }
        
        entity.setAtualizadoEm(LocalDateTime.now());
        entity.setAtualizadoPor(getUsuarioLogado());
        
        return getRepository().save(entity);
    }

    public List<T> findAll() {
        return getRepository().findAll();
    }

    public Page<T> findAll(Pageable pageable) {
        return getRepository().findAll(pageable);
    }

    public Optional<T> findById(ID id) {
        return getRepository().findById(id);
    }

    public void delete(ID id) {
        Optional<T> entity = findById(id);
        if (entity.isPresent()) {
            T entityToUpdate = entity.get();
            entityToUpdate.setAtivo(false);
            entityToUpdate.setAtualizadoEm(LocalDateTime.now());
            entityToUpdate.setAtualizadoPor(getUsuarioLogado());
            getRepository().save(entityToUpdate);
        }
    }
} 