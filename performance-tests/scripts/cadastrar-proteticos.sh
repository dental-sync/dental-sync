#!/bin/bash

# 🚀 Script para Cadastrar Protéticos em Massa
# Este script cadastra todos os protéticos do arquivo JSON na aplicação

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configurações
BASE_URL="http://localhost:8080"
PROTETICOS_FILE="test-data/proteticos-cadastro.json"
RESULTS_DIR="results/cadastro-proteticos"

echo "==============================================="
echo "🚀 CADASTRO EM MASSA DE PROTÉTICOS"
echo "==============================================="

# Verificar se aplicação está rodando
print_status "Verificando se aplicação está rodando..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/auth/check" | grep -q "200\|401\|403"; then
    print_success "Aplicação está rodando"
else
    print_error "Aplicação não está respondendo em $BASE_URL"
    print_error "Certifique-se que a aplicação está rodando:"
    print_error "  cd core && mvn spring-boot:run"
    exit 1
fi

# Verificar se arquivo de protéticos existe
if [ ! -f "$PROTETICOS_FILE" ]; then
    print_error "Arquivo não encontrado: $PROTETICOS_FILE"
    exit 1
fi

# Criar diretório de resultados
mkdir -p "$RESULTS_DIR"

# Ler JSON e cadastrar cada protético
print_status "Lendo protéticos do arquivo: $PROTETICOS_FILE"

# Contador
total=0
sucesso=0
erro=0

# Processar cada protético do array JSON
while IFS= read -r protetico; do
    # Verificar se é uma linha válida (não vazia, não comentário)
    if [[ "$protetico" =~ ^\s*\{ ]]; then
        total=$((total + 1))
        
        # Extrair email para identificação
        email=$(echo "$protetico" | sed -n 's/.*"email":\s*"\([^"]*\)".*/\1/p')
        nome=$(echo "$protetico" | sed -n 's/.*"nome":\s*"\([^"]*\)".*/\1/p')
        
        print_status "Cadastrando: $nome ($email)"
        
        # Fazer requisição POST
        response=$(curl -s -X POST "$BASE_URL/proteticos" \
            -H "Content-Type: application/json" \
            -d "$protetico" \
            -w "HTTPSTATUS:%{http_code}")
        
        # Extrair código HTTP
        http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        response_body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
        
        # Verificar resultado
        if [ "$http_code" -eq 201 ]; then
            print_success "✅ Cadastrado: $nome"
            sucesso=$((sucesso + 1))
            echo "$response_body" > "$RESULTS_DIR/success_$total.json"
        else
            print_error "❌ Erro ao cadastrar: $nome (HTTP $http_code)"
            erro=$((erro + 1))
            echo "HTTP $http_code: $response_body" > "$RESULTS_DIR/error_$total.txt"
            
            # Mostrar erro específico
            if echo "$response_body" | grep -q "email"; then
                print_warning "   Possível email duplicado"
            elif echo "$response_body" | grep -q "cro"; then
                print_warning "   Possível CRO duplicado"
            fi
        fi
        
        # Pequena pausa entre requisições
        sleep 0.5
    fi
done < <(jq -c '.[]' "$PROTETICOS_FILE" 2>/dev/null || cat "$PROTETICOS_FILE")

echo ""
echo "==============================================="
print_success "🎉 CADASTRO CONCLUÍDO!"
echo "==============================================="
echo ""
echo "📊 Estatísticas:"
echo "   Total processados: $total"
echo "   Sucessos: $sucesso"
echo "   Erros: $erro"
echo ""
echo "📁 Resultados salvos em: $RESULTS_DIR/"

if [ $erro -gt 0 ]; then
    echo ""
    print_warning "⚠️ Alguns cadastros falharam. Verifique os arquivos de erro."
    print_warning "Possíveis causas:"
    print_warning "  - Emails ou CROs já existem no banco"
    print_warning "  - Formato inválido dos dados"
    print_warning "  - Validações do modelo não atendidas"
fi

echo ""
print_status "Para testar login, use qualquer dos usuários cadastrados:"
print_status "  Email: joao.silva@dentalsync.com"
print_status "  Senha: senha123"
echo ""
print_status "Para ver todos os protéticos:"
print_status "  curl $BASE_URL/proteticos" 