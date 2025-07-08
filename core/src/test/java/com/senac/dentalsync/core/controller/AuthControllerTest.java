package com.senac.dentalsync.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;

import jakarta.servlet.http.Cookie;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = AuthController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private ProteticoService proteticoService;

    @MockBean
    private TwoFactorService twoFactorService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private TrustedDeviceService trustedDeviceService;

    @MockBean
    private RememberMeService rememberMeService;

    private Protetico proteticoTeste;
    private Authentication authenticationTeste;

    @BeforeEach
    void setUp() {
        proteticoTeste = new Protetico();
        proteticoTeste.setId(1L);
        proteticoTeste.setNome("João Protético");
        proteticoTeste.setEmail("joao@protetico.com");
        proteticoTeste.setTwoFactorEnabled(false);
        proteticoTeste.setTwoFactorSecret(null);

        authenticationTeste = new UsernamePasswordAuthenticationToken(
            "joao@protetico.com", "password123");
    }

    // ========== Testes do endpoint /login ==========

    @Test
    void deveRealizarLoginComSucesso() throws Exception {
        // Given
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authenticationTeste);

        // When & Then
        mockMvc.perform(post("/login")
                .param("username", "joao@protetico.com")
                .param("password", "password123")
                .param("rememberMe", "false"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Login realizado com sucesso"))
            .andExpect(jsonPath("$.user.email").value("joao@protetico.com"))
            .andExpect(jsonPath("$.rememberMe").value(false));
    }

    @Test
    void deveRetornarErroParaUsuarioInexistente() throws Exception {
        // Given
        when(proteticoService.findByEmail("inexistente@email.com"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/login")
                .param("username", "inexistente@email.com")
                .param("password", "password123"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Email ou senha inválidos"));
    }


    @Test
    void deveRetornarErroParaSenhaIncorreta() throws Exception {
        // Given
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Credenciais inválidas"));

        // When & Then
        mockMvc.perform(post("/login")
                .param("username", "joao@protetico.com")
                .param("password", "senhaerrada"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Email ou senha inválidos"));
    }

    @Test
    void deveExigir2FAQuandoAtivado() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(true);
        proteticoTeste.setTwoFactorSecret("secret123");
        
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authenticationTeste);
        when(trustedDeviceService.generateDeviceFingerprint(anyString(), anyString(), any()))
            .thenReturn("device-fingerprint");
        when(trustedDeviceService.isTrustedDevice("joao@protetico.com", "device-fingerprint"))
            .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/login")
                .param("username", "joao@protetico.com")
                .param("password", "password123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.requiresTwoFactor").value(true))
            .andExpect(jsonPath("$.message").value("Digite o código do Google Authenticator"));
    }

    @Test
    void deveRetornarErroParaSessaoExpirada() throws Exception {
        // When & Then
        mockMvc.perform(post("/login/verify-2fa")
                .param("totpCode", "123456"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Sessão expirada. Faça login novamente."));
    }

    @Test
    void deveRealizarLoginComRememberMe() throws Exception {
        // Given
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authenticationTeste);
        when(rememberMeService.generateRememberMeToken(eq("joao@protetico.com"), eq(7)))
            .thenReturn("remember-token-123");

        // When & Then
        mockMvc.perform(post("/login")
                .param("username", "joao@protetico.com")
                .param("password", "password123")
                .param("rememberMe", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.rememberMe").value(true))
            .andExpect(jsonPath("$.sessionDuration").value("7 dias"));
    }

    @Test
    void deveSolicitarRecuperacaoSenhaUsuarioSem2FA() throws Exception {
        // Given
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(emailService.generatePasswordResetToken("joao@protetico.com"))
            .thenReturn("reset-token-123");

        // When & Then
        mockMvc.perform(post("/password/forgot")
                .param("email", "joao@protetico.com"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.requiresTwoFactor").value(false))
            .andExpect(jsonPath("$.message").value("Link de recuperação enviado para seu email"));

        verify(emailService).sendPasswordResetEmail("joao@protetico.com", "reset-token-123");
    }



    // ========== Testes do endpoint /login/verify-2fa ==========

    @Test
    void deveVerificar2FAComSucesso() throws Exception {
        // Given
        proteticoTeste.setTwoFactorSecret("secret123");
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("TEMP_AUTH", authenticationTeste);
        session.setAttribute("TEMP_USER", proteticoTeste);
        session.setAttribute("TEMP_REMEMBER_ME", false);
        session.setAttribute("TEMP_DEVICE_FINGERPRINT", "device-fingerprint");

        when(twoFactorService.validateTotpCode("secret123", 123456))
            .thenReturn(true);

        // When & Then
        mockMvc.perform(post("/login/verify-2fa")
                .param("totpCode", "123456")
                .param("trustThisDevice", "false")
                .session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Login realizado com sucesso"));
    }

    @Test
    void deveVerificar2FAComDispositivoConfiavel() throws Exception {
        // Given
        proteticoTeste.setTwoFactorSecret("secret123");
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("TEMP_AUTH", authenticationTeste);
        session.setAttribute("TEMP_USER", proteticoTeste);
        session.setAttribute("TEMP_REMEMBER_ME", false);
        session.setAttribute("TEMP_DEVICE_FINGERPRINT", "device-fingerprint");

        when(twoFactorService.validateTotpCode("secret123", 123456))
            .thenReturn(true);
        when(trustedDeviceService.generateTrustedDeviceToken("joao@protetico.com", "device-fingerprint"))
            .thenReturn("trusted-token");

        // When & Then
        mockMvc.perform(post("/login/verify-2fa")
                .param("totpCode", "123456")
                .param("trustThisDevice", "true")
                .session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Login realizado com sucesso"));
    }

    @Test
    void deveRetornarErroParaCodigo2FAInvalido() throws Exception {
        // Given
        proteticoTeste.setTwoFactorSecret("secret123");
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("TEMP_AUTH", authenticationTeste);
        session.setAttribute("TEMP_USER", proteticoTeste);

        when(twoFactorService.validateTotpCode("secret123", 999999))
            .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/login/verify-2fa")
                .param("totpCode", "999999")
                .session(session))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Código de verificação inválido"));
    }

    // ========== Testes do endpoint /logout ==========

    @Test
    void deveRealizarLogoutComSucesso() throws Exception {
        // Given
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_DATA", proteticoTeste);

        // When & Then
        mockMvc.perform(post("/logout")
                .session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Logout realizado com sucesso"));

        verify(rememberMeService).removeRememberMeToken("joao@protetico.com");
    }

    @Test
    void deveRealizarLogoutSemSessao() throws Exception {
        // When & Then
        mockMvc.perform(post("/logout"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Logout realizado com sucesso"));
    }

    // ========== Testes do endpoint /auth/check ==========

    @Test
    void deveRetornarNaoAutenticadoSemSessao() throws Exception {
        // When & Then
        mockMvc.perform(get("/auth/check"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.authenticated").value(false));
    }

    // ========== Testes de recuperação de senha ==========

    @Test
    void deveSolicitarRecuperacaoSenhaUsuarioCom2FA() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(true);
        proteticoTeste.setTwoFactorSecret("secret123");
        
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(emailService.generatePasswordResetToken("joao@protetico.com"))
            .thenReturn("recovery-token-123");

        // When & Then
        mockMvc.perform(post("/password/forgot")
                .param("email", "joao@protetico.com"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.requiresTwoFactor").value(true))
            .andExpect(jsonPath("$.recoveryToken").value("recovery-token-123"));
    }

    @Test
    void deveRetornarSucessoParaEmailInexistente() throws Exception {
        // Given
        when(proteticoService.findByEmail("inexistente@email.com"))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/password/forgot")
                .param("email", "inexistente@email.com"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Se existir uma conta com este email, você receberá as instruções"));
    }

    @Test
    void deveVerificar2FAParaRecuperacaoSenha() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(true);
        proteticoTeste.setTwoFactorSecret("secret123");

        when(emailService.validatePasswordResetToken("joao@protetico.com", "recovery-token"))
            .thenReturn(true);
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(twoFactorService.validateTotpCode("secret123", 123456))
            .thenReturn(true);
        when(emailService.generatePasswordResetToken("joao@protetico.com"))
            .thenReturn("final-reset-token");

        // When & Then
        mockMvc.perform(post("/password/verify-2fa")
                .param("email", "joao@protetico.com")
                .param("recoveryToken", "recovery-token")
                .param("totpCode", "123456"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.resetToken").value("final-reset-token"));
    }

    @Test
    void deveResetarSenhaComSucesso() throws Exception {
        // Given
        when(emailService.validatePasswordResetTokenAndGetEmail("reset-token"))
            .thenReturn("joao@protetico.com");
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));
        when(passwordEncoder.encode("novaSenha123"))
            .thenReturn("encoded-password");

        // When & Then
        mockMvc.perform(post("/password/reset")
                .param("token", "reset-token")
                .param("newPassword", "novaSenha123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Senha alterada com sucesso"));

        verify(proteticoService).save(proteticoTeste);
        verify(emailService).invalidatePasswordResetToken("reset-token");
    }

    @Test
    void deveRetornarErroParaTokenResetInvalido() throws Exception {
        // Given
        when(emailService.validatePasswordResetTokenAndGetEmail("token-invalido"))
            .thenReturn(null);

        // When & Then
        mockMvc.perform(post("/password/reset")
                .param("token", "token-invalido")
                .param("newPassword", "novaSenha123"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Token inválido ou expirado"));
    }

    // ========== Testes de remember me token ==========

    @Test
    void deveRealizarLoginComRememberMeTokenValido() throws Exception {
        // Given
        when(rememberMeService.findUserByValidRememberMeToken("valid-token"))
            .thenReturn(Optional.of(proteticoTeste));
        when(trustedDeviceService.generateDeviceFingerprint(anyString(), anyString(), any()))
            .thenReturn("device-fingerprint");
        when(trustedDeviceService.isTrustedDevice("joao@protetico.com", "device-fingerprint"))
            .thenReturn(true);

        // When & Then
        mockMvc.perform(post("/login/remember-me")
                .cookie(new Cookie("DENTALSYNC_REMEMBER_ME", "valid-token")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Login realizado com sucesso"));
    }

    @Test
    void deveExigir2FAParaRememberMeTokenComUsuario2FA() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(true);
        proteticoTeste.setTwoFactorSecret("secret123");

        when(rememberMeService.findUserByValidRememberMeToken("valid-token"))
            .thenReturn(Optional.of(proteticoTeste));
        when(trustedDeviceService.generateDeviceFingerprint(anyString(), anyString(), any()))
            .thenReturn("device-fingerprint");
        when(trustedDeviceService.isTrustedDevice("joao@protetico.com", "device-fingerprint"))
            .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/login/remember-me")
                .cookie(new Cookie("DENTALSYNC_REMEMBER_ME", "valid-token")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.requiresTwoFactor").value(true))
            .andExpect(jsonPath("$.fromRememberMeToken").value(true));
    }

    @Test
    void deveRetornarErroParaRememberMeTokenInvalido() throws Exception {
        // When & Then
        mockMvc.perform(post("/login/remember-me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Token de lembrar de mim não encontrado ou expirado"));
    }

    // ========== Testes de códigos de recuperação por email ==========

    @Test
    void deveSolicitarCodigoRecuperacaoEmail() throws Exception {
        // Given
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("TEMP_USER", proteticoTeste);

        // When & Then
        mockMvc.perform(post("/login/request-recovery-code")
                .param("email", "joao@protetico.com")
                .session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Código de recuperação enviado para seu email"));

        verify(emailService).generateRecoveryCode("joao@protetico.com");
    }

    @Test
    void deveVerificarCodigoRecuperacaoEmail() throws Exception {
        // Given
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("TEMP_AUTH", authenticationTeste);
        session.setAttribute("TEMP_USER", proteticoTeste);
        session.setAttribute("TEMP_REMEMBER_ME", false);

        when(emailService.validateRecoveryCode("joao@protetico.com", "123456"))
            .thenReturn(true);
        when(proteticoService.findByEmail("joao@protetico.com"))
            .thenReturn(Optional.of(proteticoTeste));

        // When & Then
        mockMvc.perform(post("/login/verify-recovery-code")
                .param("email", "joao@protetico.com")
                .param("code", "123456")
                .session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Login realizado com sucesso"));

        verify(proteticoService).save(proteticoTeste);
    }

    @Test
    void deveRetornarErroParaCodigoRecuperacaoInvalido() throws Exception {
        // Given
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("TEMP_AUTH", authenticationTeste);
        session.setAttribute("TEMP_USER", proteticoTeste);

        when(emailService.validateRecoveryCode("joao@protetico.com", "999999"))
            .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/login/verify-recovery-code")
                .param("email", "joao@protetico.com")
                .param("code", "999999")
                .session(session))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Código de recuperação inválido ou expirado"));
    }
} 