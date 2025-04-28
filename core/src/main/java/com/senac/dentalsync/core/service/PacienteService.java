package com.senac.dentalsync.core.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.repository.PacienteRepository;
import com.senac.dentalsync.core.persistency.model.Usuario;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PacienteService extends BaseService<Paciente, Long> {
    
    @Autowired
    private PacienteRepository repository;

    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected PacienteRepository getRepository() {
        return repository;
    }
    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
    public Optional<Paciente> findByEmail(String email) {
        return repository.findByEmail(email);
    }
    
    public Optional<Paciente> findByNome(String nome) {
        return repository.findByNome(nome);
    }

    public Optional<Paciente> findByTelefone(String telefone) {
        return repository.findByTelefone(telefone);
    }

    @Override
    public Paciente save(Paciente entity) {
        // Verificações somente para novos pacientes
        if (entity.getId() == null) {
            // Verificar se já existe paciente com o mesmo email
            Optional<Paciente> pacienteComEmail = repository.findByEmail(entity.getEmail());
            if (pacienteComEmail.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já cadastrado");
            }
            
            // Verificar se já existe paciente com o mesmo telefone
            Optional<Paciente> pacienteComTelefone = repository.findByTelefone(entity.getTelefone());
            if (pacienteComTelefone.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone já cadastrado");
            }
        }
        
        try {
            return super.save(entity);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    public void deletePaciente(Long id) {
        // Verificar se o paciente existe
        Optional<Paciente> pacienteOpt = repository.findById(id);
        
        if (pacienteOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado");
        }
        
        Paciente paciente = pacienteOpt.get();
        
        // Verificar se o paciente está ativo
        if (paciente.getIsActive() != null && paciente.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível excluir um paciente ativo. Desative-o primeiro.");
        }
        
        // Se chegou aqui, podemos excluir o paciente
        repository.deleteById(id);
    }
    
    public Paciente updateStatus(Long id, Boolean isActive) {
        // Verificar se o paciente existe
        Optional<Paciente> pacienteOpt = repository.findById(id);
        
        if (pacienteOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado");
        }
        
        Paciente paciente = pacienteOpt.get();
        
        // Atualizar o status
        paciente.setIsActive(isActive);
        
        // Salvar as alterações
        return repository.save(paciente);
    }
}
