package com.senac.dentalsync.core.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Protetico;

public class ProteticoTest {

    private Validator validator;
    private Protetico protetico;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        
        //Configuração padrão de um protético válido para os testes
        protetico = new Protetico();
        protetico.setNome("João Silva");
        protetico.setCro("CRO-SP-12345");
        protetico.setEmail("joao.silva@email.com");
        protetico.setTelefone("(11) 99999-9999");
        protetico.setSenha("senha123");
        protetico.setIsAdmin(false);
    }

    @Test
    void deveCriarProteticoValido() {
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

   
    @Test
    void deveRetornarErroQuandoNomeVazio() {
        // Arrange
        protetico.setNome("");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCroVazio() {
        // Arrange
        protetico.setCro("");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CRO é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoCroNulo() {
        // Arrange
        protetico.setCro(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O CRO é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneVazio() {
        // Arrange
        protetico.setTelefone("");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O telefone é obrigatório")));
    }


  

    // ------------------------------------------ // ----------------------------------------//

    @Test
    void deveAceitarNomeValido() {
        // Arrange
        protetico.setNome("Maria José Santos");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarNomeComTamanhoMaximo() {
        // Arrange
        protetico.setNome("a".repeat(255));

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Nome com 255 caracteres deveria ser aceito");
    }



    @Test
    void deveRetornarErroQuandoNomeNulo() {
        // Arrange
        protetico.setNome(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoNomeMuitoLongo() {
        // Arrange
        protetico.setNome("a".repeat(100)); // Nome com tamanho adequado

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação para nome com tamanho adequado");
    }

    @Test
    void deveAceitarCroValido() {
        // Arrange
        protetico.setCro("CRO-SP-123456");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCroComDiferentesEstados() {
        // Arrange
        protetico.setCro("CRO-RJ-98765");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

   

    @Test
    void deveRetornarErroQuandoCroInvalido() {
        // Arrange
        protetico.setCro("12345"); // Formato inválido

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")));
    }

    @Test
    void deveAceitarTelefoneFixoValido() {
        // Arrange
        protetico.setTelefone("(11) 3333-3333");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarTelefoneCelularValido() {
        // Arrange
        protetico.setTelefone("(11) 99999-9999");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }


    @Test
    void deveRetornarErroQuandoTelefoneNulo() {
        // Arrange
        protetico.setTelefone(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O telefone é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoTelefoneInvalido() {
        // Arrange
        protetico.setTelefone("1199999999"); // Formato inválido

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")));
    }

    @Test
    void deveAceitarEmailValido() {
        // Arrange
        protetico.setEmail("protetico@laboratorio.com.br");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarEmailComTamanhoMaximo() {
        // Arrange
        String emailMaximo = "a".repeat(50) + "@" + "a".repeat(10) + ".com"; // Email válido com tamanho adequado
        protetico.setEmail(emailMaximo);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Email com tamanho adequado deveria ser aceito");
    }

    @Test
    void deveRetornarErroQuandoEmailVazio() {
        // Arrange
        protetico.setEmail("");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoEmailNulo() {
        // Arrange
        protetico.setEmail(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O email é obrigatório")));
    }

    @Test
    void deveRetornarErroQuandoEmailInvalido() {
        // Arrange
        protetico.setEmail("email.invalido");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Email inválido")));
    }

    @Test
    void deveRetornarErroQuandoEmailMuitoLongo() {
        // Arrange
        String emailLongo = "a".repeat(100) + "@" + "a".repeat(150) + ".com"; // Email muito longo
        protetico.setEmail(emailLongo);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().contains("Email inválido")));
    }

    @Test
    void deveAceitarSenhaValida() {
        // Arrange
        protetico.setSenha("minhasenha123");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarErroQuandoSenhaVazia() {
        // Arrange
        protetico.setSenha("");

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A senha é obrigatória")));
    }

    @Test
    void deveRetornarErroQuandoSenhaNula() {
        // Arrange
        protetico.setSenha(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertFalse(violations.isEmpty(), "Deveria ter violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A senha é obrigatória")));
    }

    @Test
    void deveAceitarIsAdminTrue() {
        // Arrange
        protetico.setIsAdmin(true);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarIsAdminFalse() {
        // Arrange
        protetico.setIsAdmin(false);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarIsAdminNulo() {
        // Arrange
        protetico.setIsAdmin(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "IsAdmin pode ser nulo");
    }

    @Test
    void deveAceitarLaboratorioNulo() {
        // Arrange
        protetico.setLaboratorio(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Laboratório pode ser nulo");
    }

    @Test
    void deveAceitarLaboratorioValido() {
        // Arrange
        Laboratorio lab = new Laboratorio();
        lab.setId(1L);
        protetico.setLaboratorio(lab);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        // Arrange
        protetico.setId(null);
        protetico.setCreatedAt(null);
        protetico.setUpdatedAt(null);
        protetico.setIsActive(null);
        protetico.setCreatedBy(null);
        protetico.setUpdatedBy(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {
        // Arrange
        Protetico proteticoAdmin = new Protetico();
        proteticoAdmin.setId(1L);
        proteticoAdmin.setNome("Admin");
        
        protetico.setId(1L);
        protetico.setCreatedAt(LocalDateTime.now());
        protetico.setUpdatedAt(LocalDateTime.now());
        protetico.setIsActive(true);
        protetico.setCreatedBy(proteticoAdmin);
        protetico.setUpdatedBy(proteticoAdmin);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveRetornarMultiplasViolacoesQuandoTodosOsCamposInvalidos() {
        // Arrange
        protetico.setNome(""); // Nome vazio
        protetico.setCro("123"); // CRO inválido
        protetico.setEmail("email.invalido"); // Email inválido
        protetico.setTelefone("1234"); // Telefone inválido
        protetico.setSenha(""); // Senha vazia

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertEquals(5, violations.size(), "Deveria ter 5 violações de validação");
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("O nome é obrigatório")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de CRO inválido. Use o formato: CRO-UF-NÚMERO (máximo 6 dígitos)")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Email inválido")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("Formato de telefone inválido. Use o formato: (99) 99999-9999 para celular ou (99) 9999-9999 para fixo")));
        assertTrue(violations.stream()
            .anyMatch(v -> v.getMessage().equals("A senha é obrigatória")));
    }

    @Test
    void deveAceitarCampos2FANulos() {
        // Arrange
        protetico.setTwoFactorSecret(null);
        protetico.setTwoFactorEnabled(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Campos 2FA podem ser nulos");
    }

    @Test
    void deveAceitarCampos2FAPreenchidos() {
        // Arrange
        protetico.setTwoFactorSecret("secret123");
        protetico.setTwoFactorEnabled(true);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposDispositivoConfiavelNulos() {
        // Arrange
        protetico.setTrustedDeviceFingerprint(null);
        protetico.setTrustedDeviceToken(null);
        protetico.setTrustedDeviceTimestamp(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Campos de dispositivo confiável podem ser nulos");
    }

    @Test
    void deveAceitarCamposDispositivoConfiavelPreenchidos() {
        // Arrange
        protetico.setTrustedDeviceFingerprint("fingerprint123");
        protetico.setTrustedDeviceToken("token123");
        protetico.setTrustedDeviceTimestamp(System.currentTimeMillis());

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveAceitarCamposLembrarDeMinNulos() {
        // Arrange
        protetico.setRememberMeToken(null);
        protetico.setRememberMeTimestamp(null);
        protetico.setRememberMeDurationDays(null);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Campos de lembrar de mim podem ser nulos");
    }

    @Test
    void deveAceitarCamposLembrarDeMinPreenchidos() {
        // Arrange
        protetico.setRememberMeToken("remember123");
        protetico.setRememberMeTimestamp(System.currentTimeMillis());
        protetico.setRememberMeDurationDays(7);

        // Act
        Set<ConstraintViolation<Protetico>> violations = validator.validate(protetico);

        // Assert
        assertTrue(violations.isEmpty(), "Não deveria ter violações de validação");
    }

    @Test
    void deveValidarGettersESetters() {
        // Arrange
        String nome = "Dr. Maria Silva";
        String cro = "CRO-RJ-54321";
        String email = "maria@laboratorio.com";
        String telefone = "(21) 98765-4321";
        String senha = "novasenha123";
        Boolean isAdmin = true;

        // Act
        protetico.setNome(nome);
        protetico.setCro(cro);
        protetico.setEmail(email);
        protetico.setTelefone(telefone);
        protetico.setSenha(senha);
        protetico.setIsAdmin(isAdmin);

        // Assert
        assertEquals(nome, protetico.getNome());
        assertEquals(cro, protetico.getCro());
        assertEquals(email, protetico.getEmail());
        assertEquals(telefone, protetico.getTelefone());
        assertEquals(senha, protetico.getSenha());
        assertEquals(isAdmin, protetico.getIsAdmin());
    }

    @Test
    void deveValidarToString() {
        // Act
        String toString = protetico.toString();

        // Assert
        assertTrue(toString.contains("Protetico"));
        assertTrue(toString.contains("nome=João Silva"));
    }

    @Test
    void deveValidarEqualsEHashCode() {
        // Arrange
        Protetico outroProtetico = new Protetico();
        outroProtetico.setNome("João Silva");
        outroProtetico.setCro("CRO-SP-12345");
        outroProtetico.setEmail("joao.silva@email.com");
        outroProtetico.setTelefone("(11) 99999-9999");
        outroProtetico.setSenha("senha123");
        outroProtetico.setIsAdmin(false);

        // Act & Assert
        assertEquals(protetico, outroProtetico, "Protéticos com os mesmos dados deveriam ser iguais");
        assertEquals(protetico.hashCode(), outroProtetico.hashCode(), "HashCodes deveriam ser iguais");
    }
} 