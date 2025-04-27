package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;
import jakarta.validation.ValidationException;

@Service
public class ProteticoService extends BaseService<Protetico, Long> {

    @Autowired
    private ProteticoRepository proteticoRepository;
    
    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected BaseRepository<Protetico, Long> getRepository() {
        return proteticoRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }
    
    @Override
    public Protetico save(Protetico protetico) {
        verificarDuplicidade(protetico);
        return super.save(protetico);
    }
    
    private void verificarDuplicidade(Protetico protetico) {
        // Verifica se já existe um protético com o mesmo CRO
        if (protetico.getCro() != null) {
            Optional<Protetico> proteticoPorCro = findByCro(protetico.getCro());
            if (proteticoPorCro.isPresent() && !isSameEntity(protetico, proteticoPorCro.get())) {
                throw new ValidationException("Já existe um protético com o CRO: " + protetico.getCro());
            }
        }
        
        // Verifica se já existe um protético com o mesmo email
        if (protetico.getEmail() != null) {
            Optional<Protetico> proteticoPorEmail = findByEmail(protetico.getEmail());
            if (proteticoPorEmail.isPresent() && !isSameEntity(protetico, proteticoPorEmail.get())) {
                throw new ValidationException("Já existe um protético com o email: " + protetico.getEmail());
            }
        }
        
        // Verifica se já existe um protético com o mesmo telefone
        if (protetico.getTelefone() != null && !protetico.getTelefone().isEmpty()) {
            Optional<Protetico> proteticoPorTelefone = findByTelefone(protetico.getTelefone());
            if (proteticoPorTelefone.isPresent() && !isSameEntity(protetico, proteticoPorTelefone.get())) {
                throw new ValidationException("Já existe um protético com o telefone: " + protetico.getTelefone());
            }
        }
    }
    
    private boolean isSameEntity(Protetico entity1, Protetico entity2) {
        // Verifica se é a mesma entidade (quando está atualizando)
        return entity1.getId() != null && entity1.getId().equals(entity2.getId());
    }
    
    public Optional<Protetico> findByEmail(String email) {
        return proteticoRepository.findByEmail(email);
    }
    
    public Optional<Protetico> findByCro(String cro) {
        return proteticoRepository.findFirstByCro(cro);
    }
    
    public Optional<Protetico> findByTelefone(String telefone) {
        return proteticoRepository.findFirstByTelefone(telefone);
    }
    
    public List<Protetico> findByCroContaining(String cro) {
        return proteticoRepository.findByCroContaining(cro);
    }
} 