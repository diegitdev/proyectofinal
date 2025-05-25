package com.example.proyectofinal.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfumeDTO {
    private Long id;
    private String nombre;
    private Double precio;
    private String descripcion;
    private String imagen;
    private List<String> categorias;
    private List<String> notas;
} 