package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.*;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

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
        configurarServicoMaterialValido();
        var violations = validator.validate(servicoMaterial);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarConstrutorComParametros() {
        BigDecimal quantidade = new BigDecimal("10.5");
        ServicoMaterial sm = new ServicoMaterial(servico, material, quantidade);

        assertEquals(servico, sm.getServico());
        assertEquals(material, sm.getMaterial());
        assertEquals(quantidade, sm.getQuantidade());
        assertEquals(servico.getId(), sm.getId().getServicoId());
        assertEquals(material.getId(), sm.getId().getMaterialId());
    }

    @Test
    void deveValidarGettersESetters() {
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);
        BigDecimal quantidade = new BigDecimal("10.5");

        servicoMaterial.setId(id);
        servicoMaterial.setServico(servico);
        servicoMaterial.setMaterial(material);
        servicoMaterial.setQuantidade(quantidade);

        assertEquals(id, servicoMaterial.getId());
        assertEquals(servico, servicoMaterial.getServico());
        assertEquals(material, servicoMaterial.getMaterial());
        assertEquals(quantidade, servicoMaterial.getQuantidade());
    }

    @Test
    void deveValidarEqualsEHashCode() {
        ServicoMaterial sm1 = new ServicoMaterial(servico, material, new BigDecimal("10.5"));
        ServicoMaterial sm2 = new ServicoMaterial(servico, material, new BigDecimal("10.5"));
        ServicoMaterial sm3 = new ServicoMaterial(servico, material, new BigDecimal("20.0"));

        // Teste equals - Como usa @Data do Lombok, compara todos os campos
        assertEquals(sm1, sm2);
        assertNotEquals(sm1, sm3); // Diferentes quantidades

        // Teste hashCode
        assertEquals(sm1.hashCode(), sm2.hashCode());
        assertNotEquals(sm1.hashCode(), sm3.hashCode());
    }

    @Test
    void deveValidarServicoMaterialId() {
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id3 = new ServicoMaterialId(2L, 2L);

        // Teste equals
        assertEquals(id1, id2);
        assertNotEquals(id1, id3);

        // Teste hashCode
        assertEquals(id1.hashCode(), id2.hashCode());
        assertNotEquals(id1.hashCode(), id3.hashCode());
    }

    private void configurarServicoMaterialValido() {
        servicoMaterial.setId(new ServicoMaterialId(1L, 2L));
        servicoMaterial.setServico(servico);
        servicoMaterial.setMaterial(material);
        servicoMaterial.setQuantidade(new BigDecimal("10.5"));
    }
} 