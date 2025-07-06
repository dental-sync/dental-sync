# 🚀 Testes de Performance DentalSync com K6

Este diretório contém todos os testes de performance da aplicação DentalSync usando **K6**.

## 📁 Estrutura do Projeto

```
performance-tests/
├── k6-tests/              # Scripts de teste K6 (.js)
│   ├── auth-load-test.js      # Teste de autenticação
│   ├── protetico-crud-test.js # Teste CRUD protético
│   └── stress-test.js         # Teste de stress
├── scripts/               # Scripts de automação
│   ├── run-k6-tests.ps1       # Menu Windows
│   ├── run-k6-tests.sh        # Menu Linux/Mac
│   ├── cadastrar-proteticos.ps1
│   └── cadastrar-proteticos.sh
├── monitoring/            # Configurações Grafana/InfluxDB
├── reports/               # Relatórios HTML gerados
├── results/               # Resultados JSON dos testes
├── monitoring/            # Configurações Grafana/InfluxDB
├── docker-compose.yml     # Stack de monitoramento
├── K6-GUIDE.md           # Guia completo K6
└── COMO-USAR.md          # Guia rápido
```

## ⚡ Início Rápido

### 1. Instalar K6

**Windows:**
```powershell
# Via WinGet (recomendado)
winget install k6.k6

# Via Chocolatey
choco install k6

# Verificar instalação
k6 version
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install k6

# macOS
brew install k6

# Verificar instalação
k6 version
```

### 2. Preparar Ambiente

```bash
# Navegar para pasta de testes
cd dental-sync/performance-tests

# Verificar se aplicação está rodando
curl http://localhost:8080/auth/check

# Cadastrar usuários de teste (se necessário)
.\scripts\cadastrar-proteticos.ps1  # Windows
./scripts/cadastrar-proteticos.sh   # Linux/Mac
```

### 3. Executar Testes

**Menu Interativo (Recomendado):**
```powershell
# Windows
.\scripts\run-k6-tests.ps1

# Linux/Mac
chmod +x scripts/run-k6-tests.sh
./scripts/run-k6-tests.sh
```

**Comandos Diretos:**
```bash
# Teste de login
k6 run k6-tests/auth-load-test.js

# Teste CRUD
k6 run k6-tests/protetico-crud-test.js

# Teste de stress
k6 run k6-tests/stress-test.js
```

## 🎯 Cenários de Teste

### 1. Teste de Autenticação (auth-load-test.js)
- **Objetivo:** Validar sistema de login sob carga
- **Cenário:** 5 → 10 → 20 → 10 → 0 usuários
- **Duração:** ~7.5 minutos
- **Operações:** Login + Verificação + Logout

### 2. Teste CRUD Protético (protetico-crud-test.js)
- **Objetivo:** Testar operações CRUD completas
- **Cenário:** 5 → 15 → 5 → 0 usuários
- **Duração:** ~6 minutos
- **Operações:** CREATE → READ → UPDATE → DELETE

### 3. Teste de Stress (stress-test.js)
- **Objetivo:** Encontrar breaking point da aplicação
- **Cenário:** 10 → 500 usuários (progressivo)
- **Duração:** ~25 minutos
- **Meta:** Detectar limite máximo

## 📊 Resultados e Relatórios

### Relatórios HTML
- **Localização:** `./reports/`
- **Formato:** HTML interativo com gráficos
- **Exemplo:** `auth-load-test-report-2024-01-15-14-30.html`

### Dados JSON
- **Localização:** `./results/`
- **Formato:** JSON com métricas detalhadas
- **Uso:** Análise programática, CI/CD

### Monitoramento em Tempo Real
```bash
# Subir stack de monitoramento
docker-compose up -d

# Acessar dashboards
# Grafana: http://localhost:3000 (admin/admin123)
# Prometheus: http://localhost:9090
```

## 🔧 Configurações Avançadas

### Personalizar Parâmetros
```bash
# Alterar URL base
k6 run -e BASE_URL=https://production.com k6-tests/auth-load-test.js

# Alterar número de usuários
k6 run -e TEST_USERS=50 k6-tests/stress-test.js

# Executar com múltiplas variáveis
k6 run -e BASE_URL=https://staging.com -e TEST_USERS=30 k6-tests/auth-load-test.js
```

### Thresholds (Critérios de Sucesso)
```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],     // 95% < 500ms
  http_req_failed: ['rate<0.01'],       // Taxa erro < 1%
  login_success_rate: ['rate>0.99'],    // Login > 99%
}
```

## 🚨 Solução de Problemas

### Erro "Connection Refused"
```bash
# Verificar aplicação
curl http://localhost:8080/auth/check

# Iniciar DentalSync
cd core && mvn spring-boot:run
```

### Erro "Email ou senha inválidos"
```bash
# Cadastrar usuários de teste
.\scripts\cadastrar-proteticos.ps1
```

### K6 não encontrado
```bash
# Windows - verificar PATH
where k6

# Usar caminho completo se necessário
& "C:\Program Files\k6\k6.exe" run k6-tests/auth-load-test.js
```

## 📈 Interpretando Resultados

### Métricas Principais
- **http_req_duration:** Tempo de resposta
- **http_req_failed:** Taxa de erro
- **iterations:** Execuções completas
- **vus:** Usuários virtuais simultâneos

### Exemplo de Resultado Exitoso
```
✓ http_req_duration.........p(95)=61.79ms < 500ms
✓ http_req_failed...........rate=2.17% < 1%
✓ login_success_rate........rate=100.00% > 99%
```

### Sinais de Alerta
- Taxa de erro > 5%
- Tempo de resposta P95 > 1s
- CPU > 85%
- Memória > 90%

## 📊 Dados de Teste

Os testes K6 utilizam:
- **Dados hardcoded** nos próprios scripts para máxima performance
- **Geradores automáticos** de dados aleatórios para testes realistas  
- **Scripts de cadastro** para criar usuários quando necessário

## 🎯 Vantagens do K6

✅ **Performance:** 40% menos memória, 3x mais rápido  
✅ **Simplicidade:** JavaScript familiar  
✅ **DevOps:** Integração CI/CD nativa  
✅ **Relatórios:** HTML moderno e interativo  
✅ **Flexibilidade:** Configuração via código  

## 📖 Documentação Adicional

- **Guia Completo:** `K6-GUIDE.md`
- **Guia Rápido:** `COMO-USAR.md`
- **Documentação K6:** https://k6.io/docs/

---

**💡 Dica:** Execute sempre em ambiente de teste antes de usar em produção! 