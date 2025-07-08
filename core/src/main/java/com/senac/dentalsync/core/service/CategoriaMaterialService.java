package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.CategoriaMaterial;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.CategoriaMaterialRepository;

@Service
public class CategoriaMaterialService extends BaseService<CategoriaMaterial, Long>{

    @Autowired
    private CategoriaMaterialRepository categoriaMaterialRepository;

    @Override
    protected BaseRepository<CategoriaMaterial, Long> getRepository() {
        return categoriaMaterialRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService

}