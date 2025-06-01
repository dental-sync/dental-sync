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

import jakarta.servlet.http.HttpServletRequest;
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

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String username, 
            @RequestParam String password,
            HttpServletRequest request) {
        
        try {
            // Tentar autenticar o usuário
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            
            // Se chegou até aqui, a autenticação foi bem-sucedida
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Criar sessão HTTP
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            
            // Buscar dados do usuário
            Optional<Protetico> proteticoOpt = proteticoService.findByEmail(username);
            
            if (proteticoOpt.isPresent()) {
                Protetico protetico = proteticoOpt.get();
                
                // Salvar dados do usuário na sessão
                session.setAttribute("USER_DATA", protetico);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login realizado com sucesso");
                response.put("user", protetico);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
        } catch (BadCredentialsException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Email ou senha inválidos");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            SecurityContextHolder.clearContext();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Logout realizado com sucesso");
            
            return ResponseEntity.ok(response);
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
                if (userData != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("authenticated", true);
                    response.put("user", userData);
                    
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