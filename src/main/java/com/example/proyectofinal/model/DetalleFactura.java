package com.example.proyectofinal.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
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

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "detalles_factura")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DetalleFactura {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "factura_id", nullable = false)
    @JsonBackReference
    private Factura factura;
    
    @ManyToOne
    @JoinColumn(name = "perfume_id")
    @JsonIgnoreProperties({"categorias", "notasOlfativas", "detallesCarrito", "detallesFactura", "hibernateLazyInitializer", "handler"})
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Perfume perfume;
    
    @ManyToOne
    @JoinColumn(name = "perfume_personalizado_id")
    @JsonIgnoreProperties({"notas", "usuario", "detallesCarrito", "detallesFactura", "hibernateLazyInitializer", "handler"})
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private PerfumePersonalizado perfumePersonalizado;
    
    @Column(nullable = false)
    private String nombreProducto;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false)
    private Double precioUnitario;
    
    @Column(nullable = false)
    private Double subtotal;
} 