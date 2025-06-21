package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.CategoriaMaterial;
import com.senac.dentalsync.core.persistency.model.Protetico;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class CategoriaMaterialTest {

    private Validator validator;
    private CategoriaMaterial categoria;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        categoria = new CategoriaMaterial();
    }

    @Test
    void deveCriarCategoriaValida() {
        // Arrange
        categoria.setNome("Categoria Teste");

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComTamanhoMaximo() {
        // Arrange - 40 caracteres exatos
        categoria.setNome("a".repeat(40));

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComTamanhoMinimo() {
        // Arrange - 1 caractere
        categoria.setNome("A");

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComEspacos() {
        // Arrange
        categoria.setNome("Categoria com espaços");

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComCaracteresEspeciais() {
        // Arrange
        categoria.setNome("Categoria-Teste_123");

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongo() {
        // Arrange - 41 caracteres
        categoria.setNome("a".repeat(41));

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertEquals(1, violations.size());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome da categoria deve ter no máximo 40 caracteres")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongoComMuitosCaracteres() {
        // Arrange - 100 caracteres
        categoria.setNome("a".repeat(100));

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertEquals(1, violations.size());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome da categoria deve ter no máximo 40 caracteres")));
    }

    @Test
    void deveAceitarNomeNulo() {
        // Arrange
        categoria.setNome(null);

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "O nome pode ser nulo pois não tem @NotNull ou @NotBlank");
    }

    @Test
    void deveAceitarNomeVazio() {
        // Arrange
        categoria.setNome("");

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "O nome pode ser vazio pois não tem @NotBlank");
    }

    @Test
    void deveValidarGettersESetters() {
        // Arrange
        String nome = "Categoria Teste";

        // Act
        categoria.setNome(nome);

        // Assert
        assertEquals(nome, categoria.getNome());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        // Arrange
        categoria.setNome("Categoria Teste");
        categoria.setId(null);
        categoria.setCreatedAt(null);
        categoria.setUpdatedAt(null);
        categoria.setIsActive(null);
        categoria.setCreatedBy(null);
        categoria.setUpdatedBy(null);

        // Act
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        categoria.setId(1L);
        categoria.setCreatedAt(LocalDateTime.now());
        categoria.setUpdatedAt(LocalDateTime.now());
        categoria.setIsActive(true);
        categoria.setCreatedBy(protetico);
        categoria.setUpdatedBy(protetico);
        
        Set<ConstraintViolation<CategoriaMaterial>> violations = validator.validate(categoria);
        assertTrue(violations.isEmpty(), "Campos do BaseEntity preenchidos deveriam ser aceitos");
    }

    @Test
    void deveValidarEqualsEHashCode() {
        // Arrange
        CategoriaMaterial categoria1 = new CategoriaMaterial();
        categoria1.setNome("Categoria 1");

        CategoriaMaterial categoria2 = new CategoriaMaterial();
        categoria2.setNome("Categoria 1");

        CategoriaMaterial categoria3 = new CategoriaMaterial();
        categoria3.setNome("Categoria 2");

        // Act & Assert - Como usa @Data do Lombok, compara todos os campos
        assertEquals(categoria1, categoria2);
        assertNotEquals(categoria1, categoria3);

        // Teste hashCode
        assertEquals(categoria1.hashCode(), categoria2.hashCode());
        assertNotEquals(categoria1.hashCode(), categoria3.hashCode());
    }

    @Test
    void deveValidarToString() {
        // Arrange
        categoria.setNome("Categoria Teste");

        // Act
        String toString = categoria.toString();

        // Assert
        assertTrue(toString.contains("nome=Categoria Teste"));
        assertTrue(toString.contains("CategoriaMaterial"));
    }
} 