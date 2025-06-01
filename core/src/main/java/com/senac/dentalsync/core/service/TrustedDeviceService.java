package com.senac.dentalsync.core.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TrustedDeviceService {
    
    // Armazenamento temporário dos dispositivos confiáveis (em produção usar Redis ou banco)
    private Map<String, String> trustedDevices = new ConcurrentHashMap<>(); // deviceFingerprint -> email
    private Map<String, Long> deviceTimestamps = new ConcurrentHashMap<>(); // deviceFingerprint -> timestamp
    private Map<String, String> deviceTokens = new ConcurrentHashMap<>(); // deviceFingerprint -> token
    
    @Value("${dentalsync.2fa.trusted-device-duration-minutes:10}")
    private int trustedDeviceDurationMinutes;
    
    /**
     * Gera um token para dispositivo confiável
     */
    public String generateTrustedDeviceToken(String email, String deviceFingerprint) {
        String token = UUID.randomUUID().toString();
        
        // Armazenar informações do dispositivo
        trustedDevices.put(deviceFingerprint, email);
        deviceTimestamps.put(deviceFingerprint, System.currentTimeMillis());
        deviceTokens.put(deviceFingerprint, token);
        
        // Limpar dispositivos expirados
        cleanExpiredDevices();
        
        System.out.println("=== DISPOSITIVO CONFIÁVEL REGISTRADO ===");
        System.out.println("Email: " + email);
        System.out.println("Device Fingerprint: " + deviceFingerprint);
        System.out.println("Token: " + token);
        System.out.println("Válido por " + trustedDeviceDurationMinutes + " minutos");
        System.out.println("===============================");
        
        return token;
    }
    
    /**
     * Verifica se um dispositivo é confiável
     */
    public boolean isTrustedDevice(String email, String deviceFingerprint) {
        String storedEmail = trustedDevices.get(deviceFingerprint);
        Long timestamp = deviceTimestamps.get(deviceFingerprint);
        
        if (storedEmail == null || timestamp == null) {
            System.out.println("Dispositivo não encontrado: " + deviceFingerprint);
            return false;
        }
        
        if (!storedEmail.equals(email)) {
            System.out.println("Email não corresponde ao dispositivo: " + email);
            return false;
        }
        
        // Verificar se o token expirou
        long currentTime = System.currentTimeMillis();
        long elapsedMinutes = (currentTime - timestamp) / (1000 * 60);
        
        if (elapsedMinutes > trustedDeviceDurationMinutes) {
            System.out.println("Dispositivo confiável expirado: " + deviceFingerprint + " (expirou há " + (elapsedMinutes - trustedDeviceDurationMinutes) + " minutos)");
            removeTrustedDevice(deviceFingerprint);
            return false;
        }
        
        System.out.println("Dispositivo confiável válido para: " + email + " (ainda válido por " + (trustedDeviceDurationMinutes - elapsedMinutes) + " minutos)");
        return true;
    }
    
    /**
     * Valida token de dispositivo confiável
     */
    public boolean validateTrustedDeviceToken(String deviceFingerprint, String token) {
        String storedToken = deviceTokens.get(deviceFingerprint);
        
        if (storedToken == null) {
            System.out.println("Token de dispositivo não encontrado: " + deviceFingerprint);
            return false;
        }
        
        boolean isValid = storedToken.equals(token);
        System.out.println("Validação de token de dispositivo: " + (isValid ? "VÁLIDO" : "INVÁLIDO"));
        
        return isValid;
    }
    
    /**
     * Remove um dispositivo confiável
     */
    public void removeTrustedDevice(String deviceFingerprint) {
        trustedDevices.remove(deviceFingerprint);
        deviceTimestamps.remove(deviceFingerprint);
        deviceTokens.remove(deviceFingerprint);
        System.out.println("Dispositivo confiável removido: " + deviceFingerprint);
    }
    
    /**
     * Remove todos os dispositivos confiáveis de um usuário
     */
    public void removeAllTrustedDevicesForUser(String email) {
        trustedDevices.entrySet().removeIf(entry -> {
            if (entry.getValue().equals(email)) {
                String fingerprint = entry.getKey();
                deviceTimestamps.remove(fingerprint);
                deviceTokens.remove(fingerprint);
                System.out.println("Dispositivo confiável removido para usuário " + email + ": " + fingerprint);
                return true;
            }
            return false;
        });
    }
    
    /**
     * Obtém informações dos dispositivos confiáveis de um usuário
     */
    public Map<String, Object> getTrustedDevicesInfo(String email) {
        Map<String, Object> info = new HashMap<>();
        int count = 0;
        long oldestTimestamp = System.currentTimeMillis();
        
        for (Map.Entry<String, String> entry : trustedDevices.entrySet()) {
            if (entry.getValue().equals(email)) {
                count++;
                Long timestamp = deviceTimestamps.get(entry.getKey());
                if (timestamp != null && timestamp < oldestTimestamp) {
                    oldestTimestamp = timestamp;
                }
            }
        }
        
        info.put("count", count);
        info.put("oldestDeviceAge", count > 0 ? (System.currentTimeMillis() - oldestTimestamp) / (1000 * 60) : 0);
        info.put("maxDurationMinutes", trustedDeviceDurationMinutes);
        
        return info;
    }
    
    /**
     * Remove dispositivos expirados
     */
    private void cleanExpiredDevices() {
        long currentTime = System.currentTimeMillis();
        
        deviceTimestamps.entrySet().removeIf(entry -> {
            long elapsedMinutes = (currentTime - entry.getValue()) / (1000 * 60);
            if (elapsedMinutes > trustedDeviceDurationMinutes) {
                String fingerprint = entry.getKey();
                trustedDevices.remove(fingerprint);
                deviceTokens.remove(fingerprint);
                System.out.println("Dispositivo confiável expirado removido: " + fingerprint);
                return true;
            }
            return false;
        });
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