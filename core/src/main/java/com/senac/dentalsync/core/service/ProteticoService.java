package com.senac.dentalsync.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.ApplicationContext;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;

@Service
public class ProteticoService extends BaseService<Protetico, Long> implements UserDetailsService {

    @Autowired
    private ProteticoRepository proteticoRepository;
    
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ApplicationContext applicationContext;

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
        PasswordEncoder passwordEncoder = applicationContext.getBean(PasswordEncoder.class);
        if (protetico.getId() == null || isSenhaAlterada(protetico, passwordEncoder)) {
            protetico.setSenha(passwordEncoder.encode(protetico.getSenha()));
        }
        return super.save(protetico);
    }
    
    private void verificarDuplicidade(Protetico protetico) {
        // Verifica se já existe um protético com o mesmo CRO
        if (protetico.getCro() != null) {
            Optional<Protetico> proteticoPorCro = findByCro(protetico.getCro());
            if (proteticoPorCro.isPresent() && !isSameEntity(protetico, proteticoPorCro.get())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CRO já cadastrado");
            }
        }
        
        // Verifica se já existe um protético com o mesmo email
        if (protetico.getEmail() != null) {
            Optional<Protetico> proteticoPorEmail = findByEmail(protetico.getEmail());
            if (proteticoPorEmail.isPresent() && !isSameEntity(protetico, proteticoPorEmail.get())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado");
            }
        }
        
        // Verifica se já existe um protético com o mesmo telefone
        if (protetico.getTelefone() != null && !protetico.getTelefone().isEmpty()) {
            Optional<Protetico> proteticoPorTelefone = findByTelefone(protetico.getTelefone());
            if (proteticoPorTelefone.isPresent() && !isSameEntity(protetico, proteticoPorTelefone.get())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone já cadastrado");
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
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Protético não encontrado"));
        
        protetico.setIsActive(isActive);
        return save(protetico);
    }
    
 
    public void deleteProtetico(Long id) {
        // Verificar se o protético existe
        Protetico protetico = findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Protético não encontrado"));
        
        // Verificar se o protético está ativo
        if (protetico.getIsActive() != null && protetico.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível excluir um protético ativo");
        }
        
        try {
            proteticoRepository.deleteById(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao excluir protético");
        }
    }

    private boolean isSenhaAlterada(Protetico protetico, PasswordEncoder passwordEncoder) {
        if (protetico.getId() == null) return true;
        Protetico existente = findById(protetico.getId()).orElse(null);
        return existente == null || !passwordEncoder.matches(protetico.getSenha(), existente.getSenha());
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Protetico protetico = findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Protético não encontrado com o email: " + email));
        return User.builder()
                .username(protetico.getEmail())
                .password(protetico.getSenha())
                .roles(protetico.getIsAdmin() != null && protetico.getIsAdmin() ? "ADMIN" : "USER")
                .build();
    }
} 