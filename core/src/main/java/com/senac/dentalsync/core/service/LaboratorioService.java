package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.LaboratorioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LaboratorioService extends BaseService<Laboratorio, Long> {

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected BaseRepository<Laboratorio, Long> getRepository() {
        return laboratorioRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
} 