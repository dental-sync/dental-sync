package com.senac.dentalsync.core.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Usuario;

public class ProteticoTest {

    private Validator validator;
    private Protetico protetico;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        // Configuração padrão de um protético válido para os testes
        protetico = new Protetico();
        protetico.setNome("João Silva");
        protetico.setCro("CRO-SP-12345");
        protetico.setEmail("joao.silva@email.com");
        protetico.setTelefone("(11) 99999-9999");
        protetico.setSenha("senha123");
        protetico.setIsAdmin(false);
    }

    @Test
    void deveCriarProteticoValido() {
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoNomeVazio() {
        protetico.setNome("");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeNulo() {
        protetico.setNome(null);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCroVazio() {
        protetico.setCro("");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CRO é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCroInvalido() {
        protetico.setCro("12345"); // Formato inválido
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")));
    }

    @Test
    void deveAceitarCroValido() {
        protetico.setCro("CRO-SP-123456");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoTelefoneVazio() {
        protetico.setTelefone("");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O telefone é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneInvalido() {
        protetico.setTelefone("1199999999"); // Formato inválido
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")));
    }

    @Test
    void deveAceitarTelefoneFixoValido() {
        protetico.setTelefone("(11) 3333-3333");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarTelefoneCelularValido() {
        protetico.setTelefone("(11) 99999-9999");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoEmailVazio() {
        protetico.setEmail("");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoEmailInvalido() {
        protetico.setEmail("email.invalido");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Email inválido")));
    }

    @Test
    void deveAceitarEmailValido() {
        protetico.setEmail("protetico@laboratorio.com.br");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoSenhaVazia() {
        protetico.setSenha("");
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A senha é obrigatória")));
    }

    @Test
    void deveAceitarLaboratorioNulo() {
        protetico.setLaboratorio(null);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarLaboratorioValido() {
        Laboratorio lab = new Laboratorio();
        lab.setId(1L);
        protetico.setLaboratorio(lab);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        protetico.setId(null);
        protetico.setCreatedAt(null);
        protetico.setUpdatedAt(null);
        protetico.setIsActive(null);
        protetico.setCreatedBy(null);
        protetico.setUpdatedBy(null);

        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        protetico.setId(1L);
        protetico.setCreatedAt(LocalDateTime.now());
        protetico.setUpdatedAt(LocalDateTime.now());
        protetico.setIsActive(true);
        protetico.setCreatedBy(usuario);
        protetico.setUpdatedBy(usuario);

        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        protetico.setNome("");
        protetico.setCro("123");
        protetico.setEmail("email.invalido");
        protetico.setTelefone("1234");
        protetico.setSenha("");

        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertEquals(5, violations.size(), "Deveria ter 5 violações de validação");
    }

    @Test
    void deveAceitarCampos2FANulos() {
        protetico.setTwoFactorSecret(null);
        protetico.setTwoFactorEnabled(null);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCampos2FAPreenchidos() {
        protetico.setTwoFactorSecret("SECRET123");
        protetico.setTwoFactorEnabled(true);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposDispositivoConfiavelNulos() {
        protetico.setTrustedDeviceFingerprint(null);
        protetico.setTrustedDeviceToken(null);
        protetico.setTrustedDeviceTimestamp(null);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposDispositivoConfiavelPreenchidos() {
        protetico.setTrustedDeviceFingerprint("FINGERPRINT123");
        protetico.setTrustedDeviceToken("TOKEN123");
        protetico.setTrustedDeviceTimestamp(System.currentTimeMillis());
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposLembrarDeMinNulos() {
        protetico.setRememberMeToken(null);
        protetico.setRememberMeTimestamp(null);
        protetico.setRememberMeDurationDays(null);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposLembrarDeMinPreenchidos() {
        protetico.setRememberMeToken("TOKEN123");
        protetico.setRememberMeTimestamp(System.currentTimeMillis());
        protetico.setRememberMeDurationDays(30);
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty());
    }
} 