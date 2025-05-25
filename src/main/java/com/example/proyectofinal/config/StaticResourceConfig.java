package com.example.proyectofinal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();
        
        if (!uploadAbsolutePath.endsWith("/") && !uploadAbsolutePath.endsWith("\\")) {
            uploadAbsolutePath += "/";
        }
        
        // Configuración específica para archivos de imagen con fuerte cacheo
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath)
                .setCachePeriod(86400) // Cache por 1 día
                .resourceChain(true);
        
        System.out.println("Configuración de recursos estáticos cargada.");
        System.out.println("Directorio de uploads: " + uploadAbsolutePath);
        System.out.println("Path absoluto para imágenes: " + Paths.get(uploadAbsolutePath).toAbsolutePath().toString());
    }
} 