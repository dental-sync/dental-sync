# 🦷 DentalSync - Sistema de Gestão de Laboratório Protético

<div align="center">
  <img src="https://img.shields.io/badge/Java-21-orange" alt="Java 21">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-19.0.0-blue" alt="React">
  <img src="https://img.shields.io/badge/Vite-6.2.0-purple" alt="Vite">
  <img src="https://img.shields.io/badge/MySQL-Database-blue" alt="MySQL">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

## 📋 Sobre o Projeto

O **DentalSync** é um sistema completo de gestão para laboratórios protéticos desenvolvido como Trabalho de Conclusão de Curso (TCC) do Senac. O sistema oferece uma solução integrada para laboratórios de prótese dentária, facilitando o gerenciamento de pedidos, materiais, serviços protéticos e relacionamento com dentistas e clínicas parceiras.

### 🎯 Objetivo

Modernizar e digitalizar os processos de gestão em laboratórios protéticos, proporcionando:
- Controle eficiente de pedidos de prótese dentária
- Gestão completa de materiais e serviços protéticos
- Integração streamlined entre laboratórios, dentistas e clínicas
- Controle de pacientes para contextualização dos trabalhos
- Relatórios detalhados e analytics específicos para laboratórios
- Segurança avançada com autenticação de dois fatores

## 🚀 Funcionalidades Principais

### 👥 Gestão de Usuários
- **Protéticos**: Gestão completa de técnicos e especialistas do laboratório
- **Dentistas**: Cadastro de profissionais parceiros e seus perfis
- **Clínicas**: Controle de estabelecimentos clientes
- **Pacientes**: Registro contextual para identificação dos trabalhos protéticos

### 🔐 Segurança Avançada
- Autenticação JWT (JSON Web Tokens)
- Autenticação de dois fatores (2FA) com Google Authenticator
- Recuperação de senha por e-mail
- Controle de acesso baseado em roles (Admin/User)
- Dispositivos confiáveis com duração configurável

### 📋 Gestão Operacional do Laboratório
- **Pedidos Protéticos**: Controle completo do fluxo de produção de prótese
- **Materiais**: Catálogo especializado de materiais protéticos com controle de estoque
- **Serviços Protéticos**: Gerenciamento de tipos de prótese e procedimentos
- **Relatórios**: Analytics específicos para laboratórios com exportação em PDF

### 📊 Relatórios e Analytics para Laboratórios
- Geração de relatórios de produção em PDF
- Histórico completo de pedidos e trabalhos realizados
- Dashboards com métricas de produtividade do laboratório
- Relatórios financeiros e de materiais consumidos
- Exportação de dados para análise externa

## 🏗️ Arquitetura do Sistema

### Backend (Core)
```
core/
├── src/main/java/com/senac/dentalsync/core/
│   ├── config/          # Configurações (Security, CORS, etc.)
│   ├── controller/      # Controllers REST API
│   ├── service/         # Lógica de negócio
│   ├── persistency/     # Modelos e Repositórios JPA
│   ├── exception/       # Tratamento de exceções
│   └── util/           # Utilitários e helpers
└── src/main/resources/
    ├── application.properties
    └── static/
```

### Frontend (React)
```
front/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── contexts/       # Context API (AuthContext)
│   ├── services/       # Serviços de API
│   ├── hooks/          # Custom hooks
│   └── assets/         # Recursos estáticos
└── public/
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 21** - Linguagem de programação
- **Spring Boot 3.4.3** - Framework principal
- **Spring Security** - Segurança e autenticação
- **Spring Data JPA** - Persistência de dados
- **MySQL** - Banco de dados principal
- **Lombok** - Redução de boilerplate
- **Maven** - Gerenciamento de dependências

#### Dependências Especiais
- **Google Authenticator (1.5.0)** - Autenticação 2FA
- **ZXing (3.5.2)** - Geração de QR Codes
- **Spring Mail** - Envio de e-mails
- **JWT** - Tokens de autenticação

### Frontend
- **React 19.0.0** - Biblioteca de interface
- **Vite 6.2.0** - Build tool e desenvolvimento
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **jsPDF** - Geração de PDFs
- **React Toastify** - Notificações

### Banco de Dados
- **MySQL** (Produção via Railway)
- **PostgreSQL** (Suporte adicional)
- **H2** (Desenvolvimento e testes)

## 📦 Instalação e Configuração

### Pré-requisitos
- Java 21+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### 1. Clone o Repositório
```bash
git clone https://github.com/your-username/dental-sync.git
cd dental-sync
```

### 2. Configuração do Backend

#### 2.1 Navegue para o diretório do backend
```bash
cd core
```

#### 2.2 Configure o banco de dados
Edite o arquivo `src/main/resources/application.properties`:
```properties
# Configuração do banco de dados local
spring.datasource.url=jdbc:mysql://localhost:3306/dentalsync
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha

