package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.EnderecoLaboratorio;
import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Usuario;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class LaboratorioTest {

    private Validator validator;
    private Laboratorio laboratorio;
    private EnderecoLaboratorio endereco;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        laboratorio = new Laboratorio();
        endereco = new EnderecoLaboratorio();
        
        // Configurando endereço válido
        endereco.setCep("12345-678");
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("123");
        endereco.setBairro("Bairro Teste");
        endereco.setCidade("Cidade Teste");
        endereco.setEstado("SP");
    }

    @Test
    void deveCriarLaboratorioValido() {
        configurarLaboratorioValido();
        var violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        laboratorio.setId(null);
        laboratorio.setCreatedAt(null);
        laboratorio.setUpdatedAt(null);
        laboratorio.setIsActive(null);
        laboratorio.setCreatedBy(null);
        laboratorio.setUpdatedBy(null);

        var violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setName("Admin");
        
        laboratorio.setId(1L);
        laboratorio.setCreatedAt(LocalDateTime.now());
        laboratorio.setUpdatedAt(LocalDateTime.now());
        laboratorio.setIsActive(true);
        laboratorio.setCreatedBy(usuario);
        laboratorio.setUpdatedBy(usuario);

        var violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveAceitarCnpjValido() {
        String[] cnpjsValidos = {
            "12.345.678/0001-90",
            "11.222.333/0001-44",
            "00.000.000/0001-91"
        };

        for (String cnpj : cnpjsValidos) {
            laboratorio.setCnpj(cnpj);
            var violations = validator.validate(laboratorio);
            assertTrue(violations.isEmpty(), "CNPJ " + cnpj + " deveria ser válido");
        }
    }

    @Test
    void deveAceitarEmailValido() {
        String[] emailsValidos = {
            "lab@teste.com",
            "laboratorio@empresa.com.br",
            "contato.lab@dominio.com"
        };

        for (String email : emailsValidos) {
            laboratorio.setEmailLaboratorio(email);
            var violations = validator.validate(laboratorio);
            assertTrue(violations.isEmpty(), "Email " + email + " deveria ser válido");
        }
    }

    @Test
    void deveAceitarTelefoneValido() {
        String[] telefonesValidos = {
            "(11) 99999-9999",
            "(11) 1234-5678",
            "(21) 98765-4321"
        };

        for (String telefone : telefonesValidos) {
            laboratorio.setTelefoneLaboratorio(telefone);
            var violations = validator.validate(laboratorio);
            assertTrue(violations.isEmpty(), "Telefone " + telefone + " deveria ser válido");
        }
    }

    @Test
    void deveAceitarTodosCamposNulos() {
        var violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty(), "Todos os campos devem aceitar valores nulos");
    }

    @Test
    void deveValidarTamanhoMaximoCampos() {
        String textoLongo = "a".repeat(256); // Maior que o tamanho máximo padrão do VARCHAR

        laboratorio.setNomeLaboratorio(textoLongo);
        laboratorio.setEmailLaboratorio(textoLongo);
        laboratorio.setTelefoneLaboratorio(textoLongo);

        var violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty(), "Campos devem aceitar textos longos pois não há restrição de tamanho");
    }

    @Test
    void deveValidarGettersESetters() {
        String nome = "Lab Teste";
        String cnpj = "12.345.678/0001-90";
        String email = "lab@teste.com";
        String telefone = "(11) 99999-9999";

        laboratorio.setNomeLaboratorio(nome);
        laboratorio.setCnpj(cnpj);
        laboratorio.setEmailLaboratorio(email);
        laboratorio.setTelefoneLaboratorio(telefone);
        laboratorio.setEndereco(endereco);

        assertEquals(nome, laboratorio.getNomeLaboratorio());
        assertEquals(cnpj, laboratorio.getCnpj());
        assertEquals(email, laboratorio.getEmailLaboratorio());
        assertEquals(telefone, laboratorio.getTelefoneLaboratorio());
        assertEquals(endereco, laboratorio.getEndereco());
    }

    @Test
    void deveValidarRelacionamentoComEndereco() {
        laboratorio.setEndereco(endereco);
        assertNotNull(laboratorio.getEndereco());
        assertEquals(endereco, laboratorio.getEndereco());
    }

    private void configurarLaboratorioValido() {
        laboratorio.setNomeLaboratorio("Lab Teste");
        laboratorio.setCnpj("12.345.678/0001-90");
        laboratorio.setEmailLaboratorio("lab@teste.com");
        laboratorio.setTelefoneLaboratorio("(11) 99999-9999");
        laboratorio.setEndereco(endereco);
    }
} 