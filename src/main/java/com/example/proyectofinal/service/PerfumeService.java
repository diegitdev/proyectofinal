package com.example.proyectofinal.service;

import com.example.proyectofinal.model.Perfume;
import com.example.proyectofinal.repository.PerfumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PerfumeService {

    @Autowired
    private PerfumeRepository perfumeRepository;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private NotaOlfativaService notaOlfativaService;

    public List<Perfume> findAll() {
        List<Perfume> perfumes = perfumeRepository.findAll();
        // Evitar referencias circulares
        perfumes.forEach(perfume -> {
            if (perfume.getDetallesCarrito() != null) {
                perfume.setDetallesCarrito(new ArrayList<>());
            }
            if (perfume.getDetallesFactura() != null) {
                perfume.setDetallesFactura(new ArrayList<>());
            }
        });
        return perfumes;
    }

    public Optional<Perfume> findById(Long id) {
        Optional<Perfume> perfumeOpt = perfumeRepository.findById(id);
        // Evitar referencias circulares
        perfumeOpt.ifPresent(perfume -> {
            if (perfume.getDetallesCarrito() != null) {
                perfume.setDetallesCarrito(new ArrayList<>());
            }
            if (perfume.getDetallesFactura() != null) {
                perfume.setDetallesFactura(new ArrayList<>());
            }
        });
        return perfumeOpt;
    }

    public Perfume save(Perfume perfume) {
        try {
            System.out.println("Guardando perfume: " + perfume.getNombre());
            return perfumeRepository.save(perfume);
        } catch (Exception e) {
            System.err.println("Error al guardar perfume: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Perfume update(Long id, Perfume perfume) {
        try {
            System.out.println("Actualizando perfume con ID: " + id);
            return perfumeRepository.findById(id)
                    .map(existingPerfume -> {
                        // Actualizar propiedades básicas
                        existingPerfume.setNombre(perfume.getNombre());
                        existingPerfume.setDescripcion(perfume.getDescripcion());
                        existingPerfume.setPrecio(perfume.getPrecio());
                        existingPerfume.setImagen(perfume.getImagen());
                        
                        // Actualizar categorías si se proporcionan
                        if (perfume.getCategorias() != null && !perfume.getCategorias().isEmpty()) {
                            existingPerfume.setCategorias(perfume.getCategorias());
                        }
                        
                        // Actualizar notas olfativas si se proporcionan
                        if (perfume.getNotasOlfativas() != null && !perfume.getNotasOlfativas().isEmpty()) {
                            existingPerfume.setNotasOlfativas(perfume.getNotasOlfativas());
                        }
                        
                        System.out.println("Guardando perfume actualizado");
                        return perfumeRepository.save(existingPerfume);
                    })
                    .orElseThrow(() -> {
                        System.err.println("Perfume no encontrado con ID: " + id);
                        return new RuntimeException("Perfume no encontrado con ID: " + id);
                    });
        } catch (Exception e) {
            System.err.println("Error al actualizar perfume: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteById(Long id) {
        try {
            System.out.println("Eliminando perfume con ID: " + id);
            perfumeRepository.deleteById(id);
            System.out.println("Perfume eliminado correctamente");
        } catch (Exception e) {
            System.err.println("Error al eliminar perfume: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<Perfume> findByCategoria(Long categoriaId) {
        return perfumeRepository.findByCategoria(categoriaId);
    }

    public List<Perfume> findByNombre(String nombre) {
        return perfumeRepository.findByNombre(nombre);
    }

    @Transactional
    public void actualizarCategorias(Perfume perfume, List<Long> categoriasIds) {
        try {
            System.out.println("Actualizando categorías del perfume: " + perfume.getId());
            // Limpiar las categorías actuales
            perfume.getCategorias().clear();
            
            // Añadir las nuevas categorías por ID
            categoriasIds.forEach(categoriaId -> {
                categoriaService.findById(categoriaId).ifPresent(categoria -> {
                    perfume.getCategorias().add(categoria);
                });
            });
            
            System.out.println("Categorías actualizadas");
        } catch (Exception e) {
            System.err.println("Error al actualizar categorías: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Transactional
    public void actualizarNotasOlfativas(Perfume perfume, List<Long> notasIds) {
        try {
            System.out.println("Actualizando notas olfativas del perfume: " + perfume.getId());
            // Limpiar las notas actuales
            perfume.getNotasOlfativas().clear();
            
            // Añadir las nuevas notas por ID
            notasIds.forEach(notaId -> {
                notaOlfativaService.findById(notaId).ifPresent(nota -> {
                    perfume.getNotasOlfativas().add(nota);
                });
            });
            
            System.out.println("Notas olfativas actualizadas");
        } catch (Exception e) {
            System.err.println("Error al actualizar notas olfativas: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
} 