# Use OpenJDK 21 como base
FROM openjdk:21-jdk-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dar permissão de execução ao mvnw
RUN chmod +x ./mvnw

# Baixar dependências (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Construir a aplicação
RUN ./mvnw clean package -DskipTests

# Expor porta 8080
EXPOSE 8080

# Comando para executar a aplicação
CMD ["java", "-jar", "target/core-0.0.1-SNAPSHOT.jar"] 