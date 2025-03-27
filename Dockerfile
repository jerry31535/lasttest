# 使用 Maven 並搭配 Java 21 版本來建構專案
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# 使用輕量的 Java 21 執行環境
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# 執行 Spring Boot 應用
ENTRYPOINT ["java", "-jar", "app.jar"]
