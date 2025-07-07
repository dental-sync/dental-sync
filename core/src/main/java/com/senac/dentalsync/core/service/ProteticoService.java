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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;
import com.senac.dentalsync.core.util.PasswordValidator;

@Service
public class ProteticoService extends BaseService<Protetico, Long> implements UserDetailsService {

    @Autowired
    private ProteticoRepository proteticoRepository;

    @Autowired
    private ApplicationContext applicationContext;

    @Override
    protected BaseRepository<Protetico, Long> getRepository() {
        return proteticoRepository;
    }

    // getUsuarioLogado() agora é implementado no BaseService
    
    @Override
    public Protetico save(Protetico protetico) {
        System.out.println("=== Salvando protético: " + protetico.getEmail() + " ===");
        System.out.println("ID do protético: " + protetico.getId());
        
        // Se é um novo protético (ID null) e não tem laboratório associado, 
        // associar automaticamente com o laboratório do usuário logado
        if (protetico.getId() == null && protetico.getLaboratorio() == null) {
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated() && 
                    !authentication.getName().equals("anonymousUser")) {
                    
                    String emailUsuarioLogado = authentication.getName();
                    System.out.println("Usuário logado: " + emailUsuarioLogado);
                    
                    Optional<Laboratorio> laboratorioOpt = findLaboratorioByEmail(emailUsuarioLogado);
                    if (laboratorioOpt.isPresent()) {
                        protetico.setLaboratorio(laboratorioOpt.get());
                        System.out.println("Laboratório setado automaticamente para o novo protético");
                    } else {
                        System.out.println("Laboratório não encontrado para o usuário logado: " + emailUsuarioLogado);
                    }
                }
            } catch (Exception e) {
                System.out.println("Erro ao obter laboratório do usuário logado: " + e.getMessage());
                // Não interrompe o processo, apenas não associa o laboratório
            }
        }
        
        // Para atualizações, se a senha é null, mantenha a senha existente
        if (protetico.getId() != null && protetico.getSenha() == null) {
            System.out.println("Senha não fornecida na atualização - mantendo senha existente");
            Protetico existente = findById(protetico.getId()).orElse(null);
            if (existente != null) {
                protetico.setSenha(existente.getSenha());
                System.out.println("Senha existente mantida");
            }
        }
        
        verificarDuplicidade(protetico);
        
        // Só processar senha se ela não for null
        if (protetico.getSenha() != null) {
            PasswordEncoder passwordEncoder = applicationContext.getBean(PasswordEncoder.class);
            
            boolean senhaFoiAlterada = isSenhaAlterada(protetico, passwordEncoder);
            System.out.println("Senha foi alterada: " + senhaFoiAlterada);
            System.out.println("Senha atual (primeiros 10 chars): " + (protetico.getSenha() != null ? protetico.getSenha().substring(0, Math.min(10, protetico.getSenha().length())) : "null"));
            
            if (protetico.getId() == null || senhaFoiAlterada) {
                // Verificar se a senha não está criptografada antes de validar
                boolean senhaJaCriptografada = protetico.getSenha().startsWith("$2a$") || protetico.getSenha().startsWith("$2b$");
                
                if (!senhaJaCriptografada) {
                    // Validar critérios de complexidade da senha apenas se não estiver criptografada
                    System.out.println("Validando critérios de complexidade da senha...");
                    PasswordValidator.validatePassword(protetico.getSenha());
                    System.out.println("Senha atende aos critérios de complexidade");
                }
                
                System.out.println("Criptografando senha...");
                protetico.setSenha(passwordEncoder.encode(protetico.getSenha()));
                System.out.println("Senha criptografada (primeiros 10 chars): " + protetico.getSenha().substring(0, 10));
            } else {
                System.out.println("Mantendo senha existente");
            }
        } else {
            System.out.println("Senha é null - não processando");
        }
        
        Protetico savedProtetico = super.save(protetico);
        System.out.println("Protético salvo com sucesso");
        return savedProtetico;
    }
    
    private void verificarDuplicidade(Protetico protetico) {
        // Verifica se já existe um protético ATIVO com o mesmo CRO
        if (protetico.getCro() != null) {
            Optional<Protetico> proteticoPorCro = findByCroActive(protetico.getCro());
            if (proteticoPorCro.isPresent() && !isSameEntity(protetico, proteticoPorCro.get())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CRO já cadastrado em um protético ativo");
            }
        }
        
        // Verifica se já existe um protético ATIVO com o mesmo email
        if (protetico.getEmail() != null) {
            Optional<Protetico> proteticoPorEmail = findByEmailActive(protetico.getEmail());
            if (proteticoPorEmail.isPresent() && !isSameEntity(protetico, proteticoPorEmail.get())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado em um protético ativo");
            }
        }
        
        // Verifica se já existe um protético ATIVO com o mesmo telefone
        if (protetico.getTelefone() != null && !protetico.getTelefone().isEmpty()) {
            Optional<Protetico> proteticoPorTelefone = findByTelefoneActive(protetico.getTelefone());
            if (proteticoPorTelefone.isPresent() && !isSameEntity(protetico, proteticoPorTelefone.get())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone já cadastrado em um protético ativo");
            }
        }
    }
    
    private boolean isSameEntity(Protetico entity1, Protetico entity2) {
        // Verifica se é a mesma entidade (quando está atualizando)
        return entity1.getId() != null && entity1.getId().equals(entity2.getId());
    }
    
    // Métodos para buscar incluindo inativos (uso interno)
    public Optional<Protetico> findByEmail(String email) {
        return proteticoRepository.findByEmail(email);
    }
    
    public Optional<Laboratorio> findLaboratorioByEmail(String email) {
        return proteticoRepository.findByEmail(email)
                .map(Protetico::getLaboratorio);
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
    
    // Métodos para buscar apenas ativos (uso público)
    public Optional<Protetico> findByEmailActive(String email) {
        return proteticoRepository.findByEmailAndIsActiveTrue(email);
    }
    
    public Optional<Protetico> findByCroActive(String cro) {
        return proteticoRepository.findFirstByCroAndIsActiveTrue(cro);
    }
    
    public Optional<Protetico> findByTelefoneActive(String telefone) {
        return proteticoRepository.findFirstByTelefoneAndIsActiveTrue(telefone);
    }
    
    public List<Protetico> findByCroContainingActive(String cro) {
        return proteticoRepository.findByCroContainingAndIsActiveTrue(cro);
    }
    
    @Override
    public List<Protetico> findAll() {
        return proteticoRepository.findAllByIsActiveTrue();
    }
    
    public List<Protetico> findAllIncludingInactive() {
        return proteticoRepository.findAll();
    }
    
    public Protetico updateStatus(Long id, Boolean isActive) {
        Protetico protetico = findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Protético não encontrado"));
        
        System.out.println("🔄 Atualizando status do protético ID: " + id + " de " + protetico.getIsActive() + " para " + isActive);
        
        protetico.setIsActive(isActive);
        
        // Usar super.save() diretamente para evitar verificação de duplicidade e lógica de senha
        Protetico savedProtetico = super.save(protetico);
        
        System.out.println("✅ Status atualizado com sucesso para: " + savedProtetico.getIsActive());
        return savedProtetico;
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
        if (protetico.getId() == null) {
            System.out.println("Novo usuário - senha precisa ser criptografada");
            return true;
        }
        
        Protetico existente = findById(protetico.getId()).orElse(null);
        if (existente == null) {
            System.out.println("Usuário existente não encontrado - senha precisa ser criptografada");
            return true;
        }
        
        // Verificar se a senha atual já está criptografada (começa com $2a$ ou $2b$)
        boolean senhaAtualJaCriptografada = protetico.getSenha() != null && 
            (protetico.getSenha().startsWith("$2a$") || protetico.getSenha().startsWith("$2b$"));
        
        // Verificar se a senha existente já está criptografada
        boolean senhaExistenteJaCriptografada = existente.getSenha() != null && 
            (existente.getSenha().startsWith("$2a$") || existente.getSenha().startsWith("$2b$"));
            
        System.out.println("Senha atual já criptografada: " + senhaAtualJaCriptografada);
        System.out.println("Senha existente já criptografada: " + senhaExistenteJaCriptografada);
        
        // Se a senha atual já está criptografada e é igual à existente, não alterar
        if (senhaAtualJaCriptografada && senhaExistenteJaCriptografada) {
            boolean senhasSaoIguais = protetico.getSenha().equals(existente.getSenha());
            System.out.println("Senhas criptografadas são iguais: " + senhasSaoIguais);
            return !senhasSaoIguais; // Retorna false se são iguais (não foi alterada)
        }
        
        // Se a senha atual não está criptografada, verificar se corresponde à existente
        if (!senhaAtualJaCriptografada && senhaExistenteJaCriptografada) {
            boolean senhaCorresponde = passwordEncoder.matches(protetico.getSenha(), existente.getSenha());
            System.out.println("Senha corresponde à existente: " + senhaCorresponde);
            return !senhaCorresponde; // Retorna false se corresponde (não foi alterada)
        }
        
        // Caso padrão: considera que foi alterada
        System.out.println("Caso padrão - considerando senha alterada");
        return true;
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

    /**
     * Salva o protético sem verificar/alterar a senha
     * Usado para operações como ativação de 2FA onde não queremos tocar na senha
     */
    public Protetico saveWithoutPasswordChange(Protetico protetico) {
        System.out.println("=== Salvando protético SEM alterar senha: " + protetico.getEmail() + " ===");
        verificarDuplicidade(protetico);
        Protetico savedProtetico = super.save(protetico);
        System.out.println("Protético salvo sem alteração de senha");
        return savedProtetico;
    }
} 