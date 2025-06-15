package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ClinicaRepository;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
import com.senac.dentalsync.core.util.CNPJValidator;

@Service
public class ClinicaService extends BaseService<Clinica, Long> {

    @Autowired
    private ClinicaRepository clinicaRepository;
    
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private DentistaRepository dentistaRepository;

    @Override
    protected BaseRepository<Clinica, Long> getRepository() {
        return clinicaRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
    @Override
    public Clinica save(Clinica entity) {
        // Remove caracteres não numéricos do CNPJ para validação
        String cnpjNumerico = entity.getCnpj().replaceAll("\\D", "");
        
        // Valida o CNPJ
        if (!CNPJValidator.isValid(cnpjNumerico)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido");
        }
        
        // Verifica se já existe clínica com o mesmo CNPJ
        Optional<Clinica> clinicaComCnpj = clinicaRepository.findByCnpj(entity.getCnpj());
        if (clinicaComCnpj.isPresent() && !isSameEntity(entity, clinicaComCnpj.get())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ já cadastrado em outra clínica");
        }
        
        try {
            return super.save(entity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    private boolean isSameEntity(Clinica entity1, Clinica entity2) {
        // Verifica se é a mesma entidade (quando está atualizando)
        return entity1.getId() != null && entity1.getId().equals(entity2.getId());
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

    public List<Dentista> findDentistasByClinicaId(Long clinicaId) {
        return dentistaRepository.findByClinicas_Id(clinicaId);
    }

    @Override
    public void delete(Long id) {
        // Remover vínculo da clínica com todos os dentistas
        List<Dentista> dentistas = dentistaRepository.findByClinicas_Id(id);
        for (Dentista dentista : dentistas) {
            dentista.getClinicas().removeIf(clinica -> clinica.getId().equals(id));
            dentistaRepository.save(dentista);
        }
        clinicaRepository.deleteById(id);
    }
} 