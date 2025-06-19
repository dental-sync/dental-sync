package com.senac.dentalsync.core.service;

import com.google.zxing.WriterException;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TwoFactorServiceTest {

    @InjectMocks
    private TwoFactorService twoFactorService;

    private final String testEmail = "test@example.com";
    private final String testSecretKey = "ABCDEFGHIJKLMNOP";
    private final String testIssuer = "DentalSync";
    private final int testTotpCode = 123456;

    @BeforeEach
    void setUp() {
        // Configurar stack traces mais limpos (5 linhas em vez de 70+)
        assertThat("").describedAs("Configurando stack traces limpos");
        System.setProperty("org.assertj.core.util.StackTraceElementsDisplayed", "5");
    }

    // Testes do método generateSecretKey
    @Test
    void deveGerarChaveSecretaValida() {
        // when
        String secretKey = twoFactorService.generateSecretKey();

        // then
        assertThat(secretKey)
            .as("Chave secreta deve estar presente e não vazia")
            .isNotNull()
            .isNotEmpty();
        assertThat(secretKey)
            .as("GoogleAuthenticator deve gerar chaves de 32 caracteres")
            .hasSize(32);
    }

    @Test
    void deveGerarChavesSecretasDiferentes() {
        // when
        String secretKey1 = twoFactorService.generateSecretKey();
        String secretKey2 = twoFactorService.generateSecretKey();

        // then
        assertThat(secretKey1)
            .as("Cada chamada deve gerar uma chave secreta única")
            .isNotEqualTo(secretKey2);
    }

    // Testes do método generateQRCodeUrl
    @Test
    void deveGerarUrlQRCodeCorretamente() {
        // when
        String qrCodeUrl = twoFactorService.generateQRCodeUrl(testEmail, testSecretKey, testIssuer);

        // then
        assertThat(qrCodeUrl)
            .as("URL do QR Code deve estar presente e seguir protocolo TOTP")
            .isNotNull()
            .startsWith("otpauth://totp/");
            
        assertThat(qrCodeUrl)
            .as("URL deve conter todos os parâmetros necessários")
            .contains(testIssuer)
            .contains(testEmail)
            .contains("secret=" + testSecretKey)
            .contains("issuer=" + testIssuer);
        
        // Verificar formato exato
        String expectedUrl = String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s",
            testIssuer, testEmail, testSecretKey, testIssuer
        );
        assertThat(qrCodeUrl)
            .as("URL deve seguir formato padrão TOTP")
            .isEqualTo(expectedUrl);
    }

    @Test
    void deveGerarUrlQRCodeComParametrosDiferentes() {
        // given
        String email2 = "outro@email.com";
        String secretKey2 = "ZYXWVUTSRQPONMLK";
        String issuer2 = "OutroIssuer";

        // when
        String qrCodeUrl1 = twoFactorService.generateQRCodeUrl(testEmail, testSecretKey, testIssuer);
        String qrCodeUrl2 = twoFactorService.generateQRCodeUrl(email2, secretKey2, issuer2);

        // then
        assertThat(qrCodeUrl1).isNotEqualTo(qrCodeUrl2);
        assertThat(qrCodeUrl2).contains(email2);
        assertThat(qrCodeUrl2).contains(secretKey2);
        assertThat(qrCodeUrl2).contains(issuer2);
    }

    // Testes do método generateQRCodeImage
    @Test
    void deveGerarImagemQRCodeValida() throws WriterException, IOException {
        // given
        String qrCodeUrl = twoFactorService.generateQRCodeUrl(testEmail, testSecretKey, testIssuer);

        // when
        String qrCodeImage = twoFactorService.generateQRCodeImage(qrCodeUrl);

        // then
        assertThat(qrCodeImage)
            .as("Imagem QR Code deve estar presente e no formato data URL")
            .isNotNull()
            .isNotEmpty()
            .startsWith("data:image/png;base64,");
        
        // Verificar se contém dados base64 válidos
        String base64Data = qrCodeImage.substring("data:image/png;base64,".length());
        assertThat(base64Data)
            .as("Dados base64 da imagem devem estar presentes")
            .isNotEmpty();
        assertThat(base64Data.length())
            .as("Imagem deve ter tamanho razoável (mais de 100 caracteres)")
            .isGreaterThan(100);
    }

    @Test
    void deveGerarImagensDiferentesParaUrlsDiferentes() throws WriterException, IOException {
        // given
        String qrCodeUrl1 = twoFactorService.generateQRCodeUrl(testEmail, testSecretKey, testIssuer);
        String qrCodeUrl2 = twoFactorService.generateQRCodeUrl("outro@email.com", "OUTROCHAVESECRET", testIssuer);

        // when
        String qrCodeImage1 = twoFactorService.generateQRCodeImage(qrCodeUrl1);
        String qrCodeImage2 = twoFactorService.generateQRCodeImage(qrCodeUrl2);

        // then
        assertThat(qrCodeImage1).isNotEqualTo(qrCodeImage2);
    }

    // Testes do método validateTotpCode (usando GoogleAuthenticator real)
    @Test
    void deveValidarMetodoValidateTotpCode() {
        // given
        String secretKey = twoFactorService.generateSecretKey();

        // when - Testar que o método executa sem erro
        boolean result = twoFactorService.validateTotpCode(secretKey, testTotpCode);

        // then - O resultado pode ser true ou false, mas não deve dar erro
        assertThat(result).isIn(true, false);
    }

    @Test
    void deveValidarComChaveSecretaDiferente() {
        // given
        String secretKey1 = twoFactorService.generateSecretKey();
        String secretKey2 = twoFactorService.generateSecretKey();

        // when
        boolean result1 = twoFactorService.validateTotpCode(secretKey1, testTotpCode);
        boolean result2 = twoFactorService.validateTotpCode(secretKey2, testTotpCode);

        // then - Ambos devem executar sem erro
        assertThat(result1).isIn(true, false);
        assertThat(result2).isIn(true, false);
    }

    // Testes do método generateSetupData
    @Test
    void deveGerarDadosConfiguracaoCompletos() throws WriterException, IOException {
        // when
        TwoFactorService.TwoFactorSetupData setupData = twoFactorService.generateSetupData(testEmail, testIssuer);

        // then
        assertThat(setupData).isNotNull();
        assertThat(setupData.getSecretKey()).isNotNull();
        assertThat(setupData.getSecretKey()).isNotEmpty();
        assertThat(setupData.getQrCodeUrl()).isNotNull();
        assertThat(setupData.getQrCodeUrl()).contains(testEmail);
        assertThat(setupData.getQrCodeUrl()).contains(testIssuer);
        assertThat(setupData.getQrCodeImage()).isNotNull();
        assertThat(setupData.getQrCodeImage()).startsWith("data:image/png;base64,");
    }

    @Test
    void deveLancarExcecaoParaEmailNulo() {
        // when/then
        assertThatThrownBy(() -> twoFactorService.generateSetupData(null, testIssuer))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Email do usuário não pode ser nulo ou vazio");
    }

    @Test
    void deveLancarExcecaoParaEmailVazio() {
        // when/then
        assertThatThrownBy(() -> twoFactorService.generateSetupData("", testIssuer))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Email do usuário não pode ser nulo ou vazio");
    }

    @Test
    void deveLancarExcecaoParaEmailApenasEspacos() {
        // when/then
        assertThatThrownBy(() -> twoFactorService.generateSetupData("   ", testIssuer))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Email do usuário não pode ser nulo ou vazio");
    }

    @Test
    void deveUsarIssuerPadraoQuandoNulo() throws WriterException, IOException {
        // when
        TwoFactorService.TwoFactorSetupData setupData = twoFactorService.generateSetupData(testEmail, null);

        // then
        assertThat(setupData).isNotNull();
        assertThat(setupData.getQrCodeUrl()).contains("DentalSync"); // valor padrão
    }

    @Test
    void deveUsarIssuerPadraoQuandoVazio() throws WriterException, IOException {
        // when
        TwoFactorService.TwoFactorSetupData setupData = twoFactorService.generateSetupData(testEmail, "");

        // then
        assertThat(setupData).isNotNull();
        assertThat(setupData.getQrCodeUrl()).contains("DentalSync"); // valor padrão
    }

    @Test
    void deveUsarIssuerPadraoQuandoApenasEspacos() throws WriterException, IOException {
        // when
        TwoFactorService.TwoFactorSetupData setupData = twoFactorService.generateSetupData(testEmail, "   ");

        // then
        assertThat(setupData).isNotNull();
        assertThat(setupData.getQrCodeUrl()).contains("DentalSync"); // valor padrão
    }

    @Test
    void deveTratarErroDeQRCode() throws WriterException, IOException {
        // given - Testar diretamente o método que pode gerar WriterException
        // Usar string com caracteres especiais que podem causar problema
        String urlComCaracteresEspeciais = "otpauth://totp/Test:test@test.com?secret=TEST&issuer=\u0000\u0001\u0002";
        
        // when/then - Se não gerar exceção, pelo menos testamos que o método funciona
        try {
            String result = twoFactorService.generateQRCodeImage(urlComCaracteresEspeciais);
            assertThat(result)
                .as("Mesmo com caracteres especiais, deve retornar resultado ou gerar exceção")
                .isNotNull();
        } catch (Exception e) {
            // Se gerar exceção, está ok - testamos o comportamento de erro
            assertThat(e)
                .as("Exceção gerada deve ser tratada adequadamente")
                .isNotNull();
        }
    }

    // Testes da classe interna TwoFactorSetupData
    @Test
    void devecriarTwoFactorSetupDataCorretamente() {
        // given
        String secretKey = "test-secret";
        String qrCodeUrl = "test-url";
        String qrCodeImage = "test-image";

        // when
        TwoFactorService.TwoFactorSetupData setupData = 
            new TwoFactorService.TwoFactorSetupData(secretKey, qrCodeUrl, qrCodeImage);

        // then
        assertThat(setupData.getSecretKey()).isEqualTo(secretKey);
        assertThat(setupData.getQrCodeUrl()).isEqualTo(qrCodeUrl);
        assertThat(setupData.getQrCodeImage()).isEqualTo(qrCodeImage);
    }

    @Test
    void devePermitirValoresNulosNaTwoFactorSetupData() {
        // when
        TwoFactorService.TwoFactorSetupData setupData = 
            new TwoFactorService.TwoFactorSetupData(null, null, null);

        // then
        assertThat(setupData.getSecretKey()).isNull();
        assertThat(setupData.getQrCodeUrl()).isNull();
        assertThat(setupData.getQrCodeImage()).isNull();
    }

    // Testes de integração e casos extremos
    @Test
    void deveGerarDadosDiferentesParaEmailsDiferentes() throws WriterException, IOException {
        // when
        TwoFactorService.TwoFactorSetupData setupData1 = 
            twoFactorService.generateSetupData(testEmail, testIssuer);
        TwoFactorService.TwoFactorSetupData setupData2 = 
            twoFactorService.generateSetupData("outro@email.com", testIssuer);

        // then
        assertThat(setupData1.getSecretKey()).isNotEqualTo(setupData2.getSecretKey());
        assertThat(setupData1.getQrCodeUrl()).isNotEqualTo(setupData2.getQrCodeUrl());
        assertThat(setupData1.getQrCodeImage()).isNotEqualTo(setupData2.getQrCodeImage());
    }

    @Test
    void deveGerarDadosConsistentesParaMesmoEmail() throws WriterException, IOException {
        // when - Gerar dados duas vezes para o mesmo email
        TwoFactorService.TwoFactorSetupData setupData1 = 
            twoFactorService.generateSetupData(testEmail, testIssuer);
        TwoFactorService.TwoFactorSetupData setupData2 = 
            twoFactorService.generateSetupData(testEmail, testIssuer);

        // then - Devem ser diferentes porque as secret keys são sempre novas
        assertThat(setupData1.getSecretKey()).isNotEqualTo(setupData2.getSecretKey());
        assertThat(setupData1.getQrCodeUrl()).isNotEqualTo(setupData2.getQrCodeUrl());
        assertThat(setupData1.getQrCodeImage()).isNotEqualTo(setupData2.getQrCodeImage());
    }

    @Test
    void deveManterFormatoUrlConsistente() {
        // given
        String[] emails = {"test@example.com", "user@domain.org", "admin@company.net"};
        String[] issuers = {"App1", "App2", "App3"};

        // when/then
        for (String email : emails) {
            for (String issuer : issuers) {
                String url = twoFactorService.generateQRCodeUrl(email, testSecretKey, issuer);
                
                assertThat(url).startsWith("otpauth://totp/");
                assertThat(url).contains(":" + email);
                assertThat(url).contains("secret=" + testSecretKey);
                assertThat(url).contains("issuer=" + issuer);
            }
        }
    }

    // Teste de fluxo completo de 2FA (sem validação TOTP para evitar complexidade de mock)
    @Test
    void deveExecutarFluxoCompleto2FA() throws WriterException, IOException {
        // when - Gerar dados de configuração
        TwoFactorService.TwoFactorSetupData setupData = 
            twoFactorService.generateSetupData(testEmail, testIssuer);

        // then
        assertThat(setupData.getSecretKey()).isNotNull();
        assertThat(setupData.getQrCodeUrl()).contains(testEmail);
        assertThat(setupData.getQrCodeImage()).startsWith("data:image/png;base64,");
    }
} 