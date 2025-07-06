# 🚀 Como Usar os Testes de Performance DentalSync

## Guia Rápido de Execução com K6

### 1. Pré-requisitos

```bash
# Instalar K6 (Windows)
winget install k6.k6

# Ou via Chocolatey
choco install k6

# Verificar instalação
k6 version
```

### 2. Configuração Inicial

```bash
# Navegar para o diretório do projeto
cd dental-sync/performance-tests

# Verificar se aplicação DentalSync está rodando
curl http://localhost:8080/auth/check
```

### 3. Executar Testes K6

**Windows (PowerShell):**
```powershell
# Menu interativo com todos os testes
.\scripts\run-k6-tests.ps1

# Executar teste específico
k6 run k6-tests/auth-load-test.js
k6 run k6-tests/protetico-crud-test.js
k6 run k6-tests/stress-test.js
```

**Linux/Mac:**
```bash
# Menu interativo
chmod +x scripts/run-k6-tests.sh
./scripts/run-k6-tests.sh

# Executar teste específico
k6 run k6-tests/auth-load-test.js
```

## 📊 Acessar Resultados

### Relatórios HTML
- **Localização:** `./reports/`
- **Abrir:** Abrir arquivo `.html` gerado após cada teste

### Resultados JSON
- **Localização:** `./results/`
- **Formato:** JSON com métricas detalhadas

## 🎯 Cenários de Teste Disponíveis

### 1. Teste de Autenticação (auth-load-test.js)
- **Objetivo:** Testar sistema de login
- **Usuários:** 5 → 10 → 20 → 10 → 0
- **Duração:** ~7.5 minutos
- **Operações:** Login + Verificação + Logout

### 2. Teste CRUD Protético (protetico-crud-test.js)
- **Objetivo:** Testar operações CRUD completas
- **Usuários:** 5 → 15 → 5 → 0
- **Duração:** ~6 minutos
- **Operações:** CREATE → READ → UPDATE → DELETE

### 3. Teste de Stress (stress-test.js)
- **Objetivo:** Encontrar limite da aplicação
- **Usuários:** 10 → 500 (progressivo)
- **Duração:** ~25 minutos
- **Meta:** Detectar breaking point

## ⚙️ Configurações Importantes

### Variáveis de Ambiente
```javascript
// No arquivo de teste K6
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const TEST_USERS = __ENV.TEST_USERS || 20;
```

### Executar com Parâmetros
```bash
# Personalizar URL base
k6 run -e BASE_URL=https://production.com k6-tests/auth-load-test.js

# Personalizar número de usuários
k6 run -e TEST_USERS=50 k6-tests/stress-test.js
```

## 🔧 Solução de Problemas

### Erro "Connection Refused"
```bash
# Verificar se aplicação está rodando
curl http://localhost:8080/auth/check

# Iniciar aplicação DentalSync
cd core && mvn spring-boot:run
```

### Erro "Email ou senha inválidos"
```bash
# Executar script para criar usuário de teste
.\scripts\cadastrar-proteticos.ps1
```

### K6 não encontrado
```bash
# Windows - verificar PATH
where k6

# Se não estiver no PATH, usar caminho completo
& "C:\Program Files\k6\k6.exe" run k6-tests/auth-load-test.js
```

## 📈 Interpretando Resultados K6

### Métricas Principais
- **http_req_duration:** Tempo de resposta (p95 < 500ms)
- **http_req_failed:** Taxa de erro (< 1%)
- **iterations:** Número de execuções completas
- **vus:** Usuários virtuais simultâneos

### Thresholds (Critérios de Aceitação)
```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],     // 95% < 500ms
  http_req_failed: ['rate<0.01'],       // Taxa erro < 1%
  login_success_rate: ['rate>0.99'],    // Login > 99%
}
```

### Exemplo de Resultado Bem-Sucedido
```
✓ http_req_duration.........p(95)=61.79ms < 500ms
✓ http_req_failed...........rate=2.17% < 1%
✓ login_success_rate........rate=100.00% > 99%
```

## 🚨 Alertas e Limites

### CPU > 85%
```bash
# Monitorar durante teste
top -p $(pgrep java)

# Ajustar JVM
export JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC"
```

### Taxa de Erro > 5%
- Verificar logs da aplicação
- Reduzir número de usuários virtuais
- Aumentar tempo entre requisições (sleep)

### Tempo de Resposta > 1s
- Verificar queries do banco de dados
- Analisar gargalos de rede
- Otimizar código da aplicação

## 📁 Arquivos de Dados

- `test-data/users.csv` - Usuários para autenticação
- `test-data/pacientes.csv` - Dados de pacientes
- `test-data/proteticos-cadastro.json` - Dados de protéticos
- `test-data/protetico-individual-examples.md` - Exemplos de JSONs

## 🎯 Vantagens do K6

### ✅ **Performance Superior**
- Consumo de memória 40% menor que JMeter
- Execução 3x mais rápida
- Melhor handling de conexões simultâneas

### ✅ **Facilidade de Uso**
- Scripts em JavaScript (familiar para devs)
- Sintaxe simples e intuitiva
- Debugging mais fácil

### ✅ **Integração DevOps**
- CI/CD nativo
- Relatórios automáticos
- Controle de versão simples

### ✅ **Relatórios Modernos**
- HTML responsivo
- Gráficos interativos
- Exportação JSON/CSV

---

**📖 Para documentação completa do K6:** Veja `K6-GUIDE.md`

**🔧 Para configuração avançada:** Veja scripts em `./scripts/` 