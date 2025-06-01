# Configuração de Variáveis de Ambiente - DentalSync

## Variáveis Disponíveis

### Configurações de Email
- `EMAIL_USERNAME`: Email usado para envio (Gmail, etc.)
- `EMAIL_PASSWORD`: Senha de aplicativo para o email

### Configurações do Frontend
- `FRONTEND_URL`: URL base do frontend (padrão: http://localhost:5173)

## Exemplos de Configuração

### Desenvolvimento Local
```bash
# Não é necessário configurar FRONTEND_URL - usa o padrão
EMAIL_USERNAME=seu.email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app
```

### Produção AWS
```bash
EMAIL_USERNAME=noreply@dentalsync.com
EMAIL_PASSWORD=senha_segura_aws_ses
FRONTEND_URL=https://dentalsync.com
```

### Staging
```bash
EMAIL_USERNAME=staging@dentalsync.com
EMAIL_PASSWORD=senha_staging
FRONTEND_URL=https://staging.dentalsync.com
```

## Como Configurar

### No Windows (PowerShell)
```powershell
$env:EMAIL_USERNAME="seu.email@gmail.com"
$env:EMAIL_PASSWORD="sua_senha"
$env:FRONTEND_URL="http://localhost:5173"
```

### No Linux/Mac
```bash
export EMAIL_USERNAME="seu.email@gmail.com"
export EMAIL_PASSWORD="sua_senha"
export FRONTEND_URL="http://localhost:5173"
```

### Na AWS (EC2/Elastic Beanstalk)
Configure as variáveis de ambiente no console da AWS ou via docker-compose/kubernetes.

### Docker
```yaml
environment:
  - EMAIL_USERNAME=noreply@empresa.com
  - EMAIL_PASSWORD=senha_segura
  - FRONTEND_URL=https://app.empresa.com
``` 