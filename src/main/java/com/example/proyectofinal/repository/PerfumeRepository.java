package com.example.proyectofinal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.proyectofinal.model.Perfume;

@Repository
public interface PerfumeRepository extends JpaRepository<Perfume, Long> {
    List<Perfume> findByNombre(String nombre);
    
    @Query("SELECT p FROM Perfume p JOIN p.categorias c WHERE c.id = :categoriaId")
    List<Perfume> findByCategoria(Long categoriaId);
    
    @Query("SELECT p FROM Perfume p JOIN p.notasOlfativas n WHERE n.id = :notaId")
    List<Perfume> findByNota(Long notaId);
} 