package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.service.TwoFactorService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private ProteticoService proteticoService;

    @Autowired
    private TwoFactorService twoFactorService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String username, 
            @RequestParam String password,
            @RequestParam(defaultValue = "false") boolean rememberMe,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        try {
            System.out.println("=== Iniciando login para: " + username + " ===");
            
            // Primeiro, buscar dados do usuário para verificar se tem 2FA
            Optional<Protetico> proteticoOpt = proteticoService.findByEmail(username);
            
            if (!proteticoOpt.isPresent()) {
                System.out.println("Usuário não encontrado: " + username);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Email ou senha inválidos");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            Protetico protetico = proteticoOpt.get();
            System.out.println("Usuário encontrado: " + protetico.getEmail());
            System.out.println("2FA ativado: " + (protetico.getTwoFactorEnabled() != null ? protetico.getTwoFactorEnabled() : "false"));
            
            // Tentar autenticar o usuário
            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
                );
                System.out.println("Autenticação bem-sucedida");
            } catch (BadCredentialsException e) {
                System.out.println("Credenciais inválidas para: " + username);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Email ou senha inválidos");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            // Se chegou até aqui, a autenticação foi bem-sucedida
            // Verificar se o usuário tem 2FA ativado
            if (protetico.getTwoFactorEnabled() != null && protetico.getTwoFactorEnabled()) {
                System.out.println("Usuário tem 2FA ativado, criando sessão temporária");
                
                // Criar sessão temporária para 2FA
                HttpSession session = request.getSession(true);
                session.setAttribute("TEMP_AUTH", authentication);
                session.setAttribute("TEMP_USER", protetico);
                session.setAttribute("TEMP_REMEMBER_ME", rememberMe);
                session.setMaxInactiveInterval(5 * 60); // 5 minutos para completar 2FA
                
                Map<String, Object> response2 = new HashMap<>();
                response2.put("success", true);
                response2.put("requiresTwoFactor", true);
                response2.put("message", "Digite o código do Google Authenticator");
                response2.put("email", protetico.getEmail());
                
                System.out.println("Retornando resposta de 2FA necessário");
                return ResponseEntity.ok(response2);
            } else {
                System.out.println("Login normal sem 2FA");
                // Login normal sem 2FA
                return completeLogin(protetico, authentication, rememberMe, request, response);
            }
            
        } catch (Exception e) {
            System.err.println("Erro geral no login: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/login/verify-2fa")
    public ResponseEntity<Map<String, Object>> verifyTwoFactor(
            @RequestParam int totpCode,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        try {
            HttpSession session = request.getSession(false);
            if (session == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Sessão expirada. Faça login novamente.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            Authentication tempAuth = (Authentication) session.getAttribute("TEMP_AUTH");
            Protetico tempUser = (Protetico) session.getAttribute("TEMP_USER");
            Boolean rememberMe = (Boolean) session.getAttribute("TEMP_REMEMBER_ME");
            
            if (tempAuth == null || tempUser == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Dados de autenticação não encontrados. Faça login novamente.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            // Verificar código TOTP
            if (!twoFactorService.validateTotpCode(tempUser.getTwoFactorSecret(), totpCode)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Código de verificação inválido");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Limpar dados temporários
            session.removeAttribute("TEMP_AUTH");
            session.removeAttribute("TEMP_USER");
            session.removeAttribute("TEMP_REMEMBER_ME");
            
            // Completar login
            return completeLogin(tempUser, tempAuth, rememberMe != null ? rememberMe : false, request, response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    private ResponseEntity<Map<String, Object>> completeLogin(
            Protetico protetico, 
            Authentication authentication, 
            boolean rememberMe, 
            HttpServletRequest request, 
            HttpServletResponse response) {
        
        // Configurar contexto de segurança
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Criar sessão HTTP
        HttpSession session = request.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        
        // Configurar duração da sessão baseado no "Lembrar de mim"
        if (rememberMe) {
            // Se "Lembrar de mim" estiver marcado: 7 dias
            session.setMaxInactiveInterval(7 * 24 * 60 * 60); // 7 dias
            
            // Configurar cookie de sessão para ser persistente
            Cookie sessionCookie = new Cookie("DENTALSYNC_SESSION", session.getId());
            sessionCookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias em segundos
            sessionCookie.setHttpOnly(true);
            sessionCookie.setSecure(false); // mudar para true em produção com HTTPS
            sessionCookie.setPath("/");
            response.addCookie(sessionCookie);
        } else {
            // Se não estiver marcado: 30 minutos (padrão)
            session.setMaxInactiveInterval(30 * 60); // 30 minutos
            
            // Cookie de sessão será deletado quando o navegador fechar (comportamento padrão)
            Cookie sessionCookie = new Cookie("DENTALSYNC_SESSION", session.getId());
            sessionCookie.setMaxAge(-1); // Session cookie (deletado quando navegador fecha)
            sessionCookie.setHttpOnly(true);
            sessionCookie.setSecure(false); 
            sessionCookie.setPath("/");
            response.addCookie(sessionCookie);
        }
        
        // Salvar dados do usuário na sessão
        session.setAttribute("USER_DATA", protetico);
        session.setAttribute("REMEMBER_ME", rememberMe);
        
        Map<String, Object> response2 = new HashMap<>();
        response2.put("success", true);
        response2.put("message", "Login realizado com sucesso");
        response2.put("user", protetico);
        response2.put("rememberMe", rememberMe);
        response2.put("sessionDuration", rememberMe ? "7 dias" : "30 minutos");
        
        return ResponseEntity.ok(response2);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            SecurityContextHolder.clearContext();
            
            // Limpar cookie de sessão
            Cookie sessionCookie = new Cookie("DENTALSYNC_SESSION", "");
            sessionCookie.setMaxAge(0); // Remove o cookie
            sessionCookie.setHttpOnly(true);
            sessionCookie.setPath("/");
            response.addCookie(sessionCookie);
            
            Map<String, Object> response2 = new HashMap<>();
            response2.put("success", true);
            response2.put("message", "Logout realizado com sucesso");
            
            return ResponseEntity.ok(response2);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao realizar logout");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/auth/check")
    public ResponseEntity<Map<String, Object>> checkAuth(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session != null && auth != null && auth.isAuthenticated() 
                && !auth.getName().equals("anonymousUser")) {
                
                Protetico userData = (Protetico) session.getAttribute("USER_DATA");
                Boolean rememberMe = (Boolean) session.getAttribute("REMEMBER_ME");
                
                if (userData != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("authenticated", true);
                    response.put("user", userData);
                    response.put("rememberMe", rememberMe != null ? rememberMe : false);
                    response.put("sessionDuration", (rememberMe != null && rememberMe) ? "7 dias" : "30 minutos");
                    
                    return ResponseEntity.ok(response);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("authenticated", false);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("authenticated", false);
            errorResponse.put("message", "Erro ao verificar autenticação");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 