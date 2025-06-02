package com.senac.dentalsync.core.config;

import com.senac.dentalsync.core.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        String requestPath = request.getServletPath();
        String method = request.getMethod();
        System.out.println("🔍 JWT Filter - Path: " + requestPath + " | Method: " + method);
        
        // Permitir endpoints de autenticação e cadastro sem token
        if (isPublicEndpoint(requestPath)) {
            System.out.println("✅ Endpoint público, prosseguindo sem JWT");
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        System.out.println("🔑 Authorization header: " + (authHeader != null ? "Bearer ***" : "null"));

        // Verificar se o header Authorization existe e começa com "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ Token JWT não encontrado no header");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Token JWT necessário\"}");
            return;
        }

        try {
            // Extrair o token JWT
            String jwt = authHeader.substring(7);
            
            // Validar se o token não está vazio
            if (jwt.trim().isEmpty()) {
                System.out.println("❌ Token JWT vazio");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Token JWT inválido\"}");
                return;
            }
            
            System.out.println("🔍 Extraindo dados do token...");
            String userEmail = jwtService.extractUsername(jwt);
            System.out.println("📧 Email extraído: " + userEmail);

            // Se temos um email e não há autenticação no contexto
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("🔍 Carregando dados do usuário...");
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                // Verificar se o token é válido
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Verificar se é um access token (não refresh token)
                    String tokenType = jwtService.getTokenType(jwt);
                    System.out.println("🏷️ Tipo do token: " + tokenType);
                    
                    if ("access".equals(tokenType)) {
                        System.out.println("✅ Token válido, criando autenticação");
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        System.out.println("✅ Usuário autenticado: " + userEmail);
                        filterChain.doFilter(request, response);
                        return;
                    } else {
                        System.out.println("❌ Tipo de token inválido: " + tokenType);
                    }
                } else {
                    System.out.println("❌ Token inválido ou expirado");
                }
            } else {
                System.out.println("❌ Email não encontrado ou usuário já autenticado");
            }
            
            // Se chegou aqui, o token é inválido
            System.out.println("❌ Falha na autenticação JWT");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Token JWT inválido ou expirado\"}");
            
        } catch (Exception e) {
            System.err.println("❌ Erro no filtro JWT: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Erro ao validar token JWT\"}");
        }
    }
    
    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/auth/") || 
               path.equals("/") ||
               path.startsWith("/public/") ||
               path.startsWith("/error");
    }
} 