package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.EnderecoLaboratorio;
import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Protetico;
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
        configurarEnderecoValido();
    }

    @Test
    void deveCriarLaboratorioValido() {
        configurarLaboratorioValido();
        var violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErrosQuandoCamposObrigatoriosAusentes() {
        var violations = validator.validate(laboratorio);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("nome do laboratório é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("CNPJ é obrigatório")));
    }

    @Test
    void deveValidarTamanhoMaximoNomeLaboratorio() {
        configurarLaboratorioValido();
        
        //Nome > 100 caracteres
        laboratorio.setNomeLaboratorio("a".repeat(101));
        var violations = validator.validate(laboratorio);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("nome do laboratório deve ter no máximo 100 caracteres")));

        //Nome válido
        laboratorio.setNomeLaboratorio("Laboratório Teste");
        violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarFormatoEmail() {
        configurarLaboratorioValido();
        
        // Email inválido sem @
        laboratorio.setEmailLaboratorio("email.invalido");
        var violations = validator.validate(laboratorio);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email inválido")));

        // Email inválido sem domínio
        laboratorio.setEmailLaboratorio("email@");
        violations = validator.validate(laboratorio);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email inválido")));

        // Email inválido com espaços
        laboratorio.setEmailLaboratorio("email teste@dominio.com");
        violations = validator.validate(laboratorio);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email inválido")));

        // Email válido
        laboratorio.setEmailLaboratorio("email@valido.com");
        violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    }
    private void configurarEnderecoValido() {
        endereco.setCep("12345678");
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("123");
        endereco.setBairro("Centro");
        endereco.setCidade("São Paulo");
        endereco.setEstado("SP");
    }

    private void configurarLaboratorioValido() {
        laboratorio.setNomeLaboratorio("Laboratório Teste");
        laboratorio.setCnpj("12345678901234");
        laboratorio.setEmailLaboratorio("lab@teste.com");
        laboratorio.setTelefoneLaboratorio("11999999999");
        laboratorio.setEndereco(endereco);
    }

   /* @Test
    void deveValidarTamanhoMaximoEmail() {
        configurarLaboratorioValido();
        
        // Email > 255 caracteres
        String emailLongo = "a".repeat(64) + "@teste ".repeat(190) + ".com";
        laboratorio.setEmailLaboratorio(emailLongo);
        var violations = validator.validate(laboratorio);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("não pode ultrapassar 255 caracteres")));

        // Email com tamanho válido
        laboratorio.setEmailLaboratorio("email@valido.com");
        violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarGettersESetters() {
        String nome = "Laboratório Teste";
        String cnpj = "12345678901234";
        String email = "lab@teste.com";
        String telefone = "11999999999";

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
    void deveValidarRelacionamentoEndereco() {
        configurarLaboratorioValido();
        
        assertNotNull(laboratorio.getEndereco());
        assertEquals(endereco, laboratorio.getEndereco());
        
        // Testando set/get
        EnderecoLaboratorio novoEndereco = new EnderecoLaboratorio();
        laboratorio.setEndereco(novoEndereco);
        assertEquals(novoEndereco, laboratorio.getEndereco());
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        configurarLaboratorioValido();
        
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
        configurarLaboratorioValido();
        
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        laboratorio.setId(1L);
        laboratorio.setCreatedAt(LocalDateTime.now());
        laboratorio.setUpdatedAt(LocalDateTime.now());
        laboratorio.setIsActive(true);
        laboratorio.setCreatedBy(protetico);
        laboratorio.setUpdatedBy(protetico);

        var violations = validator.validate(laboratorio);
        assertTrue(violations.isEmpty());
    } */

} 