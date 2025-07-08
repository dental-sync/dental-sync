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
import com.senac.dentalsync.core.persistency.model.Protetico;

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
        categoria.setNome("Categoria Teste");
        
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
        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeValido() {
        // Arrange
        servico.setNome("Serviço de Teste Completo");

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComEspacos() {
        // Arrange
        servico.setNome("Serviço com espaços especiais");

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeVazio() {
        // Arrange
        servico.setNome("");

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "O nome pode ser vazio pois não tem validação @NotBlank");
    }

    @Test
    void deveAceitarNomeNulo() {
        // Arrange
        servico.setNome(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "O nome pode ser nulo pois não tem validação @NotNull");
    }

    @Test
    void deveAceitarCategoriaNula() {
        // Arrange
        servico.setCategoriaServico(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "A categoria pode ser nula");
    }

    @Test
    void deveAceitarCategoriaValida() {
        // Arrange
        CategoriaServico novaCategoria = new CategoriaServico();
        novaCategoria.setId(2L);
        novaCategoria.setNome("Nova Categoria");
        servico.setCategoriaServico(novaCategoria);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarPrecoPositivo() {
        // Arrange
        servico.setPreco(new BigDecimal("199.99"));

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarPrecoZero() {
        // Arrange
        servico.setPreco(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Preço zero deveria ser aceito");
    }

    @Test
    void deveAceitarPrecoNegativo() {
        // Arrange
        servico.setPreco(new BigDecimal("-50.00"));

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Preço negativo deveria ser aceito");
    }

    @Test
    void deveAceitarPrecoNulo() {
        // Arrange
        servico.setPreco(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Preço pode ser nulo");
    }

    @Test
    void deveAceitarValorMateriaisPositivo() {
        // Arrange
        servico.setValorMateriais(new BigDecimal("75.50"));

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarValorMateriaisZero() {
        // Arrange
        servico.setValorMateriais(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Valor de materiais zero deveria ser aceito");
    }

    @Test
    void deveAceitarValorMateriaisNulo() {
        // Arrange
        servico.setValorMateriais(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Valor de materiais pode ser nulo");
    }

    @Test
    void deveAceitarValorTotalPositivo() {
        // Arrange
        servico.setValorTotal(new BigDecimal("275.49"));

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarValorTotalZero() {
        // Arrange
        servico.setValorTotal(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Valor total zero deveria ser aceito");
    }

    @Test
    void deveAceitarValorTotalNulo() {
        // Arrange
        servico.setValorTotal(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Valor total pode ser nulo");
    }

    @Test
    void deveAceitarTempoPrevistoPositivo() {
        // Arrange
        servico.setTempoPrevisto(new BigDecimal("3.5"));

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarTempoPrevistoZero() {
        // Arrange
        servico.setTempoPrevisto(BigDecimal.ZERO);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Tempo previsto zero deveria ser aceito");
    }

    @Test
    void deveAceitarTempoPrevistoNulo() {
        // Arrange
        servico.setTempoPrevisto(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Tempo previsto pode ser nulo");
    }

    @Test
    void deveAceitarDescricaoValida() {
        // Arrange
        servico.setDescricao("Nova descrição do serviço");

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarDescricaoVazia() {
        // Arrange
        servico.setDescricao("");

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Descrição vazia deveria ser aceita");
    }

    @Test
    void deveAceitarDescricaoComEspacos() {
        // Arrange
        servico.setDescricao("Descrição com espaços e caracteres especiais @#$");

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarDescricaoNula() {
        // Arrange
        servico.setDescricao(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Descrição pode ser nula");
    }

    @Test
    void deveAceitarPedidosNulo() {
        // Arrange
        servico.setPedidos(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Lista de pedidos pode ser nula");
    }

    @Test
    void deveAceitarPedidosVazio() {
        // Arrange
        servico.setPedidos(new ArrayList<>());

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Lista de pedidos pode ser vazia");
    }

    @Test
    void deveAceitarMateriaisNulo() {
        // Arrange
        servico.setMateriais(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Lista de materiais pode ser nula");
    }

    @Test
    void deveAceitarMateriaisVazio() {
        // Arrange
        servico.setMateriais(new ArrayList<>());

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Lista de materiais pode ser vazia");
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        // Arrange
        servico.setId(null);
        servico.setCreatedAt(null);
        servico.setUpdatedAt(null);
        servico.setIsActive(null);
        servico.setCreatedBy(null);
        servico.setUpdatedBy(null);

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        servico.setId(1L);
        servico.setCreatedAt(LocalDateTime.now());
        servico.setUpdatedAt(LocalDateTime.now());
        servico.setIsActive(true);
        servico.setCreatedBy(protetico);
        servico.setUpdatedBy(protetico);
        
        Set<ConstraintViolation<Servico>> violations = validator.validate(servico);
        assertTrue(violations.isEmpty(), "Campos do BaseEntity preenchidos deveriam ser aceitos");
    }

    @Test
    void deveAceitarTodosCamposNulos() {
        // Arrange
        Servico servicoVazio = new Servico();

        // Act
        Set<ConstraintViolation<Servico>> violations = validator.validate(servicoVazio);

        // Assert
        assertTrue(violations.isEmpty(), "Serviço deve aceitar todos os campos nulos");
    }

    @Test
    void deveValidarGettersESetters() {
        // Arrange
        String nome = "Serviço Teste";
        String descricao = "Descrição teste";
        BigDecimal preco = new BigDecimal("100.00");
        BigDecimal valorMateriais = new BigDecimal("50.00");
        BigDecimal valorTotal = new BigDecimal("150.00");
        BigDecimal tempoPrevisto = new BigDecimal("2.5");

        // Act
        servico.setNome(nome);
        servico.setDescricao(descricao);
        servico.setPreco(preco);
        servico.setValorMateriais(valorMateriais);
        servico.setValorTotal(valorTotal);
        servico.setTempoPrevisto(tempoPrevisto);
        servico.setCategoriaServico(categoria);

        // Assert
        assertEquals(nome, servico.getNome());
        assertEquals(descricao, servico.getDescricao());
        assertEquals(preco, servico.getPreco());
        assertEquals(valorMateriais, servico.getValorMateriais());
        assertEquals(valorTotal, servico.getValorTotal());
        assertEquals(tempoPrevisto, servico.getTempoPrevisto());
        assertEquals(categoria, servico.getCategoriaServico());
    }

    @Test
    void deveValidarToString() {
        // Act
        String toString = servico.toString();

        // Assert
        assertTrue(toString.contains("Servico"));
        assertTrue(toString.contains("nome=Serviço Teste"));
    }

    @Test
    void deveValidarEqualsEHashCode() {
        // Arrange
        CategoriaServico categoria = new CategoriaServico();
        categoria.setNome("Categoria Teste");

        Servico servico1 = new Servico();
        servico1.setNome("Serviço Teste");
        servico1.setCategoriaServico(categoria);
        servico1.setPreco(new BigDecimal("100.00"));
        servico1.setValorMateriais(new BigDecimal("50.00"));
        servico1.setValorTotal(new BigDecimal("150.00"));
        servico1.setTempoPrevisto(new BigDecimal("2.0"));
        servico1.setDescricao("Descrição do serviço teste");
        servico1.setPedidos(new ArrayList<>());
        servico1.setMateriais(new ArrayList<>());

        Servico servico2 = new Servico();
        servico2.setNome("Serviço Teste");
        servico2.setCategoriaServico(categoria);
        servico2.setPreco(new BigDecimal("100.00"));
        servico2.setValorMateriais(new BigDecimal("50.00"));
        servico2.setValorTotal(new BigDecimal("150.00"));
        servico2.setTempoPrevisto(new BigDecimal("2.0"));
        servico2.setDescricao("Descrição do serviço teste");
        servico2.setPedidos(new ArrayList<>());
        servico2.setMateriais(new ArrayList<>());

        // Act & Assert
        assertEquals(servico1, servico2, "Serviços com os mesmos dados deveriam ser iguais");
        assertEquals(servico1.hashCode(), servico2.hashCode(), "HashCodes deveriam ser iguais");
    }
} 