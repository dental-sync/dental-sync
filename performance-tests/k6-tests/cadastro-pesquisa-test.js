import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// 📊 Métricas customizadas
const cadastroSuccessRate = new Rate('cadastro_success_rate');
const pesquisaSuccessRate = new Rate('pesquisa_success_rate');
const cadastroDuration = new Trend('cadastro_duration');
const pesquisaDuration = new Trend('pesquisa_duration');
const totalRequests = new Counter('total_requests');

// 🎯 Configuração do teste - 200 requisições
export const options = {
  iterations: 200,  // Exatamente 200 iterações
  vus: 5,          // 5 usuários virtuais simultâneos
  duration: '5m',   // Máximo 5 minutos
  thresholds: {
    http_req_duration: ['p(95)<1000'],     // 95% < 1s
    http_req_failed: ['rate<0.05'],        // Taxa erro < 5%
    cadastro_success_rate: ['rate>0.95'],  // Cadastro > 95%
    pesquisa_success_rate: ['rate>0.99'],  // Pesquisa > 99%
  },
};

// 🌐 Configuração da API
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// 🔧 Headers
const jsonHeaders = {
  'Content-Type': 'application/json',
  'User-Agent': 'K6-DentalSync-CadastroPesquisa/1.0',
  'Accept': 'application/json',
};

const formHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'K6-DentalSync-CadastroPesquisa/1.0',
  'Accept': 'application/json',
};

// 🔑 Usuário admin
const adminUser = {
  email: 'joao.silva@dentalsync.com',
  password: 'senha123'
};

// 📋 Estados para CRO
const estados = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE'];

// 🏗️ Gerar dados de protético
function gerarProtetico() {
  const randomId = randomString(6);
  const estado = estados[randomIntBetween(0, estados.length - 1)];
  const croNumber = randomIntBetween(100000, 999999);
  
  return {
    nome: `Dr. Teste ${randomId}`,
    cro: `CRO-${estado}-${croNumber}`,
    isAdmin: false,
    telefone: `(11) 9${randomIntBetween(1000, 9999)}-${randomIntBetween(1000, 9999)}`,
    email: `teste${randomId.toLowerCase()}@dentalsync.com`,
    senha: 'senha123',
    twoFactorEnabled: false
  };
}

