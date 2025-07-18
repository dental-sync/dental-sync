package com.senac.dentalsync.core.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.repository.PacienteRepository;
import com.senac.dentalsync.core.persistency.repository.PedidoRepository;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Pedido;
import java.util.Optional;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PacienteService extends BaseService<Paciente, Long> {
    
    @Autowired
    private PacienteRepository repository;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    @Override
    protected PacienteRepository getRepository() {
        return repository;
    }
    // getUsuarioLogado() agora é implementado no BaseService
    
    public Optional<Paciente> findByEmail(String email) {
        return repository.findByEmail(email);
    }
    
    public Optional<Paciente> findByNome(String nome) {
        return repository.findByNome(nome);
    }

    public Optional<Paciente> findByTelefone(String telefone) {
        return repository.findByTelefone(telefone);
    }

    // Métodos para buscar apenas pacientes ativos
    public Optional<Paciente> findByEmailActive(String email) {
        return repository.findByEmailAndIsActiveTrue(email);
    }
    
    public Optional<Paciente> findByNomeActive(String nome) {
        return repository.findByNomeAndIsActiveTrue(nome);
    }

    public Optional<Paciente> findByTelefoneActive(String telefone) {
        return repository.findByTelefoneAndIsActiveTrue(telefone);
    }

    public List<Paciente> findByNomeContainingActive(String nome) {
        return repository.findByNomeContainingAndIsActiveTrue(nome);
    }

    // Métodos para buscar apenas pacientes inativos
    public Optional<Paciente> findByEmailInactive(String email) {
        return repository.findByEmailAndIsActiveFalse(email);
    }
    
    public Optional<Paciente> findByNomeInactive(String nome) {
        return repository.findByNomeAndIsActiveFalse(nome);
    }

    public Optional<Paciente> findByTelefoneInactive(String telefone) {
        return repository.findByTelefoneAndIsActiveFalse(telefone);
    }

    public List<Paciente> findByNomeContainingInactive(String nome) {
        return repository.findByNomeContainingAndIsActiveFalse(nome);
    }

    //Para salvar um paciente, é preciso validar se ele ja existe no banco, pesquisando no banco de dados pelo email e telefone. 
    //Se ele existir, vai retornar um erro.
    //Se não existir, vai salvar o paciente.
    @Override
    public Paciente save(Paciente entity) {
       
        if (entity.getId() == null) {
           
            Optional<Paciente> pacienteComEmail = repository.findByEmail(entity.getEmail());
            if (pacienteComEmail.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já cadastrado");
            }
            
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

    //Para deletar um Paciente ele precisa estar inativo.
    //Ele vai procurar pelo faciente pelo id, ele vai verificar se esta vazio ou não.
    //Depois eu pego o paciente caso ele existe e verifico o status dele.
    public void deletePaciente(Long id) {
       
        Optional<Paciente> pacienteOpt = repository.findById(id);
        
        if (pacienteOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado");
        }
        
        Paciente paciente = pacienteOpt.get();
        
       
        if (paciente.getIsActive() != null && paciente.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível excluir um paciente ativo. Desative-o primeiro.");
        }
        
        // Deleta todos os pedidos associados ao paciente primeiro
        List<Pedido> pedidos = pedidoRepository.findByCliente(paciente);
        pedidoRepository.deleteAll(pedidos);
        
        // Agora pode deletar o paciente
        repository.deleteById(id);
    }
    
    public Paciente updateStatus(Long id, Boolean isActive) {
       
        Optional<Paciente> pacienteOpt = repository.findById(id);
        
        if (pacienteOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado");
        }
        
        Paciente paciente = pacienteOpt.get();
        
       
        paciente.setIsActive(isActive);
        
    
        return super.save(paciente);
    }
}
