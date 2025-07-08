package com.senac.dentalsync.core.controller;

import com.senac.dentalsync.core.service.STTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/stt")
public class STTController {

    private final STTService sttService;
    
    @Autowired
    public STTController(STTService sttService) {
        this.sttService = sttService;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processText(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            System.out.println("Recebido texto para processar: " + text);
            
            Object response = sttService.processText(text);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            System.err.println("Erro ao processar STT: " + e.getMessage());
            e.printStackTrace();
            
            String errorMessage = e.getMessage();
            String errorType = determineErrorType(errorMessage);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Erro ao processar texto", 
                    "details", getErrorMessage(errorType, errorMessage),
                    "type", errorType,
                    "suggestion", sttService.getErrorSuggestion(errorType)
                ));
        }
    }

    @PostMapping("/test")
    public ResponseEntity<?> testConnection(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            System.out.println("Teste STT recebido: " + text);
            
            Object response = sttService.processText(text != null ? text : "teste de conexão");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Erro no teste STT: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Erro no teste", 
                    "details", e.getMessage()
                ));
        }
    }

    @GetMapping("/debug-webhook")
    public ResponseEntity<?> debugWebhook() {
        try {
            String testText = "Executar reparo frontal e fundir para a Sra. Muni Besen, feito por Pedro Folster e encomendado pelo dentista Marcos Viana.";
            
            Object response = sttService.processText(testText);
            
            return ResponseEntity.ok(Map.of(
                "testText", testText,
                "response", response,
                "status", "success"
            ));
            
        } catch (Exception e) {
            System.err.println("Erro no debug webhook: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Erro no debug", 
                    "details", e.getMessage(),
                    "type", e.getClass().getSimpleName()
                ));
        }
    }

    @PostMapping("/test-error")
    public ResponseEntity<?> testError(@RequestBody Map<String, String> request) {
        try {
            String errorType = request.get("errorType");
            System.out.println("Simulando erro: " + errorType);
            
            // Simular diferentes tipos de erro
            switch (errorType) {
                case "IA_EMPTY_RESPONSE":
                    throw new RuntimeException("IA_EMPTY_RESPONSE: A IA não conseguiu extrair informações válidas do texto fornecido.");
                
                case "WEBHOOK_NOT_REGISTERED":
                    throw new RuntimeException("WEBHOOK_NOT_REGISTERED");
                
                case "SERVICE_UNAVAILABLE":
                    throw new RuntimeException("SERVICE_UNAVAILABLE");
                
                case "TIMEOUT_ERROR":
                    throw new RuntimeException("TIMEOUT_ERROR");
                
                case "NULL_DATA_TEST":
                    // Simular erro de dados vazios usando um texto que a IA não consegue processar
                    try {
                        String emptyText = "texto vazio que não contém informações";
                        Object result = sttService.processText(emptyText);
                        return ResponseEntity.ok(result);
                    } catch (Exception ex) {
                        // Se chegou aqui, a validação funcionou
                        throw ex;
                    }
                
                default:
                    return ResponseEntity.ok(Map.of("message", "Tipo de erro não reconhecido"));
            }
            
        } catch (Exception e) {
            System.err.println("Erro simulado: " + e.getMessage());
            
            String errorMessage = e.getMessage();
            String errorType = determineErrorType(errorMessage);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Erro simulado para teste", 
                    "details", getErrorMessage(errorType, errorMessage),
                    "type", errorType,
                    "suggestion", sttService.getErrorSuggestion(errorType)
                ));
        }
    }
    
    private String determineErrorType(String errorMessage) {
        if (errorMessage == null) return "INTERNAL_ERROR";
        
        if (errorMessage.startsWith("IA_EMPTY_RESPONSE")) {
            return "IA_EMPTY_RESPONSE";
        } else if (errorMessage.contains("WEBHOOK_NOT_REGISTERED")) {
            return "WEBHOOK_NOT_REGISTERED";
        } else if (errorMessage.contains("WEBHOOK_NOT_FOUND")) {
            return "WEBHOOK_NOT_FOUND";
        } else if (errorMessage.contains("SERVICE_UNAVAILABLE")) {
            return "SERVICE_UNAVAILABLE";
        } else if (errorMessage.contains("TIMEOUT_ERROR")) {
            return "TIMEOUT_ERROR";
        }
        
        return "INTERNAL_ERROR";
    }
    
    private String getErrorMessage(String errorType, String originalMessage) {
        switch (errorType) {
            case "IA_EMPTY_RESPONSE":
                return "A IA não conseguiu extrair informações válidas do texto. Tente reformular com mais detalhes sobre cliente, dentista, protético e serviços.";
            case "WEBHOOK_NOT_REGISTERED":
                return "Webhook não está ativo. Execute o workflow no n8n e tente novamente.";
            case "WEBHOOK_NOT_FOUND":
                return "Serviço de IA não encontrado. Verifique se o n8n está rodando na porta 8888 e o webhook está configurado.";
            case "SERVICE_UNAVAILABLE":
                return "Serviço de IA indisponível. Verifique se o n8n está rodando na porta 8888.";
            case "TIMEOUT_ERROR":
                return "Timeout na comunicação com o serviço de IA. Tente novamente em alguns segundos.";
            default:
                return originalMessage;
        }
    }
} 