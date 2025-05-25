package com.example.proyectofinal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.proyectofinal.model.Carrito;
import com.example.proyectofinal.model.Usuario;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    List<Carrito> findByUsuario(Usuario usuario);
    Optional<Carrito> findByUsuarioAndEstado(Usuario usuario, String estado);
    List<Carrito> findByUsuarioIdAndEstado(Long usuarioId, String estado);
} 