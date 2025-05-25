package com.example.proyectofinal.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "perfumesPersonalizados", "facturas", "carritos"})
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false, unique = true)
    private String correo;
    
    @Column(nullable = false)
    private String contrasena;
    
    @Column(nullable = false)
    private String rol = "CLIENTE"; // CLIENTE, ADMIN
    
    @OneToMany(mappedBy = "usuario")
    @JsonIgnoreProperties({"usuario", "detalles"})
    private List<Carrito> carritos = new ArrayList<>();
    
    @OneToMany(mappedBy = "usuario")
    @JsonIgnoreProperties("usuario")
    private List<PerfumePersonalizado> perfumesPersonalizados = new ArrayList<>();
    
    @OneToMany(mappedBy = "usuario")
    @JsonIgnoreProperties("usuario")
    private List<Factura> facturas = new ArrayList<>();
} 