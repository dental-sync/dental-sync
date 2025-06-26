package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.CategoriaServico;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.CategoriaServicoRepository;

@Service
public class CategoriaServicoService extends BaseService<CategoriaServico, Long>{

    @Autowired
    private CategoriaServicoRepository categoriaServicoRepository;

    @Override
    protected BaseRepository<CategoriaServico, Long> getRepository() {
        return categoriaServicoRepository;
    }

    @Override
    protected Protetico getUsuarioLogado() {
        return null;
    }
    
}
