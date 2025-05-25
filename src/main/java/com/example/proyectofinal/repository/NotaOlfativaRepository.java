package com.example.proyectofinal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.proyectofinal.model.NotaOlfativa;

@Repository
public interface NotaOlfativaRepository extends JpaRepository<NotaOlfativa, Long> {
    Optional<NotaOlfativa> findByNombre(String nombre);
    List<NotaOlfativa> findByDescripcion(String descripcion);
    boolean existsByNombre(String nombre);
} 