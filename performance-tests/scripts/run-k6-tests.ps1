# 🚀 Script PowerShell para Executar Testes K6 no DentalSync
# Executa diferentes tipos de testes de carga usando K6

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$ResultsDir = "results",
    [string]$K6TestsDir = "k6-tests"
)

# Função para imprimir mensagens coloridas
function Write-Header {
    param([string]$Message)
    Write-Host "================================" -ForegroundColor Magenta
    Write-Host $Message -ForegroundColor Magenta
    Write-Host "================================" -ForegroundColor Magenta
}

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

# Verificar se K6 está instalado
function Test-K6Installation {
    try {
        $k6Version = k6 version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "K6 está instalado: $k6Version"
            return $true
        }
    }
    catch {
        # Comando não encontrado
    }
    
    Write-Error "K6 não está instalado!"
    Write-Host ""
    Write-Host "Instale o K6:"
    Write-Host "  Chocolatey: choco install k6"
    Write-Host "  Winget: winget install k6"
    Write-Host "  Manual: Baixe em https://k6.io/docs/get-started/installation/"
    Write-Host ""
    return $false
}

# Verificar se aplicação está rodando
function Test-Application {
    Write-Status "Verificando se aplicação está rodando..."
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/auth/check" -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Success "Aplicação está respondendo em $BaseUrl"
        return $true
    }
    catch {
        Write-Error "Aplicação não está respondendo em $BaseUrl"
        Write-Warning "Certifique-se de que a aplicação DentalSync está rodando na porta 8080"
        return $false
    }
}

# Criar diretório de resultados
function Initialize-ResultsDirectory {
    if (-not (Test-Path $ResultsDir)) {
        New-Item -ItemType Directory -Path $ResultsDir -Force | Out-Null
    }
    Write-Status "Diretório de resultados: $ResultsDir"
}

# Analisar resultados e mostrar porcentagem de erro
function Show-TestResults {
    param(
        [string]$OutputFile,
        [string]$TestName
    )
    
    if (Test-Path $OutputFile) {
        try {
            $jsonContent = Get-Content $OutputFile -Raw | ConvertFrom-Json
            
            # Encontrar métricas de requisições HTTP
            $httpReqsMetric = $jsonContent | Where-Object { $_.metric -eq "http_reqs" } | Select-Object -Last 1
            $httpReqFailedMetric = $jsonContent | Where-Object { $_.metric -eq "http_req_failed" } | Select-Object -Last 1
            
            if ($httpReqsMetric -and $httpReqFailedMetric) {
                $totalRequests = $httpReqsMetric.data.value
                $errorRate = [math]::Round($httpReqFailedMetric.data.value * 100, 1)
                $errorCount = [math]::Round($totalRequests * ($httpReqFailedMetric.data.value), 0)
                
                Write-Host ""
                Write-Host "=" * 50
                Write-Host "📊 RESULTADO DO TESTE - $TestName" -ForegroundColor Cyan
                Write-Host "=" * 50
                Write-Host "📈 Total de requisições: $totalRequests"
                
                if ($errorRate -gt 0) {
                    Write-Host "❌ Porcentagem de erro: $errorRate%" -ForegroundColor Red
                    Write-Host "❌ Quantidade de erros: $errorCount" -ForegroundColor Red
                } else {
                    Write-Host "✅ Porcentagem de erro: $errorRate%" -ForegroundColor Green
                }
                
                Write-Host "=" * 50
            }
        }
        catch {
            Write-Warning "Não foi possível analisar os resultados do arquivo: $OutputFile"
        }
    }
}

# Executar teste de autenticação
function Start-AuthTest {
    Write-Header "🔑 TESTE DE AUTENTICAÇÃO"
    
    $testFile = Join-Path $K6TestsDir "auth-load-test.js"
    
    if (Test-Path $testFile) {
        Write-Status "Executando teste de autenticação..."
        
        $env:BASE_URL = $BaseUrl
        $outputFile = Join-Path $ResultsDir "auth-test-results.json"
        
        & k6 run --out "json=$outputFile" $testFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Teste de autenticação concluído!"
            Show-TestResults -OutputFile $outputFile -TestName "AUTENTICAÇÃO"
        }
        else {
            Write-Error "Teste de autenticação falhou com código: $LASTEXITCODE"
            Show-TestResults -OutputFile $outputFile -TestName "AUTENTICAÇÃO"
        }
    }
    else {
        Write-Warning "Arquivo de teste não encontrado: $testFile"
    }
}

# Executar teste CRUD
function Start-CrudTest {
    Write-Header "🔄 TESTE CRUD DE PROTÉTICOS"
    
    $testFile = Join-Path $K6TestsDir "protetico-crud-test.js"
    
    if (Test-Path $testFile) {
        Write-Status "Executando teste CRUD..."
        
        $env:BASE_URL = $BaseUrl
        $outputFile = Join-Path $ResultsDir "crud-test-results.json"
        
        & k6 run --out "json=$outputFile" $testFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Teste CRUD concluído!"
            Show-TestResults -OutputFile $outputFile -TestName "CRUD"
        }
        else {
            Write-Error "Teste CRUD falhou com código: $LASTEXITCODE"
            Show-TestResults -OutputFile $outputFile -TestName "CRUD"
        }
    }
    else {
        Write-Warning "Arquivo de teste não encontrado: $testFile"
    }
}

