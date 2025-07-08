package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
import com.senac.dentalsync.core.persistency.repository.ClinicaRepository;

@Service
public class DentistaService extends BaseService<Dentista, Long> {

    @Autowired
    private DentistaRepository dentistaRepository;
    
    @Autowired
    private ClinicaRepository clinicaRepository;

    @Override
    protected BaseRepository<Dentista, Long> getRepository() {
        return dentistaRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService
    
    // Métodos para buscar incluindo inativos (uso interno)
    public Optional<Dentista> findByEmail(String email) {
        return dentistaRepository.findByEmail(email);
    }
    
    public Optional<Dentista> findByCro(String cro) {
        return dentistaRepository.findByCro(cro);
    }
    
    public List<Dentista> findByCroContaining(String cro) {
        return dentistaRepository.findByCroContaining(cro);
    }

    public Optional<Dentista> findByTelefone(String telefone) {
        return dentistaRepository.findByTelefone(telefone);
    }
    
    public List<Dentista> findByClinicaId(Long clinicaId) {
        return dentistaRepository.findByClinicas_Id(clinicaId);
    }
    
    // Métodos para buscar apenas ativos (uso público)
    public Optional<Dentista> findByEmailActive(String email) {
        return dentistaRepository.findByEmailAndIsActiveTrue(email);
    }
    
    public Optional<Dentista> findByCroActive(String cro) {
        return dentistaRepository.findByCroAndIsActiveTrue(cro);
    }
    
    public List<Dentista> findByCroContainingActive(String cro) {
        return dentistaRepository.findByCroContainingAndIsActiveTrue(cro);
    }

    public Optional<Dentista> findByTelefoneActive(String telefone) {
        return dentistaRepository.findByTelefoneAndIsActiveTrue(telefone);
    }
    
    public List<Dentista> findByClinicaIdActive(Long clinicaId) {
        return dentistaRepository.findByClinicas_IdAndIsActiveTrue(clinicaId);
    }

    public Dentista updateStatus(Long id, Boolean status) {
        Dentista dentista = dentistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dentista não encontrado"));
        dentista.setIsActive(status);
        return super.save(dentista);
    }

    @Override
    public void delete(Long id) {
        dentistaRepository.deleteById(id);
    }

    @Override
    public Dentista save(Dentista entity) {
        // Validar se o nome contém números
        if (entity.getNome().matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome não pode conter números");
        }

        // Verificar se já existe dentista ATIVO com o mesmo CRO
        Optional<Dentista> dentistaComCro = dentistaRepository.findByCroAndIsActiveTrue(entity.getCro());
        if (dentistaComCro.isPresent() && !dentistaComCro.get().getId().equals(entity.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CRO já cadastrado em um dentista ativo");
        }

        // Verificar se já existe dentista ATIVO com o mesmo email
        Optional<Dentista> dentistaComEmail = dentistaRepository.findByEmailAndIsActiveTrue(entity.getEmail());
        if (dentistaComEmail.isPresent() && !dentistaComEmail.get().getId().equals(entity.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já cadastrado em um dentista ativo");
        }

        // Verificar se já existe dentista ATIVO com o mesmo telefone
        Optional<Dentista> dentistaComTelefone = dentistaRepository.findByTelefoneAndIsActiveTrue(entity.getTelefone());
        if (dentistaComTelefone.isPresent() && !dentistaComTelefone.get().getId().equals(entity.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone já cadastrado em um dentista ativo");
        }
        
        // Garantir que as clínicas associadas existam e estejam ativas
        if (entity.getClinicas() != null && !entity.getClinicas().isEmpty()) {
            for (Clinica clinica : entity.getClinicas()) {
                if (clinica.getId() != null) {
                    Optional<Clinica> clinicaExistente = clinicaRepository.findById(clinica.getId());
                    if (clinicaExistente.isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clínica com ID " + clinica.getId() + " não encontrada");
                    }
                    if (!clinicaExistente.get().getIsActive()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clínica '" + clinicaExistente.get().getNome() + "' está inativa");
                    }
                }
            }
        }
        
        try {
            return super.save(entity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
} 