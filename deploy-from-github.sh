#!/bin/bash

# Script de deploy completo para DentalSync na AWS EC2 Free Tier
# Clona o projeto do GitHub e configura automaticamente
# Baseado no repositório: https://github.com/dental-sync/dental-sync

set -e

# Configurações
REPO_URL="https://github.com/dental-sync/dental-sync.git"
PROJECT_DIR="dental-sync"
BRANCH="main"

echo "🦷 DentalSync - Deploy Automático na AWS"
echo "========================================="
echo ""

# Função para logs coloridos
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Verificar se está executando como root (não recomendado)
if [[ $EUID -eq 0 ]]; then
   log_warning "Executando como root. Recomendamos usar um usuário comum."
   read -p "Continuar mesmo assim? (y/N): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       exit 1
   fi
fi

# Atualizar sistema
log_info "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
log_info "Instalando dependências básicas..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Docker
if ! command -v docker &> /dev/null; then
    log_info "Instalando Docker..."
    
    # Remover versões antigas
    sudo apt remove -y docker docker-engine docker.io containerd runc || true
    
    # Adicionar repositório oficial do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Adicionar usuário atual ao grupo docker
    sudo usermod -aG docker $USER
    
    # Habilitar Docker para iniciar automaticamente
    sudo systemctl enable docker
    sudo systemctl start docker
    
    log_success "Docker instalado com sucesso!"
else
    log_success "Docker já está instalado."
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_info "Instalando Docker Compose..."
    
    # Baixar Docker Compose
    DOCKER_COMPOSE_VERSION="v2.21.0"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Dar permissão de execução
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Criar link simbólico se necessário
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose instalado com sucesso!"
else
    log_success "Docker Compose já está instalado."
fi

# Verificar se o grupo docker foi aplicado
if ! groups $USER | grep -q docker; then
    log_warning "Usuário precisa fazer logout/login para aplicar grupo docker ou execute:"
    log_warning "newgrp docker"
    log_info "Aplicando grupo docker temporariamente..."
    exec sg docker "$0 $*"
fi

# Verificar espaço em disco disponível
AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
REQUIRED_SPACE=3145728  # 3GB em KB

if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
    log_error "Espaço em disco insuficiente. Necessário pelo menos 3GB livres."
    log_info "Espaço disponível: $(echo $AVAILABLE_SPACE | awk '{print int($1/1024/1024)"GB"}')"
    exit 1
fi

# Verificar memória disponível
TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
if [ "$TOTAL_MEM" -lt 900 ]; then
    log_warning "Memória baixa detectada: ${TOTAL_MEM}MB. AWS free tier tem 1GB."
    log_warning "O sistema pode ficar lento. Considere configurar swap."
fi

# Configurar swap se necessário (recomendado para AWS free tier)
if ! swapon --show | grep -q /swapfile; then
    log_info "Configurando arquivo de swap (1GB) para melhorar performance..."
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    log_success "Swap configurado com sucesso!"
fi

# Navegar para diretório de trabalho
WORK_DIR="/home/$USER"
cd "$WORK_DIR"

# Limpar projeto existente se houver
if [ -d "$PROJECT_DIR" ]; then
    log_info "Removendo instalação anterior..."
    
    # Parar containers se estiverem rodando
    cd "$PROJECT_DIR"
    if [ -f "docker-compose.yml" ]; then
        docker-compose down --remove-orphans || true
    fi
    cd ..
    
    # Remover diretório antigo
    rm -rf "$PROJECT_DIR"
fi

# Clonar repositório
log_info "Clonando repositório do GitHub..."
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Verificar se o clone foi bem-sucedido
if [ ! -f "docker-compose.yml" ]; then
    log_error "Falha ao clonar repositório ou arquivo docker-compose.yml não encontrado!"
    exit 1
fi

log_success "Repositório clonado com sucesso!"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    log_info "Criando arquivo de configuração .env..."
    
    # Obter IP público da instância
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "localhost")
    
    cat > .env << EOF
# =================================
# Configurações DentalSync - AWS
# =================================