# Configurações de Email
spring.mail.username=seu_email@gmail.com
spring.mail.password=sua_senha_app
```

#### 2.3 Execute o backend
```bash
./mvnw spring-boot:run
```

O backend estará disponível em: `http://localhost:8080`

### 3. Configuração do Frontend

#### 3.1 Navegue para o diretório do frontend
```bash
cd ../front
```

#### 3.2 Instale as dependências
```bash
npm install
```

#### 3.3 Execute o frontend
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 🔧 Configurações Importantes

### Variáveis de Ambiente
Crie um arquivo `.env` no diretório do backend com:
```env
EMAIL_USERNAME=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app
FRONTEND_URL=http://localhost:5173
```

### Configuração 2FA
O sistema suporta autenticação de dois fatores:
1. O usuário ativa o 2FA em suas configurações
2. Um QR Code é gerado para configuração no Google Authenticator
3. Dispositivos confiáveis podem ser configurados por 7 dias

### CORS
O backend está configurado para aceitar requisições do frontend em `http://localhost:5173`

## 📱 Como Usar

### 1. Acesso Inicial
1. Acesse `http://localhost:5173`
2. Cadastre-se como novo usuário
3. Faça login com suas credenciais
4. Configure 2FA (opcional mas recomendado)

### 2. Navegação Principal
- **Dashboard**: Visão geral do laboratório com métricas de produção
- **Pedidos**: Controlar pedidos protéticos e fluxo de produção
- **Materiais**: Catálogo e controle de estoque de materiais protéticos
- **Serviços**: Tipos de prótese e procedimentos oferecidos
- **Protéticos**: Gestão da equipe técnica do laboratório
- **Pacientes**: Registro contextual dos pacientes
- **Relatórios**: Analytics e exportações específicas para laboratórios

### 3. Perfis de Usuário
- **Admin (Proprietário do Laboratório)**: Acesso completo, incluindo gestão financeira e da equipe
- **Protético Supervisor**: Gerenciamento de pedidos e equipe técnica
- **Protético Técnico**: Acesso a pedidos designados e controle de produção

## 📊 Estrutura do Banco de Dados

### Principais Entidades
- **Usuario**: Autenticação e perfis de acesso
- **Protetico**: Técnicos e especialistas do laboratório
- **Laboratorio**: Dados do estabelecimento protético
- **Pedido**: Solicitações de trabalhos protéticos
- **Material**: Catálogo especializado de materiais protéticos
- **Servico**: Tipos de prótese e procedimentos oferecidos
- **Paciente**: Dados contextuais para identificação dos trabalhos
- **Dentista**: Profissionais solicitantes dos serviços
- **Clinica**: Estabelecimentos parceiros

## 🧪 Testes

### Backend
```bash
cd core
./mvnw test
```

### Frontend
```bash
cd front
npm run test
```

## 📈 Deploy

### Backend (Railway)
O backend está configurado para deploy no Railway com MySQL.

### Frontend (Vercel/Netlify)
Configure as variáveis de ambiente:
- `VITE_API_URL`: URL da API em produção


## 📝 Licença

Este projeto é um Trabalho de Conclusão de Curso (TCS) desenvolvido no Senac.

## 👥 Autores

- **Equipe de Desenvolvimento** - *Caruso Augusto, Wesley Dutra, Nathan, Victor*

---

<div align="center">
  <p>Desenvolvido com ❤️ pela equipe do DentalSync</p>
  <p>🦷 <strong>DentalSync</strong> - Modernizando a Gestão de Laboratórios Protéticos</p>
</div>
