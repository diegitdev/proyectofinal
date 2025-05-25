package com.example.proyectofinal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.proyectofinal.model.PerfumePersonalizado;

@Repository
public interface PerfumePersonalizadoRepository extends JpaRepository<PerfumePersonalizado, Long> {
    List<PerfumePersonalizado> findByUsuarioId(Long usuarioId);
    List<PerfumePersonalizado> findByAprobado(boolean aprobado);
    
    @Query("SELECT p FROM PerfumePersonalizado p JOIN p.notas n WHERE n.id = :notaId")
    List<PerfumePersonalizado> findByNotaId(Long notaId);
    
    @Modifying
    @Transactional
    @Query("UPDATE PerfumePersonalizado p SET p.nombre = :nombre, p.descripcion = :descripcion WHERE p.id = :id")
    int updateBasicInfo(@Param("id") Long id, @Param("nombre") String nombre, @Param("descripcion") String descripcion);
    
    @Query("SELECT DISTINCT p FROM PerfumePersonalizado p LEFT JOIN FETCH p.notas WHERE p.id = :id")
    PerfumePersonalizado findByIdWithNotas(@Param("id") Long id);
    
    // Heredado de JpaRepository, pero lo especificamos para claridad
    PerfumePersonalizado saveAndFlush(PerfumePersonalizado perfumePersonalizado);
} 