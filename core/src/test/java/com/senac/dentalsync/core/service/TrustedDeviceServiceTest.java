package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Protetico;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TrustedDeviceServiceTest {

    @Mock
    private ProteticoService proteticoService;

    @InjectMocks
    private TrustedDeviceService trustedDeviceService;

    private Protetico testUser;
    private final String testEmail = "test@example.com";
    private final String testDeviceFingerprint = "device-fingerprint-123";
    private final int testDurationMinutes = 10;

    @BeforeEach
    void setUp() {
        testUser = new Protetico();
        testUser.setEmail(testEmail);
        testUser.setTrustedDeviceFingerprint(null);
        testUser.setTrustedDeviceToken(null);
        testUser.setTrustedDeviceTimestamp(null);
        
        // Configurar duração via reflection
        ReflectionTestUtils.setField(trustedDeviceService, "trustedDeviceDurationMinutes", testDurationMinutes);
    }

    // Testes do método generateTrustedDeviceToken
    @Test
    void deveGerarTokenDispositivoConfiavel() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(proteticoService.save(any(Protetico.class))).thenReturn(testUser);

        // when
        String token = trustedDeviceService.generateTrustedDeviceToken(testEmail, testDeviceFingerprint);

        // then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, times(1)).save(testUser);
        
        // Verificar se os campos foram definidos no usuário
        assertThat(testUser.getTrustedDeviceFingerprint()).isEqualTo(testDeviceFingerprint);
        assertThat(testUser.getTrustedDeviceToken()).isEqualTo(token);
        assertThat(testUser.getTrustedDeviceTimestamp()).isNotNull();
    }

    @Test
    void deveRetornarNullQuandoUsuarioNaoEncontradoParaGeracao() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        String token = trustedDeviceService.generateTrustedDeviceToken(testEmail, testDeviceFingerprint);

        // then
        assertThat(token).isNull();
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, never()).save(any(Protetico.class));
    }

    @Test
    void deveGerarTokensDiferentesParaChamadasDiferentes() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(proteticoService.save(any(Protetico.class))).thenReturn(testUser);

        // when
        String token1 = trustedDeviceService.generateTrustedDeviceToken(testEmail, testDeviceFingerprint);
        String token2 = trustedDeviceService.generateTrustedDeviceToken(testEmail, testDeviceFingerprint);

        // then
        assertThat(token1).isNotNull();
        assertThat(token2).isNotNull();
        assertThat(token1).isNotEqualTo(token2);
    }

    // Testes do método isTrustedDevice
    @Test
    void deveValidarDispositivoConfiavel() {
        // given
        testUser.setTrustedDeviceFingerprint(testDeviceFingerprint);
        testUser.setTrustedDeviceTimestamp(System.currentTimeMillis());
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isTrusted = trustedDeviceService.isTrustedDevice(testEmail, testDeviceFingerprint);

        // then
        assertThat(isTrusted).isTrue();
        verify(proteticoService, times(1)).findByEmail(testEmail);
    }

    @Test
    void deveInvalidarQuandoUsuarioNaoEncontrado() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        boolean isTrusted = trustedDeviceService.isTrustedDevice(testEmail, testDeviceFingerprint);

        // then
        assertThat(isTrusted).isFalse();
        verify(proteticoService, times(1)).findByEmail(testEmail);
    }

    @Test
    void deveInvalidarQuandoFingerprintNaoDefinido() {
        // given
        testUser.setTrustedDeviceFingerprint(null);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isTrusted = trustedDeviceService.isTrustedDevice(testEmail, testDeviceFingerprint);

        // then
        assertThat(isTrusted).isFalse();
    }

    @Test
    void deveInvalidarQuandoTimestampNaoDefinido() {
        // given
        testUser.setTrustedDeviceFingerprint(testDeviceFingerprint);
        testUser.setTrustedDeviceTimestamp(null);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isTrusted = trustedDeviceService.isTrustedDevice(testEmail, testDeviceFingerprint);

        // then
        assertThat(isTrusted).isFalse();
    }

    @Test
    void deveInvalidarQuandoFingerprintNaoCorresponde() {
        // given
        testUser.setTrustedDeviceFingerprint("different-fingerprint");
        testUser.setTrustedDeviceTimestamp(System.currentTimeMillis());
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isTrusted = trustedDeviceService.isTrustedDevice(testEmail, testDeviceFingerprint);

        // then
        assertThat(isTrusted).isFalse();
    }

    @Test
    void deveInvalidarDispositivoExpirado() {
        // given
        testUser.setTrustedDeviceFingerprint(testDeviceFingerprint);
        testUser.setTrustedDeviceTimestamp(System.currentTimeMillis() - (11 * 60 * 1000)); // 11 minutos atrás
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isTrusted = trustedDeviceService.isTrustedDevice(testEmail, testDeviceFingerprint);

        // then
        assertThat(isTrusted).isFalse();
        verify(proteticoService, times(1)).save(testUser); // Deve remover dispositivo expirado
        
        // Verificar se o dispositivo foi removido
        assertThat(testUser.getTrustedDeviceFingerprint()).isNull();
        assertThat(testUser.getTrustedDeviceToken()).isNull();
        assertThat(testUser.getTrustedDeviceTimestamp()).isNull();
    }

    // Testes do método validateTrustedDeviceToken
    @Test
    void deveValidarTokenDispositivoCorreto() {
        // given
        String token = "valid-token";
        testUser.setTrustedDeviceToken(token);
        testUser.setTrustedDeviceFingerprint(testDeviceFingerprint);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = trustedDeviceService.validateTrustedDeviceToken(testEmail, testDeviceFingerprint, token);

        // then
        assertThat(isValid).isTrue();
        verify(proteticoService, times(1)).findByEmail(testEmail);
    }

    @Test
    void deveInvalidarTokenQuandoUsuarioNaoEncontrado() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        boolean isValid = trustedDeviceService.validateTrustedDeviceToken(testEmail, testDeviceFingerprint, "any-token");

        // then
        assertThat(isValid).isFalse();
        verify(proteticoService, times(1)).findByEmail(testEmail);
    }

    @Test
    void deveInvalidarQuandoTokenNaoDefinido() {
        // given
        testUser.setTrustedDeviceToken(null);
        testUser.setTrustedDeviceFingerprint(testDeviceFingerprint);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = trustedDeviceService.validateTrustedDeviceToken(testEmail, testDeviceFingerprint, "any-token");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarQuandoFingerprintTokenNaoDefinido() {
        // given
        testUser.setTrustedDeviceToken("valid-token");
        testUser.setTrustedDeviceFingerprint(null);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = trustedDeviceService.validateTrustedDeviceToken(testEmail, testDeviceFingerprint, "valid-token");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarTokenIncorreto() {
        // given
        testUser.setTrustedDeviceToken("correct-token");
        testUser.setTrustedDeviceFingerprint(testDeviceFingerprint);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = trustedDeviceService.validateTrustedDeviceToken(testEmail, testDeviceFingerprint, "wrong-token");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarFingerprintIncorreto() {
        // given
        String token = "valid-token";
        testUser.setTrustedDeviceToken(token);
        testUser.setTrustedDeviceFingerprint("different-fingerprint");
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = trustedDeviceService.validateTrustedDeviceToken(testEmail, testDeviceFingerprint, token);

        // then
        assertThat(isValid).isFalse();
    }

    // Testes do método removeTrustedDevice
    @Test
    void deveRemoverDispositivoConfiavel() {
        // given
        testUser.setTrustedDeviceFingerprint("fingerprint-to-remove");
        testUser.setTrustedDeviceToken("token-to-remove");
        testUser.setTrustedDeviceTimestamp(System.currentTimeMillis());
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        trustedDeviceService.removeTrustedDevice(testEmail);

        // then
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, times(1)).save(testUser);
        
        assertThat(testUser.getTrustedDeviceFingerprint()).isNull();
        assertThat(testUser.getTrustedDeviceToken()).isNull();
        assertThat(testUser.getTrustedDeviceTimestamp()).isNull();
    }

    @Test
    void deveIgnorarRemocaoQuandoUsuarioNaoEncontrado() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        trustedDeviceService.removeTrustedDevice(testEmail);

        // then
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, never()).save(any(Protetico.class));
    }

    // Testes do método removeAllTrustedDevicesForUser
    @Test
    void deveRemoverTodosDispositivosDoUsuario() {
        // given
        testUser.setTrustedDeviceFingerprint("fingerprint");
        testUser.setTrustedDeviceToken("token");
        testUser.setTrustedDeviceTimestamp(System.currentTimeMillis());
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        trustedDeviceService.removeAllTrustedDevicesForUser(testEmail);

        // then
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, times(1)).save(testUser);
        
        assertThat(testUser.getTrustedDeviceFingerprint()).isNull();
        assertThat(testUser.getTrustedDeviceToken()).isNull();
        assertThat(testUser.getTrustedDeviceTimestamp()).isNull();
    }

    // Testes do método getTrustedDevicesInfo
    @Test
    void deveRetornarInformacoesQuandoNaoHaDispositivos() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        Map<String, Object> info = trustedDeviceService.getTrustedDevicesInfo(testEmail);

        // then
        assertThat(info.get("count")).isEqualTo(0);
        assertThat(info.get("oldestDeviceAge")).isEqualTo(0);
        assertThat(info.get("maxDurationMinutes")).isEqualTo(testDurationMinutes);
    }

    @Test
    void deveRetornarInformacoesQuandoUsuarioSemDispositivo() {
        // given
        testUser.setTrustedDeviceTimestamp(null);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        Map<String, Object> info = trustedDeviceService.getTrustedDevicesInfo(testEmail);

        // then
        assertThat(info.get("count")).isEqualTo(0);
        assertThat(info.get("oldestDeviceAge")).isEqualTo(0);
        assertThat(info.get("maxDurationMinutes")).isEqualTo(testDurationMinutes);
        assertThat(info.get("isExpired")).isEqualTo(false);
    }

    @Test
    void deveRetornarInformacoesComDispositivoValido() {
        // given
        long timestamp = System.currentTimeMillis() - (5 * 60 * 1000); // 5 minutos atrás
        testUser.setTrustedDeviceTimestamp(timestamp);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        Map<String, Object> info = trustedDeviceService.getTrustedDevicesInfo(testEmail);

        // then
        assertThat(info.get("count")).isEqualTo(1);
        assertThat((Long) info.get("oldestDeviceAge")).isGreaterThanOrEqualTo(5L);
        assertThat(info.get("maxDurationMinutes")).isEqualTo(testDurationMinutes);
        assertThat(info.get("isExpired")).isEqualTo(false);
    }

    @Test
    void deveRetornarInformacoesComDispositivoExpirado() {
        // given
        long timestamp = System.currentTimeMillis() - (11 * 60 * 1000); // 11 minutos atrás
        testUser.setTrustedDeviceTimestamp(timestamp);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        Map<String, Object> info = trustedDeviceService.getTrustedDevicesInfo(testEmail);

        // then
        assertThat(info.get("count")).isEqualTo(1);
        assertThat((Long) info.get("oldestDeviceAge")).isGreaterThanOrEqualTo(11L);
        assertThat(info.get("maxDurationMinutes")).isEqualTo(testDurationMinutes);
        assertThat(info.get("isExpired")).isEqualTo(true);
    }

    // Testes do método cleanExpiredDevicesForAllUsers
    @Test
    void deveLimparDispositivosExpirados() {
        // given
        Protetico expiredUser = new Protetico();
        expiredUser.setEmail("expired@example.com");
        expiredUser.setTrustedDeviceFingerprint("expired-fingerprint");
        expiredUser.setTrustedDeviceToken("expired-token");
        expiredUser.setTrustedDeviceTimestamp(System.currentTimeMillis() - (11 * 60 * 1000)); // 11 minutos atrás
        
        Protetico validUser = new Protetico();
        validUser.setEmail("valid@example.com");
        validUser.setTrustedDeviceFingerprint("valid-fingerprint");
        validUser.setTrustedDeviceToken("valid-token");
        validUser.setTrustedDeviceTimestamp(System.currentTimeMillis());
        
        when(proteticoService.findAll()).thenReturn(Arrays.asList(expiredUser, validUser));

        // when
        trustedDeviceService.cleanExpiredDevicesForAllUsers();

        // then
        verify(proteticoService, times(1)).findAll();
        verify(proteticoService, times(1)).save(expiredUser); // Apenas o usuário expirado deve ser salvo
        verify(proteticoService, never()).save(validUser);
        
        // Verificar se o dispositivo expirado foi removido
        assertThat(expiredUser.getTrustedDeviceFingerprint()).isNull();
        assertThat(expiredUser.getTrustedDeviceToken()).isNull();
        assertThat(expiredUser.getTrustedDeviceTimestamp()).isNull();
        
        // Verificar se o dispositivo válido permanece
        assertThat(validUser.getTrustedDeviceFingerprint()).isEqualTo("valid-fingerprint");
        assertThat(validUser.getTrustedDeviceToken()).isEqualTo("valid-token");
        assertThat(validUser.getTrustedDeviceTimestamp()).isNotNull();
    }

    @Test
    void deveIgnorarUsuariosSemDispositivosNaLimpeza() {
        // given
        Protetico userWithoutDevice = new Protetico();
        userWithoutDevice.setEmail("no-device@example.com");
        userWithoutDevice.setTrustedDeviceTimestamp(null);
        
        when(proteticoService.findAll()).thenReturn(Arrays.asList(userWithoutDevice));

        // when
        trustedDeviceService.cleanExpiredDevicesForAllUsers();

        // then
        verify(proteticoService, times(1)).findAll();
        verify(proteticoService, never()).save(any(Protetico.class));
    }

    // Testes do método generateDeviceFingerprint
    @Test
    void deveGerarFingerprintDispositivo() {
        // given
        String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
        String ipAddress = "192.168.1.100";
        String additionalInfo = "extra-info";

        // when
        String fingerprint = trustedDeviceService.generateDeviceFingerprint(userAgent, ipAddress, additionalInfo);

        // then
        assertThat(fingerprint).isNotNull();
        assertThat(fingerprint).isNotEmpty();
    }

    @Test
    void deveGerarFingerprintComParametrosNull() {
        // when
        String fingerprint = trustedDeviceService.generateDeviceFingerprint(null, null, null);

        // then
        assertThat(fingerprint).isNotNull();
        assertThat(fingerprint).isNotEmpty();
    }

    @Test
    void deveGerarFingerprintsDiferentesParaParametrosDiferentes() {
        // when
        String fingerprint1 = trustedDeviceService.generateDeviceFingerprint("agent1", "ip1", "info1");
        String fingerprint2 = trustedDeviceService.generateDeviceFingerprint("agent2", "ip2", "info2");

        // then
        assertThat(fingerprint1).isNotEqualTo(fingerprint2);
    }

    @Test
    void deveGerarFingerprintConsistenteParaMesmosParametros() {
        // given
        String userAgent = "consistent-agent";
        String ipAddress = "192.168.1.1";
        String additionalInfo = "consistent-info";

        // when
        String fingerprint1 = trustedDeviceService.generateDeviceFingerprint(userAgent, ipAddress, additionalInfo);
        String fingerprint2 = trustedDeviceService.generateDeviceFingerprint(userAgent, ipAddress, additionalInfo);

        // then
        assertThat(fingerprint1).isEqualTo(fingerprint2);
    }

    // Teste de integração completo
    @Test
    void deveExecutarFluxoCompletoDispositivoConfiavel() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(proteticoService.save(any(Protetico.class))).thenReturn(testUser);

        // when - Gerar token
        String token = trustedDeviceService.generateTrustedDeviceToken(testEmail, testDeviceFingerprint);
        
        // when - Validar dispositivo
        boolean isTrusted = trustedDeviceService.isTrustedDevice(testEmail, testDeviceFingerprint);
        
        // when - Validar token
        boolean tokenValid = trustedDeviceService.validateTrustedDeviceToken(testEmail, testDeviceFingerprint, token);
        
        // when - Obter informações
        Map<String, Object> info = trustedDeviceService.getTrustedDevicesInfo(testEmail);
        
        // when - Remover dispositivo
        trustedDeviceService.removeTrustedDevice(testEmail);

        // then
        assertThat(token).isNotNull();
        assertThat(isTrusted).isTrue();
        assertThat(tokenValid).isTrue();
        assertThat(info.get("count")).isEqualTo(1);
        
        // Verificar se foi removido
        assertThat(testUser.getTrustedDeviceFingerprint()).isNull();
        assertThat(testUser.getTrustedDeviceToken()).isNull();
        assertThat(testUser.getTrustedDeviceTimestamp()).isNull();
    }
} 