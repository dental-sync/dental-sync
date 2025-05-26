# Dental Sync

Sistema para gerenciamento de clínicas odontológicas.

## Requisitos

- Docker
- Docker Compose

## Configuração e Execução com Docker

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/dental-sync.git
cd dental-sync
```

2. Inicie os containers:

```bash
docker-compose up -d
```

Isso vai iniciar três containers:
- **dentalsync-db**: Banco de dados MySQL
- **dentalsync-backend**: API Spring Boot
- **dentalsync-frontend**: Interface React

3. Acesse a aplicação:

- Frontend: http://localhost:80
- Backend API: http://localhost:8080

## Parando os containers

```bash
docker-compose down
```

Para remover os volumes também (isso apagará os dados do banco):

```bash
docker-compose down -v
```

## Visualizando logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas um serviço específico
docker-compose logs -f backend
```

## Desenvolvimento

### Frontend

O código do frontend está na pasta `front/`. Durante o desenvolvimento, você pode executá-lo localmente com:

```bash
cd front
npm install
npm run dev
```

### Backend

O código do backend está na pasta `core/`. Durante o desenvolvimento, você pode executá-lo localmente com:

```bash
cd core
./mvnw spring-boot:run
```
