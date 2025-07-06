package com.senac.dentalsync.core.util;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    void deveValidarSenhaComplexa() {
        String senhaValida = "MinhaSenh@123";
        assertDoesNotThrow(() -> PasswordValidator.validatePassword(senhaValida));
        assertTrue(PasswordValidator.isValidPassword(senhaValida));
    }

    @Test
    void deveRejeitarSenhaCurta() {
        String senhaCurta = "Abc1@";
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword(senhaCurta)
        );
        assertTrue(exception.getMessage().contains("8 caracteres"));
        assertFalse(PasswordValidator.isValidPassword(senhaCurta));
    }

    @Test
    void deveRejeitarSenhaSemMaiuscula() {
        String senhaSemMaiuscula = "minhasenha@123";
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword(senhaSemMaiuscula)
        );
        assertTrue(exception.getMessage().contains("maiúscula"));
        assertFalse(PasswordValidator.isValidPassword(senhaSemMaiuscula));
    }

    @Test
    void deveRejeitarSenhaSemMinuscula() {
        String senhaSemMinuscula = "MINHASENHA@123";
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword(senhaSemMinuscula)
        );
        assertTrue(exception.getMessage().contains("minúscula"));
        assertFalse(PasswordValidator.isValidPassword(senhaSemMinuscula));
    }

    @Test
    void deveRejeitarSenhaSemNumero() {
        String senhaSemNumero = "MinhaSenh@";
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword(senhaSemNumero)
        );
        assertTrue(exception.getMessage().contains("número"));
        assertFalse(PasswordValidator.isValidPassword(senhaSemNumero));
    }

    @Test
    void deveRejeitarSenhaSemCaractereEspecial() {
        String senhaSemEspecial = "MinhaSenh123";
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword(senhaSemEspecial)
        );
        assertTrue(exception.getMessage().contains("especial"));
        assertFalse(PasswordValidator.isValidPassword(senhaSemEspecial));
    }

    @Test
    void deveRejeitarSenhaNull() {
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword(null)
        );
        assertTrue(exception.getMessage().contains("obrigatória"));
        assertFalse(PasswordValidator.isValidPassword(null));
    }

    @Test
    void deveRejeitarSenhaVazia() {
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword("")
        );
        assertTrue(exception.getMessage().contains("obrigatória"));
        assertFalse(PasswordValidator.isValidPassword(""));
    }

    @Test
    void deveRejeitarSenhaApenasEspacos() {
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class, 
            () -> PasswordValidator.validatePassword("   ")
        );
        assertTrue(exception.getMessage().contains("obrigatória"));
        assertFalse(PasswordValidator.isValidPassword("   "));
    }

    @Test
    void deveValidarDiferentesCaracteresEspeciais() {
        String[] senhasValidas = {
            "MinhaSenh@123",
            "MinhaSenh#123",
            "MinhaSenh$123",
            "MinhaSenh%123",
            "MinhaSenh&123",
            "MinhaSenh*123",
            "MinhaSenh!123",
            "MinhaSenh_123",
            "MinhaSenh+123",
            "MinhaSenh-123",
            "MinhaSenh=123",
            "MinhaSenh[123]",
            "MinhaSenh{123}",
            "MinhaSenh|123",
            "MinhaSenh;123",
            "MinhaSenh:123",
            "MinhaSenh\"123",
            "MinhaSenh'123",
            "MinhaSenh\\123",
            "MinhaSenh,123",
            "MinhaSenh.123",
            "MinhaSenh<123>",
            "MinhaSenh?123",
            "MinhaSenh/123",
            "MinhaSenh~123",
            "MinhaSenh`123"
        };

        for (String senha : senhasValidas) {
            assertDoesNotThrow(() -> PasswordValidator.validatePassword(senha), 
                "Senha deveria ser válida: " + senha);
            assertTrue(PasswordValidator.isValidPassword(senha), 
                "Senha deveria ser válida: " + senha);
        }
    }

    @Test
    void deveRetornarCriteriosDeSenha() {
        String criterios = PasswordValidator.getPasswordCriteria();
        assertNotNull(criterios);
        assertTrue(criterios.contains("8 caracteres"));
        assertTrue(criterios.contains("maiúscula"));
        assertTrue(criterios.contains("minúscula"));
        assertTrue(criterios.contains("número"));
        assertTrue(criterios.contains("especial"));
    }
} 