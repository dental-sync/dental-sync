# 🚀 Guia Completo K6 - Testes de Carga DentalSync

## 📖 O que é K6?

K6 é uma ferramenta moderna de teste de carga desenvolvida em Go que usa JavaScript para definir os testes. É mais simples que o JMeter, tem melhor performance e é ideal para CI/CD.

### 🎯 **Vantagens do K6 vs JMeter:**

| Aspecto | K6 | JMeter |
|---------|----|---------| 
| **Linguagem** | JavaScript | Interface Gráfica + XML |
| **Performance** | Mais rápido e leve | Consome mais recursos |
| **Curva de Aprendizado** | Menor | Maior |
| **CI/CD** | Nativo | Complexo |
| **Versionamento** | Arquivos JS simples | Arquivos XML complexos |
| **Relatórios** | JSON/HTML nativos | Plugins necessários |

---

## 🏗️ **Estrutura dos Testes K6**

```
performance-tests/
├── k6-tests/
│   ├── auth-load-test.js      # Teste de autenticação
│   ├── protetico-crud-test.js # Teste CRUD completo
│   └── stress-test.js         # Teste de stress progressivo
├── scripts/
│   ├── run-k6-tests.sh       # Script Linux/Mac
│   └── run-k6-tests.ps1      # Script Windows
└── results/                   # Resultados dos testes
```

---

## 📥 **Instalação do K6**

### **Windows:**
```powershell
# Via Chocolatey
choco install k6

# Via Winget
winget install k6

# Via Scoop
scoop install k6
```

### **macOS:**
```bash
# Via Homebrew
brew install k6

# Via MacPorts
sudo port install k6
```

### **Linux:**
```bash
# Ubuntu/Debian
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# CentOS/RHEL
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6

# Arch Linux
sudo pacman -S k6
```

### **Docker:**
```bash
docker pull grafana/k6:latest
```

---

## 🚀 **Como Executar os Testes**

### **Método 1: Scripts Automatizados (Recomendado)**

**Windows (PowerShell):**
```powershell
cd performance-tests
.\scripts\run-k6-tests.ps1
```

**Linux/Mac:**
```bash
cd performance-tests
chmod +x scripts/run-k6-tests.sh
./scripts/run-k6-tests.sh
```

### **Método 2: Comandos Diretos**

```bash
# Teste de autenticação
BASE_URL=http://localhost:8080 k6 run k6-tests/auth-load-test.js

# Teste CRUD
BASE_URL=http://localhost:8080 k6 run k6-tests/protetico-crud-test.js

# Teste de stress
BASE_URL=http://localhost:8080 k6 run k6-tests/stress-test.js

# Com saída para arquivo
k6 run --out json=results/test-results.json k6-tests/auth-load-test.js
```

### **Método 3: Docker**
```bash
# Executar teste via Docker
docker run --rm -v $(pwd):/tests -e BASE_URL=http://host.docker.internal:8080 grafana/k6:latest run /tests/k6-tests/auth-load-test.js

# Com rede do host (Linux)
docker run --rm --network host -v $(pwd):/tests grafana/k6:latest run /tests/k6-tests/auth-load-test.js
```

---

## 📊 **Tipos de Teste Disponíveis**

### 1. **🔑 Teste de Autenticação (`auth-load-test.js`)**

**Cenário:** Simula fluxo completo de login/logout
- **Usuários:** 5 → 10 → 20 → 10 → 0
- **Duração:** ~7.5 minutos
- **Foco:** Sistema de autenticação

**Execução:**
```bash
k6 run k6-tests/auth-load-test.js
```

### 2. **🔄 Teste CRUD (`protetico-crud-test.js`)**

**Cenário:** Operações completas CREATE, READ, UPDATE, DELETE
- **Usuários:** 5 → 10 → 5 → 0  
- **Duração:** ~7.5 minutos
- **Foco:** API de protéticos

**Execução:**
```bash
k6 run k6-tests/protetico-crud-test.js
```

### 3. **🔥 Teste de Stress (`stress-test.js`)**

**Cenário:** Encontrar limites da aplicação
- **Usuários:** 10 → 25 → 50 → 100 → 200 → 300 → 500 → Recovery
- **Duração:** ~25 minutos
- **Foco:** Breaking point e capacidade máxima

**⚠️ ATENÇÃO:** Este teste pode sobrecarregar a aplicação!

**Execução:**
```bash
k6 run k6-tests/stress-test.js
```

---

## 📈 **Interpretando os Resultados**

### **Métricas Principais:**

- **`http_req_duration`**: Tempo de resposta das requisições
- **`http_req_failed`**: Taxa de falha das requisições  
- **`http_reqs`**: Total de requisições realizadas
- **`vus`**: Usuários virtuais simultâneos
- **`iterations`**: Número de iterações executadas

### **Thresholds (Limites):**

```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],    // 95% < 500ms
  http_req_failed: ['rate<0.01'],      // Taxa erro < 1%
  iterations: ['count>100'],           // Min 100 iterações
}
```

