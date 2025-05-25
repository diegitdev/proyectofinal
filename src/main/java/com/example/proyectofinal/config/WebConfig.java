package com.example.proyectofinal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configuración CORS para API
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173", 
                    "http://localhost:5174", 
                    "http://localhost:5175",
                    "http://localhost:5176", 
                    "http://localhost:5177", 
                    "http://localhost:5178",
                    "http://localhost:5179", 
                    "http://localhost:5180",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:5174",
                    "http://127.0.0.1:5175"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With")
                .exposedHeaders("Authorization", "Content-Type")
                .allowCredentials(true)
                .maxAge(3600);
        
        // Configuración CORS para recursos estáticos (uploads)
        registry.addMapping("/uploads/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173", 
                    "http://localhost:5174", 
                    "http://localhost:5175",
                    "http://localhost:5176", 
                    "http://localhost:5177", 
                    "http://localhost:5178",
                    "http://localhost:5179", 
                    "http://localhost:5180",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:5174",
                    "http://127.0.0.1:5175"
                )
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false) // No se necesitan credenciales para imágenes
                .maxAge(3600);
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir recursos estáticos del frontend
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
                
        // Nota: La configuración para servir archivos de uploads se ha movido a StaticResourceConfig
    }
} 