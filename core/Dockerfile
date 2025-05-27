FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copiar arquivos de configuração do Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Tornar o script mvnw executável
RUN chmod +x ./mvnw

# Baixar dependências
RUN ./mvnw dependency:go-offline -B

# Copiar código-fonte
COPY src src

# Compilar e empacotar a aplicação
RUN ./mvnw package -DskipTests

# Definir a imagem de execução
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar o arquivo JAR da fase de build
COPY --from=build /app/target/*.jar app.jar

# Expor a porta que a aplicação vai usar
EXPOSE 8080

# Comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "/app/app.jar"] 