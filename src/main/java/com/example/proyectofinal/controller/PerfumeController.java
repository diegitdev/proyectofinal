package com.example.proyectofinal.controller;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.proyectofinal.dto.PerfumeDTO;
import com.example.proyectofinal.model.Perfume;
import com.example.proyectofinal.service.PerfumeService;

@RestController
@RequestMapping("/api/perfumes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                        "http://localhost:5179", "http://localhost:5180"}, 
             allowCredentials = "true")
public class PerfumeController {

    @Autowired
    private PerfumeService perfumeService;

    @GetMapping
    public ResponseEntity<List<PerfumeDTO>> getAllPerfumes() {
        List<Perfume> perfumes = perfumeService.findAll();
        return ResponseEntity.ok(perfumes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfumeDTO> getPerfumeById(@PathVariable Long id) {
        return perfumeService.findById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<PerfumeDTO>> getPerfumesByCategoria(@PathVariable Long categoriaId) {
        List<Perfume> perfumes = perfumeService.findByCategoria(categoriaId);
        return ResponseEntity.ok(perfumes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<PerfumeDTO>> buscarPerfumes(@RequestParam String nombre) {
        List<Perfume> perfumes = perfumeService.findByNombre(nombre);
        return ResponseEntity.ok(perfumes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<PerfumeDTO> createPerfume(@RequestBody PerfumeDTO perfumeDTO) {
        Perfume perfume = convertToEntity(perfumeDTO);
        Perfume savedPerfume = perfumeService.save(perfume);
        return ResponseEntity.ok(convertToDTO(savedPerfume));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePerfume(@PathVariable Long id, @RequestBody Perfume perfume) {
        try {
            System.out.println("Actualizando perfume con ID: " + id);
            Perfume updatedPerfume = perfumeService.update(id, perfume);
            System.out.println("Perfume actualizado con éxito: " + updatedPerfume.getNombre());
            return ResponseEntity.ok(updatedPerfume);
        } catch (Exception e) {
            System.err.println("Error al actualizar perfume: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al actualizar el perfume: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePerfume(@PathVariable Long id) {
        try {
            System.out.println("Eliminando perfume con ID: " + id);
            perfumeService.deleteById(id);
            System.out.println("Perfume eliminado correctamente");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error al eliminar perfume: " + e.getMessage());
            e.printStackTrace();
            
            // Detectar específicamente errores de integridad referencial
            String errorMsg = e.getMessage();
            if (errorMsg != null && (
                errorMsg.contains("FK1EWTJY575YSLRYMKGSV8955YH") || 
                errorMsg.contains("DETALLES_FACTURA") || 
                errorMsg.contains("constraint violation") || 
                errorMsg.contains("integrity constraint"))) {
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "No se puede eliminar este perfume porque está asociado a facturas existentes. Debe eliminar primero las facturas relacionadas.");
                errorResponse.put("error", "INTEGRITY_CONSTRAINT_VIOLATION");
                errorResponse.put("errorCode", "FK1EWTJY575YSLRYMKGSV8955YH");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            }
            
            return ResponseEntity.status(500).body("Error al eliminar el perfume: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/simple-update")
    public ResponseEntity<?> simpleUpdatePerfume(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> datos) {
        try {
            System.out.println("Actualizando perfume (simple) con ID: " + id);
            System.out.println("Datos recibidos: " + datos);
            
            // Verificar que el perfume existe
            Optional<Perfume> perfumeOpt = perfumeService.findById(id);
            if (!perfumeOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Perfume perfumeExistente = perfumeOpt.get();
            
            // Actualizar nombre si se proporciona
            if (datos.containsKey("nombre")) {
                String nuevoNombre = (String) datos.get("nombre");
                if (nuevoNombre != null && !nuevoNombre.trim().isEmpty()) {
                    perfumeExistente.setNombre(nuevoNombre.trim());
                }
            }
            
            // Actualizar descripción si se proporciona
            if (datos.containsKey("descripcion")) {
                String nuevaDescripcion = (String) datos.get("descripcion");
                perfumeExistente.setDescripcion(nuevaDescripcion);
            }
            
            // Actualizar precio si se proporciona
            if (datos.containsKey("precio")) {
                try {
                    Double nuevoPrecio = Double.parseDouble(datos.get("precio").toString());
                    if (nuevoPrecio > 0) {
                        perfumeExistente.setPrecio(nuevoPrecio);
                    }
                } catch (NumberFormatException e) {
                    System.err.println("Error al parsear precio: " + e.getMessage());
                }
            }
            
            // Actualizar imagen si se proporciona
            if (datos.containsKey("imagen")) {
                String nuevaImagen = (String) datos.get("imagen");
                perfumeExistente.setImagen(nuevaImagen);
            }
            
            // Guardar las actualizaciones
            Perfume perfumeActualizado = perfumeService.save(perfumeExistente);
            
            // Construir respuesta simplificada
            Map<String, Object> response = new HashMap<>();
            response.put("id", perfumeActualizado.getId());
            response.put("nombre", perfumeActualizado.getNombre());
            response.put("descripcion", perfumeActualizado.getDescripcion());
            response.put("precio", perfumeActualizado.getPrecio());
            response.put("mensaje", "Perfume actualizado con éxito");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error al actualizar perfume (simple): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al actualizar el perfume: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/safe-update")
    public ResponseEntity<?> safeUpdatePerfume(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            System.out.println("Actualizando perfume (safe) con ID: " + id);
            
            // Verificar que el perfume existe
            Optional<Perfume> perfumeOpt = perfumeService.findById(id);
            if (!perfumeOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Perfume perfumeExistente = perfumeOpt.get();
            
            // Actualizar propiedades simples
            if (datos.containsKey("nombre")) {
                String nuevoNombre = (String) datos.get("nombre");
                if (nuevoNombre != null && !nuevoNombre.trim().isEmpty()) {
                    perfumeExistente.setNombre(nuevoNombre.trim());
                }
            }
            
            if (datos.containsKey("descripcion")) {
                String nuevaDescripcion = (String) datos.get("descripcion");
                perfumeExistente.setDescripcion(nuevaDescripcion);
            }
            
            if (datos.containsKey("precio")) {
                try {
                    Double nuevoPrecio = Double.parseDouble(datos.get("precio").toString());
                    if (nuevoPrecio > 0) {
                        perfumeExistente.setPrecio(nuevoPrecio);
                    }
                } catch (NumberFormatException e) {
                    System.err.println("Error al parsear precio: " + e.getMessage());
                }
            }
            
            if (datos.containsKey("imagen")) {
                String nuevaImagen = (String) datos.get("imagen");
                perfumeExistente.setImagen(nuevaImagen);
            }
            
            // Manejar categorías con seguridad
            if (datos.containsKey("categorias")) {
                try {
                    List<Map<String, Object>> categoriasMap = (List<Map<String, Object>>) datos.get("categorias");
                    if (categoriasMap != null) {
                        // Crear la lista de categorías con las IDs recibidas
                        List<Long> categoriasIds = categoriasMap.stream()
                                .filter(cat -> cat.containsKey("id"))
                                .map(cat -> {
                                    Object id0 = cat.get("id");
                                    if (id0 instanceof Integer) {
                                        return ((Integer) id0).longValue();
                                    } else if (id0 instanceof Long) {
                                        return (Long) id0;
                                    } else if (id0 instanceof String) {
                                        return Long.parseLong((String) id0);
                                    }
                                    return null;
                                })
                                .filter(id0 -> id0 != null)
                                .collect(Collectors.toList());
                
                        // Actualizar las categorías del perfume
                        perfumeService.actualizarCategorias(perfumeExistente, categoriasIds);
                    }
                } catch (Exception e) {
                    System.err.println("Error al procesar categorías: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Manejar notas olfativas con seguridad
            if (datos.containsKey("notasOlfativas")) {
                try {
                    List<Map<String, Object>> notasMap = (List<Map<String, Object>>) datos.get("notasOlfativas");
                    if (notasMap != null) {
                        // Crear la lista de notas con las IDs recibidas
                        List<Long> notasIds = notasMap.stream()
                                .filter(nota -> nota.containsKey("id"))
                                .map(nota -> {
                                    Object id0 = nota.get("id");
                                    if (id0 instanceof Integer) {
                                        return ((Integer) id0).longValue();
                                    } else if (id0 instanceof Long) {
                                        return (Long) id0;
                                    } else if (id0 instanceof String) {
                                        return Long.parseLong((String) id0);
                                    }
                                    return null;
                                })
                                .filter(id0 -> id0 != null)
                                .collect(Collectors.toList());
                
                        // Actualizar las notas olfativas del perfume
                        perfumeService.actualizarNotasOlfativas(perfumeExistente, notasIds);
                    }
                } catch (Exception e) {
                    System.err.println("Error al procesar notas olfativas: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Guardar los cambios
            Perfume perfumeActualizado = perfumeService.save(perfumeExistente);
            
            // Construir respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("id", perfumeActualizado.getId());
            response.put("nombre", perfumeActualizado.getNombre());
            response.put("descripcion", perfumeActualizado.getDescripcion());
            response.put("precio", perfumeActualizado.getPrecio());
            response.put("imagen", perfumeActualizado.getImagen());
            response.put("mensaje", "Perfume actualizado con éxito");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error al actualizar perfume (safe): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al actualizar el perfume: " + e.getMessage());
        }
    }

    private PerfumeDTO convertToDTO(Perfume perfume) {
        return new PerfumeDTO(
            perfume.getId(),
            perfume.getNombre(),
            perfume.getPrecio(),
            perfume.getDescripcion(),
            perfume.getImagen(),
            perfume.getCategorias().stream().map(c -> c.getNombre()).collect(Collectors.toList()),
            perfume.getNotasOlfativas().stream().map(n -> n.getNombre()).collect(Collectors.toList())
        );
    }

    private Perfume convertToEntity(PerfumeDTO dto) {
        Perfume perfume = new Perfume();
        perfume.setNombre(dto.getNombre());
        perfume.setPrecio(dto.getPrecio());
        perfume.setDescripcion(dto.getDescripcion());
        perfume.setImagen(dto.getImagen());
        return perfume;
    }
} 