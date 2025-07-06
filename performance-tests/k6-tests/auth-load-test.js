import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Rate, Trend } from 'k6/metrics';

// 📊 Métricas customizadas
const loginSuccessRate = new Rate('login_success_rate');
const loginDuration = new Trend('login_duration');
const logoutSuccessRate = new Rate('logout_success_rate');
const authCheckDuration = new Trend('auth_check_duration');

// 📋 Carregar dados de usuários
const users = new SharedArray('users', function () {
  return [
    { email: 'joao.silva@dentalsync.com', password: 'senha123', nome: 'Dr. João Silva Santos' },
    { email: 'maria.oliveira@dentalsync.com', password: 'senha123', nome: 'Dra. Maria Oliveira Costa' },
    { email: 'pedro.lima@dentalsync.com', password: 'senha123', nome: 'Dr. Pedro Henrique Lima' },
    { email: 'ana.souza@dentalsync.com', password: 'senha123', nome: 'Dra. Ana Carolina Souza' },
    { email: 'carlos.ferreira@dentalsync.com', password: 'senha123', nome: 'Dr. Carlos Eduardo Ferreira' },
    { email: 'lucia.alves@dentalsync.com', password: 'senha123', nome: 'Dra. Lucia Maria Alves' },
    { email: 'roberto.mendes@dentalsync.com', password: 'senha123', nome: 'Dr. Roberto Carlos Mendes' },
    { email: 'fernanda.silva@dentalsync.com', password: 'senha123', nome: 'Dra. Fernanda Beatriz Silva' },
    { email: 'eduardo.costa@dentalsync.com', password: 'senha123', nome: 'Dr. Eduardo Antônio Costa' },
    { email: 'patricia.lima@dentalsync.com', password: 'senha123', nome: 'Dra. Patricia Cristina Lima' },
    { email: 'ricardo.santos@dentalsync.com', password: 'senha123', nome: 'Dr. Ricardo José Santos' },
    { email: 'sandra.oliveira@dentalsync.com', password: 'senha123', nome: 'Dra. Sandra Regina Oliveira' }
  ];
});

// 🎯 Configurações do teste
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp-up para 5 usuários
    { duration: '1m', target: 10 },   // Ramp-up para 10 usuários
    { duration: '2m', target: 20 },   // Ramp-up para 20 usuários
    { duration: '3m', target: 20 },   // Manter 20 usuários
    { duration: '1m', target: 10 },   // Ramp-down para 10 usuários
    { duration: '30s', target: 0 },   // Ramp-down para 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições < 500ms
    http_req_failed: ['rate<0.01'],   // Taxa de erro < 1%
    login_success_rate: ['rate>0.99'], // Taxa de sucesso login > 99%
    login_duration: ['p(95)<1000'],   // 95% dos logins < 1s
  },
};

// 🌐 Configuração da API
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// 🔧 Headers padrão
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'K6-DentalSync-LoadTest/1.0',
  'Accept': 'application/json',
};

