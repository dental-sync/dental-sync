package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.MaterialRepository;  

@Service
public class MaterialService extends BaseService<Material, Long> {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Override
    public MaterialRepository getRepository() {
        return materialRepository;
    }

    @Override
    public Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
    
}
