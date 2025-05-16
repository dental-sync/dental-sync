package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.CategoriaServico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.CategoriaServicoRepository;

@Service
public class CategoriaServicoService extends BaseService<CategoriaServico, Long>{

    @Autowired
    private CategoriaServicoRepository categoriaServicoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected BaseRepository<CategoriaServico, Long> getRepository() {
        return categoriaServicoRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
}