# Email Configuration (OBRIGATÓRIO para recuperação de senha)
EMAIL_USERNAME=
EMAIL_PASSWORD=

# Database Configuration
MYSQL_ROOT_PASSWORD=dentalSync2024!@#ROOT
MYSQL_PASSWORD=dentalSync2024!@#USER

# N8N Configuration
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=dentalSync2024!@#N8N

# Application Configuration
FRONTEND_URL=http://${PUBLIC_IP}
BACKEND_URL=http://${PUBLIC_IP}:8080

# Security
JWT_SECRET=dentalSync2024SecretKeyForJWTAuthentication!@#

# Environment
NODE_ENV=production
SPRING_PROFILES_ACTIVE=production

# AWS Configuration (opcional)
AWS_REGION=us-east-1

# Domain (para SSL futuro)
DOMAIN=${PUBLIC_IP}
EOF

    log_success "Arquivo .env criado!"
    log_warning "IMPORTANTE: Configure EMAIL_USERNAME e EMAIL_PASSWORD no arquivo .env"
    log_info "Arquivo localizado em: $(pwd)/.env"
fi

# Mostrar configurações importantes
echo ""
log_info "========== CONFIGURAÇÕES IMPORTANTES =========="
echo "📍 IP Público: $(curl -s http://checkip.amazonaws.com || echo 'Não detectado')"
echo "📂 Diretório do projeto: $(pwd)"
echo "⚙️  Arquivo de configuração: $(pwd)/.env"
echo ""

# Perguntar se deseja configurar email
read -p "Deseja configurar o email agora? (recomendado) (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    log_info "Configuração de Email para recuperação de senha:"
    echo "Para Gmail, use uma 'Senha de App' (não sua senha normal)"
    echo "1. Vá em https://myaccount.google.com/security"
    echo "2. Ative verificação em 2 etapas"
    echo "3. Gere uma 'Senha de App' para o DentalSync"
    echo ""
    
    read -p "Email: " USER_EMAIL
    read -s -p "Senha de App: " USER_PASSWORD
    echo ""
    
    # Atualizar .env com credenciais
    sed -i "s/EMAIL_USERNAME=/EMAIL_USERNAME=${USER_EMAIL}/" .env
    sed -i "s/EMAIL_PASSWORD=/EMAIL_PASSWORD=${USER_PASSWORD}/" .env
    
    log_success "Email configurado!"
fi

# Limpar Docker para liberar espaço
log_info "Limpando cache do Docker..."
docker system prune -f || true

# Build e start dos containers
log_info "Iniciando build e deploy dos containers..."
echo "Isso pode demorar alguns minutos na primeira execução..."

# Aumentar timeout para build
export COMPOSE_HTTP_TIMEOUT=300

# Build das imagens
docker-compose build --no-cache --parallel

# Iniciar containers
docker-compose up -d

# Aguardar containers ficarem online
log_info "Aguardando containers ficarem online..."
sleep 60

# Verificar status dos containers
echo ""
log_info "Status dos containers:"
docker-compose ps

# Função para verificar saúde dos serviços
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=24
    local attempt=0
    
    log_info "Verificando $service_name..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f "$url" > /dev/null 2>&1; then
            log_success "$service_name está online!"
            return 0
        else
            attempt=$((attempt + 1))
            echo "⏳ Aguardando $service_name... (tentativa $attempt/$max_attempts)"
            sleep 5
        fi
    done
    
    log_warning "$service_name pode não estar respondendo ainda."
    return 1
}

# Verificar serviços
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "localhost")

echo ""
log_info "Verificando saúde dos serviços..."

# Verificar backend
check_service "Backend" "http://localhost:8080/actuator/health"

# Verificar frontend
check_service "Frontend" "http://localhost"

# Verificar n8n
check_service "N8N" "http://localhost:8888"

# Verificar database
if docker-compose exec -T database mysqladmin ping -h localhost -u dentalsync -pdental123!@# > /dev/null 2>&1; then
    log_success "Database está online!"
else
    log_warning "Database pode não estar respondendo ainda."
fi

