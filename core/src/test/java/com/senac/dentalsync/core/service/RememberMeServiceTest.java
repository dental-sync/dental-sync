package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Protetico;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RememberMeServiceTest {

    @Mock
    private ProteticoService proteticoService;

    @InjectMocks
    private RememberMeService rememberMeService;

    private Protetico testUser;
    private final String testEmail = "test@example.com";
    private final int testDurationDays = 30;

    @BeforeEach
    void setUp() {
        testUser = new Protetico();
        testUser.setEmail(testEmail);
        testUser.setRememberMeToken(null);
        testUser.setRememberMeTimestamp(null);
        testUser.setRememberMeDurationDays(null);
    }

    // Testes do método generateRememberMeToken
    @Test
    void deveGerarTokenRememberMeValido() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(proteticoService.save(any(Protetico.class))).thenReturn(testUser);

        // when
        String token = rememberMeService.generateRememberMeToken(testEmail, testDurationDays);

        // then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, times(1)).save(testUser);
        
        // Verificar se os campos foram definidos no usuário
        assertThat(testUser.getRememberMeToken()).isEqualTo(token);
        assertThat(testUser.getRememberMeTimestamp()).isNotNull();
        assertThat(testUser.getRememberMeDurationDays()).isEqualTo(testDurationDays);
    }

    @Test
    void deveRetornarNullQuandoUsuarioNaoEncontrado() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        String token = rememberMeService.generateRememberMeToken(testEmail, testDurationDays);

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
        String token1 = rememberMeService.generateRememberMeToken(testEmail, testDurationDays);
        String token2 = rememberMeService.generateRememberMeToken(testEmail, testDurationDays);

        // then
        assertThat(token1).isNotNull();
        assertThat(token2).isNotNull();
        assertThat(token1).isNotEqualTo(token2);
    }

    // Testes do método validateRememberMeToken
    @Test
    void deveValidarTokenCorretoValido() {
        // given
        String token = "valid-token";
        testUser.setRememberMeToken(token);
        testUser.setRememberMeTimestamp(System.currentTimeMillis());
        testUser.setRememberMeDurationDays(testDurationDays);
        
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, token);

        // then
        assertThat(isValid).isTrue();
        verify(proteticoService, times(1)).findByEmail(testEmail);
    }

    @Test
    void deveInvalidarQuandoUsuarioNaoEncontrado() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, "any-token");

        // then
        assertThat(isValid).isFalse();
        verify(proteticoService, times(1)).findByEmail(testEmail);
    }

    @Test
    void deveInvalidarQuandoTokenNaoDefinido() {
        // given
        testUser.setRememberMeToken(null);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, "any-token");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarQuandoTimestampNaoDefinido() {
        // given
        testUser.setRememberMeToken("valid-token");
        testUser.setRememberMeTimestamp(null);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, "valid-token");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarQuandoDuracaoNaoDefinida() {
        // given
        testUser.setRememberMeToken("valid-token");
        testUser.setRememberMeTimestamp(System.currentTimeMillis());
        testUser.setRememberMeDurationDays(null);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, "valid-token");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarTokenIncorreto() {
        // given
        testUser.setRememberMeToken("correct-token");
        testUser.setRememberMeTimestamp(System.currentTimeMillis());
        testUser.setRememberMeDurationDays(testDurationDays);
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, "wrong-token");

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    void deveInvalidarTokenExpirado() {
        // given
        String token = "valid-token";
        testUser.setRememberMeToken(token);
        testUser.setRememberMeTimestamp(System.currentTimeMillis() - (31L * 24 * 60 * 60 * 1000)); // 31 dias atrás
        testUser.setRememberMeDurationDays(testDurationDays);
        
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, token);

        // then
        assertThat(isValid).isFalse();
        verify(proteticoService, times(1)).save(testUser); // Deve remover token expirado
        
        // Verificar se o token foi removido
        assertThat(testUser.getRememberMeToken()).isNull();
        assertThat(testUser.getRememberMeTimestamp()).isNull();
        assertThat(testUser.getRememberMeDurationDays()).isNull();
    }

    // Testes do método removeRememberMeToken
    @Test
    void deveRemoverTokenRememberMe() {
        // given
        testUser.setRememberMeToken("token-to-remove");
        testUser.setRememberMeTimestamp(System.currentTimeMillis());
        testUser.setRememberMeDurationDays(testDurationDays);
        
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        rememberMeService.removeRememberMeToken(testEmail);

        // then
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, times(1)).save(testUser);
        
        assertThat(testUser.getRememberMeToken()).isNull();
        assertThat(testUser.getRememberMeTimestamp()).isNull();
        assertThat(testUser.getRememberMeDurationDays()).isNull();
    }

    @Test
    void deveIgnorarRemocaoQuandoUsuarioNaoEncontrado() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.empty());

        // when
        rememberMeService.removeRememberMeToken(testEmail);

        // then
        verify(proteticoService, times(1)).findByEmail(testEmail);
        verify(proteticoService, never()).save(any(Protetico.class));
    }

    // Testes do método findUserByValidRememberMeToken
    @Test
    void deveEncontrarUsuarioPorTokenValido() {
        // given
        String token = "valid-token";
        testUser.setRememberMeToken(token);
        testUser.setRememberMeTimestamp(System.currentTimeMillis());
        testUser.setRememberMeDurationDays(testDurationDays);
        
        when(proteticoService.findAll()).thenReturn(Arrays.asList(testUser));
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        Optional<Protetico> foundUser = rememberMeService.findUserByValidRememberMeToken(token);

        // then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo(testEmail);
        verify(proteticoService, times(1)).findAll();
    }

    @Test
    void deveRetornarVazioQuandoTokenNaoEncontrado() {
        // given
        Protetico otherUser = new Protetico();
        otherUser.setEmail("other@example.com");
        otherUser.setRememberMeToken("other-token");
        
        when(proteticoService.findAll()).thenReturn(Arrays.asList(otherUser));

        // when
        Optional<Protetico> foundUser = rememberMeService.findUserByValidRememberMeToken("non-existent-token");

        // then
        assertThat(foundUser).isEmpty();
        verify(proteticoService, times(1)).findAll();
    }

    @Test
    void deveRetornarVazioQuandoUsuarioSemToken() {
        // given
        testUser.setRememberMeToken(null);
        when(proteticoService.findAll()).thenReturn(Arrays.asList(testUser));

        // when
        Optional<Protetico> foundUser = rememberMeService.findUserByValidRememberMeToken("any-token");

        // then
        assertThat(foundUser).isEmpty();
    }

    @Test
    void deveRetornarVazioQuandoTokenExpirado() {
        // given
        String token = "expired-token";
        testUser.setRememberMeToken(token);
        testUser.setRememberMeTimestamp(System.currentTimeMillis() - (31L * 24 * 60 * 60 * 1000)); // 31 dias atrás
        testUser.setRememberMeDurationDays(testDurationDays);
        
        when(proteticoService.findAll()).thenReturn(Arrays.asList(testUser));
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // when
        Optional<Protetico> foundUser = rememberMeService.findUserByValidRememberMeToken(token);

        // then
        assertThat(foundUser).isEmpty();
    }

    // Testes do método cleanExpiredRememberMeTokens
    @Test
    void deveLimparTokensExpirados() {
        // given
        Protetico expiredUser = new Protetico();
        expiredUser.setEmail("expired@example.com");
        expiredUser.setRememberMeToken("expired-token");
        expiredUser.setRememberMeTimestamp(System.currentTimeMillis() - (31L * 24 * 60 * 60 * 1000)); // 31 dias atrás
        expiredUser.setRememberMeDurationDays(testDurationDays);
        
        Protetico validUser = new Protetico();
        validUser.setEmail("valid@example.com");
        validUser.setRememberMeToken("valid-token");
        validUser.setRememberMeTimestamp(System.currentTimeMillis());
        validUser.setRememberMeDurationDays(testDurationDays);
        
        when(proteticoService.findAll()).thenReturn(Arrays.asList(expiredUser, validUser));

        // when
        rememberMeService.cleanExpiredRememberMeTokens();

        // then
        verify(proteticoService, times(1)).findAll();
        verify(proteticoService, times(1)).save(expiredUser); // Apenas o usuário expirado deve ser salvo
        verify(proteticoService, never()).save(validUser);
        
        // Verificar se o token expirado foi removido
        assertThat(expiredUser.getRememberMeToken()).isNull();
        assertThat(expiredUser.getRememberMeTimestamp()).isNull();
        assertThat(expiredUser.getRememberMeDurationDays()).isNull();
        
        // Verificar se o token válido permanece
        assertThat(validUser.getRememberMeToken()).isEqualTo("valid-token");
        assertThat(validUser.getRememberMeTimestamp()).isNotNull();
        assertThat(validUser.getRememberMeDurationDays()).isEqualTo(testDurationDays);
    }

    @Test
    void deveIgnorarUsuariosSemTokensNaLimpeza() {
        // given
        Protetico userWithoutToken = new Protetico();
        userWithoutToken.setEmail("no-token@example.com");
        userWithoutToken.setRememberMeToken(null);
        
        Protetico userWithoutTimestamp = new Protetico();
        userWithoutTimestamp.setEmail("no-timestamp@example.com");
        userWithoutTimestamp.setRememberMeToken("token");
        userWithoutTimestamp.setRememberMeTimestamp(null);
        
        when(proteticoService.findAll()).thenReturn(Arrays.asList(userWithoutToken, userWithoutTimestamp));

        // when
        rememberMeService.cleanExpiredRememberMeTokens();

        // then
        verify(proteticoService, times(1)).findAll();
        verify(proteticoService, never()).save(any(Protetico.class));
    }

    // Teste de integração completo
    @Test
    void deveExecutarFluxoCompletoRememberMe() {
        // given
        when(proteticoService.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(proteticoService.save(any(Protetico.class))).thenReturn(testUser);

        // when - Gerar token
        String token = rememberMeService.generateRememberMeToken(testEmail, testDurationDays);
        
        // when - Validar token
        boolean isValid = rememberMeService.validateRememberMeToken(testEmail, token);
        
        // when - Buscar usuário por token
        when(proteticoService.findAll()).thenReturn(Arrays.asList(testUser));
        Optional<Protetico> foundUser = rememberMeService.findUserByValidRememberMeToken(token);
        
        // when - Remover token
        rememberMeService.removeRememberMeToken(testEmail);

        // then
        assertThat(token).isNotNull();
        assertThat(isValid).isTrue();
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo(testEmail);
        
        // Verificar se foi removido
        assertThat(testUser.getRememberMeToken()).isNull();
        assertThat(testUser.getRememberMeTimestamp()).isNull();
        assertThat(testUser.getRememberMeDurationDays()).isNull();
    }
} 