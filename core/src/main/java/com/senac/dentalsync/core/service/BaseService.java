package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.BaseEntity;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public abstract class BaseService<T extends BaseEntity, ID> {

    protected abstract BaseRepository<T, ID> getRepository();
    
    protected abstract Usuario getUsuarioLogado();

    public T save(T entity) {
        if (entity.getId() == null) {
            entity.setCreatedAt(LocalDateTime.now());
            entity.setCreatedBy(getUsuarioLogado());
            entity.setIsActive(true);
        }
        
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setUpdatedBy(getUsuarioLogado());
        
        return getRepository().save(entity);
    }

    public List<T> findAll() {
        List<T> list = getRepository().findAll();
        return list;
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
            
            //Garantir que todos os campos necessários estão preenchidos
            if (entityToUpdate.getCreatedAt() == null) {
                entityToUpdate.setCreatedAt(LocalDateTime.now());
            }
            
            if (entityToUpdate.getCreatedBy() == null) {
                entityToUpdate.setCreatedBy(getUsuarioLogado());
            }
            
            //Atualizar campos de exclusão lógica
            entityToUpdate.setIsActive(false);
            entityToUpdate.setUpdatedAt(LocalDateTime.now());
            entityToUpdate.setUpdatedBy(getUsuarioLogado());
            getRepository().save(entityToUpdate);
        }
    }
} 