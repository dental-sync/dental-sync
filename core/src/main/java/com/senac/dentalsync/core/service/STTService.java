package com.senac.dentalsync.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class STTService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${n8n.webhook.base-url}")
    private String webhookBaseUrl;

    @Value("${n8n.webhook.endpoint}")
    private String webhookEndpoint;

    @Value("${n8n.webhook.timeout}")
    private int webhookTimeout;

    public STTService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public Object processText(String text) throws Exception {
        validateText(text);
        
        String webhookUrl = buildWebhookUrl(text);
        ResponseEntity<String> response = callWebhook(webhookUrl);
        
        return parseWebhookResponse(response.getBody());
    }

    private void validateText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Texto não pode estar vazio");
        }
    }

    private String buildWebhookUrl(String text) throws Exception {
        String encodedText = URLEncoder.encode("'" + text + "'", StandardCharsets.UTF_8);
        return webhookBaseUrl + webhookEndpoint + "?message=" + encodedText;
    }

    private ResponseEntity<String> callWebhook(String webhookUrl) throws Exception {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(webhookUrl, String.class);
            
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("Erro na resposta do webhook: " + response.getStatusCode());
            }
            
            return response;
        } catch (Exception e) {
            throw new RuntimeException(mapWebhookError(e.getMessage()), e);
        }
    }

    private Object parseWebhookResponse(String rawResponse) throws Exception {
        try {
            // Tentar como array primeiro
            List<Map<String, Object>> arrayResponse = objectMapper.readValue(rawResponse, 
                objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
            
            if (arrayResponse != null && !arrayResponse.isEmpty()) {
                Map<String, Object> firstElement = arrayResponse.get(0);
                validateResponse(firstElement);
                return firstElement;
            }
        } catch (Exception e) {
            if (e.getMessage().startsWith("IA_EMPTY_RESPONSE")) {
                throw e;
            }
        }
        
        try {
            // Tentar como objeto único
            Map<String, Object> objectResponse = objectMapper.readValue(rawResponse, Map.class);
            validateResponse(objectResponse);
            return objectResponse;
        } catch (Exception e) {
            if (e.getMessage().startsWith("IA_EMPTY_RESPONSE")) {
                throw e;
            }
            
            // Retornar resposta raw como fallback
            return Map.of("rawResponse", rawResponse);
        }
    }

    private void validateResponse(Map<String, Object> response) throws Exception {
        if (response.containsKey("output")) {
            String outputStr = (String) response.get("output");
            
            // Validação mais flexível - só rejeita se TODOS os campos estão completamente vazios
            if (isCompletelyEmptyResponse(outputStr)) {
                throw new RuntimeException("IA_EMPTY_RESPONSE: A IA não conseguiu extrair nenhuma informação válida do texto fornecido.");
            }
        } else {
            // Se não tem campo "output", verificar se a resposta tem pelo menos algum dado
            if (isEmptyDirectResponse(response)) {
                throw new RuntimeException("IA_EMPTY_RESPONSE: Resposta vazia do serviço de IA. Nenhum dado foi extraído.");
            }
        }
    }

    private boolean isEmptyResponse(String outputStr) {
        if (outputStr == null || outputStr.trim().isEmpty()) {
            return true;
        }
        
        try {
            Map<String, Object> output = objectMapper.readValue(outputStr, Map.class);
            return isEmptyDataMap(output);
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean isEmptyDirectResponse(Map<String, Object> response) {
        if (response == null || response.isEmpty()) {
            return true;
        }
        
        // Se a resposta direta contém os campos esperados, verificar se estão vazios
        if (response.containsKey("cliente_id") || response.containsKey("dentista_id") || 
            response.containsKey("protetico_id") || response.containsKey("servicos")) {
            return isEmptyDataMap(response);
        }
        
        return false;
    }
    
    private boolean isCompletelyEmptyResponse(String outputStr) {
        if (outputStr == null || outputStr.trim().isEmpty()) {
            return true;
        }
        
        try {
            Map<String, Object> output = objectMapper.readValue(outputStr, Map.class);
            return isCompletelyEmptyDataMap(output);
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean isEmptyDataMap(Map<String, Object> dataMap) {
        return isCompletelyEmptyDataMap(dataMap);
    }
    
    private boolean isCompletelyEmptyDataMap(Map<String, Object> dataMap) {
        Object clienteId = dataMap.get("cliente_id");
        Object dentistaId = dataMap.get("dentista_id");
        Object proteticoId = dataMap.get("protetico_id");
        List<?> servicos = (List<?>) dataMap.get("servicos");
        List<?> dentes = (List<?>) dataMap.get("dentes");
        String prioridade = (String) dataMap.get("prioridade");
        String data = (String) dataMap.get("data");
        
        // Só rejeita se TODOS estão completamente vazios
        boolean allEmpty = (clienteId == null) && 
                          (dentistaId == null) && 
                          (proteticoId == null) && 
                          (servicos == null || servicos.isEmpty()) && 
                          (dentes == null || dentes.isEmpty()) && 
                          (prioridade == null || prioridade.trim().isEmpty()) && 
                          (data == null || data.trim().isEmpty());
        
        return allEmpty;
    }

    private String mapWebhookError(String errorMessage) {
        if (errorMessage == null) return "Erro desconhecido";
        
        if (errorMessage.contains("webhook") && errorMessage.contains("not registered")) {
            return "WEBHOOK_NOT_REGISTERED";
        } else if (errorMessage.contains("404") && errorMessage.contains("webhook")) {
            return "WEBHOOK_NOT_FOUND";
        } else if (errorMessage.contains("Connection refused") || errorMessage.contains("ConnectException")) {
            return "SERVICE_UNAVAILABLE";
        } else if (errorMessage.contains("timeout") || errorMessage.contains("SocketTimeoutException")) {
            return "TIMEOUT_ERROR";
        }
        
        return errorMessage;
    }

    public String getErrorSuggestion(String errorType) {
        switch (errorType) {
            case "IA_EMPTY_RESPONSE":
                return "Use frases naturais como: 'Cliente Muni Besen, data entrega 20/06/2025, dentista Marcos Viana, protético Pedro Folster, fazer coroa nos dentes 15 e 16, prioridade alta'. A IA pode não identificar tudo, mas isso é normal.";
            case "WEBHOOK_NOT_REGISTERED":
                return "Acesse o n8n (localhost:8888), abra o workflow de STT e clique em 'Execute workflow' para ativar o webhook";
            case "WEBHOOK_NOT_FOUND":
                return "Verifique se o n8n está rodando e se o webhook ID está correto no código";
            case "SERVICE_UNAVAILABLE":
                return "Inicie o n8n com: docker-compose up -d";
            case "TIMEOUT_ERROR":
                return "Aguarde alguns segundos e tente novamente. Se persistir, verifique a conexão com o n8n";
            default:
                return "Use o botão 'Inserir Exemplo' para testar o sistema ou entre em contato com o suporte";
        }
    }
    
    /**
     * Método para validar se pelo menos algum campo útil foi extraído
     */
    public boolean hasValidData(Map<String, Object> dataMap) {
        Object clienteId = dataMap.get("cliente_id");
        Object dentistaId = dataMap.get("dentista_id");
        Object proteticoId = dataMap.get("protetico_id");
        List<?> servicos = (List<?>) dataMap.get("servicos");
        List<?> dentes = (List<?>) dataMap.get("dentes");
        String prioridade = (String) dataMap.get("prioridade");
        String data = (String) dataMap.get("data");
        
        // Retorna true se pelo menos UM campo tem valor válido
        return (clienteId != null) ||
               (dentistaId != null) ||
               (proteticoId != null) ||
               (servicos != null && !servicos.isEmpty()) ||
               (dentes != null && !dentes.isEmpty()) ||
               (prioridade != null && !prioridade.trim().isEmpty()) ||
               (data != null && !data.trim().isEmpty());
    }
} 