export default function () {
  // 👤 Selecionar usuário aleatório
  const user = users[Math.floor(Math.random() * users.length)];
  
  console.log(`🔑 Iniciando teste com usuário: ${user.nome} (${user.email})`);
  
  // 📊 Grupo de teste: Login Flow
  group('Login Flow', function () {
    
    // 1️⃣ Login
    const loginStart = Date.now();
    const loginPayload = `username=${user.email}&password=${user.password}&rememberMe=false`;
    
    const loginResponse = http.post(`${BASE_URL}/login`, loginPayload, {
      headers: headers,
      tags: { name: 'login' },
    });
    
    const loginEndTime = Date.now() - loginStart;
    loginDuration.add(loginEndTime);
    
    const loginSuccess = check(loginResponse, {
      'Login status is 200': (r) => r.status === 200,
      'Login response contains success': (r) => r.body.includes('success'),
      'Login response time < 1000ms': (r) => r.timings.duration < 1000,
      'Login has valid cookies': (r) => r.headers['Set-Cookie'] !== undefined,
    });
    
    loginSuccessRate.add(loginSuccess);
    
    if (!loginSuccess) {
      console.error(`❌ Login falhou para ${user.email}: ${loginResponse.status} - ${loginResponse.body}`);
      return;
    }
    
    console.log(`✅ Login realizado com sucesso para ${user.nome}`);
    
    // 2️⃣ Verificar autenticação
    sleep(0.5); // Simular pausa do usuário
    
    const authCheckStart = Date.now();
    const authCheckResponse = http.get(`${BASE_URL}/auth/check`, {
      headers: { 'Accept': 'application/json' },
      tags: { name: 'auth-check' },
    });
    
    authCheckDuration.add(Date.now() - authCheckStart);
    
    check(authCheckResponse, {
      'Auth check status is 200 or 401': (r) => [200, 401, 403].includes(r.status),
      'Auth check response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    // 3️⃣ Buscar dados do usuário atual
    sleep(0.3);
    
    const userDataResponse = http.get(`${BASE_URL}/proteticos/me`, {
      headers: { 'Accept': 'application/json' },
      tags: { name: 'user-data' },
    });
    
    check(userDataResponse, {
      'User data status is 200 or 404': (r) => [200, 404].includes(r.status),
      'User data response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    // 4️⃣ Logout
    sleep(1); // Simular uso da aplicação
    
    const logoutResponse = http.post(`${BASE_URL}/logout`, null, {
      headers: { 'Accept': 'application/json' },
      tags: { name: 'logout' },
    });
    
    const logoutSuccess = check(logoutResponse, {
      'Logout status is 200 or 302': (r) => [200, 302].includes(r.status),
      'Logout response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    logoutSuccessRate.add(logoutSuccess);
    
    if (logoutSuccess) {
      console.log(`🚪 Logout realizado com sucesso para ${user.nome}`);
    }
  });
  
  // ⏱️ Pausa entre iterações (simular comportamento real)
  sleep(Math.random() * 3 + 1); // 1-4 segundos
}

// 📋 Função para configurar dados
export function setup() {
  console.log('🚀 Iniciando testes de carga DentalSync com K6');
  console.log(`🌐 URL Base: ${BASE_URL}`);
  console.log(`👥 Usuários disponíveis: ${users.length}`);
  
  // Verificar se aplicação está rodando
  const healthCheck = http.get(`${BASE_URL}/auth/check`);
  if (healthCheck.status === 0) {
    throw new Error('❌ Aplicação não está respondendo! Verifique se está rodando na porta 8080');
  }
  
  console.log('✅ Aplicação está respondendo');
  return { baseUrl: BASE_URL };
}

// 📊 Função de relatório final
export function teardown(data) {
  console.log('📊 Teste concluído!');
  console.log('📁 Verifique os resultados nos arquivos de saída');
}

// 🎯 Grupos para organização
import { group } from 'k6';

// 📈 Exemplo de uso de tags para análise
export function handleSummary(data) {
  return {
    'results/k6-auth-test-summary.json': JSON.stringify(data, null, 2),
    'results/k6-auth-test-summary.html': htmlReport(data),
  };
}

// 📊 Função para gerar relatório HTML simples
function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>K6 Load Test Results - DentalSync Auth</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #007acc; }
        .success { border-color: #28a745; }
        .warning { border-color: #ffc107; }
        .error { border-color: #dc3545; }
        h1, h2 { color: #333; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🚀 DentalSync Auth Load Test Results</h1>
    
    <div class="summary">
        <h2>📊 Resumo do Teste</h2>
        <p><strong>Duração:</strong> ${data.state.testRunDurationMs}ms</p>
        <p><strong>VUs Máximo:</strong> ${data.metrics.vus_max.values.max}</p>
        <p><strong>Iterações:</strong> ${data.metrics.iterations.values.count}</p>
        <p><strong>Requisições Totais:</strong> ${data.metrics.http_reqs.values.count}</p>
    </div>
    
    <div class="metric ${data.metrics.http_req_failed.values.rate < 0.01 ? 'success' : 'error'}">
        <h3>❌ Taxa de Erro HTTP</h3>
        <p>${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
    </div>
    
    <div class="metric ${data.metrics.http_req_duration.values.p95 < 500 ? 'success' : 'warning'}">
        <h3>⏱️ Tempo de Resposta (P95)</h3>
        <p>${data.metrics.http_req_duration.values.p95.toFixed(2)}ms</p>
    </div>
    
    <div class="metric">
        <h3>🔑 Taxa de Sucesso Login</h3>
        <p>${data.metrics.login_success_rate ? (data.metrics.login_success_rate.values.rate * 100).toFixed(2) + '%' : 'N/A'}</p>
    </div>
    
    <div class="metric">
        <h3>🚪 Taxa de Sucesso Logout</h3>
        <p>${data.metrics.logout_success_rate ? (data.metrics.logout_success_rate.values.rate * 100).toFixed(2) + '%' : 'N/A'}</p>
    </div>
    
    <p><em>Gerado em: ${new Date().toLocaleString('pt-BR')}</em></p>
</body>
</html>
  `;
} 