package com.senac.dentalsync.core.persistency.model;

import java.time.LocalDate;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidDateRangeValidator implements ConstraintValidator<ValidDateRange, LocalDate> {
    @Override
    public boolean isValid(LocalDate date, ConstraintValidatorContext context) {
        if (date == null) {
            return true; // deixa o @NotNull cuidar da validação de nulo
        }
        
        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        LocalDate today = LocalDate.now();
        
        // Permite datas de 1 ano atrás até o futuro
        return !date.isBefore(oneYearAgo);
    }
} 