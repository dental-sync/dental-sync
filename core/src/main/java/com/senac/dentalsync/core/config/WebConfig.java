package com.senac.dentalsync.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOriginPatterns(
                "http://localhost:*", 
                "https://localhost:*", 
                "http://127.0.0.1:*",
                "https://dentalsyncbr.com.br",
                "https://www.dentalsyncbr.com.br"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600); // Cache das configurações de CORS por 1 hora
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**") // Aplicar a todos os endpoints
                .excludePathPatterns(
                    "/login/**", 
                    "/logout", 
                    "/auth/check",
                    "/password/**",
                    "/proteticos/cadastro",
                    "/laboratorios/**",
                    "/security/reset-password-emergency",
                    "/material/notificacoes/estoque",
                    "/actuator/**", // Endpoints do Spring Boot Actuator
                    "/swagger-ui/**", // Swagger UI
                    "/v3/api-docs/**" // OpenAPI docs
                );
    }
}