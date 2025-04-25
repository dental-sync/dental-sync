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

    public void deletePaciente(Long id) {
        //Verificar se o paciente existe
        Optional<Paciente> pacienteOpt = repository.findById(id);
        if (pacienteOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado");
        }
        Paciente paciente = pacienteOpt.get();
        //Verificar se o paciente já está inativo pelo campo isActive
        if (paciente.getIsActive() != null && !paciente.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paciente já está inativo");
        }
        
        //Se chegou aqui, podemos excluir o paciente
        repository.deleteById(id);
    }
}
