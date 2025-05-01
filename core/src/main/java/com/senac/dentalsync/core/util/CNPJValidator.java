package com.senac.dentalsync.core.util;

public class CNPJValidator {
    
    private static final int[] PESOS_DIGITO_1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] PESOS_DIGITO_2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    
    public static boolean isValid(String cnpj) {
        // Remove caracteres não numéricos
        cnpj = cnpj.replaceAll("\\D", "");
        
        // Verifica se tem 14 dígitos
        if (cnpj.length() != 14) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais
        if (cnpj.matches("(\\d)\\1{13}")) {
            return false;
        }
        
        // Calcula o primeiro dígito verificador
        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * PESOS_DIGITO_1[i];
        }
        int digito1 = 11 - (soma % 11);
        if (digito1 > 9) {
            digito1 = 0;
        }
        
        // Verifica o primeiro dígito
        if (digito1 != Character.getNumericValue(cnpj.charAt(12))) {
            return false;
        }
        
        // Calcula o segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * PESOS_DIGITO_2[i];
        }
        int digito2 = 11 - (soma % 11);
        if (digito2 > 9) {
            digito2 = 0;
        }
        
        // Verifica o segundo dígito
        return digito2 == Character.getNumericValue(cnpj.charAt(13));
    }
} 