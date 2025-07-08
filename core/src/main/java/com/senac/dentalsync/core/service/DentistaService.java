package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
import com.senac.dentalsync.core.persistency.repository.ClinicaRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;

@Service
public class DentistaService extends BaseService<Dentista, Long> {

    @Autowired
    private DentistaRepository dentistaRepository;
    
    @Autowired
    private ClinicaRepository clinicaRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    @Override
    protected BaseRepository<Dentista, Long> getRepository() {
        return dentistaRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService
    
    // Métodos para buscar incluindo inativos (uso interno)
    public Optional<Dentista> findByEmail(String email) {
        return dentistaRepository.findByEmail(email);
    }
    
    public Optional<Dentista> findByCro(String cro) {
        return dentistaRepository.findByCro(cro);
    }
    
    public List<Dentista> findByCroContaining(String cro) {
        return dentistaRepository.findByCroContaining(cro);
    }

    public Optional<Dentista> findByTelefone(String telefone) {
        return dentistaRepository.findByTelefone(telefone);
    }
    
    public List<Dentista> findByClinicaId(Long clinicaId) {
        return dentistaRepository.findByClinicas_Id(clinicaId);
    }
    
    // Métodos para buscar apenas ativos (uso público)
    public Optional<Dentista> findByEmailActive(String email) {
        return dentistaRepository.findByEmailAndIsActiveTrue(email);
    }
    
    public Optional<Dentista> findByCroActive(String cro) {
        return dentistaRepository.findByCroAndIsActiveTrue(cro);
    }
    
    public List<Dentista> findByCroContainingActive(String cro) {
        return dentistaRepository.findByCroContainingAndIsActiveTrue(cro);
    }

    public Optional<Dentista> findByTelefoneActive(String telefone) {
        return dentistaRepository.findByTelefoneAndIsActiveTrue(telefone);
    }
    
    public List<Dentista> findByClinicaIdActive(Long clinicaId) {
        return dentistaRepository.findByClinicas_IdAndIsActiveTrue(clinicaId);
    }

    public Dentista updateStatus(Long id, Boolean status) {
        try {
            // Buscar dentista existente
            Optional<Dentista> dentistaOpt = dentistaRepository.findById(id);
            
            if (dentistaOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dentista não encontrado");
            }
            
            Dentista dentista = dentistaOpt.get();
            
            // Usar reflection para contornar problema do Lombok
            java.lang.reflect.Field isActiveField = dentista.getClass().getSuperclass().getDeclaredField("isActive");
            isActiveField.setAccessible(true);
            isActiveField.set(dentista, status);
            
            return super.save(dentista);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar status: " + e.getMessage());
        }
    }

    @Override
    public void delete(Long id) {
        // Primeiro, buscar o dentista
        Optional<Dentista> dentistaOpt = dentistaRepository.findById(id);
        
        if (dentistaOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dentista não encontrado");
        }
        
        Dentista dentista = dentistaOpt.get();
        
        // Buscar todos os pedidos do dentista e deletá-los primeiro
        List<Pedido> pedidos = pedidoRepository.findByDentista(dentista);
        pedidoRepository.deleteAll(pedidos);
        
        // Agora pode deletar o dentista (o relacionamento com clínicas é deletado automaticamente pelo JPA)
        dentistaRepository.deleteById(id);
    }

    @Override
    public Dentista save(Dentista entity) {
        try {
            return super.save(entity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
} 