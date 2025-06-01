package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.senac.dentalsync.core.persistency.model.Protetico;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

@Service
public class TrustedDeviceService {
    
    @Autowired
    private ProteticoService proteticoService;
    
    @Value("${dentalsync.2fa.trusted-device-duration-minutes:10}")
    private int trustedDeviceDurationMinutes;
    
    /**
     * Gera um token para dispositivo confiável
     */
    public String generateTrustedDeviceToken(String email, String deviceFingerprint) {
        String token = UUID.randomUUID().toString();
        
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.err.println("Usuário não encontrado para gerar token de dispositivo: " + email);
            return null;
        }
        
        Protetico user = userOpt.get();
        
        // Armazenar informações do dispositivo no usuário
        user.setTrustedDeviceFingerprint(deviceFingerprint);
        user.setTrustedDeviceToken(token);
        user.setTrustedDeviceTimestamp(System.currentTimeMillis());
        
        // Salvar no banco de dados
        proteticoService.save(user);
        
        System.out.println("=== DISPOSITIVO CONFIÁVEL REGISTRADO ===");
        System.out.println("Email: " + email);
        System.out.println("Device Fingerprint: " + deviceFingerprint);
        System.out.println("Token: " + token);
        System.out.println("Válido por " + trustedDeviceDurationMinutes + " minutos");
        System.out.println("Salvo no banco de dados");
        System.out.println("===============================");
        
        return token;
    }
    
    /**
     * Verifica se um dispositivo é confiável
     */
    public boolean isTrustedDevice(String email, String deviceFingerprint) {
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.out.println("Usuário não encontrado: " + email);
            return false;
        }
        
        Protetico user = userOpt.get();
        String storedFingerprint = user.getTrustedDeviceFingerprint();
        Long timestamp = user.getTrustedDeviceTimestamp();
        
        if (storedFingerprint == null || timestamp == null) {
            System.out.println("Dispositivo não encontrado para usuário: " + email);
            return false;
        }
        
        if (!storedFingerprint.equals(deviceFingerprint)) {
            System.out.println("Device fingerprint não corresponde para usuário: " + email);
            return false;
        }
        
        // Verificar se o token expirou
        long currentTime = System.currentTimeMillis();
        long elapsedMinutes = (currentTime - timestamp) / (1000 * 60);
        
        if (elapsedMinutes > trustedDeviceDurationMinutes) {
            System.out.println("Dispositivo confiável expirado para " + email + " (expirou há " + (elapsedMinutes - trustedDeviceDurationMinutes) + " minutos)");
            removeTrustedDevice(email);
            return false;
        }
        
        System.out.println("Dispositivo confiável válido para: " + email + " (ainda válido por " + (trustedDeviceDurationMinutes - elapsedMinutes) + " minutos)");
        return true;
    }
    
    /**
     * Valida token de dispositivo confiável
     */
    public boolean validateTrustedDeviceToken(String email, String deviceFingerprint, String token) {
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.out.println("Usuário não encontrado para validar token: " + email);
            return false;
        }
        
        Protetico user = userOpt.get();
        String storedToken = user.getTrustedDeviceToken();
        String storedFingerprint = user.getTrustedDeviceFingerprint();
        
        if (storedToken == null || storedFingerprint == null) {
            System.out.println("Token ou fingerprint de dispositivo não encontrado para: " + email);
            return false;
        }
        
        boolean isValid = storedToken.equals(token) && storedFingerprint.equals(deviceFingerprint);
        System.out.println("Validação de token de dispositivo para " + email + ": " + (isValid ? "VÁLIDO" : "INVÁLIDO"));
        
        return isValid;
    }
    
    /**
     * Remove um dispositivo confiável
     */
    public void removeTrustedDevice(String email) {
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.out.println("Usuário não encontrado para remover dispositivo: " + email);
            return;
        }
        
        Protetico user = userOpt.get();
        user.setTrustedDeviceFingerprint(null);
        user.setTrustedDeviceToken(null);
        user.setTrustedDeviceTimestamp(null);
        
        proteticoService.save(user);
        System.out.println("Dispositivo confiável removido para usuário: " + email);
    }
    
    /**
     * Remove todos os dispositivos confiáveis de um usuário (mesmo método que removeTrustedDevice neste caso)
     */
    public void removeAllTrustedDevicesForUser(String email) {
        removeTrustedDevice(email);
    }
    
    /**
     * Obtém informações dos dispositivos confiáveis de um usuário
     */
    public Map<String, Object> getTrustedDevicesInfo(String email) {
        Map<String, Object> info = new HashMap<>();
        
        Optional<Protetico> userOpt = proteticoService.findByEmail(email);
        if (!userOpt.isPresent()) {
            info.put("count", 0);
            info.put("oldestDeviceAge", 0);
            info.put("maxDurationMinutes", trustedDeviceDurationMinutes);
            return info;
        }
        
        Protetico user = userOpt.get();
        Long timestamp = user.getTrustedDeviceTimestamp();
        
        if (timestamp != null) {
            long currentTime = System.currentTimeMillis();
            long ageInMinutes = (currentTime - timestamp) / (1000 * 60);
            
            info.put("count", 1);
            info.put("oldestDeviceAge", ageInMinutes);
            info.put("maxDurationMinutes", trustedDeviceDurationMinutes);
            info.put("isExpired", ageInMinutes > trustedDeviceDurationMinutes);
        } else {
            info.put("count", 0);
            info.put("oldestDeviceAge", 0);
            info.put("maxDurationMinutes", trustedDeviceDurationMinutes);
            info.put("isExpired", false);
        }
        
        return info;
    }
    
    /**
     * Remove dispositivos expirados de todos os usuários
     */
    public void cleanExpiredDevicesForAllUsers() {
        // Buscar todos os usuários com dispositivos confiáveis
        List<Protetico> allUsers = proteticoService.findAll();
        long currentTime = System.currentTimeMillis();
        
        for (Protetico user : allUsers) {
            Long timestamp = user.getTrustedDeviceTimestamp();
            if (timestamp != null) {
                long elapsedMinutes = (currentTime - timestamp) / (1000 * 60);
                if (elapsedMinutes > trustedDeviceDurationMinutes) {
                    user.setTrustedDeviceFingerprint(null);
                    user.setTrustedDeviceToken(null);
                    user.setTrustedDeviceTimestamp(null);
                    proteticoService.save(user);
                    System.out.println("Dispositivo confiável expirado removido para: " + user.getEmail());
                }
            }
        }
    }
    
    /**
     * Gera um fingerprint básico do dispositivo baseado no User-Agent e IP
     */
    public String generateDeviceFingerprint(String userAgent, String ipAddress, String additionalInfo) {
        String combined = (userAgent != null ? userAgent : "") + "|" + 
                         (ipAddress != null ? ipAddress : "") + "|" + 
                         (additionalInfo != null ? additionalInfo : "");
        
        // Gerar hash simples (em produção usar algo mais robusto)
        return String.valueOf(combined.hashCode());
    }
} 