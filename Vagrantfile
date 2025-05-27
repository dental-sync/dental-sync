Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.box_version = "20241002.0.0"
  
  # Configuração de rede
  config.vm.network "forwarded_port", guest: 8080, host: 8080  # Porta da aplicação
  config.vm.network "forwarded_port", guest: 5432, host: 5432  # Porta do PostgreSQL
  
  # Configuração de recursos
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "4096"  # 4GB de RAM
    vb.cpus = 2         # 2 CPUs
    vb.name = "dental-sync-dev"
  end
  
  # Script de provisionamento
  config.vm.provision "shell", inline: <<-SHELL
    # Atualizar sistema
    apt-get update
    apt-get upgrade -y
    
    # Instalar dependências básicas
    apt-get install -y curl git
    
    # Instalar Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker vagrant
    
    # Instalar Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Instalar Java 21
    apt-get install -y software-properties-common
    add-apt-repository -y ppa:linuxuprising/java
    apt-get update
    apt-get install -y openjdk-21-jdk
    
    # Configurar variáveis de ambiente
    echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> /home/vagrant/.bashrc
    echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /home/vagrant/.bashrc
    
    # Limpar
    apt-get clean
    rm -rf /var/lib/apt/lists/*
  SHELL
  
  # Sincronizar pasta do projeto
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"
end 