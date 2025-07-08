package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ClinicaRepository;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
import com.senac.dentalsync.core.util.CNPJValidator;

@Service
public class ClinicaService extends BaseService<Clinica, Long> {

    @Autowired
    private ClinicaRepository clinicaRepository;

    @Autowired
    private DentistaRepository dentistaRepository;

    @Override
    protected BaseRepository<Clinica, Long> getRepository() {
        return clinicaRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService
    
    @Override
    public Clinica save(Clinica entity) {
        // Remove caracteres não numéricos do CNPJ para validação
        String cnpjNumerico = entity.getCnpj().replaceAll("\\D", "");
        
        // Valida o CNPJ
        if (!CNPJValidator.isValid(cnpjNumerico)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido");
        }
        
        // Verifica se já existe clínica ATIVA com o mesmo CNPJ
        Optional<Clinica> clinicaComCnpj = clinicaRepository.findByCnpjAndIsActiveTrue(entity.getCnpj());
        if (clinicaComCnpj.isPresent() && !isSameEntity(entity, clinicaComCnpj.get())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ já cadastrado em uma clínica ativa");
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
    
    // Métodos para buscar incluindo inativos (uso interno)
    public Optional<Clinica> findByNome(String nome) {
        return clinicaRepository.findByNome(nome);
    }
    
    public Optional<Clinica> findByCnpj(String cnpj) {
        return clinicaRepository.findByCnpj(cnpj);
    }
    
    public List<Clinica> findByNomeContaining(String nome) {
        return clinicaRepository.findByNomeContaining(nome);
    }
    
    // Métodos para buscar apenas ativos (uso público)
    public Optional<Clinica> findByNomeActive(String nome) {
        return clinicaRepository.findByNomeAndIsActiveTrue(nome);
    }
    
    public Optional<Clinica> findByCnpjActive(String cnpj) {
        return clinicaRepository.findByCnpjAndIsActiveTrue(cnpj);
    }
    
    public List<Clinica> findByNomeContainingActive(String nome) {
        return clinicaRepository.findByNomeContainingAndIsActiveTrue(nome);
    }

    public List<Dentista> findDentistasByClinicaId(Long clinicaId) {
        return dentistaRepository.findByClinicas_Id(clinicaId);
    }
    
    public List<Dentista> findDentistasByClinicaIdActive(Long clinicaId) {
        return dentistaRepository.findByClinicas_IdAndIsActiveTrue(clinicaId);
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