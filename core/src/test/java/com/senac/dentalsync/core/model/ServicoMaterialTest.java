package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ServicoMaterialTest {

    private Validator validator;
    private ServicoMaterial servicoMaterial;
    private Servico servico;
    private Material material;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        servico = new Servico();
        servico.setId(1L);
        servico.setNome("Serviço Teste");

        material = new Material();
        material.setId(2L);
        material.setNome("Material Teste");

        servicoMaterial = new ServicoMaterial();
    }

    @Test
    void deveCriarServicoMaterialValido() {
        // Arrange
        configurarServicoMaterialValido();

        // Act
        Set<ConstraintViolation<ServicoMaterial>> violations = validator.validate(servicoMaterial);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveValidarConstrutorComParametros() {
        // Arrange
        BigDecimal quantidade = new BigDecimal("10.5");

        // Act
        ServicoMaterial sm = new ServicoMaterial(servico, material, quantidade);

        // Assert
        assertEquals(servico, sm.getServico());
        assertEquals(material, sm.getMaterial());
        assertEquals(quantidade, sm.getQuantidade());
        assertEquals(servico.getId(), sm.getId().getServicoId());
        assertEquals(material.getId(), sm.getId().getMaterialId());
    }

    @Test
    void deveValidarConstrutorVazio() {
        // Act
        ServicoMaterial sm = new ServicoMaterial();

        // Assert
        assertNotNull(sm.getId());
        assertNull(sm.getServico());
        assertNull(sm.getMaterial());
        assertNull(sm.getQuantidade());
    }

    @Test
    void deveAceitarQuantidadeZero() {
        // Arrange
        configurarServicoMaterialValido();
        servicoMaterial.setQuantidade(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<ServicoMaterial>> violations = validator.validate(servicoMaterial);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarQuantidadePositiva() {
        // Arrange
        configurarServicoMaterialValido();
        servicoMaterial.setQuantidade(new BigDecimal("100.50"));

        // Act
        Set<ConstraintViolation<ServicoMaterial>> violations = validator.validate(servicoMaterial);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarQuantidadeNegativa() {
        // Arrange
        configurarServicoMaterialValido();
        servicoMaterial.setQuantidade(new BigDecimal("-10.5"));

        // Act
        Set<ConstraintViolation<ServicoMaterial>> violations = validator.validate(servicoMaterial);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarQuantidadeNula() {
        // Arrange
        configurarServicoMaterialValido();
        servicoMaterial.setQuantidade(null);

        // Act
        Set<ConstraintViolation<ServicoMaterial>> violations = validator.validate(servicoMaterial);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarServicoNulo() {
        // Arrange
        configurarServicoMaterialValido();
        servicoMaterial.setServico(null);

        // Act
        Set<ConstraintViolation<ServicoMaterial>> violations = validator.validate(servicoMaterial);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarMaterialNulo() {
        // Arrange
        configurarServicoMaterialValido();
        servicoMaterial.setMaterial(null);

        // Act
        Set<ConstraintViolation<ServicoMaterial>> violations = validator.validate(servicoMaterial);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveValidarGettersESetters() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);
        BigDecimal quantidade = new BigDecimal("10.5");

        // Act
        servicoMaterial.setId(id);
        servicoMaterial.setServico(servico);
        servicoMaterial.setMaterial(material);
        servicoMaterial.setQuantidade(quantidade);

        // Assert
        assertEquals(id, servicoMaterial.getId());
        assertEquals(servico, servicoMaterial.getServico());
        assertEquals(material, servicoMaterial.getMaterial());
        assertEquals(quantidade, servicoMaterial.getQuantidade());
    }

    @Test
    void deveValidarEqualsEHashCode() {
        // Arrange
        ServicoMaterial sm1 = new ServicoMaterial(servico, material, new BigDecimal("10.5"));
        ServicoMaterial sm2 = new ServicoMaterial(servico, material, new BigDecimal("10.5"));
        ServicoMaterial sm3 = new ServicoMaterial(servico, material, new BigDecimal("20.0"));

        // Act & Assert - Como usa @Data do Lombok, compara todos os campos
        assertEquals(sm1, sm2);
        assertNotEquals(sm1, sm3); // Diferentes quantidades

        // Teste hashCode
        assertEquals(sm1.hashCode(), sm2.hashCode());
        assertNotEquals(sm1.hashCode(), sm3.hashCode());
    }

    @Test
    void deveValidarToString() {
        // Arrange
        configurarServicoMaterialValido();

        // Act
        String toString = servicoMaterial.toString();

        // Assert
        assertTrue(toString.contains("ServicoMaterial"));
        assertTrue(toString.contains("quantidade=10.5"));
    }

    @Test
    void deveValidarServicoMaterialIdSeparadamente() {
        // Arrange
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id3 = new ServicoMaterialId(2L, 2L);

        // Act & Assert
        assertEquals(id1, id2);
        assertNotEquals(id1, id3);

        // Teste hashCode
        assertEquals(id1.hashCode(), id2.hashCode());
        assertNotEquals(id1.hashCode(), id3.hashCode());
    }

    @Test
    void deveValidarRelacionamentoComServico() {
        // Arrange
        Servico novoServico = new Servico();
        novoServico.setId(3L);
        novoServico.setNome("Novo Serviço");

        // Act
        servicoMaterial.setServico(novoServico);

        // Assert
        assertEquals(novoServico, servicoMaterial.getServico());
        assertEquals("Novo Serviço", servicoMaterial.getServico().getNome());
    }

    @Test
    void deveValidarRelacionamentoComMaterial() {
        // Arrange
        Material novoMaterial = new Material();
        novoMaterial.setId(4L);
        novoMaterial.setNome("Novo Material");

        // Act
        servicoMaterial.setMaterial(novoMaterial);

        // Assert
        assertEquals(novoMaterial, servicoMaterial.getMaterial());
        assertEquals("Novo Material", servicoMaterial.getMaterial().getNome());
    }

    private void configurarServicoMaterialValido() {
        servicoMaterial.setId(new ServicoMaterialId(1L, 2L));
        servicoMaterial.setServico(servico);
        servicoMaterial.setMaterial(material);
        servicoMaterial.setQuantidade(new BigDecimal("10.5"));
    }
} 