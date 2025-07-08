package com.senac.dentalsync.core.controller;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.service.TrustedDeviceService;
import com.senac.dentalsync.core.service.TwoFactorService;
import com.senac.dentalsync.core.util.PasswordValidator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/security")
public class SecurityController {

    @Autowired
    private ProteticoService proteticoService;

    @Autowired
    private TwoFactorService twoFactorService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TrustedDeviceService trustedDeviceService;

    /**
     * Altera a senha do usuário
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestParam String currentPassword,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verificar se o usuário está autenticado
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session == null || auth == null || !auth.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "Usuário não autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Buscar usuário atual
            Protetico currentUser = (Protetico) session.getAttribute("USER_DATA");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Dados do usuário não encontrados");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Verificar se a nova senha e confirmação coincidem
            if (!newPassword.equals(confirmPassword)) {
                response.put("success", false);
                response.put("message", "Nova senha e confirmação não coincidem");
                return ResponseEntity.badRequest().body(response);
            }

            // Validar critérios de complexidade da nova senha
            try {
                PasswordValidator.validatePassword(newPassword);
            } catch (Exception e) {
                response.put("success", false);
                response.put("message", e.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            // Verificar a senha atual
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(currentUser.getEmail(), currentPassword)
                );
            } catch (BadCredentialsException e) {
                response.put("success", false);
                response.put("message", "Senha atual incorreta");
                return ResponseEntity.badRequest().body(response);
            }

            // Atualizar a senha
            currentUser.setSenha(newPassword); // Senha em texto plano - o service vai criptografar
            proteticoService.save(currentUser);

            // Atualizar dados na sessão
            session.setAttribute("USER_DATA", currentUser);

            response.put("success", true);
            response.put("message", "Senha alterada com sucesso");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Inicia o processo de configuração do 2FA
     */
    @PostMapping("/2fa/setup")
    public ResponseEntity<Map<String, Object>> setupTwoFactor(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session == null || auth == null || !auth.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "Usuário não autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Protetico currentUser = (Protetico) session.getAttribute("USER_DATA");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Dados do usuário não encontrados");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Gerar dados para configuração do 2FA
            TwoFactorService.TwoFactorSetupData setupData = twoFactorService.generateSetupData(
                currentUser.getEmail(), 
                "DentalSync"
            );

            response.put("success", true);
            response.put("secretKey", setupData.getSecretKey());
            response.put("qrCodeImage", setupData.getQrCodeImage());
            response.put("message", "Dados de configuração 2FA gerados");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao gerar configuração 2FA");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Ativa o 2FA após verificar o código TOTP
     */
    @PostMapping("/2fa/enable")
    public ResponseEntity<Map<String, Object>> enableTwoFactor(
            @RequestParam String secretKey,
            @RequestParam int totpCode,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session == null || auth == null || !auth.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "Usuário não autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Protetico currentUser = (Protetico) session.getAttribute("USER_DATA");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Dados do usuário não encontrados");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Verificar o código TOTP
            if (!twoFactorService.validateTotpCode(secretKey, totpCode)) {
                response.put("success", false);
                response.put("message", "Código de verificação inválido");
                return ResponseEntity.badRequest().body(response);
            }

            // Ativar 2FA
            currentUser.setTwoFactorSecret(secretKey);
            currentUser.setTwoFactorEnabled(true);
            proteticoService.save(currentUser);

            // Atualizar dados na sessão
            session.setAttribute("USER_DATA", currentUser);

            response.put("success", true);
            response.put("message", "Autenticação de dois fatores ativada com sucesso");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao ativar 2FA");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Desativa o 2FA
     */
    @PostMapping("/2fa/disable")
    public ResponseEntity<Map<String, Object>> disableTwoFactor(
            @RequestParam int totpCode,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session == null || auth == null || !auth.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "Usuário não autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Protetico currentUser = (Protetico) session.getAttribute("USER_DATA");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Dados do usuário não encontrados");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            if (!currentUser.getTwoFactorEnabled()) {
                response.put("success", false);
                response.put("message", "2FA já está desativado");
                return ResponseEntity.badRequest().body(response);
            }

            // Verificar o código TOTP
            if (!twoFactorService.validateTotpCode(currentUser.getTwoFactorSecret(), totpCode)) {
                response.put("success", false);
                response.put("message", "Código de verificação inválido");
                return ResponseEntity.badRequest().body(response);
            }

            // Desativar 2FA
            currentUser.setTwoFactorSecret(null);
            currentUser.setTwoFactorEnabled(false);
            proteticoService.save(currentUser);

            // Atualizar dados na sessão
            session.setAttribute("USER_DATA", currentUser);

            response.put("success", true);
            response.put("message", "Autenticação de dois fatores desativada com sucesso");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao desativar 2FA");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Retorna o status atual do 2FA
     */
    @GetMapping("/2fa/status")
    public ResponseEntity<Map<String, Object>> getTwoFactorStatus(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session == null || auth == null || !auth.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "Usuário não autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Protetico currentUser = (Protetico) session.getAttribute("USER_DATA");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Dados do usuário não encontrados");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            response.put("success", true);
            response.put("twoFactorEnabled", currentUser.getTwoFactorEnabled() != null ? currentUser.getTwoFactorEnabled() : false);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao verificar status 2FA");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtém informações sobre dispositivos confiáveis
     */
    @GetMapping("/trusted-devices")
    public ResponseEntity<Map<String, Object>> getTrustedDevicesInfo(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session == null || auth == null || !auth.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "Usuário não autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Protetico currentUser = (Protetico) session.getAttribute("USER_DATA");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Dados do usuário não encontrados");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Map<String, Object> deviceInfo = trustedDeviceService.getTrustedDevicesInfo(currentUser.getEmail());
            
            response.put("success", true);
            response.put("trustedDevices", deviceInfo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao obter informações de dispositivos");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Remove todos os dispositivos confiáveis do usuário
     */
    @PostMapping("/trusted-devices/remove-all")
    public ResponseEntity<Map<String, Object>> removeAllTrustedDevices(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            HttpSession session = request.getSession(false);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (session == null || auth == null || !auth.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "Usuário não autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Protetico currentUser = (Protetico) session.getAttribute("USER_DATA");
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "Dados do usuário não encontrados");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            trustedDeviceService.removeAllTrustedDevicesForUser(currentUser.getEmail());
            
            response.put("success", true);
            response.put("message", "Todos os dispositivos confiáveis foram removidos");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao remover dispositivos confiáveis");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 