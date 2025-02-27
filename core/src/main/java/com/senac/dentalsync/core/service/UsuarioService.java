package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.UsuarioRepository;

@Service
public class UsuarioService extends BaseService<Usuario, Long>{

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected BaseRepository<Usuario, Long> getRepository() {
        return usuarioRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return null;
    }

    
}