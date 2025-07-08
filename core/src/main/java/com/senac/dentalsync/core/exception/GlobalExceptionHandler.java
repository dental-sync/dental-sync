package com.senac.dentalsync.core.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.ConstraintViolationException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        
        String message = "Erro de integridade dos dados";
        String rootCause = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        
        // Extrair mensagens mais específicas baseadas no erro
        if (rootCause.contains("Duplicate entry") && rootCause.contains("cnpj")) {
            message = "Este CNPJ já está cadastrado no sistema";
        } else if (rootCause.contains("Duplicate entry") && rootCause.contains("email")) {
            message = "Este email já está cadastrado no sistema";
        } else if (rootCause.contains("Duplicate entry") && rootCause.contains("cro")) {
            message = "Este CRO já está cadastrado no sistema";
        } else if (rootCause.contains("Duplicate entry")) {
            message = "Já existe um registro com essas informações no sistema";
        } else if (rootCause.contains("foreign key constraint")) {
            message = "Não é possível realizar esta operação devido a vínculos com outros dados";
        } else if (rootCause.contains("cannot be null")) {
            message = "Campos obrigatórios não foram preenchidos";
        }
        
        response.put("message", message);
        response.put("error", "INTEGRITY_CONSTRAINT_VIOLATION");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Dados inválidos: " + ex.getMessage());
        response.put("error", "VALIDATION_ERROR");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getReason() != null ? ex.getReason() : "Erro na requisição");
        response.put("error", "REQUEST_ERROR");
        
        return ResponseEntity.status(ex.getStatusCode()).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("error", "INVALID_ARGUMENT");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Erro interno do servidor. Tente novamente mais tarde.");
        response.put("error", "INTERNAL_SERVER_ERROR");
        
        // Log do erro para debugging
        System.err.println("Erro não tratado: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
        ex.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
} 