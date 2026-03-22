FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/apartment-management-system-1.0.0.jar app.jar

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-Duser.timezone=Asia/Kolkata"

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
