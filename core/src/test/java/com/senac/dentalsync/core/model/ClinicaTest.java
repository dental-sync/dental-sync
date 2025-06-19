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

import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Usuario;

public class ClinicaTest {

    private Validator validator;
    private Clinica clinica;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        // Configuração padrão de uma clínica válida para os testes
        clinica = new Clinica();
        clinica.setNome("Clínica Odontológica Teste");
        clinica.setCnpj("12.345.678/0001-90");
    }

    @Test
    void deveCriarClinicaValida() {
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoNomeVazio() {
        clinica.setNome("");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeNulo() {
        clinica.setNome(null);
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongo() {
        clinica.setNome("a".repeat(256));
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveRetornarErroQuandoCnpjVazio() {
        clinica.setCnpj("");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CNPJ é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCnpjNulo() {
        clinica.setCnpj(null);
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CNPJ é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCnpjInvalido() {
        clinica.setCnpj("12345678000190"); // Formato inválido (sem pontuação)
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
    }

    @Test
    void deveAceitarCnpjValido() {
        clinica.setCnpj("12.345.678/0001-90");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        clinica.setId(null);
        clinica.setCreatedAt(null);
        clinica.setUpdatedAt(null);
        clinica.setIsActive(null);
        clinica.setCreatedBy(null);
        clinica.setUpdatedBy(null);

        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        clinica.setId(1L);
        clinica.setCreatedAt(LocalDateTime.now());
        clinica.setUpdatedAt(LocalDateTime.now());
        clinica.setIsActive(true);
        clinica.setCreatedBy(usuario);
        clinica.setUpdatedBy(usuario);

        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        clinica.setNome(""); // Nome vazio
        clinica.setCnpj("12345678000190"); // CNPJ formato inválido

        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertEquals(2, violations.size(), "Deveria ter 2 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
    }
} 