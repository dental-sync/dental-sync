import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Métricas customizadas
const loginSuccessRate = new Rate('login_success_rate');
const consultaSuccessRate = new Rate('consulta_success_rate');
const totalOperations = new Counter('total_operations');

// Configuração de STRESS TEST EXTREMO - 500 usuários para QUEBRAR o sistema
export const options = {
  vus: 500,          // 500 usuários virtuais simultâneos (STRESS EXTREMO)
  duration: '1m',    // 1 minuto de bombardeio intenso
  thresholds: {
    http_req_duration: ['p(95)<30000'],    // 95% das requisições < 30 segundos (muito tolerante)
    http_req_failed: ['rate<0.95'],        // < 95% de falhas (esperamos quebrar)
    login_success_rate: ['rate>0.01'],     // > 1% login com sucesso (quase impossível)
    consulta_success_rate: ['rate>0.01'],  // > 1% consultas com sucesso (quase impossível)
  },
};

const BASE_URL = 'http://localhost:8080';
const testUser = { email: 'joao.silva@dentalsync.com', password: 'senha123' };

export default function () {
  // BOMBARDEIO DE LOGIN - 5 tentativas para QUEBRAR autenticação
  let cookies = '';
  let loginOK = false;
  
  // 5 tentativas de login para QUEBRAR o sistema de autenticação
  for (let i = 1; i <= 5; i++) {
    const loginResponse = http.post(`${BASE_URL}/login`, 
      `username=${testUser.email}&password=${testUser.password}&rememberMe=false`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    totalOperations.add(1);
    
    const loginSuccess = check(loginResponse, {
      'Login realizado com sucesso': (r) => r.status === 200,
      'Sessao estabelecida corretamente': (r) => r.headers['Set-Cookie'] !== undefined,
      'Tempo de resposta do login adequado': (r) => r.timings.duration < 3000, // Mais rigoroso
    });
    
    loginSuccessRate.add(loginSuccess);
    
    if (loginSuccess && loginResponse.headers['Set-Cookie'] && !loginOK) {
      cookies = loginResponse.headers['Set-Cookie'];
      loginOK = true;
    }
    
    // Sem sleep entre logins para QUEBRAR autenticação
  }
  
  if (loginOK && cookies) {
    
    // BOMBARDEIO PACIENTE - 3 requisições para QUEBRAR
    for (let p = 0; p < 3; p++) {
      const pacienteResponse = http.get(`${BASE_URL}/paciente?page=${p}&size=5`, {
        headers: { 
          'Cookie': cookies, 
          'Accept': 'application/json' 
        }
      });
      
      totalOperations.add(1);
      
      const pacienteSuccess = check(pacienteResponse, {
        'Busca por paciente': (r) => r.status === 200,
        'Sistema respondeu adequadamente': (r) => r.timings.duration < 2000, // Mais rigoroso
      });
      
      consultaSuccessRate.add(pacienteSuccess);
    }
    
    // BOMBARDEIO PROTÉTICO - 3 requisições para QUEBRAR
    for (let pt = 0; pt < 3; pt++) {
      const proteticosResponse = http.get(`${BASE_URL}/proteticos?page=${pt}&size=5`, {
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
    }
    
    // BOMBARDEIO DENTISTA - 2 requisições para QUEBRAR
    for (let d = 0; d < 2; d++) {
      const dentistaResponse = http.get(`${BASE_URL}/dentistas?page=${d}&size=5`, {
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
    }
    
    // BOMBARDEIO SERVIÇO - 2 requisições para QUEBRAR
    for (let s = 0; s < 2; s++) {
      const servicoResponse = http.get(`${BASE_URL}/servico?page=${s}&size=5`, {
        headers: { 
          'Cookie': cookies, 
          'Accept': 'application/json' 
        }
      });
      
      totalOperations.add(1);
      
      const servicoSuccess = check(servicoResponse, {
        'Busca por serviço': (r) => r.status === 200,
        'Sistema de validacao respondeu adequadamente': (r) => r.timings.duration < 2000, // Mais rigoroso
      });
      
      consultaSuccessRate.add(servicoSuccess);
    }
    
    // BOMBARDEIO PEDIDO - 2 requisições para QUEBRAR
    for (let pe = 0; pe < 2; pe++) {
      const pedidoResponse = http.get(`${BASE_URL}/pedidos?page=${pe}&size=5`, {
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
    }
    
    // CLASSE CLÍNICA - Busca por clínicas
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
  
  // Sem sleep entre iterações para bombardeio máximo
}

export function setup() {
  // Setup sem logs - deixa K6 mostrar as métricas nativas
}

export function teardown(data) {
  // Teardown sem logs customizados - K6 mostra as métricas nativas automaticamente
} 