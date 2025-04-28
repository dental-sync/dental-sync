package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;
import jakarta.validation.ValidationException;

@Service
public class ProteticoService extends BaseService<Protetico, Long> {

    private static final Logger logger = LoggerFactory.getLogger(ProteticoService.class);

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
    
    public Protetico updateStatus(Long id, Boolean isActive) {
        Protetico protetico = findById(id)
            .orElseThrow(() -> new ValidationException("Protético não encontrado com ID: " + id));
        
        protetico.setIsActive(isActive);
        return save(protetico);
    }
    
    /**
     * Exclui fisicamente um protético do banco de dados.
     * Verifica se o protético existe e se está inativo antes de excluí-lo.
     * 
     * @param id ID do protético a ser excluído
     * @throws ValidationException se o protético não existir ou estiver ativo
     */
    public void deleteProtetico(Long id) {
        logger.info("Iniciando processo de exclusão do protético ID: {}", id);
        
        // Verificar se o protético existe
        Protetico protetico = findById(id)
            .orElseThrow(() -> {
                logger.error("Protético não encontrado com ID: {}", id);
                return new ValidationException("Protético não encontrado com ID: " + id);
            });
        
        // Verificar se o protético está ativo
        if (protetico.getIsActive() != null && protetico.getIsActive()) {
            logger.error("Não é possível excluir um protético ativo. ID: {}", id);
            throw new ValidationException("Não é possível excluir um protético ativo. Desative-o primeiro.");
        }
        
        try {
            // Excluir o protético fisicamente
            proteticoRepository.deleteById(id);
            logger.info("Protético excluído com sucesso. ID: {}", id);
        } catch (Exception e) {
            logger.error("Erro ao excluir protético: {}", e.getMessage(), e);
            throw new ValidationException("Erro ao excluir protético: " + e.getMessage());
        }
    }
} 