export default function () {
  let sessionCookies = '';
  
  // 🔑 1. Login como admin
  const loginPayload = `username=${adminUser.email}&password=${adminUser.password}&rememberMe=false`;
  const loginResponse = http.post(`${BASE_URL}/login`, loginPayload, {
    headers: formHeaders,
    tags: { name: 'login' },
  });
  
  totalRequests.add(1);
  
  const loginSuccess = check(loginResponse, {
    'Login status é 200': (r) => r.status === 200,
    'Login tem cookies': (r) => r.headers['Set-Cookie'] !== undefined,
  });
  
  if (!loginSuccess) {
    console.error(`❌ Login falhou: ${loginResponse.status}`);
    return;
  }
  
  // Extrair cookies
  if (loginResponse.headers['Set-Cookie']) {
    sessionCookies = loginResponse.headers['Set-Cookie'];
  }
  
  console.log(`🔑 Login realizado - Iteração ${__ITER + 1}/200`);
  
  // 📝 2. CADASTRAR protético
  sleep(0.2);
  const novoProtetico = gerarProtetico();
  
  const cadastroStart = Date.now();
  const cadastroResponse = http.post(`${BASE_URL}/proteticos`, JSON.stringify(novoProtetico), {
    headers: {
      ...jsonHeaders,
      'Cookie': sessionCookies
    },
    tags: { name: 'cadastro' },
  });
  
  const cadastroDur = Date.now() - cadastroStart;
  cadastroDuration.add(cadastroDur);
  totalRequests.add(1);
  
  const cadastroSuccess = check(cadastroResponse, {
    'Cadastro status é 201': (r) => r.status === 201,
    'Cadastro tem ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    },
    'Cadastro tempo < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  cadastroSuccessRate.add(cadastroSuccess);
  
  if (!cadastroSuccess) {
    console.error(`❌ Cadastro falhou: ${cadastroResponse.status}`);
    return;
  }
  
  // Extrair ID
  let proteticoId;
  try {
    const body = JSON.parse(cadastroResponse.body);
    proteticoId = body.id;
    console.log(`✅ Protético cadastrado: ${novoProtetico.nome} (ID: ${proteticoId})`);
  } catch (e) {
    console.error('❌ Erro ao extrair ID');
    return;
  }
  
  // 🔍 3. PESQUISAR protético por ID
  sleep(0.3);
  
  const pesquisaStart = Date.now();
  const pesquisaResponse = http.get(`${BASE_URL}/proteticos/${proteticoId}`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': sessionCookies
    },
    tags: { name: 'pesquisa' },
  });
  
  const pesquisaDur = Date.now() - pesquisaStart;
  pesquisaDuration.add(pesquisaDur);
  totalRequests.add(1);
  
  const pesquisaSuccess = check(pesquisaResponse, {
    'Pesquisa status é 200': (r) => r.status === 200,
    'Pesquisa tem dados': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id == proteticoId;
      } catch (e) {
        return false;
      }
    },
    'Pesquisa tempo < 500ms': (r) => r.timings.duration < 500,
  });
  
  pesquisaSuccessRate.add(pesquisaSuccess);
  
  if (pesquisaSuccess) {
    console.log(`🔍 Pesquisa realizada: ID ${proteticoId}`);
  }
  
  // 🔍 4. PESQUISAR lista de protéticos
  sleep(0.2);
  
  const listaResponse = http.get(`${BASE_URL}/proteticos?page=0&size=10`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': sessionCookies
    },
    tags: { name: 'lista' },
  });
  
  totalRequests.add(1);
  
  check(listaResponse, {
    'Lista status é 200': (r) => r.status === 200,
    'Lista tem dados': (r) => r.body && r.body.length > 0,
    'Lista tempo < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Pausa entre iterações
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5 segundos
}

// 📋 Setup inicial
export function setup() {
  console.log('🚀 Iniciando Teste de Cadastro e Pesquisa - DentalSync');
  console.log(`🌐 URL: ${BASE_URL}`);
  console.log(`📊 Meta: 200 requisições de cadastro + pesquisa`);
  
  // Verificar aplicação
  const healthCheck = http.get(`${BASE_URL}/auth/check`);
  if (healthCheck.status === 0) {
    throw new Error('❌ Aplicação não responde! Verifique se está rodando');
  }
  
  console.log('✅ Aplicação respondendo');
  return { baseUrl: BASE_URL };
}

// 📊 Relatório final
export function teardown(data) {
  console.log('🏁 Teste de Cadastro e Pesquisa concluído!');
  console.log('📁 Verifique os relatórios gerados');
}

// 📈 Gerar relatórios
export function handleSummary(data) {
  const reportTitle = 'Teste Cadastro e Pesquisa - DentalSync (200 Requisições)';
  const reportDescription = `
    <h3>🎯 Objetivo</h3>
    <p>Testar performance de cadastro e pesquisa de protéticos com exatamente 200 requisições.</p>
    
    <h3>📊 Cenário</h3>
    <ul>
      <li><strong>Iterações:</strong> 200 (fixo)</li>
      <li><strong>Usuários simultâneos:</strong> 5</li>
      <li><strong>Operações por iteração:</strong> Login → Cadastro → Pesquisa ID → Lista</li>
      <li><strong>Total de requisições:</strong> ~800 (4 por iteração)</li>
    </ul>
    
    <h3>✅ Critérios de Sucesso</h3>
    <ul>
      <li>Taxa de erro < 5%</li>
      <li>Cadastro > 95% sucesso</li>
      <li>Pesquisa > 99% sucesso</li>
      <li>Tempo resposta P95 < 1s</li>
    </ul>
  `;

  return {
    'reports/cadastro-pesquisa-report.html': htmlReport(data, { 
      title: reportTitle,
      description: reportDescription 
    }),
    'results/cadastro-pesquisa-results.json': JSON.stringify(data, null, 2),
  };
} 