# Configurar firewall (UFW)
if command -v ufw &> /dev/null; then
    log_info "Configurando firewall..."
    sudo ufw allow 22/tcp      # SSH
    sudo ufw allow 80/tcp      # Frontend
    sudo ufw allow 8080/tcp    # Backend
    sudo ufw allow 8888/tcp    # N8N
    sudo ufw --force enable
    log_success "Firewall configurado!"
fi

# Mostrar logs finais
echo ""
log_info "Últimos logs do backend:"
docker-compose logs --tail=10 backend

# Criar script de gerenciamento
log_info "Criando scripts de gerenciamento..."

cat > manage.sh << 'EOF'
#!/bin/bash

case "$1" in
    "start")
        echo "🚀 Iniciando DentalSync..."
        docker-compose up -d
        ;;
    "stop")
        echo "🛑 Parando DentalSync..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Reiniciando DentalSync..."
        docker-compose restart
        ;;
    "logs")
        echo "📋 Logs do DentalSync..."
        docker-compose logs -f ${2:-}
        ;;
    "status")
        echo "📊 Status dos containers:"
        docker-compose ps
        ;;
    "update")
        echo "🔄 Atualizando DentalSync..."
        git pull origin main
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        ;;
    "backup")
        echo "💾 Fazendo backup do banco de dados..."
        docker-compose exec database mysqldump -u dentalsync -pdental123!@# dentalsyncdb > backup_$(date +%Y%m%d_%H%M%S).sql
        echo "Backup salvo como: backup_$(date +%Y%m%d_%H%M%S).sql"
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|logs|status|update|backup}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start   - Iniciar todos os serviços"
        echo "  stop    - Parar todos os serviços"
        echo "  restart - Reiniciar todos os serviços"
        echo "  logs    - Ver logs (adicione nome do serviço para específico)"
        echo "  status  - Ver status dos containers"
        echo "  update  - Atualizar do GitHub e rebuild"
        echo "  backup  - Fazer backup do banco de dados"
        ;;
esac
EOF

chmod +x manage.sh

# Resultado final
echo ""
echo "🎉 ========================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "🎉 ========================================="
echo ""
echo "📱 DentalSync está disponível em:"
echo "   🌐 Frontend: http://${PUBLIC_IP}"
echo "   🔧 Backend:  http://${PUBLIC_IP}:8080"
echo "   🤖 N8N:      http://${PUBLIC_IP}:8888"
echo ""
echo "🔐 Credenciais de acesso:"
echo "   N8N - Usuário: admin | Senha: dentalSync2024!@#N8N"
echo ""
echo "📂 Arquivos importantes:"
echo "   📋 Projeto: $(pwd)"
echo "   ⚙️  Config:  $(pwd)/.env"
echo "   🛠️  Gerenc.: $(pwd)/manage.sh"
echo ""
echo "💡 Comandos úteis:"
echo "   ./manage.sh start    - Iniciar serviços"
echo "   ./manage.sh stop     - Parar serviços"
echo "   ./manage.sh logs     - Ver logs"
echo "   ./manage.sh status   - Ver status"
echo "   ./manage.sh update   - Atualizar do GitHub"
echo "   ./manage.sh backup   - Backup do banco"
echo ""
echo "🚨 PRÓXIMOS PASSOS IMPORTANTES:"
echo "   1. ✅ Configure SSL/HTTPS para produção"
echo "   2. ✅ Altere senhas padrão no .env"
echo "   3. ✅ Configure backup automático"
echo "   4. ✅ Configure monitoramento"
echo "   5. ✅ Teste todas as funcionalidades"
echo ""

if [ -z "$(grep EMAIL_USERNAME .env | cut -d'=' -f2)" ]; then
    log_warning "ATENÇÃO: Email não configurado!"
    log_warning "Configure EMAIL_USERNAME e EMAIL_PASSWORD no arquivo .env"
    log_warning "Edite: nano .env"
    log_warning "Depois reinicie: ./manage.sh restart"
fi

echo "📚 Documentação: https://github.com/dental-sync/dental-sync"
echo ""
log_success "Deploy finalizado! O DentalSync está pronto para uso! 🦷✨" 