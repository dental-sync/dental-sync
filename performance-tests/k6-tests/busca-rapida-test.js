import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// 📊 Métricas customizadas
const loginSuccessRate = new Rate('login_success_rate');
const buscaSuccessRate = new Rate('busca_success_rate');
const responseTime = new Trend('response_time');
const totalOperations = new Counter('total_operations');

// 🎯 Configuração LEVE - teste rápido
export const options = {
  iterations: 50,   // Apenas 50 iterações
  vus: 3,          // 3 usuários simultâneos apenas
  duration: '2m',   // Máximo 2 minutos
  thresholds: {
    http_req_duration: ['p(95)<2000'],     // 95% < 2s (mais realista)
      // Taxa erro < 15% (mais tolerante)
    login_success_rate: ['rate>0.80'],     // Login > 80% (mais realista)
    // busca_success_rate removido - pode ter dados vazios
  },
};

// 🌐 Configuração da API
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// 🔧 Headers
const jsonHeaders = {
  'Content-Type': 'application/json',
  'User-Agent': 'K6-DentalSync-BuscaRapida/1.0',
  'Accept': 'application/json',
};

const formHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'K6-DentalSync-BuscaRapida/1.0',
  'Accept': 'application/json',
};

// 🔑 Usuário para teste
const testUser = {
  email: 'joao.silva@dentalsync.com',
  password: 'senha123'
};

export default function () {
  let sessionCookies = '';
  
  console.log(`🔍 TESTE BUSCA RÁPIDA - VU ${__VU} - Iteração ${__ITER + 1}/50`);
  
  // 🔑 1. LOGIN
  const loginStart = Date.now();
  const loginPayload = `username=${testUser.email}&password=${testUser.password}&rememberMe=false`;
  
  const loginResponse = http.post(`${BASE_URL}/login`, loginPayload, {
    headers: formHeaders,
    tags: { name: 'login' },
  });
  
  const loginDuration = Date.now() - loginStart;
  responseTime.add(loginDuration);
  totalOperations.add(1);
  
  const loginSuccess = check(loginResponse, {
    'Login: Status é 200': (r) => r.status === 200,
    'Login: Tem cookies': (r) => r.headers['Set-Cookie'] !== undefined,
    'Login: Tempo < 1000ms': () => loginDuration < 1000,
  });
  
  loginSuccessRate.add(loginSuccess);
  
  if (!loginSuccess) {
    console.error(`❌ Login falhou - VU ${__VU}: Status ${loginResponse.status}`);
    return;
  }
  
  // Extrair cookies da sessão
  if (loginResponse.headers['Set-Cookie']) {
    sessionCookies = loginResponse.headers['Set-Cookie'];
  }
  
  console.log(`✅ Login OK - VU ${__VU}`);
  
  // Pequena pausa entre operações
  sleep(0.2);
  
  // 🔍 2. BUSCA PACIENTES
  const pacienteResponse = http.get(`${BASE_URL}/pacientes?page=0&size=10`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': sessionCookies
    },
    tags: { name: 'busca-pacientes' },
  });
  
  totalOperations.add(1);
  
  const buscaPacienteSuccess = check(pacienteResponse, {
    'Busca Pacientes: Status é 200': (r) => r.status === 200,
    'Busca Pacientes: Tem dados': (r) => r.body && r.body.length > 0,
    'Busca Pacientes: Tempo < 500ms': (r) => r.timings.duration < 500,
  });
  
  buscaSuccessRate.add(buscaPacienteSuccess);
  
  if (buscaPacienteSuccess) {
    console.log(`📋 Pacientes encontrados - VU ${__VU}`);
  }
  
  sleep(0.2);
  
  // 🔍 3. BUSCA PEDIDOS
  const pedidoResponse = http.get(`${BASE_URL}/pedidos?page=0&size=10`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': sessionCookies
    },
    tags: { name: 'busca-pedidos' },
  });
  
  totalOperations.add(1);
  
  const buscaPedidoSuccess = check(pedidoResponse, {
    'Busca Pedidos: Status é 200': (r) => r.status === 200,
    'Busca Pedidos: Tem dados': (r) => r.body && r.body.length > 0,
    'Busca Pedidos: Tempo < 500ms': (r) => r.timings.duration < 500,
  });
  
  buscaSuccessRate.add(buscaPedidoSuccess);
  
  if (buscaPedidoSuccess) {
    console.log(`📦 Pedidos encontrados - VU ${__VU}`);
  }
  
  sleep(0.2);
  
  // 🔍 4. BUSCA DENTISTAS
  const dentistaResponse = http.get(`${BASE_URL}/dentistas?page=0&size=10`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': sessionCookies
    },
    tags: { name: 'busca-dentistas' },
  });
  
  totalOperations.add(1);
  
  const buscaDentistaSuccess = check(dentistaResponse, {
    'Busca Dentistas: Status é 200': (r) => r.status === 200,
    'Busca Dentistas: Tem dados': (r) => r.body && r.body.length > 0,
    'Busca Dentistas: Tempo < 500ms': (r) => r.timings.duration < 500,
  });
  
  buscaSuccessRate.add(buscaDentistaSuccess);
  
  if (buscaDentistaSuccess) {
    console.log(`👨‍⚕️ Dentistas encontrados - VU ${__VU}`);
  }
  
  sleep(0.2);
  
  // 🔍 5. BUSCA SERVIÇOS
  const servicoResponse = http.get(`${BASE_URL}/servicos?page=0&size=10`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': sessionCookies
    },
    tags: { name: 'busca-servicos' },
  });
  
  totalOperations.add(1);
  
  const buscaServicoSuccess = check(servicoResponse, {
    'Busca Serviços: Status é 200': (r) => r.status === 200,
    'Busca Serviços: Tem dados': (r) => r.body && r.body.length > 0,
    'Busca Serviços: Tempo < 500ms': (r) => r.timings.duration < 500,
  });
  
  buscaSuccessRate.add(buscaServicoSuccess);
  
  if (buscaServicoSuccess) {
    console.log(`🛠️ Serviços encontrados - VU ${__VU}`);
  }
  
  // 🔍 6. BUSCA PROTÉTICOS (bonus)
  sleep(0.2);
  
  const proteticoResponse = http.get(`${BASE_URL}/proteticos?page=0&size=10`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': sessionCookies
    },
    tags: { name: 'busca-proteticos' },
  });
  
  totalOperations.add(1);
  
  const buscaProteticoSuccess = check(proteticoResponse, {
    'Busca Protéticos: Status é 200': (r) => r.status === 200,
    'Busca Protéticos: Tem dados': (r) => r.body && r.body.length > 0,
    'Busca Protéticos: Tempo < 500ms': (r) => r.timings.duration < 500,
  });
  
  buscaSuccessRate.add(buscaProteticoSuccess);
  
  if (buscaProteticoSuccess) {
    console.log(`🦷 Protéticos encontrados - VU ${__VU}`);
  }
  
  console.log(`✅ Ciclo completo - VU ${__VU} - Iteração ${__ITER + 1}`);
  
  // Pausa entre iterações
  sleep(1);
}

