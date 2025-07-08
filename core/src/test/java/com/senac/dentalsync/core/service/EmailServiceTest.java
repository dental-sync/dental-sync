package com.senac.dentalsync.core.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    private final String testEmail = "test@example.com";
    private final String fromEmail = "noreply@dentalsync.com";
    private final String fromName = "DentalSync Security";
    private final String frontendUrl = "http://localhost:3000";
    private final String resetPasswordPath = "/reset-password";

    @BeforeEach
    void setUp() {
        // Configurar stack traces mais limpos
        System.setProperty("org.assertj.core.util.StackTraceElementsDisplayed", "5");
        
        // Configurar valores das propriedades usando ReflectionTestUtils
        ReflectionTestUtils.setField(emailService, "fromEmail", fromEmail);
        ReflectionTestUtils.setField(emailService, "fromName", fromName);
        ReflectionTestUtils.setField(emailService, "emailUsername", ""); // Modo desenvolvimento
        ReflectionTestUtils.setField(emailService, "emailPassword", ""); // Modo desenvolvimento
        ReflectionTestUtils.setField(emailService, "frontendUrl", frontendUrl);
        ReflectionTestUtils.setField(emailService, "resetPasswordPath", resetPasswordPath);
    }

    // Testes do método generateRecoveryCode
    @Test
    void deveGerarCodigoRecuperacaoValido() {
        // when
        String codigo = emailService.generateRecoveryCode(testEmail);

        // then
        assertThat(codigo)
            .as("Código de recuperação deve estar presente")
            .isNotNull();
        assertThat(codigo)
            .as("Código deve ter exatamente 6 dígitos")
            .hasSize(6)
            .matches("\\d{6}");
    }

    @Test
    void deveArmazenarCodigoETimestampCorretamente() {
        // when
        String codigo1 = emailService.generateRecoveryCode(testEmail);
        String codigo2 = emailService.generateRecoveryCode(testEmail);

        // then
        assertThat(codigo1).isNotNull();
        assertThat(codigo2).isNotNull();
        assertThat(codigo2).isNotEqualTo(codigo1); // Deve gerar códigos diferentes
    }

    // Testes do método validateRecoveryCode
    @Test
    void deveValidarCodigoCorretoValido() {
        // given
        String codigo = emailService.generateRecoveryCode(testEmail);

        // when
        boolean isValid = emailService.validateRecoveryCode(testEmail, codigo);

        // then
        assertThat(isValid)
            .as("Código correto deve ser validado com sucesso")
            .isTrue();
    }

    @Test
    void deveInvalidarCodigoIncorreto() {
        // given
        emailService.generateRecoveryCode(testEmail);

        // when
        boolean isValid = emailService.validateRecoveryCode(testEmail, "999999");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarCodigoInexistente() {
        // when
        boolean isValid = emailService.validateRecoveryCode("inexistente@test.com", "123456");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveRemoverCodigoAposUsoCorreto() {
        // given
        String codigo = emailService.generateRecoveryCode(testEmail);
        
        // when
        boolean firstValidation = emailService.validateRecoveryCode(testEmail, codigo);
        boolean secondValidation = emailService.validateRecoveryCode(testEmail, codigo);

        // then
        assertThat(firstValidation).isTrue();
        assertThat(secondValidation).isFalse(); // Código deve ser removido após uso
    }

    @Test
    void deveValidarExpiracaoDeCodigoPorTempo() throws Exception {
        // given
        String codigo = emailService.generateRecoveryCode(testEmail);
        
        // Simular passagem de tempo modificando o timestamp diretamente
        // Acessar o mapa privado usando reflection para simular expiração
        var tempCodes = ReflectionTestUtils.getField(emailService, "tempCodes");
        var codeTimestamps = ReflectionTestUtils.getField(emailService, "codeTimestamps");
        
        // Modificar timestamp para simular expiração (11 minutos atrás)
        long expiredTime = System.currentTimeMillis() - (11 * 60 * 1000);
        ((java.util.Map<String, Long>) codeTimestamps).put(testEmail, expiredTime);

        // when
        boolean isValid = emailService.validateRecoveryCode(testEmail, codigo);

        // then
        assertThat(isValid).isFalse();
    }

    // Testes do envio de email com configurações válidas
    @Test
    void deveEnviarEmailComConfiguracaoValida() throws Exception {
        // given - Configurar credenciais válidas para este teste
        ReflectionTestUtils.setField(emailService, "emailUsername", "test@gmail.com");
        ReflectionTestUtils.setField(emailService, "emailPassword", "password123");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));
        
        // when
        emailService.generateRecoveryCode(testEmail);

        // then
        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    // Testes do modo desenvolvimento (sem credenciais)
    @Test
    void deveSimularEnvioEmModoDesenvolvimento() {
        // given - Simular modo desenvolvimento
        ReflectionTestUtils.setField(emailService, "emailUsername", "");
        ReflectionTestUtils.setField(emailService, "emailPassword", "");

        // when
        String codigo = emailService.generateRecoveryCode(testEmail);

        // then
        assertThat(codigo).isNotNull();
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void deveLancarExcecaoQuandoEnvioFalhar() throws Exception {
        // given - Configurar credenciais válidas para este teste
        ReflectionTestUtils.setField(emailService, "emailUsername", "test@gmail.com");
        ReflectionTestUtils.setField(emailService, "emailPassword", "password123");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Erro de envio")).when(mailSender).send(any(MimeMessage.class));

        // when/then
        assertThatThrownBy(() -> emailService.generateRecoveryCode(testEmail))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Falha ao enviar email de recuperação");
    }

    // Testes dos métodos de reset de senha
    @Test
    void deveGerarTokenResetSenhaValido() {
        // when
        String token = emailService.generatePasswordResetToken(testEmail);

        // then
        assertThat(token)
            .as("Token de reset deve estar presente e conter hífen (UUID + timestamp)")
            .isNotNull()
            .contains("-");
    }

    @Test
    void deveValidarTokenResetSenhaCorreto() {
        // given
        String token = emailService.generatePasswordResetToken(testEmail);

        // when
        boolean isValid = emailService.validatePasswordResetToken(testEmail, token);

        // then
        assertThat(isValid).isTrue();
    }

    @Test
    void deveInvalidarTokenResetSenhaIncorreto() {
        // given
        emailService.generatePasswordResetToken(testEmail);

        // when
        boolean isValid = emailService.validatePasswordResetToken(testEmail, "token-invalido");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarTokenParaEmailDiferente() {
        // given
        String token = emailService.generatePasswordResetToken(testEmail);

        // when
        boolean isValid = emailService.validatePasswordResetToken("outro@email.com", token);

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveRetornarEmailDoTokenValido() {
        // given
        String token = emailService.generatePasswordResetToken(testEmail);

        // when
        String email = emailService.validatePasswordResetTokenAndGetEmail(token);

        // then
        assertThat(email).isEqualTo(testEmail);
    }

    @Test
    void deveRetornarNullParaTokenInvalido() {
        // when
        String email = emailService.validatePasswordResetTokenAndGetEmail("token-invalido");

        // then
        assertThat(email).isNull();
    }

    @Test
    void deveInvalidarTokenResetSenha() {
        // given
        String token = emailService.generatePasswordResetToken(testEmail);

        // when
        emailService.invalidatePasswordResetToken(token);
        boolean isValid = emailService.validatePasswordResetToken(testEmail, token);

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveValidarExpiracaoTokenResetSenha() throws Exception {
        // given
        String token = emailService.generatePasswordResetToken(testEmail);
        
        // Simular expiração modificando timestamp
        var passwordResetTimestamps = ReflectionTestUtils.getField(emailService, "passwordResetTimestamps");
        long expiredTime = System.currentTimeMillis() - (31 * 60 * 1000); // 31 minutos atrás
        ((java.util.Map<String, Long>) passwordResetTimestamps).put(token, expiredTime);

        // when
        boolean isValid = emailService.validatePasswordResetToken(testEmail, token);

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveEnviarEmailResetSenhaComConfiguracaoValida() throws Exception {
        // given - Configurar credenciais válidas para este teste
        ReflectionTestUtils.setField(emailService, "emailUsername", "test@gmail.com");
        ReflectionTestUtils.setField(emailService, "emailPassword", "password123");
        String token = emailService.generatePasswordResetToken(testEmail);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // when
        emailService.sendPasswordResetEmail(testEmail, token);

        // then
        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void deveSimularEnvioResetSenhaEmModoDesenvolvimento() {
        // given
        ReflectionTestUtils.setField(emailService, "emailUsername", "");
        ReflectionTestUtils.setField(emailService, "emailPassword", "");
        String token = emailService.generatePasswordResetToken(testEmail);

        // when
        emailService.sendPasswordResetEmail(testEmail, token);

        // then
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void deveLancarExcecaoQuandoEnvioResetFalhar() throws Exception {
        // given - Configurar credenciais válidas para este teste
        ReflectionTestUtils.setField(emailService, "emailUsername", "test@gmail.com");
        ReflectionTestUtils.setField(emailService, "emailPassword", "password123");
        String token = emailService.generatePasswordResetToken(testEmail);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Erro de envio")).when(mailSender).send(any(MimeMessage.class));

        // when/then
        assertThatThrownBy(() -> emailService.sendPasswordResetEmail(testEmail, token))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Falha ao enviar email de reset");
    }

    // Testes de limpeza de tokens expirados
    @Test
    void deveLimparTokensExpirados() throws Exception {
        // given
        String token1 = emailService.generatePasswordResetToken(testEmail);
        String token2 = emailService.generatePasswordResetToken("outro@email.com");
        
        // Simular que token1 expirou
        var passwordResetTimestamps = ReflectionTestUtils.getField(emailService, "passwordResetTimestamps");
        long expiredTime = System.currentTimeMillis() - (31 * 60 * 1000);
        ((java.util.Map<String, Long>) passwordResetTimestamps).put(token1, expiredTime);

        // when - Gerar novo token para triggerar limpeza
        emailService.generatePasswordResetToken("terceiro@email.com");

        // then
        boolean token1Valid = emailService.validatePasswordResetToken(testEmail, token1);
        boolean token2Valid = emailService.validatePasswordResetToken("outro@email.com", token2);
        
        assertThat(token1Valid).isFalse(); // Token expirado deve ser removido
        assertThat(token2Valid).isTrue();  // Token válido deve permanecer
    }

    // Testes das constantes e configurações
    @Test
    void deveDefinirConstantesCorretamente() {
        // given/when - Acessar constantes via reflection
        int codeExpiry = (int) ReflectionTestUtils.getField(emailService, "CODE_EXPIRY_MINUTES");
        int tokenExpiry = (int) ReflectionTestUtils.getField(emailService, "PASSWORD_RESET_TOKEN_EXPIRY_MINUTES");

        // then
        assertThat(codeExpiry).isEqualTo(10);
        assertThat(tokenExpiry).isEqualTo(30);
    }

    // Teste de casos extremos
    @Test
    void deveGerarCodigosDiferentes() {
        // when
        String codigo1 = emailService.generateRecoveryCode(testEmail);
        String codigo2 = emailService.generateRecoveryCode("outro@email.com");

        // then
        assertThat(codigo1).isNotEqualTo(codigo2);
    }

    @Test
    void devePermitirMultiplosTokensResetParaEmailsDiferentes() {
        // when
        String token1 = emailService.generatePasswordResetToken(testEmail);
        String token2 = emailService.generatePasswordResetToken("outro@email.com");

        // then
        assertThat(token1).isNotNull();
        assertThat(token2).isNotNull();
        assertThat(token1).isNotEqualTo(token2);
        
        assertThat(emailService.validatePasswordResetToken(testEmail, token1)).isTrue();
        assertThat(emailService.validatePasswordResetToken("outro@email.com", token2)).isTrue();
    }
} 