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
import com.senac.dentalsync.core.persistency.model.Usuario;

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
        material.setNome("Material de Teste Completo");
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCategoriaNula() {
        material.setCategoriaMaterial(null);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCategoriaValida() {
        CategoriaMaterial novaCategoria = new CategoriaMaterial();
        novaCategoria.setId(2L);
        material.setCategoriaMaterial(novaCategoria);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarQuantidadeValida() {
        material.setQuantidade(new BigDecimal("100.50"));
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarQuantidadeNula() {
        material.setQuantidade(null);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarUnidadeMedidaValida() {
        material.setUnidadeMedida("KG");
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarUnidadeMedidaNula() {
        material.setUnidadeMedida(null);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarValorUnitarioValido() {
        material.setValorUnitario(new BigDecimal("199.99"));
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarValorUnitarioNulo() {
        material.setValorUnitario(null);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarEstoqueMinimoValido() {
        material.setEstoqueMinimo(new BigDecimal("10.0"));
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarEstoqueMinimoNulo() {
        material.setEstoqueMinimo(null);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarStatusValido() {
        material.setStatus(StatusMaterial.SEM_ESTOQUE);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarStatusNulo() {
        material.setStatus(null);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarQtdUsadaValida() {
        material.setQtdUsada(new BigDecimal("5.0"));
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarQtdUsadaNula() {
        material.setQtdUsada(null);
        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        material.setId(null);
        material.setCreatedAt(null);
        material.setUpdatedAt(null);
        material.setIsActive(null);
        material.setCreatedBy(null);
        material.setUpdatedBy(null);

        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        material.setId(1L);
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        material.setIsActive(true);
        material.setCreatedBy(usuario);
        material.setUpdatedBy(usuario);

        Set<ConstraintViolation<Material>> violations = validator.validate(material);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarTodosCamposNulos() {
        Material materialVazio = new Material();
        Set<ConstraintViolation<Material>> violations = validator.validate(materialVazio);
        assertTrue(violations.isEmpty(), "Material deve aceitar todos os campos nulos");
    }
} 