package com.example.proyectofinal.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "perfumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Perfume {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private Double precio;
    
    @Column(length = 1000)
    private String descripcion;
    
    @Column
    private String imagen;
    
    @ManyToMany
    @JoinTable(
        name = "perfume_categoria",
        joinColumns = @JoinColumn(name = "perfume_id"),
        inverseJoinColumns = @JoinColumn(name = "categoria_id")
    )
    @JsonIgnoreProperties("perfumes")
    private List<Categoria> categorias = new ArrayList<>();
    
    @ManyToMany
    @JoinTable(
        name = "perfume_nota",
        joinColumns = @JoinColumn(name = "perfume_id"),
        inverseJoinColumns = @JoinColumn(name = "nota_id")
    )
    private List<NotaOlfativa> notasOlfativas = new ArrayList<>();
    
    @OneToMany(mappedBy = "perfume", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("perfume")
    private List<DetalleCarrito> detallesCarrito = new ArrayList<>();
    
    @OneToMany(mappedBy = "perfume")
    private List<DetalleFactura> detallesFactura = new ArrayList<>();
} 