#!/bin/bash

# 🚀 Script para Executar Testes K6 no DentalSync
# Executa diferentes tipos de testes de carga usando K6

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

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
RESULTS_DIR="results"
K6_TESTS_DIR="k6-tests"

# Verificar se K6 está instalado
check_k6() {
    if ! command -v k6 &> /dev/null; then
        print_error "K6 não está instalado!"
        echo ""
        echo "Instale o K6:"
        echo "  macOS: brew install k6"
        echo "  Ubuntu/Debian: sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69"
        echo "                 echo 'deb https://dl.k6.io/deb stable main' | sudo tee /etc/apt/sources.list.d/k6.list"
        echo "                 sudo apt-get update && sudo apt-get install k6"
        echo "  CentOS/RHEL: sudo dnf install https://dl.k6.io/rpm/repo.rpm && sudo dnf install k6"
        echo ""
        echo "Ou baixe em: https://k6.io/docs/get-started/installation/"
        exit 1
    fi
    
    print_success "K6 está instalado: $(k6 version)"
}

# Verificar se aplicação está rodando
check_application() {
    print_status "Verificando se aplicação está rodando..."
    
    if curl -s -f "${BASE_URL}/auth/check" > /dev/null; then
        print_success "Aplicação está respondendo em ${BASE_URL}"
    else
        print_error "Aplicação não está respondendo em ${BASE_URL}"
        print_warning "Certifique-se de que a aplicação DentalSync está rodando na porta 8080"
        exit 1
    fi
}

# Criar diretório de resultados
setup_results_dir() {
    mkdir -p "${RESULTS_DIR}"
    print_status "Diretório de resultados: ${RESULTS_DIR}"
}

# Analisar resultados e mostrar porcentagem de erro
show_test_results() {
    local output_file="$1"
    local test_name="$2"
    
    if [[ -f "$output_file" ]]; then
        # Extrair métricas usando jq se disponível, senão usar grep/awk
        if command -v jq &> /dev/null; then
            local total_reqs=$(jq -r 'select(.metric=="http_reqs") | .data.value' "$output_file" | tail -1)
            local error_rate=$(jq -r 'select(.metric=="http_req_failed") | .data.value' "$output_file" | tail -1)
        else
            local total_reqs=$(grep '"metric":"http_reqs"' "$output_file" | tail -1 | grep -o '"value":[0-9]*' | cut -d':' -f2)
            local error_rate=$(grep '"metric":"http_req_failed"' "$output_file" | tail -1 | grep -o '"value":[0-9.]*' | cut -d':' -f2)
        fi
        
        if [[ -n "$total_reqs" && -n "$error_rate" ]]; then
            local error_percentage=$(echo "$error_rate * 100" | bc -l | xargs printf "%.1f")
            local error_count=$(echo "$total_reqs * $error_rate" | bc -l | xargs printf "%.0f")
            
            echo ""
            echo "=================================================="
            echo -e "${CYAN}📊 RESULTADO DO TESTE - $test_name${NC}"
            echo "=================================================="
            echo "📈 Total de requisições: $total_reqs"
            
            if (( $(echo "$error_percentage > 0" | bc -l) )); then
                echo -e "${RED}❌ Porcentagem de erro: ${error_percentage}%${NC}"
                echo -e "${RED}❌ Quantidade de erros: $error_count${NC}"
            else
                echo -e "${GREEN}✅ Porcentagem de erro: ${error_percentage}%${NC}"
            fi
            
            echo "=================================================="
        fi
    fi
}

# Executar teste de autenticação
run_auth_test() {
    print_header "🔑 TESTE DE AUTENTICAÇÃO"
    
    if [[ -f "${K6_TESTS_DIR}/auth-load-test.js" ]]; then
        print_status "Executando teste de autenticação..."
        
        BASE_URL="${BASE_URL}" k6 run \
            --out json="${RESULTS_DIR}/auth-test-results.json" \
            "${K6_TESTS_DIR}/auth-load-test.js"
        
        if [[ $? -eq 0 ]]; then
            print_success "Teste de autenticação concluído!"
            show_test_results "${RESULTS_DIR}/auth-test-results.json" "AUTENTICAÇÃO"
        else
            print_error "Teste de autenticação falhou!"
            show_test_results "${RESULTS_DIR}/auth-test-results.json" "AUTENTICAÇÃO"
        fi
    else
        print_warning "Arquivo de teste de autenticação não encontrado: ${K6_TESTS_DIR}/auth-load-test.js"
    fi
}

# Executar teste CRUD
run_crud_test() {
    print_header "🔄 TESTE CRUD DE PROTÉTICOS"
    
    if [[ -f "${K6_TESTS_DIR}/protetico-crud-test.js" ]]; then
        print_status "Executando teste CRUD..."
        
        BASE_URL="${BASE_URL}" k6 run \
            --out json="${RESULTS_DIR}/crud-test-results.json" \
            "${K6_TESTS_DIR}/protetico-crud-test.js"
        
        if [[ $? -eq 0 ]]; then
            print_success "Teste CRUD concluído!"
            show_test_results "${RESULTS_DIR}/crud-test-results.json" "CRUD"
        else
            print_error "Teste CRUD falhou!"
            show_test_results "${RESULTS_DIR}/crud-test-results.json" "CRUD"
        fi
    else
        print_warning "Arquivo de teste CRUD não encontrado: ${K6_TESTS_DIR}/protetico-crud-test.js"
    fi
}

