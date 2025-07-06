# Usando OpenJDK 17 Alpine para menor tamanho
FROM openjdk:17-jdk-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências necessárias
RUN apk add --no-cache curl

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S spring && \
    adduser -S spring -u 1001

# Copiar arquivos Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dar permissão de execução ao mvnw
RUN chmod +x ./mvnw

# Download das dependências (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN ./mvnw clean package -DskipTests

# Mudar para usuário não-root
USER spring:spring

# Configurações JVM otimizadas para AWS free tier (1GB RAM)
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCTimeMillis=200 -XX:ParallelGCThreads=2 -XX:ConcGCThreads=1 -XX:InitiatingHeapOccupancyPercent=70"

# Expor porta
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando para executar a aplicação
CMD java $JAVA_OPTS -jar target/*.jar 