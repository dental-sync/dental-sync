package com.senac.dentalsync.core.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${dentalsync.mail.from:noreply@dentalsync.com}")
    private String fromEmail;
    
    @Value("${dentalsync.mail.fromName:DentalSync Security}")
    private String fromName;
    
    @Value("${spring.mail.username:}")
    private String emailUsername;
    
    @Value("${spring.mail.password:}")
    private String emailPassword;
    
    @Value("${dentalsync.frontend.url}")
    private String frontendUrl;
    
    @Value("${dentalsync.frontend.reset-password-path}")
    private String resetPasswordPath;
    
    // Armazenamento temporário dos códigos (em produção usar Redis ou banco)
    private Map<String, String> tempCodes = new HashMap<>();
    private Map<String, Long> codeTimestamps = new HashMap<>();
    
    // Armazenamento temporário dos tokens de reset de senha
    private Map<String, String> passwordResetTokens = new HashMap<>(); // token -> email
    private Map<String, Long> passwordResetTimestamps = new HashMap<>(); // token -> timestamp
    
    private static final int CODE_EXPIRY_MINUTES = 10;
    private static final int PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 30;
    
    /**
     * Gera um código de 6 dígitos para recuperação de 2FA e envia por email
     */
    public String generateRecoveryCode(String email) {
        Random random = new Random();
        String code = String.format("%06d", random.nextInt(1000000));
        
        // Armazenar código temporariamente
        tempCodes.put(email, code);
        codeTimestamps.put(email, System.currentTimeMillis());
        
        System.out.println("=== ENVIANDO CÓDIGO DE RECUPERAÇÃO 2FA ===");
        System.out.println("Email: " + email);
        System.out.println("Código: " + code);
        System.out.println("Válido por " + CODE_EXPIRY_MINUTES + " minutos");
        System.out.println("===============================");
        
        // Enviar email real
        sendRecoveryEmail(email, code);
        
        return code;
    }
    
    /**
     * Valida o código de recuperação
     */
    public boolean validateRecoveryCode(String email, String code) {
        String storedCode = tempCodes.get(email);
        Long timestamp = codeTimestamps.get(email);
        
        if (storedCode == null || timestamp == null) {
            System.out.println("Código não encontrado para: " + email);
            return false;
        }
        
        // Verificar se o código expirou
        long currentTime = System.currentTimeMillis();
        long elapsedMinutes = (currentTime - timestamp) / (1000 * 60);
        
        if (elapsedMinutes > CODE_EXPIRY_MINUTES) {
            System.out.println("Código expirado para: " + email);
            tempCodes.remove(email);
            codeTimestamps.remove(email);
            return false;
        }
        
        // Verificar se o código está correto
        boolean isValid = storedCode.equals(code);
        
        if (isValid) {
            // Remover código após uso
            tempCodes.remove(email);
            codeTimestamps.remove(email);
            System.out.println("Código válido usado para: " + email);
        } else {
            System.out.println("Código inválido para: " + email);
        }
        
        return isValid;
    }
    
    /**
     * Envia email real com código de recuperação
     */
    private void sendRecoveryEmail(String toEmail, String code) {
        try {
            // Verificar se as credenciais de email estão configuradas
            if (emailUsername == null || emailUsername.trim().isEmpty() || 
                emailPassword == null || emailPassword.trim().isEmpty()) {
                
                // Modo de desenvolvimento - simular envio
                System.out.println("🔧 MODO DESENVOLVIMENTO - Simulando envio de email");
                System.out.println("📧 Para: " + toEmail);
                System.out.println("📋 Código: " + code);
                System.out.println("💡 Configure EMAIL_USERNAME e EMAIL_PASSWORD para envio real");
                System.out.println("✅ Email 'enviado' com sucesso (simulado)");
                return;
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Configurar remetente
            helper.setFrom(fromEmail, fromName);
            
            // Configurar destinatário
            helper.setTo(toEmail);
            
            // Configurar assunto
            helper.setSubject("🔐 Código de Recuperação - DentalSync");
            
            // Criar conteúdo HTML do email
            String htmlContent = createRecoveryEmailHtml(code);
            helper.setText(htmlContent, true);
            
            // Enviar email
            mailSender.send(message);
            
            System.out.println("✅ Email de recuperação enviado com sucesso para: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ ERRO ao enviar email para: " + toEmail);
            System.err.println("Erro: " + e.getMessage());
            e.printStackTrace();
            
            // Em desenvolvimento, continuar mesmo com erro de email
            if (emailUsername == null || emailUsername.trim().isEmpty()) {
                System.out.println("⚠️ Continuando em modo desenvolvimento...");
                return;
            }
            
            // Re-lançar exceção para que o erro seja tratado no controller
            throw new RuntimeException("Falha ao enviar email de recuperação: " + e.getMessage(), e);
        }
    }
    
    /**
     * Cria o conteúdo HTML do email de recuperação
     */
    private String createRecoveryEmailHtml(String code) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"pt-BR\">");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<title>Código de Recuperação DentalSync</title>");
        html.append("<style>");
        html.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }");
        html.append(".container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { text-align: center; margin-bottom: 30px; }");
        html.append(".logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }");
        html.append(".title { color: #1e293b; margin-bottom: 20px; }");
        html.append(".code-container { background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }");
        html.append(".code { font-size: 32px; font-weight: bold; color: #dc2626; font-family: 'Courier New', monospace; letter-spacing: 8px; margin: 10px 0; }");
        html.append(".warning { background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 6px; padding: 15px; margin: 20px 0; color: #92400e; }");
        html.append(".footer { font-size: 14px; color: #64748b; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<div class=\"logo\">🦷 DentalSync</div>");
        html.append("<h1 class=\"title\">Código de Recuperação de Acesso</h1>");
        html.append("</div>");
        
        html.append("<p>Olá,</p>");
        html.append("<p>Você solicitou um código de recuperação para desativar a verificação em duas etapas (2FA) da sua conta DentalSync.</p>");
        
        html.append("<div class=\"code-container\">");
        html.append("<p><strong>Seu código de recuperação é:</strong></p>");
        html.append("<div class=\"code\">").append(code).append("</div>");
        html.append("<p><small>Digite este código na tela de recuperação</small></p>");
        html.append("</div>");
        
        html.append("<div class=\"warning\">");
        html.append("<p><strong>⚠️ Importante:</strong></p>");
        html.append("<ul>");
        html.append("<li>Este código é válido por <strong>").append(CODE_EXPIRY_MINUTES).append(" minutos</strong></li>");
        html.append("<li>Usar este código irá <strong>desativar completamente</strong> o 2FA da sua conta</li>");
        html.append("<li>Você poderá configurar o 2FA novamente depois do login</li>");
        html.append("<li>Se você não solicitou este código, ignore este email</li>");
        html.append("</ul>");
        html.append("</div>");
        
        html.append("<p>Se você está tendo problemas para acessar sua conta, entre em contato com nosso suporte.</p>");
        
        html.append("<div class=\"footer\">");
        html.append("<p>Este é um email automático, não responda a esta mensagem.</p>");
        html.append("<p>© 2024 DentalSync - Sistema de Gestão Odontológica</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    // ===== MÉTODOS PARA RESET DE SENHA =====
    
    /**
     * Gera um token único para reset de senha
     */
    public String generatePasswordResetToken(String email) {
        // Gerar token único usando UUID + timestamp
        String token = java.util.UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
        
        // Armazenar token temporariamente
        passwordResetTokens.put(token, email);
        passwordResetTimestamps.put(token, System.currentTimeMillis());
        
        // Limpar tokens expirados
        cleanExpiredPasswordResetTokens();
        
        System.out.println("=== TOKEN DE RESET DE SENHA GERADO ===");
        System.out.println("Email: " + email);
        System.out.println("Token: " + token);
        System.out.println("Válido por " + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES + " minutos");
        System.out.println("===============================");
        
        return token;
    }
    
    /**
     * Valida token de reset de senha
     */
    public boolean validatePasswordResetToken(String email, String token) {
        String storedEmail = passwordResetTokens.get(token);
        Long timestamp = passwordResetTimestamps.get(token);
        
        if (storedEmail == null || timestamp == null) {
            System.out.println("Token de reset não encontrado: " + token);
            return false;
        }
        
        if (!storedEmail.equals(email)) {
            System.out.println("Email não corresponde ao token: " + email);
            return false;
        }
        
        // Verificar se o token expirou
        long currentTime = System.currentTimeMillis();
        long elapsedMinutes = (currentTime - timestamp) / (1000 * 60);
        
        if (elapsedMinutes > PASSWORD_RESET_TOKEN_EXPIRY_MINUTES) {
            System.out.println("Token de reset expirado: " + token);
            passwordResetTokens.remove(token);
            passwordResetTimestamps.remove(token);
            return false;
        }
        
        System.out.println("Token de reset válido para: " + email);
        return true;
    }
    
    /**
     * Valida token e retorna o email associado
     */
    public String validatePasswordResetTokenAndGetEmail(String token) {
        String email = passwordResetTokens.get(token);
        Long timestamp = passwordResetTimestamps.get(token);
        
        if (email == null || timestamp == null) {
            System.out.println("Token de reset não encontrado: " + token);
            return null;
        }
        
        // Verificar se o token expirou
        long currentTime = System.currentTimeMillis();
        long elapsedMinutes = (currentTime - timestamp) / (1000 * 60);
        
        if (elapsedMinutes > PASSWORD_RESET_TOKEN_EXPIRY_MINUTES) {
            System.out.println("Token de reset expirado: " + token);
            passwordResetTokens.remove(token);
            passwordResetTimestamps.remove(token);
            return null;
        }
        
        System.out.println("Token de reset válido - email: " + email);
        return email;
    }
    
    /**
     * Invalida um token de reset de senha
     */
    public void invalidatePasswordResetToken(String token) {
        passwordResetTokens.remove(token);
        passwordResetTimestamps.remove(token);
        System.out.println("Token de reset invalidado: " + token);
    }
    
    /**
     * Envia email com link de reset de senha
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            // Verificar se as credenciais de email estão configuradas
            if (emailUsername == null || emailUsername.trim().isEmpty() || 
                emailPassword == null || emailPassword.trim().isEmpty()) {
                
                // Modo de desenvolvimento - simular envio
                System.out.println("🔧 MODO DESENVOLVIMENTO - Simulando envio de email de reset");
                System.out.println("📧 Para: " + toEmail);
                System.out.println("🔗 Link: " + frontendUrl + resetPasswordPath + "?token=" + resetToken);
                System.out.println("💡 Configure EMAIL_USERNAME e EMAIL_PASSWORD para envio real");
                System.out.println("✅ Email de reset 'enviado' com sucesso (simulado)");
                return;
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Configurar remetente
            helper.setFrom(fromEmail, fromName);
            
            // Configurar destinatário
            helper.setTo(toEmail);
            
            // Configurar assunto
            helper.setSubject("🔐 Redefinição de Senha - DentalSync");
            
            // Criar conteúdo HTML do email
            String htmlContent = createPasswordResetEmailHtml(resetToken);
            helper.setText(htmlContent, true);
            
            // Enviar email
            mailSender.send(message);
            
            System.out.println("✅ Email de reset de senha enviado com sucesso para: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ ERRO ao enviar email de reset para: " + toEmail);
            System.err.println("Erro: " + e.getMessage());
            e.printStackTrace();
            
            // Em desenvolvimento, continuar mesmo com erro de email
            if (emailUsername == null || emailUsername.trim().isEmpty()) {
                System.out.println("⚠️ Continuando em modo desenvolvimento...");
                return;
            }
            
            throw new RuntimeException("Falha ao enviar email de reset: " + e.getMessage(), e);
        }
    }
    
    /**
     * Cria o conteúdo HTML do email de reset de senha
     */
    private String createPasswordResetEmailHtml(String resetToken) {
        StringBuilder html = new StringBuilder();
        String resetLink = frontendUrl + resetPasswordPath + "?token=" + resetToken;
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"pt-BR\">");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<title>Redefinição de Senha DentalSync</title>");
        html.append("<style>");
        html.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }");
        html.append(".container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { text-align: center; margin-bottom: 30px; }");
        html.append(".logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }");
        html.append(".title { color: #1e293b; margin-bottom: 20px; }");
        html.append(".button { display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }");
        html.append(".warning { background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 6px; padding: 15px; margin: 20px 0; color: #92400e; }");
        html.append(".footer { font-size: 14px; color: #64748b; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<div class=\"logo\">🦷 DentalSync</div>");
        html.append("<h1 class=\"title\">Redefinição de Senha</h1>");
        html.append("</div>");
        
        html.append("<p>Olá,</p>");
        html.append("<p>Recebemos uma solicitação para redefinir a senha da sua conta DentalSync.</p>");
        html.append("<p>Clique no botão abaixo para criar uma nova senha:</p>");
        
        html.append("<div style=\"text-align: center;\">");
        html.append("<a href=\"").append(resetLink).append("\" class=\"button\">Redefinir Senha</a>");
        html.append("</div>");
        
        html.append("<div class=\"warning\">");
        html.append("<p><strong>⚠️ Importante:</strong></p>");
        html.append("<ul>");
        html.append("<li>Este link é válido por <strong>").append(PASSWORD_RESET_TOKEN_EXPIRY_MINUTES).append(" minutos</strong></li>");
        html.append("<li>Se você não solicitou esta redefinição, ignore este email</li>");
        html.append("<li>Por segurança, não compartilhe este link com ninguém</li>");
        html.append("</ul>");
        html.append("</div>");
        
        html.append("<p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>");
        html.append("<p style=\"word-break: break-all; color: #2563eb;\">").append(resetLink).append("</p>");
        
        html.append("<div class=\"footer\">");
        html.append("<p>Este é um email automático, não responda a esta mensagem.</p>");
        html.append("<p>© 2024 DentalSync - Sistema de Gestão Odontológica</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    /**
     * Remove tokens de reset expirados
     */
    private void cleanExpiredPasswordResetTokens() {
        long currentTime = System.currentTimeMillis();
        
        passwordResetTimestamps.entrySet().removeIf(entry -> {
            long elapsedMinutes = (currentTime - entry.getValue()) / (1000 * 60);
            if (elapsedMinutes > PASSWORD_RESET_TOKEN_EXPIRY_MINUTES) {
                passwordResetTokens.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }
} 