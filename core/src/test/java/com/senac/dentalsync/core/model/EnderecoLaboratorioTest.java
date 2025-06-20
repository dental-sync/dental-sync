package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.EnderecoLaboratorio;
import com.senac.dentalsync.core.persistency.model.Usuario;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class EnderecoLaboratorioTest {

    private Validator validator;
    private EnderecoLaboratorio endereco;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        endereco = new EnderecoLaboratorio();
    }

    @Test
    void deveCriarEnderecoValido() {
        configurarEnderecoValido();
        var violations = validator.validate(endereco);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErrosQuandoCamposObrigatoriosAusentes() {
        var violations = validator.validate(endereco);
        assertEquals(6, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("CEP é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("logradouro é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("número é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("bairro é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("cidade é obrigatória")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("estado é obrigatório")));
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        configurarEnderecoValido();
        
        endereco.setId(null);
        endereco.setCreatedAt(null);
        endereco.setUpdatedAt(null);
        endereco.setIsActive(null);
        endereco.setCreatedBy(null);
        endereco.setUpdatedBy(null);

        var violations = validator.validate(endereco);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        configurarEnderecoValido();
        
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        endereco.setId(1L);
        endereco.setCreatedAt(LocalDateTime.now());
        endereco.setUpdatedAt(LocalDateTime.now());
        endereco.setIsActive(true);
        endereco.setCreatedBy(usuario);
        endereco.setUpdatedBy(usuario);

        var violations = validator.validate(endereco);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarTamanhoMaximoCampos() {
        configurarEnderecoValido();
        
        // Logradouro > 100
        endereco.setLogradouro("a".repeat(101));
        var violations = validator.validate(endereco);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("logradouro deve ter no máximo 100")));

        // Número > 10
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("a".repeat(11));
        violations = validator.validate(endereco);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("número deve ter no máximo 10")));

        // Bairro > 50
        endereco.setNumero("123");
        endereco.setBairro("a".repeat(51));
        violations = validator.validate(endereco);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("bairro deve ter no máximo 50")));

        // Cidade > 50
        endereco.setBairro("Centro");
        endereco.setCidade("a".repeat(51));
        violations = validator.validate(endereco);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("cidade deve ter no máximo 50")));
    }

    @Test
    void deveValidarEstadoComDoisCaracteres() {
        configurarEnderecoValido();
        
        // Estado com 1 caractere
        endereco.setEstado("S");
        var violations = validator.validate(endereco);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("estado deve ter exatamente 2")));

        // Estado com 3 caracteres
        endereco.setEstado("SPP");
        violations = validator.validate(endereco);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("estado deve ter exatamente 2")));

        // Estado válido
        endereco.setEstado("SP");
        violations = validator.validate(endereco);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarGettersESetters() {
        String cep = "12345678";
        String logradouro = "Rua Teste";
        String numero = "123";
        String bairro = "Centro";
        String cidade = "São Paulo";
        String estado = "SP";

        endereco.setCep(cep);
        endereco.setLogradouro(logradouro);
        endereco.setNumero(numero);
        endereco.setBairro(bairro);
        endereco.setCidade(cidade);
        endereco.setEstado(estado);

        assertEquals(cep, endereco.getCep());
        assertEquals(logradouro, endereco.getLogradouro());
        assertEquals(numero, endereco.getNumero());
        assertEquals(bairro, endereco.getBairro());
        assertEquals(cidade, endereco.getCidade());
        assertEquals(estado, endereco.getEstado());
    }

    private void configurarEnderecoValido() {
        endereco.setCep("12345678");
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("123");
        endereco.setBairro("Centro");
        endereco.setCidade("São Paulo");
        endereco.setEstado("SP");
    }
} 