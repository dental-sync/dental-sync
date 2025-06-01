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
        return GoogleAuthenticatorQRGenerator.getOtpAuthURL(
            issuer,
            userEmail,
            gAuth.createCredentials(secretKey)
        );
    }

    /**
     * Gera o QR Code como imagem base64
     */
    public String generateQRCodeImage(String qrCodeUrl) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeUrl, BarcodeFormat.QR_CODE, 200, 200);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
        
        return Base64.getEncoder().encodeToString(baos.toByteArray());
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
            String secretKey = generateSecretKey();
            String qrCodeUrl = generateQRCodeUrl(userEmail, secretKey, issuer);
            String qrCodeImage = generateQRCodeImage(qrCodeUrl);
            
            return new TwoFactorSetupData(secretKey, qrCodeUrl, qrCodeImage);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar dados de configuração 2FA", e);
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