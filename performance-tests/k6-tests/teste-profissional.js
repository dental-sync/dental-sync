import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Métricas customizadas
const loginSuccessRate = new Rate('login_success_rate');
const consultaSuccessRate = new Rate('consulta_success_rate');
const totalOperations = new Counter('total_operations');

// Configuração de STRESS TEST EXTREMO - 300 usuários simultâneos para QUEBRAR o sistema
export const options = {
  vus: 300,          // 300 usuários virtuais simultâneos (STRESS EXTREMO)
  duration: '1m',    // 1 minutos de duração para quebrar o sistema
  thresholds: {
    http_req_duration: ['p(95)<15000'],    // 95% das requisições < 15 segundos (muito tolerante)
    http_req_failed: ['rate<0.90'],        // < 90% de falhas (esperamos muitas falhas)
    login_success_rate: ['rate>0.05'],     // > 5% login com sucesso (muito baixo - sistema pode quebrar)
    consulta_success_rate: ['rate>0.05'],  // > 5% consultas com sucesso (muito baixo)
  },
};

const BASE_URL = 'http://localhost:8080';
const testUser = { email: 'joao.silva@dentalsync.com', password: 'senha123' };

export default function () {
  // LOGIN - CLASSE DE AUTENTICAÇÃO
  const loginResponse = http.post(`${BASE_URL}/login`, 
    `username=${testUser.email}&password=${testUser.password}&rememberMe=false`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  totalOperations.add(1);
  
  const loginSuccess = check(loginResponse, {
    'Login realizado com sucesso': (r) => r.status === 200,
    'Sessao estabelecida corretamente': (r) => r.headers['Set-Cookie'] !== undefined,
    'Tempo de resposta do login adequado': (r) => r.timings.duration < 5000,
  });
  
  loginSuccessRate.add(loginSuccess);
  
  if (loginSuccess && loginResponse.headers['Set-Cookie']) {
    const cookies = loginResponse.headers['Set-Cookie'];
    
    sleep(0.1);
    
    // CLASSE PACIENTE - Busca por paciente
    const pacienteResponse = http.get(`${BASE_URL}/paciente?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const pacienteSuccess = check(pacienteResponse, {
      'Busca por paciente': (r) => r.status === 200,
      'Sistema respondeu adequadamente': (r) => r.timings.duration < 5000,
    });
    
    consultaSuccessRate.add(pacienteSuccess);
    
    sleep(0.1);
    
    // CLASSE PROTÉTICO - Busca por protéticos
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
    
    sleep(0.1);
    
    // CLASSE DENTISTA - Busca por dentista
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
    
    sleep(0.1);
    
    // CLASSE SERVIÇO - Busca por serviço
    const servicoResponse = http.get(`${BASE_URL}/servico?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const servicoSuccess = check(servicoResponse, {
      'Busca por serviço': (r) => r.status === 200,
      'Sistema de validacao respondeu adequadamente': (r) => r.timings.duration < 5000,
    });
    
    consultaSuccessRate.add(servicoSuccess);
    
    sleep(0.1);
    
    // CLASSE PEDIDO - Busca por pedido
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
    
    // CLASSE CLÍNICA - Busca por clínicas (requisição extra para aumentar carga)
    const clinicaResponse = http.get(`${BASE_URL}/clinicas?page=0&size=3`, {
      headers: { 
        'Cookie': cookies, 
        'Accept': 'application/json' 
      }
    });
    
    totalOperations.add(1);
    
    const clinicaSuccess = check(clinicaResponse, {
      'Busca por clinica': (r) => r.status === 200 || r.status === 403,
      'Clinica respondeu': (r) => r.timings.duration < 5000,
    });
    
    consultaSuccessRate.add(clinicaSuccess);
  }
  
  sleep(0.2);
}

export function setup() {
  // Setup sem logs - deixa K6 mostrar as métricas nativas
}

export function teardown(data) {
  // Teardown sem logs customizados - K6 mostra as métricas nativas automaticamente
} 