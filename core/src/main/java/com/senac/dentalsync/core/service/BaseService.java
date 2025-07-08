package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.BaseEntity;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public abstract class BaseService<T extends BaseEntity, ID> {

    @Autowired
    protected ProteticoRepository proteticoRepository;

    protected abstract BaseRepository<T, ID> getRepository();
    
    /**
     * Busca o protético logado através do SecurityContext
     * @return Protetico logado ou null se não encontrado
     */
    protected Protetico getUsuarioLogado() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                String emailUsuarioLogado = authentication.getName();
                System.out.println("🔍 Buscando usuário logado: " + emailUsuarioLogado);
                
                Optional<Protetico> proteticoOpt = proteticoRepository.findByEmailAndIsActiveTrue(emailUsuarioLogado);
                if (proteticoOpt.isPresent()) {
                    Protetico protetico = proteticoOpt.get();
                    System.out.println("✅ Usuário logado encontrado: " + protetico.getNome() + " (ID: " + protetico.getId() + ")");
                    return protetico;
                } else {
                    System.out.println("❌ Usuário logado não encontrado no banco: " + emailUsuarioLogado);
                }
            } else {
                System.out.println("❌ Nenhum usuário autenticado");
            }
        } catch (Exception e) {
            System.out.println("❌ Erro ao buscar usuário logado: " + e.getMessage());
        }
        return null;
    }

    public T save(T entity) {
        Protetico usuarioLogado = getUsuarioLogado();
        
        if (entity.getId() == null) {
            // Nova entidade
            entity.setCreatedAt(LocalDateTime.now());
            entity.setCreatedBy(usuarioLogado);
            
            // Só setar isActive como true se ainda não foi definido
            if (entity.getIsActive() == null) {
                entity.setIsActive(true);
            }
            
            if (usuarioLogado != null) {
                System.out.println("📝 Criando nova entidade - created_by: " + usuarioLogado.getNome() + " (ID: " + usuarioLogado.getId() + ")");
            } else {
                System.out.println("⚠️ Criando nova entidade sem usuário logado (created_by será null)");
            }
        } else {
            // Entidade existente - apenas atualizar updated_by
            // Garantir que isActive seja true se não foi especificado explicitamente
            if (entity.getIsActive() == null) {
                entity.setIsActive(true);
            }
            
            if (usuarioLogado != null) {
                System.out.println("📝 Atualizando entidade - updated_by: " + usuarioLogado.getNome() + " (ID: " + usuarioLogado.getId() + ")");
            } else {
                System.out.println("⚠️ Atualizando entidade sem usuário logado (updated_by será null)");
            }
        }
        
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setUpdatedBy(usuarioLogado);
        
        return getRepository().save(entity);
    }

    public List<T> findAll() {
        // Retorna apenas entidades ativas
        return getRepository().findAllByIsActiveTrue();
    }
    
    public List<T> findAllIncludingInactive() {
        // Método para retornar todas as entidades, incluindo inativas
        return getRepository().findAll();
    }
    
    public List<T> findAllInactive() {
        // Método para retornar apenas entidades inativas
        return getRepository().findAllByIsActiveFalse();
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
            Protetico usuarioLogado = getUsuarioLogado();
            
            // SOFT DELETE ATIVADO - Para os triggers de backup funcionarem
            
            // Garantir que todos os campos necessários estão preenchidos
            if (entityToUpdate.getCreatedAt() == null) {
                entityToUpdate.setCreatedAt(LocalDateTime.now());
            }
            
            if (entityToUpdate.getCreatedBy() == null) {
                entityToUpdate.setCreatedBy(usuarioLogado);
            }
            
            // Atualizar campos de exclusão lógica
            entityToUpdate.setIsActive(false);
            entityToUpdate.setUpdatedAt(LocalDateTime.now());
            entityToUpdate.setUpdatedBy(usuarioLogado);
            
            if (usuarioLogado != null) {
                System.out.println("🗑️ Desativando entidade - updated_by: " + usuarioLogado.getNome() + " (ID: " + usuarioLogado.getId() + ")");
            } else {
                System.out.println("⚠️ Desativando entidade sem usuário logado (updated_by será null)");
            }
            
            getRepository().save(entityToUpdate);

            // DELETE REAL comentado - agora usando SOFT DELETE
            // getRepository().delete(entityToUpdate);
        }
    }
} 