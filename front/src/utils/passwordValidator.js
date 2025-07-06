/**
 * Validador de senha com regras de complexidade
 * Deve atender aos critérios:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 maiúscula
 * - Pelo menos 1 minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */

export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.trim() === '') {
    errors.push('A senha é obrigatória');
    return errors;
  }

  // Mínimo 8 caracteres
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  // Pelo menos 1 maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  // Pelo menos 1 minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  // Pelo menos 1 número
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  // Pelo menos 1 caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;\':"\\,.<>?/~`)');
  }

  return errors;
};

export const isValidPassword = (password) => {
  return validatePassword(password).length === 0;
};

export const getPasswordCriteria = () => {
  return [
    'Pelo menos 8 caracteres',
    'Pelo menos uma letra maiúscula (A-Z)',
    'Pelo menos uma letra minúscula (a-z)',
    'Pelo menos um número (0-9)',
    'Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;\':"\\,.<>?/~`)'
  ];
};

export const getPasswordStrengthLevel = (password) => {
  if (!password) return 0;
  
  const criteria = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]/.test(password)
  ];
  
  return criteria.filter(Boolean).length;
};

export const getPasswordStrengthText = (level) => {
  switch (level) {
    case 0:
    case 1:
      return 'Muito fraca';
    case 2:
      return 'Fraca';
    case 3:
      return 'Média';
    case 4:
      return 'Forte';
    case 5:
      return 'Muito forte';
    default:
      return 'Inválida';
  }
};

export const getPasswordStrengthColor = (level) => {
  switch (level) {
    case 0:
    case 1:
      return '#e74c3c';
    case 2:
      return '#f39c12';
    case 3:
      return '#f1c40f';
    case 4:
      return '#27ae60';
    case 5:
      return '#2ecc71';
    default:
      return '#e74c3c';
  }
}; 