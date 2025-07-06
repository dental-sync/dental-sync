package com.senac.dentalsync.core.model;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.CategoriaMaterial;
import com.senac.dentalsync.core.persistency.model.StatusMaterial;
import com.senac.dentalsync.core.persistency.model.Protetico;

public class MaterialTest {

    private Validator validator;
    private Material material;
    private CategoriaMaterial categoria;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        categoria = new CategoriaMaterial();
        categoria.setId(1L);
        categoria.setNome("Categoria Teste");
        
        // Configuração padrão de um material válido para os testes
        material = new Material();
        material.setNome("Material Teste");
        material.setCategoriaMaterial(categoria);
        material.setQuantidade(new BigDecimal("10.0"));
        material.setUnidadeMedida("UN");
        material.setValorUnitario(new BigDecimal("50.0"));
        material.setEstoqueMinimo(new BigDecimal("5.0"));
        material.setStatus(StatusMaterial.EM_ESTOQUE);
    }

    @Test
    void deveCriarMaterialValido() {
     
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeValido() {
        // Arrange
        material.setNome("Material de Teste Completo");

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeNulo() {
        // Arrange
        material.setNome(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "O nome pode ser nulo pois não tem validação @NotNull");
    }

    @Test
    void deveAceitarNomeVazio() {
        // Arrange
        material.setNome("");

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "O nome pode ser vazio pois não tem validação @NotBlank");
    }

    @Test
    void deveAceitarNomeComEspacos() {
        // Arrange
        material.setNome("Material com espaços");

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCategoriaNula() {
        // Arrange
        material.setCategoriaMaterial(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "A categoria pode ser nula");
    }

    @Test
    void deveAceitarCategoriaValida() {
        // Arrange
        CategoriaMaterial novaCategoria = new CategoriaMaterial();
        novaCategoria.setId(2L);
        novaCategoria.setNome("Nova Categoria");
        material.setCategoriaMaterial(novaCategoria);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarQuantidadePositiva() {
        // Arrange
        material.setQuantidade(new BigDecimal("100.50"));

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarQuantidadeZero() {
        // Arrange
        material.setQuantidade(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarQuantidadeNegativa() {
        // Arrange
        material.setQuantidade(new BigDecimal("-10.0"));

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Quantidade negativa deveria ser aceita");
    }

    @Test
    void deveAceitarQuantidadeNula() {
        // Arrange
        material.setQuantidade(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Quantidade pode ser nula");
    }

    @Test
    void deveAceitarUnidadeMedidaValida() {
        // Arrange
        material.setUnidadeMedida("KG");

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarUnidadeMedidaComAbreviacao() {
        // Arrange
        material.setUnidadeMedida("ML");

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarUnidadeMedidaNula() {
        // Arrange
        material.setUnidadeMedida(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Unidade de medida pode ser nula");
    }

    @Test
    void deveAceitarValorUnitarioPositivo() {
        // Arrange
        material.setValorUnitario(new BigDecimal("199.99"));

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarValorUnitarioZero() {
        // Arrange
        material.setValorUnitario(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Valor unitário zero deveria ser aceito");
    }

    @Test
    void deveAceitarValorUnitarioNegativo() {
        // Arrange
        material.setValorUnitario(new BigDecimal("-50.0"));

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Valor unitário negativo deveria ser aceito");
    }

    @Test
    void deveAceitarValorUnitarioNulo() {
        // Arrange
        material.setValorUnitario(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Valor unitário pode ser nulo");
    }

    @Test
    void deveAceitarEstoqueMinimoPositivo() {
        // Arrange
        material.setEstoqueMinimo(new BigDecimal("10.0"));

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarEstoqueMinimoZero() {
        // Arrange
        material.setEstoqueMinimo(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Estoque mínimo zero deveria ser aceito");
    }

    @Test
    void deveAceitarEstoqueMinimoNulo() {
        // Arrange
        material.setEstoqueMinimo(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Estoque mínimo pode ser nulo");
    }

    @Test
    void deveAceitarStatusEmEstoque() {
        // Arrange
        material.setStatus(StatusMaterial.EM_ESTOQUE);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarStatusSemEstoque() {
        // Arrange
        material.setStatus(StatusMaterial.SEM_ESTOQUE);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarStatusNulo() {
        // Arrange
        material.setStatus(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Status pode ser nulo");
    }

    @Test
    void deveAceitarQtdUsadaPositiva() {
        // Arrange
        material.setQtdUsada(new BigDecimal("5.0"));

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarQtdUsadaZero() {
        // Arrange
        material.setQtdUsada(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Quantidade usada zero deveria ser aceita");
    }

    @Test
    void deveAceitarQtdUsadaNula() {
        // Arrange
        material.setQtdUsada(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Quantidade usada pode ser nula");
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        // Arrange
        material.setId(null);
        material.setCreatedAt(null);
        material.setUpdatedAt(null);
        material.setIsActive(null);
        material.setCreatedBy(null);
        material.setUpdatedBy(null);

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(material);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        material.setId(1L);
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        material.setIsActive(true);
        material.setCreatedBy(protetico);
        material.setUpdatedBy(protetico);
        
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty(), "Campos do BaseEntity preenchidos deveriam ser aceitos");
    }

    @Test
    void deveAceitarTodosCamposNulos() {
        // Arrange
        Material materialVazio = new Material();

        // Act
        Set<ConstraintViolation<Material>> violations = validator.validate(materialVazio);

        // Assert
        assertTrue(violations.isEmpty(), "Material deve aceitar todos os campos nulos");
    }

    @Test
    void deveValidarGettersESetters() {
        // Arrange
        String nome = "Material Teste";
        BigDecimal quantidade = new BigDecimal("15.5");
        String unidadeMedida = "KG";
        BigDecimal valorUnitario = new BigDecimal("75.0");
        BigDecimal estoqueMinimo = new BigDecimal("3.0");
        BigDecimal qtdUsada = new BigDecimal("2.5");

        // Act
        material.setNome(nome);
        material.setQuantidade(quantidade);
        material.setUnidadeMedida(unidadeMedida);
        material.setValorUnitario(valorUnitario);
        material.setEstoqueMinimo(estoqueMinimo);
        material.setQtdUsada(qtdUsada);
        material.setStatus(StatusMaterial.EM_ESTOQUE);
        material.setCategoriaMaterial(categoria);

        // Assert
        assertEquals(nome, material.getNome());
        assertEquals(quantidade, material.getQuantidade());
        assertEquals(unidadeMedida, material.getUnidadeMedida());
        assertEquals(valorUnitario, material.getValorUnitario());
        assertEquals(estoqueMinimo, material.getEstoqueMinimo());
        assertEquals(qtdUsada, material.getQtdUsada());
        assertEquals(StatusMaterial.EM_ESTOQUE, material.getStatus());
        assertEquals(categoria, material.getCategoriaMaterial());
    }

    @Test
    void deveValidarToString() {
        // Act
        String toString = material.toString();

        // Assert
        assertTrue(toString.contains("Material"));
        assertTrue(toString.contains("nome=Material Teste"));
    }
} 