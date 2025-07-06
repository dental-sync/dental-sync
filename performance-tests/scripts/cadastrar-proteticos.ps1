# 🚀 Script PowerShell para Cadastrar Protéticos em Massa
# Este script cadastra todos os protéticos do arquivo JSON na aplicação

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$ProteticosFile = "test-data/proteticos-cadastro.json"
)

# Função para imprimir mensagens coloridas
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Configurações
$ResultsDir = "results/cadastro-proteticos"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🚀 CADASTRO EM MASSA DE PROTÉTICOS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Verificar se aplicação está rodando
Write-Status "Verificando se aplicação está rodando..."
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/check" -Method GET -TimeoutSec 10
    if ($response.StatusCode -in @(200, 401, 403)) {
        Write-Success "Aplicação está rodando"
    }
} catch {
    Write-Error "Aplicação não está respondendo em $BaseUrl"
    Write-Error "Certifique-se que a aplicação está rodando:"
    Write-Error "  cd core && mvn spring-boot:run"
    exit 1
}

# Verificar se arquivo de protéticos existe
if (-not (Test-Path $ProteticosFile)) {
    Write-Error "Arquivo não encontrado: $ProteticosFile"
    exit 1
}

# Criar diretório de resultados
if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir -Force | Out-Null
}

# Ler JSON
Write-Status "Lendo protéticos do arquivo: $ProteticosFile"
$proteticos = Get-Content $ProteticosFile -Raw | ConvertFrom-Json

# Contadores
$total = $proteticos.Count
$sucesso = 0
$erro = 0

Write-Status "Processando $total protéticos..."

# Processar cada protético
for ($i = 0; $i -lt $proteticos.Count; $i++) {
    $protetico = $proteticos[$i]
    $numero = $i + 1
    
    Write-Status "[$numero/$total] Cadastrando: $($protetico.nome) ($($protetico.email))"
    
    try {
        # Converter para JSON
        $json = $protetico | ConvertTo-Json -Compress
        
        # Fazer requisição POST
        $response = Invoke-WebRequest -Uri "$BaseUrl/proteticos" `
            -Method POST `
            -ContentType "application/json" `
            -Body $json `
            -TimeoutSec 30
        
        if ($response.StatusCode -eq 201) {
            Write-Success "✅ Cadastrado: $($protetico.nome)"
            $sucesso++
            $response.Content | Out-File -FilePath "$ResultsDir/success_$numero.json" -Encoding UTF8
        }
        
    } catch {
        Write-Error "❌ Erro ao cadastrar: $($protetico.nome)"
        $erro++
        
        # Salvar erro
        $errorDetails = @{
            StatusCode = $_.Exception.Response.StatusCode.value__
            StatusDescription = $_.Exception.Response.StatusDescription
            ResponseBody = $_.Exception.Response | ConvertTo-Json
            Protetico = $protetico
        }
        
        $errorDetails | ConvertTo-Json | Out-File -FilePath "$ResultsDir/error_$numero.json" -Encoding UTF8
        
        # Mostrar erro específico
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "email") {
            Write-Warning "   Possível email duplicado"
        } elseif ($errorMessage -match "cro") {
            Write-Warning "   Possível CRO duplicado"
        }
    }
    
    # Pequena pausa entre requisições
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Success "🎉 CADASTRO CONCLUÍDO!"
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Estatísticas:" -ForegroundColor White
Write-Host "   Total processados: $total" -ForegroundColor White
Write-Host "   Sucessos: $sucesso" -ForegroundColor Green
Write-Host "   Erros: $erro" -ForegroundColor Red
Write-Host ""
Write-Host "📁 Resultados salvos em: $ResultsDir/" -ForegroundColor White

if ($erro -gt 0) {
    Write-Host ""
    Write-Warning "⚠️ Alguns cadastros falharam. Verifique os arquivos de erro."
    Write-Warning "Possíveis causas:"
    Write-Warning "  - Emails ou CROs já existem no banco"
    Write-Warning "  - Formato inválido dos dados"
    Write-Warning "  - Validações do modelo não atendidas"
}

Write-Host ""
Write-Status "Para testar login, use qualquer dos usuários cadastrados:"
Write-Status "  Email: joao.silva@dentalsync.com"
Write-Status "  Senha: senha123"
Write-Host ""
Write-Status "Para ver todos os protéticos:"
Write-Status "  Invoke-RestMethod -Uri '$BaseUrl/proteticos' -Method GET"

Write-Host ""
Write-Host "🔧 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  # Testar login via PowerShell:" -ForegroundColor Gray
Write-Host "  `$body = @{ username='joao.silva@dentalsync.com'; password='senha123'; rememberMe='false' }" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod -Uri '$BaseUrl/login' -Method POST -Body `$body" -ForegroundColor Gray 