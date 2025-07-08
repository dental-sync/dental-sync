package com.senac.dentalsync.core.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.LaboratorioRepository;
import com.senac.dentalsync.core.util.CNPJValidator;

@Service
public class LaboratorioService extends BaseService<Laboratorio, Long> {

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Override
    protected BaseRepository<Laboratorio, Long> getRepository() {
        return laboratorioRepository;
    }

    @Override
    public Laboratorio save(Laboratorio entity) {
        // Remove caracteres não numéricos do CNPJ para validação
        String cnpjNumerico = entity.getCnpj().replaceAll("\\D", "");
        
        // Valida o CNPJ
        if (!CNPJValidator.isValid(cnpjNumerico)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido");
        }
        
        // Verifica se já existe laboratório ATIVO com o mesmo CNPJ
        Optional<Laboratorio> laboratorioComCnpj = laboratorioRepository.findByCnpjAndIsActiveTrue(entity.getCnpj());
        if (laboratorioComCnpj.isPresent() && !isSameEntity(entity, laboratorioComCnpj.get())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ já cadastrado em um laboratório ativo");
        }
        
        try {
            return super.save(entity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    private boolean isSameEntity(Laboratorio entity1, Laboratorio entity2) {
        // Verifica se é a mesma entidade (quando está atualizando)
        return entity1.getId() != null && entity1.getId().equals(entity2.getId());
    }

    // getUsuarioLogado() agora é implementado no BaseService
} 