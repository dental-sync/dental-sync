package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.LaboratorioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LaboratorioService extends BaseService<Laboratorio, Long> {

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Override
    protected BaseRepository<Laboratorio, Long> getRepository() {
        return laboratorioRepository;
    }

    @Override
    protected Protetico getUsuarioLogado() {
        return null;
    }
} 