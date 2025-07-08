package com.senac.dentalsync.core.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Protetico;
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
        String cnpjNumerico = entity.getCnpj().replaceAll("\\D", "");
        
        if (!CNPJValidator.isValid(cnpjNumerico)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido");
        }
        
        Optional<Laboratorio> laboratorioComCnpj = laboratorioRepository.findByCnpjAndIsActiveTrue(entity.getCnpj());
        if (laboratorioComCnpj.isPresent() && !isSameEntity(entity, laboratorioComCnpj.get())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ já cadastrado em um laboratório ativo");
        }
        
        processarEndereco(entity);
        
        try {
            return super.save(entity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    private void processarEndereco(Laboratorio entity) {
        if (entity.getEndereco() != null) {
            if (entity.getId() != null) {
                Optional<Laboratorio> laboratorioExistente = findById(entity.getId());
                
                if (laboratorioExistente.isPresent() && laboratorioExistente.get().getEndereco() != null) {
                    entity.getEndereco().setId(laboratorioExistente.get().getEndereco().getId());
                    entity.getEndereco().setCreatedAt(laboratorioExistente.get().getEndereco().getCreatedAt());
                    entity.getEndereco().setCreatedBy(laboratorioExistente.get().getEndereco().getCreatedBy());
                }
            }
            
            preencherCamposAuditoriaEndereco(entity.getEndereco());
        }
    }
    
    private void preencherCamposAuditoriaEndereco(com.senac.dentalsync.core.persistency.model.EnderecoLaboratorio endereco) {
        Protetico usuarioLogado = getUsuarioLogado();
        
        if (endereco.getId() == null) {
            endereco.setCreatedAt(java.time.LocalDateTime.now());
            endereco.setCreatedBy(usuarioLogado);
            
            if (endereco.getIsActive() == null) {
                endereco.setIsActive(true);
            }
        } else {
            if (endereco.getIsActive() == null) {
                endereco.setIsActive(true);
            }
        }
        
        endereco.setUpdatedAt(java.time.LocalDateTime.now());
        endereco.setUpdatedBy(usuarioLogado);
    }
    
    private boolean isSameEntity(Laboratorio entity1, Laboratorio entity2) {
        return entity1.getId() != null && entity1.getId().equals(entity2.getId());
    }
} 