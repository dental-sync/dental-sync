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
import com.senac.dentalsync.core.persistency.model.Protetico;

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
      
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

     @Test
    void deveRetornarErroQuandoDataNascimentoNula() {
       
        paciente.setDataNascimento(null);
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A data de nascimento é obrigatória")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongo() {
        
        String nomeLongo = "a".repeat(256);
        paciente.setNome(nomeLongo);
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
    }

    @Test
    void deveRetornarErroQuandoNomeVazio() {
        
        paciente.setNome("");
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveAceitarNomeCompletoValido() {

        paciente.setNome("Maria José da Silva Santos");
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }


    @Test
    void deveAceitarNomeCompostoValido() {
    
        paciente.setNome("Anna Maria Souza");
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);
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
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        paciente.setId(1L);
        paciente.setCreatedAt(LocalDateTime.now());
        paciente.setUpdatedAt(LocalDateTime.now());
        paciente.setIsActive(true);
        paciente.setCreatedBy(protetico);
        paciente.setUpdatedBy(protetico);
        
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);
        assertTrue(violations.isEmpty(), "Campos do BaseEntity preenchidos deveriam ser aceitos");
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        // Arrange
        paciente.setNome("A a"); // Nome muito curto
        paciente.setEmail("email.invalido@");
        paciente.setTelefone("1234");
        paciente.setDataNascimento(LocalDate.now().plusDays(1));

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertEquals(5, violations.size(), "Deveria ter 5 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Por favor, informe nome e sobrenome válido")));
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
        paciente.setNome("A A"); // Nome muito curto
        paciente.setEmail("email@"); // Email inválido (viola @Email e o padrão .com)

        // Act
        Set<ConstraintViolation<Paciente>> violations = validator.validate(paciente);

        // Assert
        assertEquals(3, violations.size(), "Deveria ter 3 violações de validação: 1 para nome e 2 para email");
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
        assertEquals(3, violations.size(), "Deveria ter 3 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome não pode ultrapassar 255 caracteres")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 9999-9999 ou (99) 99999-9999")));
    }
} 