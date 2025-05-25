package com.example.proyectofinal.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notas_olfativas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaOlfativa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String nombre;
    
    @Column(nullable = false)
    private String descripcion;
    
    @ManyToMany(mappedBy = "notasOlfativas")
    @JsonIgnoreProperties("notasOlfativas")
    private List<Perfume> perfumes = new ArrayList<>();
    
    @ManyToMany(mappedBy = "notas")
    @JsonIgnoreProperties("notas")
    private List<PerfumePersonalizado> perfumesPersonalizados = new ArrayList<>();
} 