package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.senac.dentalsync.core.persistency.model.Protetico;
import java.util.UUID;
import java.util.Optional;

@Service
public class RememberMeService {
    
    @Autowired
    private ProteticoService proteticoService;
    
    /**
     * Gera e salva um token de "Lembrar de mim" para o usuário
     */
    public String generateRememberMeToken(String email, int durationDays) {
        String token = UUID.randomUUID().toString();
        
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.err.println("Usuário não encontrado para gerar token de remember me: " + email);
            return null;
        }
        
        Protetico user = userOpt.get();
        
        // Salvar token no usuário
        user.setRememberMeToken(token);
        user.setRememberMeTimestamp(System.currentTimeMillis());
        user.setRememberMeDurationDays(durationDays);
        
        // Salvar no banco de dados
        proteticoService.save(user);
        
        System.out.println("=== TOKEN REMEMBER ME GERADO ===");
        System.out.println("Email: " + email);
        System.out.println("Token: " + token);
        System.out.println("Duração: " + durationDays + " dias");
        System.out.println("Salvo no banco de dados");
        System.out.println("===============================");
        
        return token;
    }
    
    /**
     * Valida um token de "Lembrar de mim"
     */
    public boolean validateRememberMeToken(String email, String token) {
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.out.println("Usuário não encontrado para validar remember me: " + email);
            return false;
        }
        
        Protetico user = userOpt.get();
        String storedToken = user.getRememberMeToken();
        Long timestamp = user.getRememberMeTimestamp();
        Integer durationDays = user.getRememberMeDurationDays();
        
        if (storedToken == null || timestamp == null || durationDays == null) {
            System.out.println("Token de remember me não encontrado para usuário: " + email);
            return false;
        }
        
        if (!storedToken.equals(token)) {
            System.out.println("Token de remember me não corresponde para usuário: " + email);
            return false;
        }
        
        // Verificar se o token expirou
        long currentTime = System.currentTimeMillis();
        long elapsedDays = (currentTime - timestamp) / (1000 * 60 * 60 * 24);
        
        if (elapsedDays > durationDays) {
            System.out.println("Token de remember me expirado para " + email + " (expirou há " + (elapsedDays - durationDays) + " dias)");
            removeRememberMeToken(email);
            return false;
        }
        
        System.out.println("Token de remember me válido para: " + email + " (ainda válido por " + (durationDays - elapsedDays) + " dias)");
        return true;
    }
    
    /**
     * Remove o token de "Lembrar de mim" do usuário
     */
    public void removeRememberMeToken(String email) {
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.out.println("Usuário não encontrado para remover remember me: " + email);
            return;
        }
        
        Protetico user = userOpt.get();
        user.setRememberMeToken(null);
        user.setRememberMeTimestamp(null);
        user.setRememberMeDurationDays(null);
        
        proteticoService.save(user);
        System.out.println("Token de remember me removido para usuário: " + email);
    }
    
    /**
     * Busca usuário por token de "Lembrar de mim" válido
     */
    public Optional<Protetico> findUserByValidRememberMeToken(String token) {
        // Buscar todos os usuários e verificar tokens
        // Em produção, seria melhor ter um índice no banco
        var allUsers = proteticoService.findAll();
        
        for (Protetico user : allUsers) {
            if (user.getRememberMeToken() != null && 
                user.getRememberMeToken().equals(token) &&
                validateRememberMeToken(user.getEmail(), token)) {
                return Optional.of(user);
            }
        }
        
        return Optional.empty();
    }
    
    /**
     * Remove tokens expirados de todos os usuários
     */
    public void cleanExpiredRememberMeTokens() {
        var allUsers = proteticoService.findAll();
        long currentTime = System.currentTimeMillis();
        
        for (Protetico user : allUsers) {
            Long timestamp = user.getRememberMeTimestamp();
            Integer durationDays = user.getRememberMeDurationDays();
            
            if (timestamp != null && durationDays != null) {
                long elapsedDays = (currentTime - timestamp) / (1000 * 60 * 60 * 24);
                if (elapsedDays > durationDays) {
                    user.setRememberMeToken(null);
                    user.setRememberMeTimestamp(null);
                    user.setRememberMeDurationDays(null);
                    proteticoService.save(user);
                    System.out.println("Token de remember me expirado removido para: " + user.getEmail());
                }
            }
        }
    }
} 