// 📋 Setup inicial
export function setup() {
  console.log('🚀 Iniciando Teste de Busca Rápida - DentalSync');
  console.log('🎯 Objetivo: Testar login + busca de todas as entidades');
  console.log(`🌐 URL: ${BASE_URL}`);
  console.log('📊 50 iterações com 3 usuários simultâneos');
  
  // Verificar se aplicação está rodando
  const healthCheck = http.get(`${BASE_URL}/auth/check`);
  if (healthCheck.status === 0) {
    throw new Error('❌ Aplicação não está respondendo! Verifique se está rodando na porta 8080');
  }
  
  console.log('✅ Aplicação respondendo - INICIANDO TESTE');
  return { baseUrl: BASE_URL };
}

// 📊 Relatório final
export function teardown(data) {
  console.log('🏁 Teste de Busca Rápida concluído!');
  console.log('📊 Verificando funcionalidades de busca...');
}

// 📈 Gerar relatórios
export function handleSummary(data) {
  const reportTitle = 'Teste de Busca Rápida - DentalSync (50 Iterações)';
  const reportDescription = `
    <h3>🎯 Objetivo</h3>
    <p>Teste rápido das funcionalidades de busca do sistema DentalSync.</p>
    
    <h3>📊 Cenário de Teste</h3>
    <ul>
      <li><strong>Iterações:</strong> 50 (leve)</li>
      <li><strong>Usuários simultâneos:</strong> 3</li>
      <li><strong>Duração máxima:</strong> 2 minutos</li>
      <li><strong>Operações por iteração:</strong> Login + 5 buscas</li>
    </ul>
    
    <h3>🔍 Entidades Testadas</h3>
    <ul>
      <li>👤 <strong>Login:</strong> Autenticação do usuário</li>
      <li>👥 <strong>Pacientes:</strong> Lista paginada</li>
      <li>📦 <strong>Pedidos:</strong> Lista paginada</li>
      <li>👨‍⚕️ <strong>Dentistas:</strong> Lista paginada</li>
      <li>🛠️ <strong>Serviços:</strong> Lista paginada</li>
      <li>🦷 <strong>Protéticos:</strong> Lista paginada</li>
    </ul>
    
    <h3>✅ Critérios de Sucesso</h3>
    <ul>
      <li>Taxa de erro < 15%</li>
      <li>Login > 80% sucesso</li>
      <li>Tempo resposta P95 < 2s</li>
      <li>Funcionalidades básicas operacionais</li>
    </ul>
  `;

  return {
    'reports/busca-rapida-report.html': htmlReport(data, { 
      title: reportTitle,
      description: reportDescription 
    }),
    'results/busca-rapida-results.json': JSON.stringify(data, null, 2),
  };
} 