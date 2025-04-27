package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;

@Service
public class DentistaService extends BaseService<Dentista, Long> {

    @Autowired
    private DentistaRepository dentistaRepository;
    
    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected BaseRepository<Dentista, Long> getRepository() {
        return dentistaRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
    public Optional<Dentista> findByEmail(String email) {
        return dentistaRepository.findByEmail(email);
    }
    
    public Optional<Dentista> findByCro(String cro) {
        return dentistaRepository.findByCro(cro);
    }
    
    public List<Dentista> findByCroContaining(String cro) {
        return dentistaRepository.findByCroContaining(cro);
    }

    public Dentista updateStatus(Long id, Boolean status) {
        Dentista dentista = dentistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dentista não encontrado"));
        dentista.setStatus(status);
        return dentistaRepository.save(dentista);
    }

    @Override
    public void delete(Long id) {
        dentistaRepository.deleteById(id);
    }

    @Override
    public Dentista save(Dentista entity) {
        // Verificar se já existe dentista com o mesmo CRO
        if (entity.getId() == null) { // Apenas para novos cadastros
            Optional<Dentista> dentistaComCro = dentistaRepository.findByCro(entity.getCro());
            if (dentistaComCro.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CRO já cadastrado");
            }

            // Verificar se já existe dentista com o mesmo email
            Optional<Dentista> dentistaComEmail = dentistaRepository.findByEmail(entity.getEmail());
            if (dentistaComEmail.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já cadastrado");
            }
        }
        
        try {
            return super.save(entity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
} 