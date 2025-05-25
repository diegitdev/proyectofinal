package com.example.proyectofinal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class JpaConfig {
    // La configuración JPA se tomará automáticamente de application.properties
} 