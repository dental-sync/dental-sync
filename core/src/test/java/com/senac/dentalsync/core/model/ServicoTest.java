package com.senac.dentalsync.core.model;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.model.CategoriaServico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.model.Usuario;

public class ServicoTest {

    private Validator validator;
    private Servico servico;
    private CategoriaServico categoria;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        categoria = new CategoriaServico();
        categoria.setId(1L);
        
        // Configuração padrão de um serviço válido para os testes
        servico = new Servico();
        servico.setNome("Serviço Teste");
        servico.setCategoriaServico(categoria);
        servico.setPreco(new BigDecimal("100.00"));
        servico.setValorMateriais(new BigDecimal("50.00"));
        servico.setValorTotal(new BigDecimal("150.00"));
        servico.setTempoPrevisto(new BigDecimal("2.0"));
        servico.setDescricao("Descrição do serviço teste");
        servico.setPedidos(new ArrayList<>());
        servico.setMateriais(new ArrayList<>());
    }

    @Test
    void deveCriarServicoValido() {
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeValido() {
        servico.setNome("Serviço de Teste Completo");
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarNomeNulo() {
        servico.setNome(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCategoriaNula() {
        servico.setCategoriaServico(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCategoriaValida() {
        CategoriaServico novaCategoria = new CategoriaServico();
        novaCategoria.setId(2L);
        servico.setCategoriaServico(novaCategoria);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarPrecoValido() {
        servico.setPreco(new BigDecimal("199.99"));
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarPrecoNulo() {
        servico.setPreco(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarValorMateriaisValido() {
        servico.setValorMateriais(new BigDecimal("75.50"));
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarValorMateriaisNulo() {
        servico.setValorMateriais(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarValorTotalValido() {
        servico.setValorTotal(new BigDecimal("275.49"));
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarValorTotalNulo() {
        servico.setValorTotal(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarTempoPrevistoValido() {
        servico.setTempoPrevisto(new BigDecimal("3.5"));
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarTempoPrevistoNulo() {
        servico.setTempoPrevisto(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarDescricaoValida() {
        servico.setDescricao("Nova descrição do serviço");
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarDescricaoNula() {
        servico.setDescricao(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarPedidosNulo() {
        servico.setPedidos(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarMateriaisNulo() {
        servico.setMateriais(null);
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarMateriaisVazio() {
        servico.setMateriais(new ArrayList<>());
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        servico.setId(null);
        servico.setCreatedAt(null);
        servico.setUpdatedAt(null);
        servico.setIsActive(null);
        servico.setCreatedBy(null);
        servico.setUpdatedBy(null);

        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        servico.setId(1L);
        servico.setCreatedAt(LocalDateTime.now());
        servico.setUpdatedAt(LocalDateTime.now());
        servico.setIsActive(true);
        servico.setCreatedBy(usuario);
        servico.setUpdatedBy(usuario);

        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarTodosCamposNulos() {
        Servico servicoVazio = new Servico();
        Set<ConstraintViolation<Servico>> violations = validator.validate(servicoVazio);
        assertTrue(violations.isEmpty(), "Serviço deve aceitar todos os campos nulos");
    }
} 