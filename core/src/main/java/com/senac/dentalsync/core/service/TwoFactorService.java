package com.senac.dentalsync.core.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class TwoFactorService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    /**
     * Gera uma nova chave secreta para 2FA
     */
    public String generateSecretKey() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    /**
     * Gera a URL para o QR Code do Google Authenticator
     */
    public String generateQRCodeUrl(String userEmail, String secretKey, String issuer) {
        // Gerando URL TOTP manualmente no formato correto para Google Authenticator
        // Formato: otpauth://totp/Issuer:user@email.com?secret=SECRET&issuer=Issuer
        return String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s",
            issuer,
            userEmail,
            secretKey,
            issuer
        );
    }

    /**
     * Gera o QR Code como imagem base64
     */
    public String generateQRCodeImage(String qrCodeUrl) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        // Configurações melhoradas para melhor compatibilidade
        BitMatrix bitMatrix = qrCodeWriter.encode(
            qrCodeUrl, 
            BarcodeFormat.QR_CODE, 
            300, // largura aumentada
            300  // altura aumentada
        );

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
        
        String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
        
        // Retornar no formato data URL para uso direto no frontend
        return "data:image/png;base64," + base64Image;
    }

    /**
     * Valida o código TOTP fornecido pelo usuário
     */
    public boolean validateTotpCode(String secretKey, int totpCode) {
        return gAuth.authorize(secretKey, totpCode);
    }

    /**
     * Gera dados completos para configuração do 2FA
     */
    public TwoFactorSetupData generateSetupData(String userEmail, String issuer) {
        try {
            // Validações para evitar erros
            if (userEmail == null || userEmail.trim().isEmpty()) {
                throw new IllegalArgumentException("Email do usuário não pode ser nulo ou vazio");
            }
            if (issuer == null || issuer.trim().isEmpty()) {
                issuer = "DentalSync"; // valor padrão
            }
            
            System.out.println("Gerando setup 2FA para: " + userEmail + " com issuer: " + issuer);
            
            String secretKey = generateSecretKey();
            System.out.println("Secret key gerada: " + secretKey);
            
            String qrCodeUrl = generateQRCodeUrl(userEmail, secretKey, issuer);
            System.out.println("QR Code URL gerada: " + qrCodeUrl);
            
            String qrCodeImage = generateQRCodeImage(qrCodeUrl);
            System.out.println("QR Code Image gerada com sucesso");
            
            return new TwoFactorSetupData(secretKey, qrCodeUrl, qrCodeImage);
        } catch (Exception e) {
            System.err.println("Erro ao gerar dados de configuração 2FA: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar dados de configuração 2FA: " + e.getMessage(), e);
        }
    }

    /**
     * Classe para retornar dados de configuração do 2FA
     */
    public static class TwoFactorSetupData {
        private final String secretKey;
        private final String qrCodeUrl;
        private final String qrCodeImage;

        public TwoFactorSetupData(String secretKey, String qrCodeUrl, String qrCodeImage) {
            this.secretKey = secretKey;
            this.qrCodeUrl = qrCodeUrl;
            this.qrCodeImage = qrCodeImage;
        }

        public String getSecretKey() {
            return secretKey;
        }

        public String getQrCodeUrl() {
            return qrCodeUrl;
        }

        public String getQrCodeImage() {
            return qrCodeImage;
        }
    }
} 