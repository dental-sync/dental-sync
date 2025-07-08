package com.senac.dentalsync.core.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

/**
 * Utilitário para validação de senhas com regras de complexidade
 */
public class PasswordValidator {

    // Padrões regex para validação
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*[0-9].*");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>?/~`].*");

    /**
     * Valida se a senha atende aos critérios de complexidade
     * 
     * @param password A senha a ser validada
     * @throws ResponseStatusException Se a senha não atender aos critérios
     */
    public static void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha é obrigatória");
        }

        // Mínimo 8 caracteres
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "A senha deve ter pelo menos 8 caracteres");
        }

        // Pelo menos 1 letra maiúscula
        if (!UPPERCASE_PATTERN.matcher(password).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "A senha deve conter pelo menos uma letra maiúscula");
        }

        // Pelo menos 1 letra minúscula
        if (!LOWERCASE_PATTERN.matcher(password).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "A senha deve conter pelo menos uma letra minúscula");
        }

        // Pelo menos 1 número
        if (!DIGIT_PATTERN.matcher(password).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "A senha deve conter pelo menos um número");
        }

        // Pelo menos 1 caractere especial
        if (!SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "A senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;':\"\\,.<>?/~`)");
        }
    }

    /**
     * Verifica se a senha atende aos critérios sem lançar exceção
     * 
     * @param password A senha a ser validada
     * @return true se a senha é válida, false caso contrário
     */
    public static boolean isValidPassword(String password) {
        try {
            validatePassword(password);
            return true;
        } catch (ResponseStatusException e) {
            return false;
        }
    }

    /**
     * Retorna uma mensagem com os critérios de senha
     * 
     * @return String com os critérios
     */
    public static String getPasswordCriteria() {
        return "A senha deve conter:\n" +
               "- Pelo menos 8 caracteres\n" +
               "- Pelo menos uma letra maiúscula (A-Z)\n" +
               "- Pelo menos uma letra minúscula (a-z)\n" +
               "- Pelo menos um número (0-9)\n" +
               "- Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;':\"\\,.<>?/~`)";
    }
} 