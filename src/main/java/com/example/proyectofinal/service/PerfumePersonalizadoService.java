package com.example.proyectofinal.service;

import com.example.proyectofinal.model.PerfumePersonalizado;
import com.example.proyectofinal.model.NotaOlfativa;
import com.example.proyectofinal.repository.PerfumePersonalizadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PerfumePersonalizadoService {

    @Autowired
    private PerfumePersonalizadoRepository perfumePersonalizadoRepository;

    public List<PerfumePersonalizado> findAll() {
        List<PerfumePersonalizado> perfumes = perfumePersonalizadoRepository.findAll();
        // Eliminar referencias circulares para evitar el StackOverflowError
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

    public Optional<PerfumePersonalizado> findById(Long id) {
        Optional<PerfumePersonalizado> perfumeOpt = perfumePersonalizadoRepository.findById(id);
        // Prevenir referencias circulares para evitar el StackOverflowError
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

    public List<PerfumePersonalizado> findByUsuarioId(Long usuarioId) {
        List<PerfumePersonalizado> perfumes = perfumePersonalizadoRepository.findByUsuarioId(usuarioId);
        // Eliminar referencias circulares para evitar el StackOverflowError
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

    public List<PerfumePersonalizado> findByAprobado(boolean aprobado) {
        List<PerfumePersonalizado> perfumes = perfumePersonalizadoRepository.findByAprobado(aprobado);
        // Eliminar referencias circulares para evitar el StackOverflowError
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

    public PerfumePersonalizado save(PerfumePersonalizado perfumePersonalizado) {
        try {
            System.out.println("Guardando perfume personalizado con ID: " + 
                               (perfumePersonalizado.getId() != null ? perfumePersonalizado.getId() : "NUEVO"));
            
            // Si es una creación, establecer la fecha
            if (perfumePersonalizado.getFechaCreacion() == null) {
                perfumePersonalizado.setFechaCreacion(LocalDateTime.now());
            }
            
            // Verificar si las notas olfativas están presentes
            if (perfumePersonalizado.getNotas() != null) {
                System.out.println("El perfume tiene " + perfumePersonalizado.getNotas().size() + " notas olfativas");
            } else {
                System.out.println("No se encontraron notas olfativas en el perfume");
            }
            
            // Verificar la URL de la imagen
            if (perfumePersonalizado.getImagenUrl() != null) {
                System.out.println("URL de imagen: " + perfumePersonalizado.getImagenUrl());
            } else {
                System.out.println("No se encontró URL de imagen");
            }
            
            // Guardar en la base de datos con flush para forzar la persistencia inmediata
            PerfumePersonalizado resultado = perfumePersonalizadoRepository.saveAndFlush(perfumePersonalizado);
            System.out.println("Perfume guardado correctamente con ID: " + resultado.getId());
            
            // Verificar que se guardaron todas las propiedades
            System.out.println("Perfume guardado:");
            System.out.println("- Nombre: " + resultado.getNombre());
            System.out.println("- Descripción: " + resultado.getDescripcion());
            System.out.println("- Precio: " + resultado.getPrecio());
            System.out.println("- Imagen URL: " + resultado.getImagenUrl());
            
            // Limpiar colecciones para evitar problemas de serialización
            resultado.setDetallesCarrito(new ArrayList<>());
            resultado.setDetallesFactura(new ArrayList<>());
            
            return resultado;
        } catch (Exception e) {
            System.err.println("Error al guardar perfume personalizado: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public PerfumePersonalizado update(Long id, PerfumePersonalizado perfumeActualizado) {
        try {
            System.out.println("Actualizando perfume personalizado con ID: " + id);
            
            // Obtener el perfume existente con todas sus propiedades
            Optional<PerfumePersonalizado> perfumeExistenteOpt = perfumePersonalizadoRepository.findById(id);
            if (!perfumeExistenteOpt.isPresent()) {
                System.out.println("No se encontró el perfume con ID: " + id);
                return null;
            }
            
            PerfumePersonalizado perfumeExistente = perfumeExistenteOpt.get();
            
            // Actualizar campos básicos
            if (perfumeActualizado.getNombre() != null) {
                System.out.println("Actualizando nombre de '" + perfumeExistente.getNombre() + "' a '" + 
                                   perfumeActualizado.getNombre() + "'");
                perfumeExistente.setNombre(perfumeActualizado.getNombre());
            }
            
            if (perfumeActualizado.getDescripcion() != null) {
                System.out.println("Actualizando descripción a: " + perfumeActualizado.getDescripcion());
                perfumeExistente.setDescripcion(perfumeActualizado.getDescripcion());
            }
            
            // Actualizar URL de imagen si está definida en el objeto actualizado
            if (perfumeActualizado.getImagenUrl() != null) {
                System.out.println("Actualizando URL de imagen a: " + perfumeActualizado.getImagenUrl());
                perfumeExistente.setImagenUrl(perfumeActualizado.getImagenUrl());
            }
            
            // Actualizar las notas si se proporcionan
            if (perfumeActualizado.getNotas() != null && !perfumeActualizado.getNotas().isEmpty()) {
                System.out.println("Actualizando " + perfumeActualizado.getNotas().size() + " notas olfativas");
                perfumeExistente.setNotas(perfumeActualizado.getNotas());
                
                // Actualizar precio basado en el número de notas
                double precioBase = 50.0;
                precioBase += perfumeActualizado.getNotas().size() * 10.0;
                System.out.println("Recalculando precio: " + precioBase);
                perfumeExistente.setPrecio(precioBase);
            }
            
            // Guardar todos los cambios usando saveAndFlush para persistencia inmediata
            System.out.println("Guardando cambios con saveAndFlush para persistencia inmediata");
            PerfumePersonalizado resultado = perfumePersonalizadoRepository.saveAndFlush(perfumeExistente);
            System.out.println("Perfume actualizado correctamente con ID: " + resultado.getId());
            
            // Verificar que se actualizaron todas las propiedades
            System.out.println("Perfume actualizado:");
            System.out.println("- Nombre: " + resultado.getNombre());
            System.out.println("- Descripción: " + resultado.getDescripcion());
            System.out.println("- Precio: " + resultado.getPrecio());
            System.out.println("- Imagen URL: " + resultado.getImagenUrl());
            System.out.println("- Notas olfativas: " + (resultado.getNotas() != null ? resultado.getNotas().size() : 0));
            
            // Limpiar colecciones para evitar problemas de serialización
            resultado.setDetallesCarrito(new ArrayList<>());
            resultado.setDetallesFactura(new ArrayList<>());
            
            return resultado;
        } catch (Exception e) {
            System.err.println("Error en update de PerfumePersonalizadoService: " + e.getMessage());
            e.printStackTrace();
            throw e; 
        }
    }
    
    /**
     * Método auxiliar para actualizar solo las notas de un perfume personalizado
     */
    @Transactional
    private void updateNotas(Long perfumeId, List<NotaOlfativa> nuevasNotas) {
        try {
            System.out.println("Actualizando notas para el perfume " + perfumeId);
            // Usar la consulta específica que solo trae las notas
            PerfumePersonalizado perfumeExistente = perfumePersonalizadoRepository.findByIdWithNotas(perfumeId);
            
            if (perfumeExistente != null) {
                // Actualizamos solo las notas manteniendo la misma colección
                perfumeExistente.getNotas().clear();
                perfumeExistente.getNotas().addAll(nuevasNotas);
                perfumePersonalizadoRepository.saveAndFlush(perfumeExistente);
                System.out.println("Notas actualizadas correctamente");
            } else {
                System.out.println("No se pudo encontrar el perfume con ID: " + perfumeId + " para actualizar notas");
            }
        } catch (Exception e) {
            System.err.println("Error actualizando notas: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void deleteById(Long id) {
        perfumePersonalizadoRepository.deleteById(id);
    }
}