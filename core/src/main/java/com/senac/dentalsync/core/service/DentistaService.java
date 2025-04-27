package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
} 