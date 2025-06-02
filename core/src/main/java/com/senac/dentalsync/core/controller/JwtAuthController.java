package com.senac.dentalsync.core.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.JwtService;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.service.TrustedDeviceService;
import com.senac.dentalsync.core.service.TwoFactorService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class JwtAuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private ProteticoService proteticoService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private TwoFactorService twoFactorService;
    
    @Autowired
    private TrustedDeviceService trustedDeviceService;

    // Estrutura para armazenar dados temporários do 2FA
    private static class TempAuthData {
        private String email;
        private boolean rememberMe;
        private String deviceFingerprint;
        private long timestamp;
        
        public TempAuthData(String email, boolean rememberMe, String deviceFingerprint) {
            this.email = email;
            this.rememberMe = rememberMe;
            this.deviceFingerprint = deviceFingerprint;
            this.timestamp = System.currentTimeMillis();
        }
        
        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > 300000; // 5 minutos
        }
        
        // Getters
        public String getEmail() { return email; }
        public boolean isRememberMe() { return rememberMe; }
        public String getDeviceFingerprint() { return deviceFingerprint; }
    }
    
    // Cache temporário para dados de 2FA (em produção, use Redis ou similar)
    private static final Map<String, TempAuthData> tempAuthCache = new HashMap<>();

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(defaultValue = "false") boolean rememberMe,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("=== JWT Login para: " + username + " ===");
            
            // Buscar dados do usuário
            Optional<Protetico> proteticoOpt = proteticoService.findByEmail(username);
            if (!proteticoOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Email ou senha inválidos");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Protetico protetico = proteticoOpt.get();
            
            // Autenticar usuário
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
                );
            } catch (BadCredentialsException e) {
                response.put("success", false);
                response.put("message", "Email ou senha inválidos");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Verificar se tem 2FA ativado
            if (protetico.getTwoFactorEnabled() != null && protetico.getTwoFactorEnabled()) {
                // Gerar fingerprint do dispositivo
                String userAgent = request.getHeader("User-Agent");
                String ipAddress = request.getRemoteAddr();
                String deviceFingerprint = trustedDeviceService.generateDeviceFingerprint(userAgent, ipAddress, null);
                
                // Verificar se é dispositivo confiável
                if (trustedDeviceService.isTrustedDevice(username, deviceFingerprint)) {
                    System.out.println("Dispositivo confiável - pulando 2FA");
                    return generateTokenResponse(protetico, rememberMe);
                }
                
                // Gerar ID temporário para 2FA
                String tempId = java.util.UUID.randomUUID().toString();
                tempAuthCache.put(tempId, new TempAuthData(username, rememberMe, deviceFingerprint));
                
                response.put("success", true);
                response.put("requiresTwoFactor", true);
                response.put("tempAuthId", tempId);
                response.put("message", "Digite o código do Google Authenticator");
                response.put("email", protetico.getEmail());
                
                return ResponseEntity.ok(response);
            } else {
                // Login direto sem 2FA
                return generateTokenResponse(protetico, rememberMe);
            }
            
        } catch (Exception e) {
            System.err.println("Erro no JWT login: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<Map<String, Object>> verifyTwoFactor(
            @RequestParam String tempAuthId,
            @RequestParam int totpCode,
            @RequestParam(defaultValue = "false") boolean trustThisDevice) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verificar dados temporários
            TempAuthData tempData = tempAuthCache.get(tempAuthId);
            if (tempData == null || tempData.isExpired()) {
                response.put("success", false);
                response.put("message", "Sessão expirada. Faça login novamente.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Buscar usuário
            Optional<Protetico> proteticoOpt = proteticoService.findByEmail(tempData.getEmail());
            if (!proteticoOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Protetico protetico = proteticoOpt.get();
            
            // Verificar código TOTP
            if (!twoFactorService.validateTotpCode(protetico.getTwoFactorSecret(), totpCode)) {
                response.put("success", false);
                response.put("message", "Código de verificação inválido");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Salvar dispositivo como confiável se solicitado
            if (trustThisDevice) {
                trustedDeviceService.generateTrustedDeviceToken(tempData.getEmail(), tempData.getDeviceFingerprint());
            }
            
            // Remover dados temporários
            tempAuthCache.remove(tempAuthId);
            
            // Gerar tokens
            return generateTokenResponse(protetico, tempData.isRememberMe());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao verificar 2FA");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestParam String refreshToken) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validar refresh token
            if (!jwtService.validateToken(refreshToken)) {
                response.put("success", false);
                response.put("message", "Token de refresh inválido");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Verificar se é mesmo um refresh token
            String tokenType = jwtService.getTokenType(refreshToken);
            if (!"refresh".equals(tokenType)) {
                response.put("success", false);
                response.put("message", "Token inválido");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Extrair usuário e gerar novos tokens
            String username = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);
            
            response.put("success", true);
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            response.put("tokenType", "Bearer");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao renovar token");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/check-auth")
    public ResponseEntity<Map<String, Object>> checkAuth(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verificar se há token no header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("authenticated", false);
                response.put("message", "Token não encontrado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String token = authHeader.substring(7);
            
            // Validar token
            if (!jwtService.validateToken(token)) {
                response.put("success", false);
                response.put("authenticated", false);
                response.put("message", "Token inválido ou expirado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Extrair email do token
            String email = jwtService.extractEmail(token);
            if (email == null) {
                email = jwtService.extractUsername(token); // Fallback para o subject
            }
            
            if (email == null) {
                response.put("success", false);
                response.put("authenticated", false);
                response.put("message", "Email não encontrado no token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Buscar dados completos do usuário
            Optional<Protetico> proteticoOpt = proteticoService.findByEmail(email);
            if (proteticoOpt.isPresent()) {
                Protetico user = proteticoOpt.get();
                response.put("success", true);
                response.put("authenticated", true);
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("authenticated", false);
                response.put("message", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Erro ao verificar autenticação: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("authenticated", false);
            response.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // No JWT, o logout é feito no frontend removendo o token
            // Aqui podemos adicionar lógica para blacklist de tokens se necessário
            SecurityContextHolder.clearContext();
            
            response.put("success", true);
            response.put("message", "Logout realizado com sucesso");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao realizar logout");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> generateTokenResponse(Protetico protetico, boolean rememberMe) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(protetico.getEmail());
            
            // Adicionar claims importantes ao token
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("email", protetico.getEmail());
            extraClaims.put("cro", protetico.getCro());
            extraClaims.put("telefone", protetico.getTelefone());
            extraClaims.put("isAdmin", protetico.getIsAdmin() != null ? protetico.getIsAdmin() : false);
            extraClaims.put("rememberMe", rememberMe);
            extraClaims.put("createdAt", System.currentTimeMillis()); // Timestamp de criação
            
            String accessToken = jwtService.generateToken(extraClaims, userDetails, rememberMe);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            
            response.put("success", true);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            response.put("user", protetico);
            response.put("rememberMe", rememberMe);
            response.put("expiresIn", rememberMe ? "7 dias" : "24 horas");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao gerar tokens");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 