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
import com.senac.dentalsync.core.persistency.model.Protetico;

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
    void deveAceitarNomeValido() {
        clinica.setNome("Clínica Odontológica Especializada");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComEspacos() {
        clinica.setNome("Clínica Odontológica Dr. Silva");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComCaracteresEspeciais() {
        clinica.setNome("Clínica Odontológica & Estética");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComTamanhoMaximo() {
        clinica.setNome("a".repeat(255));
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty(), "Nome com 255 caracteres deveria ser aceito");
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
    void deveRetornarErroQuandoNomeApenasEspacos() {
        clinica.setNome("   ");
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
    void deveAceitarCnpjValido() {
        clinica.setCnpj("12.345.678/0001-90");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCnpjComDiferentesDigitos() {
        clinica.setCnpj("98.765.432/0001-10");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertTrue(violations.isEmpty());
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
    void deveRetornarErroQuandoCnpjApenasEspacos() {
        clinica.setCnpj("   ");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CNPJ é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCnpjSemPontuacao() {
        clinica.setCnpj("12345678000190");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
    }

    @Test
    void deveRetornarErroQuandoCnpjComPontuacaoIncorreta() {
        clinica.setCnpj("12-345-678/0001.90");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
    }

    @Test
    void deveRetornarErroQuandoCnpjMuitoCurto() {
        clinica.setCnpj("12.345.678/0001-9");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
    }

    @Test
    void deveRetornarErroQuandoCnpjMuitoLongo() {
        clinica.setCnpj("12.345.678/0001-900");
        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
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
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        clinica.setId(1L);
        clinica.setCreatedAt(LocalDateTime.now());
        clinica.setUpdatedAt(LocalDateTime.now());
        clinica.setIsActive(true);
        clinica.setCreatedBy(protetico);
        clinica.setUpdatedBy(protetico);

        var violations = validator.validate(clinica);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        clinica.setNome("");
        clinica.setCnpj("12345678000190");

        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertEquals(2, violations.size(), "Deveria ter 2 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
    }

    @Test
    void deveRetornarErroQuandoNomeETamanhoInvalidos() {
        clinica.setNome("a".repeat(256));
        clinica.setCnpj("12.345.678/001-90");

        Set<ConstraintViolation<Clinica>> violations = validator.validate(clinica);
        assertEquals(2, violations.size(), "Deveria ter 2 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CNPJ inválido. Use o formato: XX.XXX.XXX/YYYY-ZZ")));
    }

    @Test
    void deveValidarGettersESetters() {
        String nome = "Clínica Teste";
        String cnpj = "98.765.432/0001-10";

        clinica.setNome(nome);
        clinica.setCnpj(cnpj);

        assertEquals(nome, clinica.getNome());
        assertEquals(cnpj, clinica.getCnpj());
    }

    @Test
    void deveValidarToString() {
        String toString = clinica.toString();
        assertTrue(toString.contains("Clinica"));
        assertTrue(toString.contains("nome=Clínica Odontológica Teste"));
    }

    @Test
    void deveValidarEqualsEHashCode() {
        Clinica outraClinica = new Clinica();
        outraClinica.setNome("Clínica Odontológica Teste");
        outraClinica.setCnpj("12.345.678/0001-90");

        assertEquals(clinica, outraClinica, "Clínicas com os mesmos dados deveriam ser iguais");
        assertEquals(clinica.hashCode(), outraClinica.hashCode(), "HashCodes deveriam ser iguais");
    }
} 