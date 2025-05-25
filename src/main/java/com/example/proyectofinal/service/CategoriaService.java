package com.example.proyectofinal.service;

import com.example.proyectofinal.model.Categoria;
import com.example.proyectofinal.model.Perfume;
import com.example.proyectofinal.repository.CategoriaRepository;
import com.example.proyectofinal.repository.PerfumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private PerfumeRepository perfumeRepository;

    public List<Categoria> findAll() {
        try {
            System.out.println("Buscando todas las categorías");
            List<Categoria> categorias = categoriaRepository.findAll();
            if (categorias == null) {
                System.out.println("La lista de categorías es null, retornando lista vacía");
                return new ArrayList<>();
            }
            System.out.println("Se encontraron " + categorias.size() + " categorías");
            return categorias;
        } catch (Exception e) {
            System.err.println("Error al obtener todas las categorías: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public Optional<Categoria> findById(Long id) {
        try {
            System.out.println("Buscando categoría con ID: " + id);
            Optional<Categoria> categoria = categoriaRepository.findById(id);
            System.out.println("Categoría encontrada: " + (categoria.isPresent() ? "Sí" : "No"));
            return categoria;
        } catch (Exception e) {
            System.err.println("Error al buscar categoría por ID: " + e.getMessage());
            return Optional.empty();
        }
    }

    public Categoria save(Categoria categoria) {
        try {
            System.out.println("Guardando categoría: " + categoria.getNombre());
            Categoria savedCategoria = categoriaRepository.save(categoria);
            System.out.println("Categoría guardada con ID: " + savedCategoria.getId());
            return savedCategoria;
        } catch (Exception e) {
            System.err.println("Error al guardar categoría: " + e.getMessage());
            throw e;
        }
    }

    public Categoria update(Long id, Categoria categoria) {
        try {
            System.out.println("Actualizando categoría con ID: " + id);
            return categoriaRepository.findById(id)
                    .map(existingCategoria -> {
                        existingCategoria.setNombre(categoria.getNombre());
                        Categoria updatedCategoria = categoriaRepository.save(existingCategoria);
                        System.out.println("Categoría actualizada: " + updatedCategoria.getNombre());
                        return updatedCategoria;
                    })
                    .orElse(null);
        } catch (Exception e) {
            System.err.println("Error al actualizar categoría: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Transactional
    public void deleteById(Long id) {
        try {
            // Buscar la categoría
            Optional<Categoria> categoriaOpt = categoriaRepository.findById(id);
            
            if (categoriaOpt.isPresent()) {
                Categoria categoria = categoriaOpt.get();
                
                // Verificar si hay perfumes que usan esta categoría
                List<Perfume> perfumes = perfumeRepository.findByCategoria(id);
                
                if (!perfumes.isEmpty()) {
                    // Primero eliminar las relaciones con los perfumes
                    for (Perfume perfume : perfumes) {
                        perfume.getCategorias().remove(categoria);
                        perfumeRepository.save(perfume);
                    }
                }
                
                // Ahora podemos eliminar la categoría de forma segura
                categoriaRepository.deleteById(id);
            } else {
                throw new RuntimeException("No se encontró la categoría con ID: " + id);
            }
        } catch (Exception e) {
            System.err.println("Error al eliminar categoría: " + e.getMessage());
            throw e;
        }
    }
} 