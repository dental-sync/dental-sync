package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.CategoriaServico;
import com.senac.dentalsync.core.persistency.model.Usuario;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class CategoriaServicoTest {

    private Validator validator;
    private CategoriaServico categoria;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        categoria = new CategoriaServico();
    }

    @Test
    void deveCriarCategoriaValida() {
        categoria.setNome("Categoria Teste");
        var violations = validator.validate(categoria);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarTamanhoMaximoNome() {
        // Nome > 40 caracteres
        categoria.setNome("a".repeat(41));
        var violations = validator.validate(categoria);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("nome da categoria deve ter no máximo 40 caracteres")));

        // Nome válido
        categoria.setNome("Categoria Teste");
        violations = validator.validate(categoria);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarNomeNulo() {
        var violations = validator.validate(categoria);
        assertTrue(violations.isEmpty(), "O nome pode ser nulo pois não tem @NotNull ou @NotBlank");
    }

    @Test
    void deveValidarGettersESetters() {
        String nome = "Categoria Teste";
        categoria.setNome(nome);
        assertEquals(nome, categoria.getNome());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        categoria.setNome("Categoria Teste");
        
        categoria.setId(null);
        categoria.setCreatedAt(null);
        categoria.setUpdatedAt(null);
        categoria.setIsActive(null);
        categoria.setCreatedBy(null);
        categoria.setUpdatedBy(null);

        var violations = validator.validate(categoria);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        categoria.setNome("Categoria Teste");
        
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        categoria.setId(1L);
        categoria.setCreatedAt(LocalDateTime.now());
        categoria.setUpdatedAt(LocalDateTime.now());
        categoria.setIsActive(true);
        categoria.setCreatedBy(usuario);
        categoria.setUpdatedBy(usuario);

        var violations = validator.validate(categoria);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarEqualsEHashCode() {
        CategoriaServico categoria1 = new CategoriaServico();
        categoria1.setNome("Categoria 1");

        CategoriaServico categoria2 = new CategoriaServico();
        categoria2.setNome("Categoria 1");

        CategoriaServico categoria3 = new CategoriaServico();
        categoria3.setNome("Categoria 2");

        // Teste equals - Como usa @Data do Lombok, compara todos os campos
        assertEquals(categoria1, categoria2);
        assertNotEquals(categoria1, categoria3);

        // Teste hashCode
        assertEquals(categoria1.hashCode(), categoria2.hashCode());
        assertNotEquals(categoria1.hashCode(), categoria3.hashCode());
    }
} 