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
import com.senac.dentalsync.core.persistency.model.Protetico;

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
        // Arrange
        dentista.setNome("");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeNulo() {
        // Arrange
        dentista.setNome(null);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }
    @Test
    void deveRetornarErroQuandoCroVazio() {
        // Arrange
        dentista.setCro("");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CRO é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneVazio() {
        // Arrange
        dentista.setTelefone("");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O telefone é obrigatório")));
    }

    @Test
    void deveAceitarTelefoneFixoValido() {
        // Arrange
        dentista.setTelefone("(11) 3333-3333");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }
    @Test
    void deveAceitarTelefoneCelularValido() {
        // Arrange
        dentista.setTelefone("(11) 99999-9999");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoEmailInvalido() {
        // Arrange
        dentista.setEmail("email.invalido");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email deve terminar com .com")));
    }

    //------------------------------------------//------------------------------------------//

   

    @Test
    void deveRetornarErroQuandoNomeMuitoCurto() {
        // Arrange
        dentista.setNome("J"); // Nome muito curto

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Por favor, informe um nome válido. O primeiro nome deve ter no mínimo 2 letras e pelo menos um sobrenome com no mínimo 1 letra")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongo() {
        // Arrange
        dentista.setNome("a".repeat(256));

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveAceitarNomeValido() {
        // Arrange
        dentista.setNome("Maria José Silva");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComTamanhoMaximo() {
        // Arrange
        dentista.setNome("Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Nome com 255 caracteres deveria ser aceito");
    }

   

    @Test
    void deveRetornarErroQuandoCroNulo() {
        // Arrange
        dentista.setCro(null);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CRO é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCroInvalido() {
        // Arrange
        dentista.setCro("12345"); // Formato inválido

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")));
    }

    @Test
    void deveAceitarCroValido() {
        // Arrange
        dentista.setCro("CRO-SP-123456");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCroComDiferentesEstados() {
        // Arrange
        dentista.setCro("CRO-RJ-98765");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    

    @Test
    void deveRetornarErroQuandoTelefoneNulo() {
        // Arrange
        dentista.setTelefone(null);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O telefone é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneInvalido() {
        // Arrange
        dentista.setTelefone("1199999999"); // Formato inválido

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")));
    }

    @Test
    void deveRetornarErroQuandoEmailVazio() {
        // Arrange
        dentista.setEmail("");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoEmailNulo() {
        // Arrange
        dentista.setEmail(null);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email é obrigatório")));
    }

    

    @Test
    void deveRetornarErroQuandoEmailMuitoLongo() {
        // Arrange
        String emailLongo = "a".repeat(246) + "@email.com"; // 255+ caracteres
        dentista.setEmail(emailLongo);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveAceitarEmailValido() {
        // Arrange
        dentista.setEmail("dentista@clinica.com");

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarEmailComTamanhoMaximo() {
        // Arrange
        String emailMaximo = "a".repeat(245) + "@email.com"; // 255 caracteres
        dentista.setEmail(emailMaximo);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Email com 255 caracteres deveria ser aceito");
    }

    @Test
    void deveAceitarClinicasNulo() {
        // Arrange
        dentista.setClinicas(null);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Lista de clínicas pode ser nula");
    }

    @Test
    void deveAceitarClinicasVazio() {
        // Arrange
        dentista.setClinicas(new ArrayList<>());

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Lista de clínicas pode ser vazia");
    }

    @Test
    void deveAceitarClinicasValidas() {
        // Arrange
        Clinica clinica = new Clinica();
        clinica.setId(1L);
        clinica.setNome("Clínica Teste");
        
        ArrayList<Clinica> clinicas = new ArrayList<>();
        clinicas.add(clinica);
        dentista.setClinicas(clinicas);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        // Arrange
        dentista.setId(null);
        dentista.setCreatedAt(null);
        dentista.setUpdatedAt(null);
        dentista.setIsActive(null);
        dentista.setCreatedBy(null);
        dentista.setUpdatedBy(null);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        // Arrange
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        dentista.setId(1L);
        dentista.setCreatedAt(LocalDateTime.now());
        dentista.setUpdatedAt(LocalDateTime.now());
        dentista.setIsActive(true);
        dentista.setCreatedBy(protetico);
        dentista.setUpdatedBy(protetico);

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        // Arrange
        dentista.setNome("A"); // Nome muito curto
        dentista.setCro("123"); // CRO inválido
        dentista.setEmail("email.invalido"); // Email inválido
        dentista.setTelefone("1234"); // Telefone inválido

        // Act
        Set<ConstraintViolation<Dentista>> violations = validator.validate(dentista);

        // Assert
        assertEquals(4, violations.size(), "Deveria ter 4 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Por favor, informe um nome válido. O primeiro nome deve ter no mínimo 2 letras e pelo menos um sobrenome com no mínimo 1 letra")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email deve terminar com .com")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")));
    }

    @Test
    void deveValidarGettersESetters() {
        // Arrange
        String nome = "Dr. Carlos Silva";
        String cro = "CRO-RJ-54321";
        String email = "carlos@clinica.com";
        String telefone = "(21) 98765-4321";

        // Act
        dentista.setNome(nome);
        dentista.setCro(cro);
        dentista.setEmail(email);
        dentista.setTelefone(telefone);

        // Assert
        assertEquals(nome, dentista.getNome());
        assertEquals(cro, dentista.getCro());
        assertEquals(email, dentista.getEmail());
        assertEquals(telefone, dentista.getTelefone());
    }

    @Test
    void deveValidarToString() {
        // Act
        String toString = dentista.toString();

        // Assert
        assertTrue(toString.contains("Dentista"));
        assertTrue(toString.contains("nome=João Silva"));
    }

    @Test
    void deveValidarEqualsEHashCode() {
        // Arrange
        Dentista outroDentista = new Dentista();
        outroDentista.setNome("João Silva");
        outroDentista.setCro("CRO-SP-12345");
        outroDentista.setEmail("joao.silva@email.com");
        outroDentista.setTelefone("(11) 99999-9999");
        outroDentista.setClinicas(new ArrayList<>());

        // Act & Assert
        assertEquals(dentista, outroDentista, "Dentistas com os mesmos dados deveriam ser iguais");
        assertEquals(dentista.hashCode(), outroDentista.hashCode(), "HashCodes deveriam ser iguais");
    }
} 