### **Relatórios Gerados:**

1. **Console**: Saída em tempo real
2. **JSON**: `results/test-results.json` - Dados brutos
3. **HTML**: `results/k6-*-summary.html` - Relatório visual

---

## ⚙️ **Configurações Avançadas**

### **Variáveis de Ambiente:**

```bash
# URL da aplicação
export BASE_URL=http://localhost:8080

# Configurações adicionais
export K6_OUT=json=results/custom-results.json
export K6_VUS=50
export K6_DURATION=5m
```

### **Opções via Linha de Comando:**

```bash
# Definir usuários e duração
k6 run --vus 10 --duration 30s test.js

# Múltiplos estágios
k6 run --stage 30s:10,1m:20,30s:0 test.js

# Salvar resultados
k6 run --out json=results.json --out influxdb=http://localhost:8086/k6 test.js

# Modo silencioso
k6 run --quiet test.js

# Limitar requisições por segundo
k6 run --rps 100 test.js
```

### **Integração com Monitoramento:**

```bash
# InfluxDB + Grafana
k6 run --out influxdb=http://localhost:8086/k6 test.js

# Prometheus
k6 run --out experimental-prometheus-rw test.js

# DataDog
k6 run --out datadog test.js

# New Relic
k6 run --out newrelic test.js
```

---

## 🛠️ **Criando Testes Customizados**

### **Estrutura Básica:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const response = http.get('http://localhost:8080/api/endpoint');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### **Exemplo Avançado:**

```javascript
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95) < 500'],
    http_req_failed: ['rate < 0.1'],
  },
};

export default function () {
  group('API Login', function () {
    const loginResponse = http.post('http://localhost:8080/login', {
      username: 'test@example.com',
      password: 'password123'
    });
    
    check(loginResponse, {
      'login successful': (r) => r.status === 200,
    });
  });
  
  group('API Data Fetch', function () {
    const dataResponse = http.get('http://localhost:8080/api/data');
    
    check(dataResponse, {
      'data retrieved': (r) => r.status === 200,
      'has data': (r) => r.json().length > 0,
    });
  });
  
  sleep(Math.random() * 3 + 1);
}
```

---

## 🔧 **Debugging e Troubleshooting**

### **Modo Debug:**
```bash
# Habilitar logs detalhados
k6 run --http-debug="full" test.js

# Mostrar apenas erros
k6 run --log-output=stderr test.js

# Salvar logs
k6 run --log-output=file=logs.txt test.js
```

### **Problemas Comuns:**

1. **Erro de Conexão:**
   ```
   ERRO: dial: connection refused
   SOLUÇÃO: Verificar se aplicação está rodando
   ```

2. **Timeout:**
   ```
   ERRO: request timeout
   SOLUÇÃO: Aumentar timeout ou reduzir carga
   ```

3. **Memória:**
   ```
   ERRO: out of memory
   SOLUÇÃO: Usar --discard-response-bodies
   ```

### **Otimizações:**

```javascript
export const options = {
  // Descartar response bodies para economizar memória
  discardResponseBodies: true,
  
  // Reutilizar conexões
  noConnectionReuse: false,
  
  // Limitar conexões simultâneas
  batch: 20,
  
  // Configurar timeouts
  httpReqTimeout: '10s',
};
```

---

## 📊 **Comparação: K6 vs JMeter no DentalSync**

| Critério | K6 | JMeter |
|----------|----| -------|
| **Facilidade de Uso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Relatórios** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **CI/CD** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Comunidade** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Recursos** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### **Quando usar K6:**
- ✅ Projetos modernos
- ✅ Integração CI/CD
- ✅ Equipes de desenvolvimento
- ✅ Testes rápidos e simples
- ✅ Controle de versão

### **Quando usar JMeter:**
- ✅ Testes complexos
- ✅ Equipes de QA especializadas  
- ✅ Interface gráfica necessária
- ✅ Protocolos específicos
- ✅ Relatórios detalhados

---

## 🎯 **Próximos Passos**

1. **Instalar K6** seguindo o guia de instalação
2. **Executar teste básico** com `auth-load-test.js`
3. **Analisar resultados** nos relatórios HTML
4. **Customizar testes** conforme necessidades
5. **Integrar no pipeline** CI/CD

---

## 📚 **Recursos Adicionais**

- **Documentação Oficial:** https://k6.io/docs/
- **Exemplos:** https://github.com/grafana/k6/tree/master/examples
- **Community:** https://community.k6.io/
- **Extensions:** https://k6.io/docs/extensions/

---

## 💡 **Dicas Finais**

1. **Sempre teste em ambiente de homologação primeiro**
2. **Monitore recursos do servidor durante os testes**
3. **Use dados de teste realistas**
4. **Documente cenários de teste**
5. **Automatize execução no CI/CD**

---

*Criado para o projeto DentalSync - Testes de Performance com K6* 🚀 