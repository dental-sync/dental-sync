package com.senac.dentalsync.core.config;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.service.RememberMeService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private ProteticoService proteticoService;
    
    @Autowired
    private RememberMeService rememberMeService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        
        // Pular validação para endpoints públicos
        if (isPublicEndpoint(requestURI)) {
            return true;
        }

        // Pular validação para requests OPTIONS (CORS preflight)
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        // Verificar se há sessão autenticada
        HttpSession session = request.getSession(false);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (session != null && auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            // Obter dados do usuário da sessão
            Protetico userData = (Protetico) session.getAttribute("USER_DATA");
            
            if (userData != null) {
                // Verificar se o protético ainda está ativo no banco
                Optional<Protetico> currentUserOpt = proteticoService.findByEmail(userData.getEmail());
                
                if (currentUserOpt.isPresent()) {
                    Protetico currentUser = currentUserOpt.get();
                    
                    // Se o protético foi desativado, invalidar sessão
                    if (currentUser.getIsActive() == null || !currentUser.getIsActive()) {
                        System.out.println("🚫 Protético inativo interceptado - Request: " + requestURI + " - Email: " + currentUser.getEmail());
                        
                        // Invalidar sessão e cookies
                        invalidateUserSession(currentUser.getEmail(), request, response);
                        
                        // Retornar erro 403 Forbidden
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"success\":false,\"message\":\"Conta desativada. Entre em contato com o administrador do sistema.\"}");
                        
                        return false; // Bloquear a requisição
                    }
                } else {
                    // Usuário não encontrado no banco - sessão inválida
                    System.out.println("🚫 Usuário não encontrado no banco - invalidando sessão: " + userData.getEmail());
                    invalidateUserSession(userData.getEmail(), request, response);
                    
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"message\":\"Sessão inválida. Faça login novamente.\"}");
                    
                    return false;
                }
            }
        }

        return true; // Continuar com a requisição
    }

    /**
     * Verifica se o endpoint é público (não requer autenticação)
     */
    private boolean isPublicEndpoint(String requestURI) {
        String[] publicPaths = {
            "/login",
            "/logout", 
            "/auth/check",
            "/login/verify-2fa",
            "/login/request-recovery-code",
            "/login/verify-recovery-code",
            "/login/remember-me",
            "/password/",
            "/proteticos/cadastro",
            "/laboratorios/",
            "/security/reset-password-emergency",
            "/material/notificacoes/estoque"
        };
        
        for (String path : publicPaths) {
            if (requestURI.startsWith("/api" + path) || requestURI.startsWith(path)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Invalida sessão e cookies do usuário
     */
    private void invalidateUserSession(String email, HttpServletRequest request, HttpServletResponse response) {
        try {
            // Invalidar sessão HTTP
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            
            // Limpar SecurityContext
            SecurityContextHolder.clearContext();
            
            // Limpar cookies
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("DENTALSYNC_SESSION".equals(cookie.getName()) || 
                        "JSESSIONID".equals(cookie.getName()) ||
                        "DENTALSYNC_REMEMBER_ME".equals(cookie.getName())) {
                        
                        Cookie deleteCookie = new Cookie(cookie.getName(), null);
                        deleteCookie.setMaxAge(0);
                        deleteCookie.setPath("/");
                        response.addCookie(deleteCookie);
                    }
                }
            }
            
            // Invalidar tokens de "lembrar de mim" no banco
            rememberMeService.removeRememberMeToken(email);
            
            System.out.println("✅ Sessão invalidada para usuário inativo: " + email);
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao invalidar sessão: " + e.getMessage());
        }
    }
} 