# Executar teste de stress
function Start-StressTest {
    Write-Header "🔥 TESTE DE STRESS"
    
    Write-Host "⚠️  AVISO: Este teste pode sobrecarregar a aplicação!" -ForegroundColor Red
    $response = Read-Host "Tem certeza que deseja continuar? (y/N)"
    
    if ($response -match '^[yYsS]') {
        $testFile = Join-Path $K6TestsDir "stress-test.js"
        
        if (Test-Path $testFile) {
            Write-Status "Executando teste de stress..."
            
            $env:BASE_URL = $BaseUrl
            $outputFile = Join-Path $ResultsDir "stress-test-results.json"
            
            & k6 run --out "json=$outputFile" $testFile
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Teste de stress concluído!"
                Show-TestResults -OutputFile $outputFile -TestName "STRESS"
            }
            else {
                Write-Error "Teste de stress falhou com código: $LASTEXITCODE"
                Show-TestResults -OutputFile $outputFile -TestName "STRESS"
            }
        }
        else {
            Write-Warning "Arquivo de teste não encontrado: $testFile"
        }
    }
    else {
        Write-Status "Teste de stress cancelado pelo usuário"
    }
}

# Executar teste customizado
function Start-CustomTest {
    Write-Header "⚙️ TESTE CUSTOMIZADO"
    
    $testFile = Read-Host "Digite o caminho para o arquivo de teste K6"
    
    if (Test-Path $testFile) {
        Write-Status "Executando teste customizado: $testFile"
        
        $env:BASE_URL = $BaseUrl
        $outputFile = Join-Path $ResultsDir "custom-test-results.json"
        
        & k6 run --out "json=$outputFile" $testFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Teste customizado concluído!"
            Show-TestResults -OutputFile $outputFile -TestName "CUSTOMIZADO"
        }
        else {
            Write-Error "Teste customizado falhou com código: $LASTEXITCODE"
            Show-TestResults -OutputFile $outputFile -TestName "CUSTOMIZADO"
        }
    }
    else {
        Write-Error "Arquivo não encontrado: $testFile"
    }
}

# Ver resultados anteriores
function Show-Results {
    Write-Header "📊 RESULTADOS ANTERIORES"
    
    if ((Test-Path $ResultsDir) -and (Get-ChildItem $ResultsDir -Force | Measure-Object).Count -gt 0) {
        Write-Status "Arquivos de resultado encontrados:"
        Get-ChildItem $ResultsDir | Format-Table Name, LastWriteTime, Length -AutoSize
        
        Write-Host ""
        $filename = Read-Host "Deseja abrir algum relatório HTML? Digite o nome do arquivo (ou Enter para voltar)"
        
        if ($filename -and (Test-Path (Join-Path $ResultsDir $filename))) {
            $filePath = Join-Path $ResultsDir $filename
            Start-Process $filePath
        }
    }
    else {
        Write-Warning "Nenhum resultado encontrado em $ResultsDir"
    }
}

# Limpar resultados
function Clear-Results {
    if (Test-Path $ResultsDir) {
        $response = Read-Host "Tem certeza que deseja limpar todos os resultados? (y/N)"
        
        if ($response -match '^[yY]') {
            Remove-Item "$ResultsDir\*" -Force -Recurse
            Write-Success "Resultados limpos!"
        }
        else {
            Write-Status "Operação cancelada"
        }
    }
    else {
        Write-Warning "Diretório de resultados não existe"
    }
}

# Executar todos os testes
function Start-AllTests {
    Write-Header "📊 EXECUTANDO TODOS OS TESTES"
    
    Write-Status "Isso irá executar:"
    Write-Host "  1. Teste de Autenticação"
    Write-Host "  2. Teste CRUD"
    Write-Host "  3. Teste de Stress (com confirmação)"
    Write-Host ""
    
    $response = Read-Host "Continuar? (y/N)"
    
    if ($response -match '^[yY]') {
        Start-AuthTest
        Write-Host ""
        Start-CrudTest
        Write-Host ""
        Start-StressTest
        
        Write-Header "✅ TODOS OS TESTES CONCLUÍDOS"
        Write-Status "Verifique os resultados em: $ResultsDir\"
    }
    else {
        Write-Status "Operação cancelada"
    }
}

# Menu principal
function Show-Menu {
    Write-Header "🚀 TESTES K6 - DENTALSYNC"
    
    Write-Host "Escolha o tipo de teste:"
    Write-Host ""
    Write-Host "1) 🔑 Teste de Autenticação (Login/Logout)"
    Write-Host "2) 🔄 Teste CRUD de Protéticos"
    Write-Host "3) 🔥 Teste de Stress (CUIDADO!)"
    Write-Host "4) 📊 Executar Todos os Testes"
    Write-Host "5) ⚙️ Teste Customizado"
    Write-Host "6) 📁 Ver Resultados Anteriores"
    Write-Host "7) 🧹 Limpar Resultados"
    Write-Host "0) ❌ Sair"
    Write-Host ""
    
    return Read-Host "Sua escolha"
}

# Função principal
function Main {
    # Verificações iniciais
    if (-not (Test-K6Installation)) {
        return
    }
    
    if (-not (Test-Application)) {
        return
    }
    
    Initialize-ResultsDirectory
    
    # Menu interativo
    while ($true) {
        Write-Host ""
        $choice = Show-Menu
        
        switch ($choice) {
            "1" {
                Start-AuthTest
            }
            "2" {
                Start-CrudTest
            }
            "3" {
                Start-StressTest
            }
            "4" {
                Start-AllTests
            }
            "5" {
                Start-CustomTest
            }
            "6" {
                Show-Results
            }
            "7" {
                Clear-Results
            }
            "0" {
                Write-Success "Até logo!"
                return
            }
            default {
                Write-Error "Opção inválida. Tente novamente."
            }
        }
        
        Write-Host ""
        Read-Host "Pressione Enter para continuar..." | Out-Null
    }
}

# Executar função principal
Main 