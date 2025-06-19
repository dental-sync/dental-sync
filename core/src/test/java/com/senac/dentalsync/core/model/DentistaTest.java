package com.senac.dentalsync.core.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Usuario;

public class DentistaTest {

    private Validator validator;
    private Dentista dentista;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        // Configuração padrão de um dentista válido para os testes
        dentista = new Dentista();
        dentista.setNome("João Silva");
        dentista.setCro("CRO-SP-12345");
        dentista.setEmail("joao.silva@email.com");
        dentista.setTelefone("(11) 99999-9999");
        dentista.setClinicas(new ArrayList<>());
    }

    @Test
    void deveCriarDentistaValido() {
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoNomeVazio() {
        dentista.setNome("");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeNulo() {
        dentista.setNome(null);
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoCurto() {
        dentista.setNome("J"); // Nome muito curto
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Por favor, informe um nome válido. O primeiro nome deve ter no mínimo 2 letras e pelo menos um sobrenome com no mínimo 1 letra")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongo() {
        dentista.setNome("a".repeat(256));
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveAceitarNomeValido() {
        dentista.setNome("Maria José Silva");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoCroVazio() {
        dentista.setCro("");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CRO é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCroInvalido() {
        dentista.setCro("12345"); // Formato inválido
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")));
    }

    @Test
    void deveAceitarCroValido() {
        dentista.setCro("CRO-SP-123456");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoTelefoneVazio() {
        dentista.setTelefone("");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O telefone é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneInvalido() {
        dentista.setTelefone("1199999999"); // Formato inválido
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")));
    }

    @Test
    void deveAceitarTelefoneFixoValido() {
        dentista.setTelefone("(11) 3333-3333");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarTelefoneCelularValido() {
        dentista.setTelefone("(11) 99999-9999");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoEmailVazio() {
        dentista.setEmail("");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoEmailInvalido() {
        dentista.setEmail("email.invalido");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email deve terminar com .com")));
    }

    @Test
    void deveRetornarErroQuandoEmailMuitoLongo() {
        String emailLongo = "a".repeat(246) + "@email.com"; // 255+ caracteres
        dentista.setEmail(emailLongo);
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveAceitarEmailValido() {
        dentista.setEmail("dentista@clinica.com");
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarClinicasNulo() {
        dentista.setClinicas(null);
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarClinicasVazio() {
        dentista.setClinicas(new ArrayList<>());
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarClinicasValidas() {
        Clinica clinica = new Clinica();
        clinica.setId(1L);
        clinica.setNome("Clínica Teste");
        
        ArrayList<Clinica> clinicas = new ArrayList<>();
        clinicas.add(clinica);
        dentista.setClinicas(clinicas);
        
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        dentista.setId(null);
        dentista.setCreatedAt(null);
        dentista.setUpdatedAt(null);
        dentista.setIsActive(null);
        dentista.setCreatedBy(null);
        dentista.setUpdatedBy(null);

        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        dentista.setId(1L);
        dentista.setCreatedAt(LocalDateTime.now());
        dentista.setUpdatedAt(LocalDateTime.now());
        dentista.setIsActive(true);
        dentista.setCreatedBy(usuario);
        dentista.setUpdatedBy(usuario);

        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        dentista.setNome("A"); // Nome muito curto
        dentista.setCro("123"); // CRO inválido
        dentista.setEmail("email.invalido"); // Email inválido
        dentista.setTelefone("1234"); // Telefone inválido

        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);
        assertEquals(4, violations.size(), "Deveria ter 4 violações de validação");
    }
} 