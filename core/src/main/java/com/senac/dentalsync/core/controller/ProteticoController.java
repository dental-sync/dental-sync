package com.senac.dentalsync.core.controller;

import java.util.Map;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.ProteticoService;
import jakarta.validation.ValidationException;
import jakarta.validation.ConstraintViolationException;

@RestController
@RequestMapping("/proteticos")
public class ProteticoController extends BaseController<Protetico, Long> {

    private static final Logger logger = LoggerFactory.getLogger(ProteticoController.class);

    @Autowired
    private ProteticoService proteticoService;
    
    @Autowired
    private ProteticoRepository proteticoRepository;
    
    @Override
    protected BaseService<Protetico, Long> getService() {
        return proteticoService;
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Protetico> findByEmail(@PathVariable String email) {
        return proteticoService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cro/{cro}")
    public ResponseEntity<Protetico> findByCro(@PathVariable String cro) {
        return proteticoService.findByCro(cro)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Protetico> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        try {
            logger.info("Recebida solicitação para atualizar status do protético ID: {}", id);
            logger.info("Payload recebido: {}", status);
            
            Boolean isActive = status.get("isActive");
            
            if (isActive == null) {
                logger.error("Campo 'isActive' não encontrado no payload");
                return ResponseEntity.badRequest().build();
            }
            
            logger.info("Atualizando status para: {}", isActive);
            Protetico protetico = proteticoService.updateStatus(id, isActive);
            logger.info("Status atualizado com sucesso para protetico: {}", id);
            
            return ResponseEntity.ok(protetico);
        } catch (Exception e) {
            logger.error("Erro ao atualizar status do protético: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
    
    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            logger.info("Recebida solicitação para excluir protético ID: {}", id);
            
            // Delegar toda a lógica para o serviço
            proteticoService.deleteProtetico(id);
            
            return ResponseEntity.noContent().build();
        } catch (ValidationException e) {
            logger.error("Erro de validação ao excluir protético: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Erro ao excluir protético: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Handler para tratar exceções específicas de validação
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidationException(ValidationException e) {
        logger.error("Erro de validação: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        String mensagem = e.getMessage();
        
        // Tratamento específico para email duplicado
        if (mensagem != null && 
            (mensagem.contains("email") || mensagem.contains("E-mail")) && 
            (mensagem.contains("existe") || mensagem.contains("cadastrado"))) {
            
            response.put("field", "email");
            response.put("message", "Este e-mail já está cadastrado no sistema. Por favor, utilize outro e-mail.");
            logger.debug("Email duplicado detectado: {}", mensagem);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Tratamento para outros casos de validação
        response.put("message", mensagem);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    /**
     * Handler para tratar exceções de validação de constraints
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleConstraintViolationException(ConstraintViolationException e) {
        logger.error("Erro de validação de constraints: {}", e.getMessage(), e);
        
        Map<String, String> response = new HashMap<>();
        
        e.getConstraintViolations().forEach(violation -> {
            String field = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            
            // Mensagem específica para email inválido
            if (field.equals("email") && message.contains("Email inv")) {
                message = "Email inválido. Verifique o formato e tente novamente.";
            }
            
            response.put("field", field);
            response.put("message", message);
            
            logger.debug("Violação de validação: campo={}, mensagem={}", field, message);
        });
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    /**
     * Handler para tratar exceções gerais que contenham mensagem de email inválido
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        logger.error("Erro ao processar requisição: {}", e.getMessage(), e);
        
        Map<String, Object> response = new HashMap<>();
        
        // Verificar se a exceção está relacionada a email
        if (e.getMessage() != null) {
            String mensagem = e.getMessage();
            
            // Email inválido
            if (mensagem.contains("Email inv") || mensagem.contains("email inv")) {
                response.put("field", "email");
                response.put("message", "Email inválido. Verifique o formato e tente novamente.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Email duplicado
            if ((mensagem.contains("email") || mensagem.contains("E-mail")) && 
                (mensagem.contains("existe") || mensagem.contains("cadastrado") || 
                 mensagem.contains("duplicate") || mensagem.contains("duplicidade"))) {
                
                response.put("field", "email");
                response.put("message", "Este e-mail já está cadastrado no sistema. Por favor, utilize outro e-mail.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }
        
        // Para outros erros, retornar erro interno
        response.put("message", "Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
} 