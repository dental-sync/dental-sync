package com.senac.dentalsync.core.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Usuario;

public class PacienteTest {

    private Validator validator;
    private Paciente paciente;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        // Configuração padrão de um paciente válido para os testes
        paciente = new Paciente();
        paciente.setNome("João Silva");
        paciente.setEmail("joao.silva@email.com");
        paciente.setTelefone("(11) 99999-9999");
        paciente.setDataNascimento(LocalDate.of(1990, 1, 1));
    }

    @Test
    void deveCriarPacienteValido() {
        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeCompletoValido() {
        // Arrange
        paciente.setNome("Maria José da Silva Santos");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeCompostoValido() {
        // Arrange
        paciente.setNome("Anna Maria Souza");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoNomeVazio() {
        // Arrange
        paciente.setNome("");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeInvalido() {
        // Arrange
        paciente.setNome("J"); // Nome muito curto

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Por favor, informe nome e sobrenome válido")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongo() {
        // Arrange
        String nomeLongo = "a".repeat(256);
        paciente.setNome(nomeLongo);

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveAceitarEmailValido() {
        // Arrange
        paciente.setEmail("usuario@dominio.com.br");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarEmailComPontos() {
        // Arrange
        paciente.setEmail("usuario.nome@dominio.com.br");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarEmailComCaracteresEspeciais() {
        // Arrange
        paciente.setEmail("usuario-nome+tag@dominio.com.br");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoEmailMuitoLongo() {
        // Arrange
        String emailLongo = "usuario" + "a".repeat(245) + "@dominio.com.br"; // Mais de 255 caracteres
        paciente.setEmail(emailLongo);

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O e-mail não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveRetornarErroQuandoEmailTemEspaco() {
        // Arrange
        paciente.setEmail("usuario nome@dominio.com.br");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Email inválido")));
    }

    @Test
    void deveAceitarDataNascimentoValida() {
        // Arrange
        paciente.setDataNascimento(LocalDate.of(1990, 1, 1));

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarDataNascimentoRecente() {
        // Arrange
        paciente.setDataNascimento(LocalDate.now().minusDays(1));

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoDataNascimentoNula() {
        // Arrange
        paciente.setDataNascimento(null);

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A data de nascimento é obrigatória")));
    }

    @Test
    void deveRetornarErroQuandoDataNascimentoFutura() {
        // Arrange
        paciente.setDataNascimento(LocalDate.now().plusDays(1));

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A data de nascimento não pode ser maior que a data atual")));
    }

    @Test
    void deveAceitarTelefoneFixoValido() {
        // Arrange
        paciente.setTelefone("(11) 3333-3333");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarTelefoneCelularValido() {
        // Arrange
        paciente.setTelefone("(11) 99999-9999");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoTelefoneVazio() {
        // Arrange
        paciente.setTelefone("");

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O telefone é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneInvalido() {
        // Arrange
        paciente.setTelefone("1199999999"); // formato inválido

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 9999-9999 ou (99) 99999-9999")));
    }

    @Test
    void deveAceitarUltimoPedidoNulo() {
        // Arrange
        paciente.setUltimoPedido(null);

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarUltimoPedidoValido() {
        // Arrange
        paciente.setUltimoPedido(LocalDate.now());

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        // Arrange
        paciente.setId(null);
        paciente.setCreatedAt(null);
        paciente.setUpdatedAt(null);
        paciente.setIsActive(null);
        paciente.setCreatedBy(null);
        paciente.setUpdatedBy(null);

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        // Arrange
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        paciente.setId(1L);
        paciente.setCreatedAt(LocalDateTime.now());
        paciente.setUpdatedAt(LocalDateTime.now());
        paciente.setIsActive(true);
        paciente.setCreatedBy(usuario);
        paciente.setUpdatedBy(usuario);

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        // Arrange
        paciente.setNome("");
        paciente.setEmail("email.invalido");
        paciente.setTelefone("1234");
        paciente.setDataNascimento(LocalDate.now().plusDays(1));

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertEquals(4, violations.size(), "Deveria ter 4 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Email inválido")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 9999-9999 ou (99) 99999-9999")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A data de nascimento não pode ser maior que a data atual")));
    }

    @Test
    void deveRetornarErroQuandoNomeEEmailInvalidos() {
        // Arrange
        paciente.setNome("A"); // Nome muito curto
        paciente.setEmail("email@"); // Email inválido

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertEquals(2, violations.size(), "Deveria ter 2 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Por favor, informe nome e sobrenome válido")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Email inválido")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneETamanhoNomeInvalidos() {
        // Arrange
        paciente.setNome("a".repeat(256)); // Nome muito longo
        paciente.setTelefone("(11)99999-9999"); // Falta espaço após DDD

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertEquals(2, violations.size(), "Deveria ter 2 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 9999-9999 ou (99) 99999-9999")));
    }
} 