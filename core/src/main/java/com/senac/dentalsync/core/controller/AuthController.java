package com.senac.dentalsync.core.controller;

import java.util.HashMap;
import java.util.List;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.EmailService;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.service.TrustedDeviceService;
import com.senac.dentalsync.core.service.TwoFactorService;
import com.senac.dentalsync.core.service.RememberMeService;
import com.senac.dentalsync.core.util.PasswordValidator;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private ProteticoService proteticoService;

    @Autowired
    private TwoFactorService twoFactorService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TrustedDeviceService trustedDeviceService;

    @Autowired
    private RememberMeService rememberMeService;

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
            
            // Verificar se o protético está ativo
            if (protetico.getIsActive() == null || !protetico.getIsActive()) {
                System.out.println("Protético inativo tentando fazer login: " + username);
                
                // Revogar cookies e sessões existentes
                invalidateUserSessions(username, request, response);
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Conta desativada. Entre em contato com o administrador do sistema.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }
            
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
                System.out.println("Usuário tem 2FA ativado");
                
                // Gerar fingerprint do dispositivo
                String userAgent = request.getHeader("User-Agent");
                String ipAddress = request.getRemoteAddr();
                String deviceFingerprint = trustedDeviceService.generateDeviceFingerprint(userAgent, ipAddress, null);
                
                System.out.println("Device fingerprint: " + deviceFingerprint);
                
                // Verificar se este dispositivo é confiável
                if (trustedDeviceService.isTrustedDevice(username, deviceFingerprint)) {
                    System.out.println("Dispositivo confiável encontrado - pulando 2FA");
                    return completeLogin(protetico, authentication, rememberMe, request, response);
                }
                
                System.out.println("Dispositivo não confiável - exigindo 2FA");
                
                // Criar sessão temporária para 2FA
                HttpSession session = request.getSession(true);
                session.setAttribute("TEMP_AUTH", authentication);
                session.setAttribute("TEMP_USER", protetico);
                session.setAttribute("TEMP_REMEMBER_ME", rememberMe);
                session.setAttribute("TEMP_DEVICE_FINGERPRINT", deviceFingerprint);
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
            @RequestParam(defaultValue = "false") boolean trustThisDevice,
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
            String deviceFingerprint = (String) session.getAttribute("TEMP_DEVICE_FINGERPRINT");
            
            if (tempAuth == null || tempUser == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Dados de autenticação não encontrados. Faça login novamente.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            System.out.println("Verificando código 2FA para usuário: " + tempUser.getEmail());
            System.out.println("Lembrar dispositivo: " + trustThisDevice);
            
            // Verificar código TOTP
            if (!twoFactorService.validateTotpCode(tempUser.getTwoFactorSecret(), totpCode)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Código de verificação inválido");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            System.out.println("Código 2FA válido");
            
            // Se usuário marcou "Lembrar deste dispositivo", registrar dispositivo
            if (trustThisDevice && deviceFingerprint != null) {
                String deviceToken = trustedDeviceService.generateTrustedDeviceToken(tempUser.getEmail(), deviceFingerprint);
                System.out.println("Dispositivo registrado como confiável: " + deviceToken);
            }
            
            // Limpar dados temporários
            session.removeAttribute("TEMP_AUTH");
            session.removeAttribute("TEMP_USER");
            session.removeAttribute("TEMP_REMEMBER_ME");
            session.removeAttribute("TEMP_DEVICE_FINGERPRINT");
            
            // Completar login
            return completeLogin(tempUser, tempAuth, rememberMe != null ? rememberMe : false, request, response);
            
        } catch (Exception e) {
            System.err.println("Erro na verificação 2FA: " + e.getMessage());
            e.printStackTrace();
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
            
            // Gerar token persistente no banco de dados
            String rememberMeToken = rememberMeService.generateRememberMeToken(protetico.getEmail(), 7);
            
            // Configurar cookie persistente com o token
            Cookie rememberMeCookie = new Cookie("DENTALSYNC_REMEMBER_ME", rememberMeToken);
            rememberMeCookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias em segundos
            rememberMeCookie.setHttpOnly(true);
            rememberMeCookie.setSecure(false); // mudar para true em produção com HTTPS
            rememberMeCookie.setPath("/");
            response.addCookie(rememberMeCookie);
            
            // Configurar cookie de sessão para ser persistente
            Cookie sessionCookie = new Cookie("DENTALSYNC_SESSION", session.getId());
            sessionCookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias em segundos
            sessionCookie.setHttpOnly(true);
            sessionCookie.setSecure(false);
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
            
            // Obter dados do usuário antes de invalidar a sessão
            String userEmail = null;
            if (session != null) {
                Protetico userData = (Protetico) session.getAttribute("USER_DATA");
                if (userData != null) {
                    userEmail = userData.getEmail();
                }
                session.invalidate();
            }
            
            SecurityContextHolder.clearContext();
            
            // Remover token de "Lembrar de mim" do banco de dados
            if (userEmail != null) {
                rememberMeService.removeRememberMeToken(userEmail);
            }
            
            // Limpar cookie de sessão
            Cookie sessionCookie = new Cookie("DENTALSYNC_SESSION", "");
            sessionCookie.setMaxAge(0); // Remove o cookie
            sessionCookie.setHttpOnly(true);
            sessionCookie.setPath("/");
            response.addCookie(sessionCookie);
            
            // Limpar cookie de "Lembrar de mim"
            Cookie rememberMeCookie = new Cookie("DENTALSYNC_REMEMBER_ME", "");
            rememberMeCookie.setMaxAge(0); // Remove o cookie
            rememberMeCookie.setHttpOnly(true);
            rememberMeCookie.setPath("/");
            response.addCookie(rememberMeCookie);
            
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
    public ResponseEntity<Map<String, Object>> checkAuth(HttpServletRequest request, HttpServletResponse response) {
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            // Verificar se há sessão ativa
            if (session != null && auth != null && auth.isAuthenticated() 
                && !auth.getName().equals("anonymousUser")) {
                
                Protetico userData = (Protetico) session.getAttribute("USER_DATA");
                Boolean rememberMe = (Boolean) session.getAttribute("REMEMBER_ME");
                
                if (userData != null) {
                    // Verificar se o protético ainda está ativo e buscar dados atualizados
                    Optional<Protetico> currentUserOpt = proteticoService.findByEmail(userData.getEmail());
                    if (currentUserOpt.isPresent()) {
                        Protetico currentUser = currentUserOpt.get();
                        if (currentUser.getIsActive() == null || !currentUser.getIsActive()) {
                            System.out.println("Protético inativo detectado em sessão ativa: " + currentUser.getEmail());
                            invalidateUserSessions(currentUser.getEmail(), request, response);
                            
                            Map<String, Object> errorResponse = new HashMap<>();
                            errorResponse.put("success", false);
                            errorResponse.put("authenticated", false);
                            errorResponse.put("message", "Conta desativada. Entre em contato com o administrador do sistema.");
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
                        }
                        
                        // Atualizar dados da sessão com dados atualizados do banco
                        // Isso garante que mudanças no isAdmin sejam refletidas
                        session.setAttribute("USER_DATA", currentUser);
                        
                        Map<String, Object> authResponse = new HashMap<>();
                        authResponse.put("success", true);
                        authResponse.put("authenticated", true);
                        authResponse.put("user", currentUser); // Usar dados atualizados
                        authResponse.put("rememberMe", rememberMe != null ? rememberMe : false);
                        authResponse.put("sessionDuration", (rememberMe != null && rememberMe) ? "7 dias" : "30 minutos");
                        
                        return ResponseEntity.ok(authResponse);
                    }
                }
            }
            
            // Se não há sessão ativa, retornar não autenticado
            // O token de "Lembrar de mim" será verificado apenas no login manual
            Map<String, Object> unauthResponse = new HashMap<>();
            unauthResponse.put("success", false);
            unauthResponse.put("authenticated", false);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(unauthResponse);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("authenticated", false);
            errorResponse.put("message", "Erro ao verificar autenticação");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/login/request-recovery-code")
    public ResponseEntity<Map<String, Object>> requestRecoveryCode(
            @RequestParam String email,
            HttpServletRequest request) {
        
        try {
            System.out.println("=== Solicitando código de recuperação para: " + email + " ===");
            
            HttpSession session = request.getSession(false);
            if (session == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Sessão expirada. Faça login novamente.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            // Verificar se há dados temporários de 2FA na sessão
            Protetico tempUser = (Protetico) session.getAttribute("TEMP_USER");
            if (tempUser == null || !tempUser.getEmail().equals(email)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Sessão inválida. Faça login novamente.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            // Gerar e enviar código por email
            try {
                emailService.generateRecoveryCode(email);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Código de recuperação enviado para seu email");
                
                return ResponseEntity.ok(response);
                
            } catch (RuntimeException emailError) {
                System.err.println("Erro específico no envio de email: " + emailError.getMessage());
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Erro ao enviar email. Verifique se o email está correto e tente novamente.");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
            }
            
        } catch (Exception e) {
            System.err.println("Erro geral ao solicitar código de recuperação: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/login/verify-recovery-code")
    public ResponseEntity<Map<String, Object>> verifyRecoveryCode(
            @RequestParam String email,
            @RequestParam String code,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        try {
            System.out.println("=== Verificando código de recuperação para: " + email + " ===");
            
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
            
            if (tempAuth == null || tempUser == null || !tempUser.getEmail().equals(email)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Dados de autenticação não encontrados. Faça login novamente.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            // Verificar código de recuperação
            if (!emailService.validateRecoveryCode(email, code)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Código de recuperação inválido ou expirado");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Código válido - desativar 2FA e fazer login
            System.out.println("Código válido - desativando 2FA para: " + email);
            
            // Buscar usuário do banco e desativar 2FA
            Optional<Protetico> userFromDb = proteticoService.findByEmail(email);
            if (!userFromDb.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            Protetico user = userFromDb.get();
            user.setTwoFactorSecret(null);
            user.setTwoFactorEnabled(false);
            
            // Salvar usando repository para evitar problemas de senha
            proteticoService.save(user);
            
            // Limpar dados temporários
            session.removeAttribute("TEMP_AUTH");
            session.removeAttribute("TEMP_USER");
            session.removeAttribute("TEMP_REMEMBER_ME");
            
            // Completar login
            System.out.println("2FA desativado - completando login para: " + email);
            return completeLogin(user, tempAuth, rememberMe != null ? rememberMe : false, request, response);
            
        } catch (Exception e) {
            System.err.println("Erro ao verificar código de recuperação: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // ===== ENDPOINTS DE RECUPERAÇÃO DE SENHA =====
    
    @PostMapping("/password/forgot")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestParam String email) {
        try {
            System.out.println("=== Iniciando recuperação de senha para: " + email + " ===");
            
            Optional<Protetico> userOpt = proteticoService.findByEmail(email);
            if (!userOpt.isPresent()) {
                // Por segurança, sempre retornar sucesso mesmo se o email não existir
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Se existir uma conta com este email, você receberá as instruções");
                response.put("requiresTwoFactor", false);
                return ResponseEntity.ok(response);
            }
            
            Protetico user = userOpt.get();
            
            // Verificar se tem 2FA ativo
            if (user.getTwoFactorEnabled() && user.getTwoFactorSecret() != null) {
                // Gerar token temporário para o processo de recuperação
                String recoveryToken = generatePasswordResetToken(email);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("requiresTwoFactor", true);
                response.put("email", email);
                response.put("recoveryToken", recoveryToken);
                response.put("message", "Verificação 2FA necessária para recuperação de senha");
                
                System.out.println("2FA necessário para recuperação de senha: " + email);
                return ResponseEntity.ok(response);
            } else {
                // Usuário sem 2FA - enviar link diretamente por email
                String resetToken = generatePasswordResetToken(email);
                emailService.sendPasswordResetEmail(email, resetToken);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("requiresTwoFactor", false);
                response.put("message", "Link de recuperação enviado para seu email");
                
                System.out.println("Link de recuperação enviado por email para: " + email);
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("Erro na recuperação de senha: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/password/verify-2fa")
    public ResponseEntity<Map<String, Object>> verifyTwoFactorForPasswordReset(
            @RequestParam String email,
            @RequestParam String recoveryToken,
            @RequestParam int totpCode) {
        
        try {
            System.out.println("=== Verificando 2FA para recuperação de senha: " + email + " ===");
            
            // Verificar token de recuperação
            if (!emailService.validatePasswordResetToken(email, recoveryToken)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Token de recuperação inválido ou expirado");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Optional<Protetico> userOpt = proteticoService.findByEmail(email);
            if (!userOpt.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            Protetico user = userOpt.get();
            
            // Verificar código TOTP
            if (!twoFactorService.validateTotpCode(user.getTwoFactorSecret(), totpCode)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Código de verificação inválido");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // 2FA válido - gerar token final para reset de senha
            String finalResetToken = generatePasswordResetToken(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("resetToken", finalResetToken);
            response.put("message", "2FA verificado com sucesso");
            
            System.out.println("2FA verificado - token de reset gerado para: " + email);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Erro na verificação 2FA para recuperação: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/password/request-email-link")
    public ResponseEntity<Map<String, Object>> requestEmailLinkForPasswordReset(@RequestParam String email) {
        try {
            System.out.println("=== Solicitando link por email para: " + email + " ===");
            
            Optional<Protetico> userOpt = proteticoService.findByEmail(email);
            if (!userOpt.isPresent()) {
                // Por segurança, sempre retornar sucesso
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Se existir uma conta com este email, você receberá o link");
                return ResponseEntity.ok(response);
            }
            
            // Gerar token e enviar por email
            String resetToken = generatePasswordResetToken(email);
            emailService.sendPasswordResetEmail(email, resetToken);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Link de recuperação enviado para seu email");
            
            System.out.println("Link de recuperação enviado por email para: " + email);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Erro ao enviar link por email: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro ao enviar email");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/password/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        
        try {
            System.out.println("=== Resetando senha com token ===");
            
            // Validar token
            String email = emailService.validatePasswordResetTokenAndGetEmail(token);
            if (email == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Token inválido ou expirado");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Optional<Protetico> userOpt = proteticoService.findByEmail(email);
            if (!userOpt.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            Protetico user = userOpt.get();
            
            // Validar critérios de complexidade da nova senha
            try {
                PasswordValidator.validatePassword(newPassword);
            } catch (Exception e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Atualizar senha
            user.setSenha(passwordEncoder.encode(newPassword));
            proteticoService.save(user);
            
            // Invalidar token
            emailService.invalidatePasswordResetToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Senha alterada com sucesso");
            
            System.out.println("Senha resetada com sucesso para: " + email);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Erro ao resetar senha: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Método auxiliar para gerar token de reset de senha
    private String generatePasswordResetToken(String email) {
        return emailService.generatePasswordResetToken(email);
    }

    @PostMapping("/login/remember-me")
    public ResponseEntity<Map<String, Object>> loginWithRememberMeToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            System.out.println("=== Verificando login com token de Lembrar de mim ===");
            
            // Verificar cookie de "Lembrar de mim"
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("DENTALSYNC_REMEMBER_ME".equals(cookie.getName())) {
                        String rememberMeToken = cookie.getValue();
                        
                        // Buscar usuário pelo token válido
                        Optional<Protetico> userOpt = rememberMeService.findUserByValidRememberMeToken(rememberMeToken);
                        if (userOpt.isPresent()) {
                            Protetico user = userOpt.get();
                            
                            // Verificar se o protético está ativo
                            if (user.getIsActive() == null || !user.getIsActive()) {
                                System.out.println("Protético inativo tentando login com token: " + user.getEmail());
                                invalidateUserSessions(user.getEmail(), request, response);
                                
                                Map<String, Object> errorResponse = new HashMap<>();
                                errorResponse.put("success", false);
                                errorResponse.put("message", "Conta desativada. Entre em contato com o administrador do sistema.");
                                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
                            }
                            
                            // Verificar se o usuário tem 2FA ativado
                            if (user.getTwoFactorEnabled() != null && user.getTwoFactorEnabled()) {
                                System.out.println("Usuário com token válido tem 2FA ativado");
                                
                                // Gerar fingerprint do dispositivo
                                String userAgent = request.getHeader("User-Agent");
                                String ipAddress = request.getRemoteAddr();
                                String deviceFingerprint = trustedDeviceService.generateDeviceFingerprint(userAgent, ipAddress, null);
                                
                                // Verificar se este dispositivo é confiável
                                if (trustedDeviceService.isTrustedDevice(user.getEmail(), deviceFingerprint)) {
                                    System.out.println("Dispositivo confiável encontrado - login automático com token");
                                    
                                    // Criar autenticação
                                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                                        user.getEmail(), null, List.of()
                                    );
                                    
                                    return completeLogin(user, authentication, true, request, response);
                                } else {
                                    System.out.println("Dispositivo não confiável - exigindo 2FA mesmo com token válido");
                                    
                                    // Criar sessão temporária para 2FA com token de remember me
                                    HttpSession session = request.getSession(true);
                                    Authentication tempAuth = new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of());
                                    session.setAttribute("TEMP_AUTH", tempAuth);
                                    session.setAttribute("TEMP_USER", user);
                                    session.setAttribute("TEMP_REMEMBER_ME", true);
                                    session.setAttribute("TEMP_DEVICE_FINGERPRINT", deviceFingerprint);
                                    session.setAttribute("FROM_REMEMBER_ME_TOKEN", true);
                                    session.setMaxInactiveInterval(5 * 60);
                                    
                                    Map<String, Object> response2 = new HashMap<>();
                                    response2.put("success", true);
                                    response2.put("requiresTwoFactor", true);
                                    response2.put("message", "Digite o código do Google Authenticator");
                                    response2.put("email", user.getEmail());
                                    response2.put("fromRememberMeToken", true);
                                    
                                    return ResponseEntity.ok(response2);
                                }
                            } else {
                                System.out.println("Login automático com token (usuário sem 2FA)");
                                
                                // Criar autenticação
                                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                    user.getEmail(), null, List.of()
                                );
                                
                                return completeLogin(user, authentication, true, request, response);
                            }
                        }
                    }
                }
            }
            
            // Nenhum token válido encontrado
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Token de lembrar de mim não encontrado ou expirado");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            
        } catch (Exception e) {
            System.err.println("Erro no login com token de lembrar de mim: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Invalida todas as sessões e cookies associados ao usuário
     */
    private void invalidateUserSessions(String email, HttpServletRequest request, HttpServletResponse response) {
        try {
            System.out.println("🔒 Invalidando sessões para usuário: " + email);
            
            // Invalidar sessão atual se existir
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
                System.out.println("Sessão HTTP invalidada");
            }
            
            // Limpar cookies do navegador
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    // Remover cookie de sessão
                    if ("DENTALSYNC_SESSION".equals(cookie.getName()) || "JSESSIONID".equals(cookie.getName())) {
                        Cookie deleteCookie = new Cookie(cookie.getName(), null);
                        deleteCookie.setMaxAge(0);
                        deleteCookie.setPath("/");
                        response.addCookie(deleteCookie);
                        System.out.println("Cookie de sessão removido: " + cookie.getName());
                    }
                    
                    // Remover cookie de "Lembrar de mim"
                    if ("DENTALSYNC_REMEMBER_ME".equals(cookie.getName())) {
                        Cookie deleteCookie = new Cookie(cookie.getName(), null);
                        deleteCookie.setMaxAge(0);
                        deleteCookie.setPath("/");
                        response.addCookie(deleteCookie);
                        System.out.println("Cookie de lembrar-me removido");
                    }
                }
            }
            
            // Invalidar tokens de "Lembrar de mim" no banco de dados
            rememberMeService.removeRememberMeToken(email);
            System.out.println("Tokens de lembrar-me invalidados no banco");
            
        } catch (Exception e) {
            System.err.println("Erro ao invalidar sessões: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 