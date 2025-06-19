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
    private EnderecoLaboratorio enderecoLaboratorio;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        enderecoLaboratorio = new EnderecoLaboratorio();
    }

    @Test
    void deveCriarEnderecoLaboratorioValido() {
        configurarEnderecoValido();
        var violations = validator.validate(enderecoLaboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        enderecoLaboratorio.setId(null);
        enderecoLaboratorio.setCreatedAt(null);
        enderecoLaboratorio.setUpdatedAt(null);
        enderecoLaboratorio.setIsActive(null);
        enderecoLaboratorio.setCreatedBy(null);
        enderecoLaboratorio.setUpdatedBy(null);

        var violations = validator.validate(enderecoLaboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        enderecoLaboratorio.setId(1L);
        enderecoLaboratorio.setCreatedAt(LocalDateTime.now());
        enderecoLaboratorio.setUpdatedAt(LocalDateTime.now());
        enderecoLaboratorio.setIsActive(true);
        enderecoLaboratorio.setCreatedBy(usuario);
        enderecoLaboratorio.setUpdatedBy(usuario);

        var violations = validator.validate(enderecoLaboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarTodosCamposNulos() {
        var violations = validator.validate(enderecoLaboratorio);
        assertTrue(violations.isEmpty(), "Todos os campos devem aceitar valores nulos");
    }

    @Test
    void deveAceitarCepValido() {
        String[] cepsValidos = {
            "12345-678",
            "87654-321",
            "00000-000"
        };

        for (String cep : cepsValidos) {
            enderecoLaboratorio.setCep(cep);
            var violations = validator.validate(enderecoLaboratorio);
            assertTrue(violations.isEmpty(), "CEP " + cep + " deveria ser válido");
        }
    }

    @Test
    void deveValidarTamanhoMaximoCampos() {
        String textoLongo = "a".repeat(256); // Maior que o tamanho máximo padrão do VARCHAR

        enderecoLaboratorio.setCep(textoLongo);
        enderecoLaboratorio.setLogradouro(textoLongo);
        enderecoLaboratorio.setNumero(textoLongo);
        enderecoLaboratorio.setBairro(textoLongo);
        enderecoLaboratorio.setCidade(textoLongo);
        enderecoLaboratorio.setEstado(textoLongo);

        var violations = validator.validate(enderecoLaboratorio);
        assertTrue(violations.isEmpty(), "Campos devem aceitar textos longos pois não há restrição de tamanho");
    }

    @Test
    void deveValidarGettersESetters() {
        String cep = "12345-678";
        String logradouro = "Rua Teste";
        String numero = "123";
        String bairro = "Bairro Teste";
        String cidade = "Cidade Teste";
        String estado = "SP";

        enderecoLaboratorio.setCep(cep);
        enderecoLaboratorio.setLogradouro(logradouro);
        enderecoLaboratorio.setNumero(numero);
        enderecoLaboratorio.setBairro(bairro);
        enderecoLaboratorio.setCidade(cidade);
        enderecoLaboratorio.setEstado(estado);

        assertEquals(cep, enderecoLaboratorio.getCep());
        assertEquals(logradouro, enderecoLaboratorio.getLogradouro());
        assertEquals(numero, enderecoLaboratorio.getNumero());
        assertEquals(bairro, enderecoLaboratorio.getBairro());
        assertEquals(cidade, enderecoLaboratorio.getCidade());
        assertEquals(estado, enderecoLaboratorio.getEstado());
    }

    private void configurarEnderecoValido() {
        enderecoLaboratorio.setCep("12345-678");
        enderecoLaboratorio.setLogradouro("Rua Teste");
        enderecoLaboratorio.setNumero("123");
        enderecoLaboratorio.setBairro("Bairro Teste");
        enderecoLaboratorio.setCidade("Cidade Teste");
        enderecoLaboratorio.setEstado("SP");
    }
} 