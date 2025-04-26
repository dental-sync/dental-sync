package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ClinicaRepository;

@Service
public class ClinicaService extends BaseService<Clinica, Long> {

    @Autowired
    private ClinicaRepository clinicaRepository;
    
    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected BaseRepository<Clinica, Long> getRepository() {
        return clinicaRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
    public Optional<Clinica> findByNome(String nome) {
        return clinicaRepository.findByNome(nome);
    }
    
    public Optional<Clinica> findByCnpj(String cnpj) {
        return clinicaRepository.findByCnpj(cnpj);
    }
    
    public List<Clinica> findByNomeContaining(String nome) {
        return clinicaRepository.findByNomeContaining(nome);
    }
} 