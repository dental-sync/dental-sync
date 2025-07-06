#!/usr/bin/env pwsh

# Script para criar usuário de teste para os testes K6
# Deve ser executado após o banco ser recriado/dropado

Write-Host "=== Configurando usuário de teste para K6 ===" -ForegroundColor Green

$baseUrl = "http://localhost:8080"

# Dados do usuário de teste (protético)
$userData = @{
    nome = "Dr. João Silva Santos"
    email = "joao.silva@dentalsync.com"
    senha = "senha123"
    telefone = "(11) 98765-4321"
    cro = "CRO-SP-123456"
    isAdmin = $true
    twoFactorEnabled = $false
} | ConvertTo-Json -Depth 3

Write-Host "Tentando cadastrar usuário de teste..." -ForegroundColor Yellow

try {
    # Cadastrar protético
    $response = Invoke-RestMethod -Uri "$baseUrl/proteticos" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "✅ Usuário cadastrado com sucesso!" -ForegroundColor Green
    Write-Host "Email: joao.silva@dentalsync.com" -ForegroundColor Cyan
    Write-Host "Senha: senha123" -ForegroundColor Cyan
    
    # Testar login
    Write-Host "`nTestando login..." -ForegroundColor Yellow
    $loginData = "username=joao.silva@dentalsync.com&password=senha123&rememberMe=false"
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Body $loginData -ContentType "application/x-www-form-urlencoded"
    Write-Host "✅ Login funcionando!" -ForegroundColor Green
    Write-Host "Status: $($loginResponse.StatusCode)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro ao configurar usuário:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️  Usuário já existe - tentando fazer login..." -ForegroundColor Yellow
        try {
            $loginData = "username=joao.silva@dentalsync.com&password=senha123&rememberMe=false"
            
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Body $loginData -ContentType "application/x-www-form-urlencoded"
            Write-Host "✅ Login funcionando com usuário existente!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Login também falhou. Verifique se a aplicação está rodando." -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Configuração concluída ===" -ForegroundColor Green
Write-Host "Agora você pode executar os testes K6:" -ForegroundColor White
Write-Host "& 'C:\Program Files\k6\k6.exe' run k6-tests/busca-rapida-test.js" -ForegroundColor Cyan 