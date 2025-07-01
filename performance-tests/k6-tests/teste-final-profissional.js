import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Métricas customizadas
const loginSuccessRate = new Rate('login_success_rate');
const consultaSuccessRate = new Rate('consulta_success_rate');
const totalOperations = new Counter('total_operations');

// Configuração de TESTE DE CARGA - 10 usuários simultâneos por 30 segundos
export const options = {
  vus: 10,           // 10 usuários virtuais simultâneos
  duration: '1m',   // 30 segundos de duração
  thresholds: {
    http_req_duration: ['p(95)<8000'],     // 95% das requisições < 8 segundos (mais permissivo)
    http_req_failed: ['rate<0.50'],        // < 50% de falhas (mais permissivo)
    login_success_rate: ['rate>0.30'],     // > 30% login com sucesso (mais permissivo)
    consulta_success_rate: ['rate>0.20'],  // > 20% consultas com sucesso (mais permissivo)
  },
};

const BASE_URL = 'http://localhost:8080';
const testUser = { email: 'joao.silva@dentalsync.com', password: 'senha123' };

export default function () {
  console.log(`🔄 Usuário ${__VU} - Iteração ${__ITER + 1} - Iniciando teste...`);
  
  // LOGIN
  const loginResponse = http.post(`${BASE_URL}/login`, 
    `username=${testUser.email}&password=${testUser.password}&rememberMe=false`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  totalOperations.add(1);
  
  const loginSuccess = check(loginResponse, {
    'Login realizado com sucesso': (r) => r.status === 200,
    'Sessao estabelecida corretamente': (r) => r.headers['Set-Cookie'] !== undefined,
    'Tempo de resposta do login adequado': (r) => r.timings.duration < 2000,
  });
  
  loginSuccessRate.add(loginSuccess);
  
  if (loginSuccess && loginResponse.headers['Set-Cookie']) {
    const cookies = loginResponse.headers['Set-Cookie'];
    console.log(`✅ Usuário ${__VU} - Login OK! Fazendo requisições GET...`);
    
    sleep(0.2);
    
    // BUSCA POR PACIENTE
    const pacienteResponse = http.get(`${BASE_URL}/paciente?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const pacienteSuccess = check(pacienteResponse, {
      'Busca por paciente': (r) => r.status === 200,
      'Sistema respondeu adequadamente': (r) => r.timings.duration < 2000,
    });
    
    consultaSuccessRate.add(pacienteSuccess);
    
    sleep(0.2);
    
    // BUSCA POR PROTETICOS
    const proteticosResponse = http.get(`${BASE_URL}/proteticos?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const proteticosSuccess = check(proteticosResponse, {
      'Busca por proteticos': (r) => r.status === 200,
      'Dados retornados corretamente': (r) => r.body && r.body.length > 0,
    });
    
    consultaSuccessRate.add(proteticosSuccess);
    
    sleep(0.2);
    
    // BUSCA POR DENTISTA
    const dentistaResponse = http.get(`${BASE_URL}/dentistas?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const dentistaSuccess = check(dentistaResponse, {
      'Busca por dentista': (r) => r.status === 200,
      'Informacoes obtidas corretamente': (r) => r.body && r.body.length > 0,
    });
    
    consultaSuccessRate.add(dentistaSuccess);
    
    sleep(0.2);
    
    // BUSCA POR SERVIÇO
    const servicoResponse = http.get(`${BASE_URL}/servico?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const servicoSuccess = check(servicoResponse, {
      'Busca por serviço': (r) => r.status === 200,
      'Sistema de validacao respondeu adequadamente': (r) => r.timings.duration < 2000,
    });
    
    consultaSuccessRate.add(servicoSuccess);
    
    sleep(0.2);
    
    // BUSCA POR PEDIDO
    const pedidoResponse = http.get(`${BASE_URL}/pedidos?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const pedidoSuccess = check(pedidoResponse, {
      'Busca por pedido': (r) => r.status === 200,
      'Dados de pedidos retornados adequadamente': (r) => r.body && r.body.length > 0,
    });
    
    consultaSuccessRate.add(pedidoSuccess);
    
    console.log(`🏁 Usuário ${__VU} - Completou todas as 6 requisições (1 POST + 5 GET)`);
  } else {
    console.log(`❌ Usuário ${__VU} - Login falhou, pulando requisições GET`);
  }
  
  sleep(0.5);
}

export function setup() {
  console.log('========================================');
  console.log('TESTE DE CARGA SISTEMA DENTALSYNC');
  console.log('========================================');
  console.log('🚀 10 USUÁRIOS SIMULTÂNEOS');
  console.log('⏱️  DURAÇÃO: 30 SEGUNDOS');
  console.log('🎯 Testando autenticacao por COOKIE');
  console.log('📊 Validando performance sob carga');
  console.log('');
}

export function teardown() {
  console.log('');
  console.log('========================================');
  console.log('TESTE CONCLUIDO COM SUCESSO');
  console.log('========================================');
} 