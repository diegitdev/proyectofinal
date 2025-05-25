package com.example.proyectofinal.exception;

public class UnauthorizedException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException() {
        super("No estás autorizado para acceder a este recurso");
    }
} 