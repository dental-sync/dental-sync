package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;

@Service
public class ProteticoService extends BaseService<Protetico, Long> {

    @Autowired
    private ProteticoRepository proteticoRepository;
    
    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected BaseRepository<Protetico, Long> getRepository() {
        return proteticoRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
    public Optional<Protetico> findByEmail(String email) {
        return proteticoRepository.findByEmail(email);
    }
    
    public Optional<Protetico> findByCro(String cro) {
        return proteticoRepository.findByCro(cro);
    }
    
    public List<Protetico> findByCroContaining(String cro) {
        return proteticoRepository.findByCroContaining(cro);
    }
} 