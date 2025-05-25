package com.example.proyectofinal.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detalles_carrito")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleCarrito {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "carrito_id", nullable = false)
    @JsonIgnoreProperties("detalles")
    private Carrito carrito;
    
    @ManyToOne
    @JoinColumn(name = "perfume_id")
    @JsonIgnoreProperties({"categorias", "notasOlfativas"})
    private Perfume perfume;
    
    @ManyToOne
    @JoinColumn(name = "perfume_personalizado_id")
    @JsonIgnoreProperties({"usuario", "notas"})
    private PerfumePersonalizado perfumePersonalizado;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false)
    private Double precioUnitario;
    
    @Column(nullable = false)
    private Double subtotal;
} 