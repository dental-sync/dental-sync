#!/bin/bash

# Script de deploy para AWS EC2 Free Tier
# DentalSync Application

set -e

echo "🚀 Iniciando deploy do DentalSync na AWS..."

# Verificar se Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do exemplo..."
    echo "# Configurações de Email" > .env
    echo "EMAIL_USERNAME=" >> .env
    echo "EMAIL_PASSWORD=" >> .env
    echo ""
    echo "📝 IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!"
    echo "   - Configure EMAIL_USERNAME e EMAIL_PASSWORD para funcionalidades de email"
    echo ""
    read -p "Pressione ENTER para continuar após configurar o .env..."
fi

# Parar containers existentes (se houver)
echo "🛑 Parando containers existentes..."
docker-compose down --remove-orphans || true

# Remover imagens antigas para economizar espaço
echo "🧹 Limpando imagens antigas..."
docker system prune -f || true

# Verificar espaço em disco disponível
AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
REQUIRED_SPACE=2097152  # 2GB em KB

if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
    echo "⚠️  Espaço em disco insuficiente. Liberando espaço..."
    docker system prune -af --volumes
fi

# Build e start dos containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar containers ficarem saudáveis
echo "⏳ Aguardando containers ficarem online..."
sleep 30

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

# Verificar se backend está respondendo
echo "🔍 Verificando saúde do backend..."
for i in {1..12}; do
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ Backend está online!"
        break
    else
        echo "⏳ Aguardando backend... (tentativa $i/12)"
        sleep 10
    fi
done

# Verificar se frontend está respondendo
echo "🔍 Verificando saúde do frontend..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend está online!"
else
    echo "⚠️  Frontend pode não estar respondendo ainda. Verifique os logs."
fi

# Mostrar logs finais
echo "📝 Últimos logs do backend:"
docker-compose logs --tail=20 backend

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📱 Aplicação disponível em:"
echo "   Frontend: http://$(curl -s http://checkip.amazonaws.com):80"
echo "   Backend:  http://$(curl -s http://checkip.amazonaws.com):8080"
echo "   N8N:      http://$(curl -s http://checkip.amazonaws.com):8888"
echo ""
echo "🔐 Credenciais N8N:"
echo "   Usuário: admin"
echo "   Senha: admin123!@#"
echo ""
echo "💡 Comandos úteis:"
echo "   Ver logs:     docker-compose logs -f [serviço]"
echo "   Parar tudo:   docker-compose down"
echo "   Reiniciar:    docker-compose restart [serviço]"
echo "   Status:       docker-compose ps"
echo ""
echo "⚠️  IMPORTANTE para produção:"
echo "   1. Configure SSL/HTTPS"
echo "   2. Altere senhas padrão"
echo "   3. Configure firewall (portas 80, 8080, 8888)"
echo "   4. Configure backup do banco de dados" 