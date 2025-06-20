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
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = SecurityController.class, 
    excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
@ActiveProfiles("test")
public class SecurityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProteticoService proteticoService;

    @MockBean
    private TwoFactorService twoFactorService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private TrustedDeviceService trustedDeviceService;

    private Protetico proteticoTeste;
    private Authentication authenticationTeste;
    private MockHttpSession sessionTeste;

    @BeforeEach
    void setUp() {
        proteticoTeste = new Protetico();
        proteticoTeste.setId(1L);
        proteticoTeste.setNome("João Protético");
        proteticoTeste.setEmail("joao@protetico.com");
        proteticoTeste.setTwoFactorEnabled(false);
        proteticoTeste.setTwoFactorSecret(null);

        authenticationTeste = new UsernamePasswordAuthenticationToken(
            "joao@protetico.com", null, Collections.emptyList());

        sessionTeste = new MockHttpSession();
        sessionTeste.setAttribute("USER_DATA", proteticoTeste);

        // Mock do SecurityContext
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authenticationTeste);
        SecurityContextHolder.setContext(securityContext);
    }

    // ========== Testes do endpoint /security/change-password ==========

    @Test
    void deveAlterarSenhaComSucesso() throws Exception {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authenticationTeste);

        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaAtual123")
                .param("newPassword", "novaSenha123")
                .param("confirmPassword", "novaSenha123")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Senha alterada com sucesso"));

        verify(proteticoService).save(proteticoTeste);
    }

    @Test
    void deveRetornarErroParaSenhaAtualIncorreta() throws Exception {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Senha incorreta"));

        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaErrada")
                .param("newPassword", "novaSenha123")
                .param("confirmPassword", "novaSenha123")
                .session(sessionTeste))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Senha atual incorreta"));
    }

    @Test
    void deveRetornarErroParaSenhasNaoCoincidentes() throws Exception {
        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaAtual123")
                .param("newPassword", "novaSenha123")
                .param("confirmPassword", "senhasDiferentes")
                .session(sessionTeste))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Nova senha e confirmação não coincidem"));
    }

    @Test
    void deveRetornarErroParaSenhaMuitoCurta() throws Exception {
        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaAtual123")
                .param("newPassword", "123")
                .param("confirmPassword", "123")
                .session(sessionTeste))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Nova senha deve ter pelo menos 6 caracteres"));
    }

    @Test
    void deveRetornarErroParaUsuarioNaoAutenticado() throws Exception {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaAtual123")
                .param("newPassword", "novaSenha123")
                .param("confirmPassword", "novaSenha123"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuário não autenticado"));
    }

    @Test
    void deveRetornarErroSemSessao() throws Exception {
        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaAtual123")
                .param("newPassword", "novaSenha123")
                .param("confirmPassword", "novaSenha123"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuário não autenticado"));
    }

    // ========== Testes do endpoint /security/2fa/setup ==========

    @Test
    void deveGerarDadosConfiguracao2FA() throws Exception {
        // Given
        TwoFactorService.TwoFactorSetupData setupData = new TwoFactorService.TwoFactorSetupData(
            "SECRET123", 
            "otpauth://totp/DentalSync:joao@protetico.com?secret=SECRET123&issuer=DentalSync",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        );
        
        when(twoFactorService.generateSetupData("joao@protetico.com", "DentalSync"))
            .thenReturn(setupData);

        // When & Then
        mockMvc.perform(post("/security/2fa/setup")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.secretKey").value("SECRET123"))
            .andExpect(jsonPath("$.qrCodeImage").exists())
            .andExpect(jsonPath("$.message").value("Dados de configuração 2FA gerados"));
    }

    @Test
    void deveRetornarErroAoGerarConfiguracao2FASemAutenticacao() throws Exception {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(post("/security/2fa/setup"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuário não autenticado"));
    }

    // ========== Testes do endpoint /security/2fa/enable ==========

    @Test
    void deveAtivar2FAComSucesso() throws Exception {
        // Given
        when(twoFactorService.validateTotpCode("SECRET123", 123456))
            .thenReturn(true);

        // When & Then
        mockMvc.perform(post("/security/2fa/enable")
                .param("secretKey", "SECRET123")
                .param("totpCode", "123456")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Autenticação de dois fatores ativada com sucesso"));

        verify(proteticoService).save(proteticoTeste);
        // Verificar se o 2FA foi ativado
        assert proteticoTeste.getTwoFactorEnabled();
        assert "SECRET123".equals(proteticoTeste.getTwoFactorSecret());
    }

    @Test
    void deveRetornarErroParaCodigo2FAInvalidoNaAtivacao() throws Exception {
        // Given
        when(twoFactorService.validateTotpCode("SECRET123", 999999))
            .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/security/2fa/enable")
                .param("secretKey", "SECRET123")
                .param("totpCode", "999999")
                .session(sessionTeste))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Código de verificação inválido"));
    }

    // ========== Testes do endpoint /security/2fa/disable ==========

    @Test
    void deveDesativar2FAComSucesso() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(true);
        proteticoTeste.setTwoFactorSecret("SECRET123");
        sessionTeste.setAttribute("USER_DATA", proteticoTeste);

        when(twoFactorService.validateTotpCode("SECRET123", 123456))
            .thenReturn(true);

        // When & Then
        mockMvc.perform(post("/security/2fa/disable")
                .param("totpCode", "123456")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Autenticação de dois fatores desativada com sucesso"));

        verify(proteticoService).save(proteticoTeste);
        // Verificar se o 2FA foi desativado
        assert !proteticoTeste.getTwoFactorEnabled();
        assert proteticoTeste.getTwoFactorSecret() == null;
    }

    @Test
    void deveRetornarErroAoDesativar2FAJaDesativado() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(false);
        sessionTeste.setAttribute("USER_DATA", proteticoTeste);

        // When & Then
        mockMvc.perform(post("/security/2fa/disable")
                .param("totpCode", "123456")
                .session(sessionTeste))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("2FA já está desativado"));
    }

    @Test
    void deveRetornarErroParaCodigo2FAInvalidoNaDesativacao() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(true);
        proteticoTeste.setTwoFactorSecret("SECRET123");
        sessionTeste.setAttribute("USER_DATA", proteticoTeste);

        when(twoFactorService.validateTotpCode("SECRET123", 999999))
            .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/security/2fa/disable")
                .param("totpCode", "999999")
                .session(sessionTeste))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Código de verificação inválido"));
    }

    // ========== Testes do endpoint /security/2fa/status ==========

    @Test
    void deveRetornarStatus2FADesativado() throws Exception {
        // When & Then
        mockMvc.perform(get("/security/2fa/status")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.twoFactorEnabled").value(false));
    }

    @Test
    void deveRetornarStatus2FAAtivado() throws Exception {
        // Given
        proteticoTeste.setTwoFactorEnabled(true);
        sessionTeste.setAttribute("USER_DATA", proteticoTeste);

        // When & Then
        mockMvc.perform(get("/security/2fa/status")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.twoFactorEnabled").value(true));
    }

    @Test
    void deveRetornarErroAoVerificarStatus2FASemAutenticacao() throws Exception {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(get("/security/2fa/status"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuário não autenticado"));
    }

    // ========== Testes do endpoint /security/trusted-devices ==========

    @Test
    void deveObterInformacoesDispositivosConfiáveis() throws Exception {
        // Given
        Map<String, Object> deviceInfo = new HashMap<>();
        deviceInfo.put("totalDevices", 2);
        deviceInfo.put("lastAccess", "2024-01-15T10:30:00");
        
        when(trustedDeviceService.getTrustedDevicesInfo("joao@protetico.com"))
            .thenReturn(deviceInfo);

        // When & Then
        mockMvc.perform(get("/security/trusted-devices")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.trustedDevices.totalDevices").value(2))
            .andExpect(jsonPath("$.trustedDevices.lastAccess").value("2024-01-15T10:30:00"));
    }

    @Test
    void deveRetornarErroAoObterDispositivosSemAutenticacao() throws Exception {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(get("/security/trusted-devices"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuário não autenticado"));
    }

    // ========== Testes do endpoint /security/trusted-devices/remove-all ==========

    @Test
    void deveRemoverTodosDispositivosConfiáveis() throws Exception {
        // When & Then
        mockMvc.perform(post("/security/trusted-devices/remove-all")
                .session(sessionTeste))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Todos os dispositivos confiáveis foram removidos"));

        verify(trustedDeviceService).removeAllTrustedDevicesForUser("joao@protetico.com");
    }

    @Test
    void deveRetornarErroAoRemoverDispositivosSemAutenticacao() throws Exception {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // When & Then
        mockMvc.perform(post("/security/trusted-devices/remove-all"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuário não autenticado"));
    }

    @Test
    void deveRetornarErroAoRemoverDispositivosSemSessao() throws Exception {
        // When & Then
        mockMvc.perform(post("/security/trusted-devices/remove-all"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Usuário não autenticado"));
    }

    // ========== Testes de casos extremos ==========

    @Test
    void deveRetornarErroParaDadosUsuarioNaoEncontradosNaSessao() throws Exception {
        // Given
        MockHttpSession sessionSemDados = new MockHttpSession();
        // Não adicionar USER_DATA na sessão

        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaAtual123")
                .param("newPassword", "novaSenha123")
                .param("confirmPassword", "novaSenha123")
                .session(sessionSemDados))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Dados do usuário não encontrados"));
    }

    @Test
    void deveRetornarErroInternoAoFalharSalvarUsuario() throws Exception {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authenticationTeste);
        when(proteticoService.save(any(Protetico.class)))
            .thenThrow(new RuntimeException("Erro no banco de dados"));

        // When & Then
        mockMvc.perform(post("/security/change-password")
                .param("currentPassword", "senhaAtual123")
                .param("newPassword", "novaSenha123")
                .param("confirmPassword", "novaSenha123")
                .session(sessionTeste))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Erro interno do servidor"));
    }

    @Test
    void deveRetornarErroInternoAoFalharGerar2FA() throws Exception {
        // Given
        when(twoFactorService.generateSetupData("joao@protetico.com", "DentalSync"))
            .thenThrow(new RuntimeException("Erro ao gerar QR Code"));

        // When & Then
        mockMvc.perform(post("/security/2fa/setup")
                .session(sessionTeste))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Erro ao gerar configuração 2FA"));
    }

    @Test
    void deveRetornarErroInternoAoFalharObterDispositivos() throws Exception {
        // Given
        when(trustedDeviceService.getTrustedDevicesInfo("joao@protetico.com"))
            .thenThrow(new RuntimeException("Erro ao acessar dispositivos"));

        // When & Then
        mockMvc.perform(get("/security/trusted-devices")
                .session(sessionTeste))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Erro ao obter informações de dispositivos"));
    }

    @Test
    void deveRetornarErroInternoAoFalharRemoverDispositivos() throws Exception {
        // Given
        doThrow(new RuntimeException("Erro ao remover dispositivos"))
            .when(trustedDeviceService).removeAllTrustedDevicesForUser("joao@protetico.com");

        // When & Then
        mockMvc.perform(post("/security/trusted-devices/remove-all")
                .session(sessionTeste))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Erro ao remover dispositivos confiáveis"));
    }
} 