# Executar teste de stress
run_stress_test() {
    print_header "🔥 TESTE DE STRESS"
    
    echo -e "${RED}⚠️  AVISO: Este teste pode sobrecarregar a aplicação!${NC}"
    echo -e "${YELLOW}Tem certeza que deseja continuar? (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY]|[sS])$ ]]; then
        if [[ -f "${K6_TESTS_DIR}/stress-test.js" ]]; then
            print_status "Executando teste de stress..."
            
            BASE_URL="${BASE_URL}" k6 run \
                --out json="${RESULTS_DIR}/stress-test-results.json" \
                "${K6_TESTS_DIR}/stress-test.js"
            
            if [[ $? -eq 0 ]]; then
                print_success "Teste de stress concluído!"
                show_test_results "${RESULTS_DIR}/stress-test-results.json" "STRESS"
            else
                print_error "Teste de stress falhou!"
                show_test_results "${RESULTS_DIR}/stress-test-results.json" "STRESS"
            fi
        else
            print_warning "Arquivo de teste de stress não encontrado: ${K6_TESTS_DIR}/stress-test.js"
        fi
    else
        print_status "Teste de stress cancelado pelo usuário"
    fi
}

# Executar teste customizado
run_custom_test() {
    print_header "⚙️ TESTE CUSTOMIZADO"
    
    echo "Digite o caminho para o arquivo de teste K6:"
    read -r test_file
    
    if [[ -f "$test_file" ]]; then
        print_status "Executando teste customizado: $test_file"
        
        BASE_URL="${BASE_URL}" k6 run \
            --out json="${RESULTS_DIR}/custom-test-results.json" \
            "$test_file"
        
        if [[ $? -eq 0 ]]; then
            print_success "Teste customizado concluído!"
            show_test_results "${RESULTS_DIR}/custom-test-results.json" "CUSTOMIZADO"
        else
            print_error "Teste customizado falhou!"
            show_test_results "${RESULTS_DIR}/custom-test-results.json" "CUSTOMIZADO"
        fi
    else
        print_error "Arquivo não encontrado: $test_file"
    fi
}

# Menu principal
show_menu() {
    print_header "🚀 TESTES K6 - DENTALSYNC"
    
    echo "Escolha o tipo de teste:"
    echo ""
    echo "1) 🔑 Teste de Autenticação (Login/Logout)"
    echo "2) 🔄 Teste CRUD de Protéticos"
    echo "3) 🔥 Teste de Stress (CUIDADO!)"
    echo "4) 📊 Executar Todos os Testes"
    echo "5) ⚙️ Teste Customizado"
    echo "6) 📁 Ver Resultados Anteriores"
    echo "7) 🧹 Limpar Resultados"
    echo "0) ❌ Sair"
    echo ""
    echo -n "Sua escolha: "
}

# Ver resultados anteriores
view_results() {
    print_header "📊 RESULTADOS ANTERIORES"
    
    if [[ -d "${RESULTS_DIR}" && "$(ls -A ${RESULTS_DIR})" ]]; then
        print_status "Arquivos de resultado encontrados:"
        ls -la "${RESULTS_DIR}"
        
        echo ""
        echo "Deseja abrir algum relatório HTML? Digite o nome do arquivo (ou Enter para voltar):"
        read -r filename
        
        if [[ -n "$filename" && -f "${RESULTS_DIR}/$filename" ]]; then
            if command -v xdg-open &> /dev/null; then
                xdg-open "${RESULTS_DIR}/$filename"
            elif command -v open &> /dev/null; then
                open "${RESULTS_DIR}/$filename"
            else
                print_status "Abra manualmente: ${RESULTS_DIR}/$filename"
            fi
        fi
    else
        print_warning "Nenhum resultado encontrado em ${RESULTS_DIR}"
    fi
}

# Limpar resultados
clean_results() {
    if [[ -d "${RESULTS_DIR}" ]]; then
        echo -e "${YELLOW}Tem certeza que deseja limpar todos os resultados? (y/N)${NC}"
        read -r response
        
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            rm -rf "${RESULTS_DIR}"/*
            print_success "Resultados limpos!"
        else
            print_status "Operação cancelada"
        fi
    else
        print_warning "Diretório de resultados não existe"
    fi
}

# Executar todos os testes
run_all_tests() {
    print_header "📊 EXECUTANDO TODOS OS TESTES"
    
    print_status "Isso irá executar:"
    echo "  1. Teste de Autenticação"
    echo "  2. Teste CRUD"
    echo "  3. Teste de Stress (com confirmação)"
    echo ""
    echo -e "${YELLOW}Continuar? (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        run_auth_test
        echo ""
        run_crud_test
        echo ""
        run_stress_test
        
        print_header "✅ TODOS OS TESTES CONCLUÍDOS"
        print_status "Verifique os resultados em: ${RESULTS_DIR}/"
    else
        print_status "Operação cancelada"
    fi
}

# Função principal
main() {
    # Verificações iniciais
    check_k6
    check_application
    setup_results_dir
    
    # Menu interativo
    while true; do
        echo ""
        show_menu
        read -r choice
        
        case $choice in
            1)
                run_auth_test
                ;;
            2)
                run_crud_test
                ;;
            3)
                run_stress_test
                ;;
            4)
                run_all_tests
                ;;
            5)
                run_custom_test
                ;;
            6)
                view_results
                ;;
            7)
                clean_results
                ;;
            0)
                print_success "Até logo!"
                exit 0
                ;;
            *)
                print_error "Opção inválida. Tente novamente."
                ;;
        esac
        
        echo ""
        echo "Pressione Enter para continuar..."
        read -r
    done
}

# Executar função principal
main "$@" 