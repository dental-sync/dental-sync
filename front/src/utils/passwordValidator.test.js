import { validatePassword, isValidPassword, getPasswordStrengthLevel } from './passwordValidator';

/**
 * Testes para validação de senha
 * Para executar: abrir console do navegador e colar este código
 */

const testPasswordValidation = () => {
  console.log('🧪 Testando validação de senhas...\n');

  const testCases = [
    // Senhas válidas
    { password: 'MinhaSenh@123', expected: true, description: 'Senha válida completa' },
    { password: 'Dental$2024', expected: true, description: 'Senha válida alternativa' },
    { password: 'Segur@nca!456', expected: true, description: 'Senha válida com múltiplos especiais' },
    
    // Senhas inválidas
    { password: '123456', expected: false, description: 'Muito curta, sem maiúscula, sem especial' },
    { password: 'password', expected: false, description: 'Sem maiúscula, sem número, sem especial' },
    { password: 'PASSWORD123', expected: false, description: 'Sem minúscula, sem especial' },
    { password: 'MinhaSenh', expected: false, description: 'Sem número, sem especial' },
    { password: 'minhasenha@123', expected: false, description: 'Sem maiúscula' },
    { password: 'MINHASENHA@123', expected: false, description: 'Sem minúscula' },
    { password: 'MinhaSenh@', expected: false, description: 'Sem número' },
    { password: 'MinhaSenh123', expected: false, description: 'Sem caractere especial' },
    { password: 'Abc1@', expected: false, description: 'Muito curta' },
    { password: '', expected: false, description: 'Senha vazia' },
    { password: null, expected: false, description: 'Senha null' },
    { password: '   ', expected: false, description: 'Apenas espaços' },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ password, expected, description }) => {
    const result = isValidPassword(password);
    const errors = validatePassword(password);
    const strength = getPasswordStrengthLevel(password);
    
    if (result === expected) {
      console.log(`✅ ${description}: OK`);
      passed++;
    } else {
      console.log(`❌ ${description}: FALHOU`);
      console.log(`   Esperado: ${expected}, Obtido: ${result}`);
      console.log(`   Erros: ${errors.join(', ')}`);
      failed++;
    }
  });

  console.log(`\n📊 Resultado dos testes:`);
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  // Teste de força de senha
  console.log('\n💪 Testando força de senhas:');
  const strengthTests = [
    { password: '', expected: 0 },
    { password: 'abc', expected: 1 },
    { password: 'Abc', expected: 2 },
    { password: 'Abc1', expected: 3 },
    { password: 'Abc1@', expected: 4 },
    { password: 'Abc12345@', expected: 5 },
  ];

  strengthTests.forEach(({ password, expected }) => {
    const result = getPasswordStrengthLevel(password);
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} "${password}" -> Força: ${result}/5 (esperado: ${expected})`);
  });
};

// Exportar função para uso no console
window.testPasswordValidation = testPasswordValidation;

console.log('🔧 Testes de validação de senha carregados!');
console.log('Para executar, digite: testPasswordValidation()');

export default testPasswordValidation; 