package com.example.proyectofinal.service;

import com.example.proyectofinal.model.NotaOlfativa;
import com.example.proyectofinal.model.Perfume;
import com.example.proyectofinal.model.PerfumePersonalizado;
import com.example.proyectofinal.repository.NotaOlfativaRepository;
import com.example.proyectofinal.repository.PerfumeRepository;
import com.example.proyectofinal.repository.PerfumePersonalizadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NotaOlfativaService {

    @Autowired
    private NotaOlfativaRepository notaOlfativaRepository;
    
    @Autowired
    private PerfumeRepository perfumeRepository;
    
    @Autowired
    private PerfumePersonalizadoRepository perfumePersonalizadoRepository;

    public List<NotaOlfativa> findAll() {
        try {
            List<NotaOlfativa> notas = notaOlfativaRepository.findAll();
            
            // Limpiar las referencias circulares para evitar recursión infinita
            if (notas != null) {
                notas.forEach(nota -> {
                    // Vaciar las listas para evitar la recursión infinita en JSON
                    if (nota.getPerfumes() != null) {
                        nota.setPerfumes(new ArrayList<>());
                    }
                    if (nota.getPerfumesPersonalizados() != null) {
                        nota.setPerfumesPersonalizados(new ArrayList<>());
                    }
                });
            }
            
            return notas != null ? notas : new ArrayList<>();
        } catch (Exception e) {
            // Log error
            System.err.println("Error al obtener todas las notas olfativas: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public Optional<NotaOlfativa> findById(Long id) {
        try {
            return notaOlfativaRepository.findById(id);
        } catch (Exception e) {
            // Log error
            System.err.println("Error al buscar nota olfativa por ID: " + e.getMessage());
            return Optional.empty();
        }
    }

    public List<NotaOlfativa> findByDescripcion(String descripcion) {
        try {
            List<NotaOlfativa> notas = notaOlfativaRepository.findByDescripcion(descripcion);
            return notas != null ? notas : new ArrayList<>();
        } catch (Exception e) {
            // Log error
            System.err.println("Error al buscar notas olfativas por descripción: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public NotaOlfativa save(NotaOlfativa notaOlfativa) {
        try {
            return notaOlfativaRepository.save(notaOlfativa);
        } catch (Exception e) {
            // Log error
            System.err.println("Error al guardar nota olfativa: " + e.getMessage());
            throw e; // Relanzar para que el controlador pueda manejarlo
        }
    }

    public NotaOlfativa update(Long id, NotaOlfativa notaOlfativa) {
        try {
            return notaOlfativaRepository.findById(id)
                    .map(existingNota -> {
                        existingNota.setNombre(notaOlfativa.getNombre());
                        existingNota.setDescripcion(notaOlfativa.getDescripcion());
                        return notaOlfativaRepository.save(existingNota);
                    })
                    .orElse(null);
        } catch (Exception e) {
            // Log error
            System.err.println("Error al actualizar nota olfativa: " + e.getMessage());
            return null;
        }
    }

    @Transactional
    public void deleteById(Long id) {
        try {
            // Buscar la nota olfativa
            Optional<NotaOlfativa> notaOptional = notaOlfativaRepository.findById(id);
            
            if (notaOptional.isPresent()) {
                NotaOlfativa nota = notaOptional.get();
                
                // Verificar y eliminar relaciones con perfumes
                List<Perfume> perfumes = perfumeRepository.findByNota(id);
                if (!perfumes.isEmpty()) {
                    for (Perfume perfume : perfumes) {
                        perfume.getNotasOlfativas().remove(nota);
                        perfumeRepository.save(perfume);
                    }
                }
                
                // Verificar y eliminar relaciones con perfumes personalizados
                List<PerfumePersonalizado> perfumesPersonalizados = perfumePersonalizadoRepository.findByNotaId(id);
                if (!perfumesPersonalizados.isEmpty()) {
                    for (PerfumePersonalizado perfume : perfumesPersonalizados) {
                        perfume.getNotas().remove(nota);
                        perfumePersonalizadoRepository.save(perfume);
                    }
                }
                
                // Ahora podemos eliminar la nota olfativa de forma segura
                notaOlfativaRepository.deleteById(id);
            } else {
                throw new RuntimeException("No se encontró la nota olfativa con ID: " + id);
            }
        } catch (Exception e) {
            // Log error
            System.err.println("Error al eliminar nota olfativa: " + e.getMessage());
            throw e; // Relanzar para que el controlador pueda manejarlo
        }
    }
} 