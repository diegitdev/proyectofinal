package com.example.proyectofinal.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.proyectofinal.model.NotaOlfativa;
import com.example.proyectofinal.model.PerfumePersonalizado;
import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.repository.NotaOlfativaRepository;
import com.example.proyectofinal.repository.UsuarioRepository;
import com.example.proyectofinal.service.PerfumePersonalizadoService;

@RestController
@RequestMapping("/api/perfumes-personalizados")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                        "http://localhost:5179", "http://localhost:5180"}, 
             allowCredentials = "true")
public class PerfumePersonalizadoController {

    @Autowired
    private PerfumePersonalizadoService perfumePersonalizadoService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private NotaOlfativaRepository notaOlfativaRepository;

    @GetMapping
    public ResponseEntity<List<PerfumePersonalizado>> getAllPerfumesPersonalizados() {
        try {
            List<PerfumePersonalizado> perfumes = perfumePersonalizadoService.findAll();
            if (perfumes == null) {
                perfumes = new ArrayList<>();
            }
            return ResponseEntity.ok(perfumes);
        } catch (Exception e) {
            System.err.println("Error al obtener todos los perfumes personalizados: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfumePersonalizado> getPerfumePersonalizadoById(@PathVariable Long id) {
        try {
            return perfumePersonalizadoService.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error al obtener perfume personalizado por ID: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PerfumePersonalizado>> getPerfumesPersonalizadosByUsuario(@PathVariable Long usuarioId) {
        try {
            List<PerfumePersonalizado> perfumes = perfumePersonalizadoService.findByUsuarioId(usuarioId);
            if (perfumes == null) {
                perfumes = new ArrayList<>();
            }
            return ResponseEntity.ok(perfumes);
        } catch (Exception e) {
            System.err.println("Error al obtener perfumes personalizados por usuario: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/aprobados")
    public ResponseEntity<List<PerfumePersonalizado>> getPerfumesPersonalizadosAprobados() {
        try {
            List<PerfumePersonalizado> perfumes = perfumePersonalizadoService.findByAprobado(true);
            if (perfumes == null) {
                perfumes = new ArrayList<>();
            }
            return ResponseEntity.ok(perfumes);
        } catch (Exception e) {
            System.err.println("Error al obtener perfumes personalizados aprobados: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createPerfumePersonalizadoJson(@RequestBody Map<String, Object> perfumeData) {
        try {
            System.out.println("Recibiendo solicitud JSON para crear perfume personalizado: " + perfumeData);
            
            // 1. Validar datos básicos
            String nombre = (String) perfumeData.get("nombre");
            String descripcion = (String) perfumeData.get("descripcion");
            
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre del perfume es obligatorio");
            }
            
            // 2. Crear nuevo perfume personalizado
            PerfumePersonalizado perfumePersonalizado = new PerfumePersonalizado();
            perfumePersonalizado.setNombre(nombre.trim());
            perfumePersonalizado.setFechaCreacion(LocalDateTime.now());
            perfumePersonalizado.setAprobado(false);
            
            // Establecer descripción si existe
            if (descripcion != null) {
                perfumePersonalizado.setDescripcion(descripcion.trim());
            }
            
            // 3. Obtener y verificar usuario
            try {
                Map<String, Object> usuarioMap = (Map<String, Object>) perfumeData.get("usuario");
                if (usuarioMap == null || usuarioMap.get("id") == null) {
                    return ResponseEntity.badRequest().body("Usuario no especificado");
                }
                
                Long usuarioId = Long.valueOf(usuarioMap.get("id").toString());
                Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));
                
                perfumePersonalizado.setUsuario(usuario);
            } catch (Exception e) {
                System.err.println("Error al procesar usuario: " + e.getMessage());
                return ResponseEntity.badRequest().body("Error al procesar el usuario: " + e.getMessage());
            }
            
            // 4. Procesar notas olfativas
            try {
                List<Map<String, Object>> notasData = (List<Map<String, Object>>) perfumeData.get("notas");
                
                if (notasData == null || notasData.isEmpty()) {
                    return ResponseEntity.badRequest().body("Debe seleccionar al menos una nota olfativa");
                }
                
                List<NotaOlfativa> notas = new ArrayList<>();
                
                for (Map<String, Object> notaData : notasData) {
                    if (notaData == null || notaData.get("id") == null) {
                        continue;
                    }
                    
                    Long notaId = Long.valueOf(notaData.get("id").toString());
                    NotaOlfativa nota = notaOlfativaRepository.findById(notaId)
                        .orElse(null);
                    
                    if (nota != null) {
                        notas.add(nota);
                    }
                }
                
                if (notas.isEmpty()) {
                    return ResponseEntity.badRequest().body("No se encontraron notas olfativas válidas");
                }
                
                perfumePersonalizado.setNotas(notas);
            } catch (Exception e) {
                System.err.println("Error al procesar notas olfativas: " + e.getMessage());
                return ResponseEntity.badRequest().body("Error al procesar las notas olfativas: " + e.getMessage());
            }
            
            // 5. Procesar URL de imagen si existe
            if (perfumeData.containsKey("imagenUrl")) {
                String imagenUrl = (String) perfumeData.get("imagenUrl");
                if (imagenUrl != null && !imagenUrl.trim().isEmpty()) {
                    perfumePersonalizado.setImagenUrl(imagenUrl.trim());
                } else {
                    perfumePersonalizado.setImagenUrl("https://via.placeholder.com/300?text=Perfume+Personalizado");
                }
            } else {
                perfumePersonalizado.setImagenUrl("https://via.placeholder.com/300?text=Perfume+Personalizado");
            }
            
            // 6. Calcular precio basado en el número de notas
            double precioBase = 50.0;
            precioBase += perfumePersonalizado.getNotas().size() * 10.0;
            perfumePersonalizado.setPrecio(precioBase);
            
            // 7. Guardar el perfume personalizado
            try {
                PerfumePersonalizado savedPerfume = perfumePersonalizadoService.save(perfumePersonalizado);
                
                // 8. Construir respuesta simplificada
                Map<String, Object> response = new HashMap<>();
                response.put("id", savedPerfume.getId());
                response.put("nombre", savedPerfume.getNombre());
                response.put("precio", savedPerfume.getPrecio());
                response.put("fechaCreacion", savedPerfume.getFechaCreacion());
                response.put("aprobado", savedPerfume.isAprobado());
                response.put("mensaje", "Perfume personalizado creado con éxito");
                
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                System.err.println("Error al guardar perfume personalizado: " + e.getMessage());
                return ResponseEntity.status(500).body("Error al guardar el perfume: " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("Error general al crear perfume personalizado: " + e.getMessage());
            return ResponseEntity.status(500).body("Error interno del servidor: " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPerfumePersonalizadoMultipart(
            @RequestParam(value = "nombre", required = true) String nombre,
            @RequestParam(value = "descripcion", required = false, defaultValue = "") String descripcion,
            @RequestParam(value = "usuarioId", required = true) Long usuarioId,
            @RequestParam(value = "notasIds", required = true) List<Long> notasIds,
            @RequestParam(value = "imagenUrl", required = false) String imagenUrl) {
        try {
            System.out.println("==== Inicio de procesamiento de creación de perfume personalizado (multipart) ====");
            System.out.println("Parámetros recibidos:");
            System.out.println("- nombre: " + (nombre != null ? nombre : "NULL"));
            System.out.println("- descripcion: " + (descripcion != null ? descripcion : "NULL"));
            System.out.println("- usuarioId: " + usuarioId);
            System.out.println("- notasIds size: " + (notasIds != null ? notasIds.size() : "NULL"));
            System.out.println("- notasIds: " + (notasIds != null ? notasIds.toString() : "NULL"));
            System.out.println("- imagenUrl: " + (imagenUrl != null ? imagenUrl : "No incluida"));
            
            // 1. Validar datos básicos
            if (nombre == null || nombre.trim().isEmpty()) {
                System.out.println("Error: Nombre vacío o nulo");
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "El nombre del perfume es obligatorio",
                    "status", 400,
                    "error", "Parámetro 'nombre' vacío o nulo"
                ));
            }
            
            // 2. Crear nuevo perfume personalizado
            PerfumePersonalizado perfumePersonalizado = new PerfumePersonalizado();
            perfumePersonalizado.setNombre(nombre.trim());
            perfumePersonalizado.setDescripcion(descripcion != null ? descripcion.trim() : "");
            perfumePersonalizado.setFechaCreacion(LocalDateTime.now());
            perfumePersonalizado.setAprobado(false);
            
            // 3. Obtener y verificar usuario
            try {
                System.out.println("Buscando usuario con ID: " + usuarioId);
                Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
                
                if (!usuarioOpt.isPresent()) {
                    System.out.println("Error: Usuario no encontrado con ID: " + usuarioId);
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "Usuario no encontrado con ID: " + usuarioId,
                        "status", 400,
                        "error", "Usuario no encontrado"
                    ));
                }
                
                perfumePersonalizado.setUsuario(usuarioOpt.get());
                System.out.println("Usuario asignado correctamente: " + usuarioOpt.get().getNombre());
            } catch (Exception e) {
                System.err.println("Error al procesar usuario: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Error al procesar el usuario: " + e.getMessage(),
                    "status", 400,
                    "error", "Error procesando usuario"
                ));
            }
            
            // 4. Procesar notas olfativas
            try {
                if (notasIds == null || notasIds.isEmpty()) {
                    System.out.println("Error: No se proporcionaron notas olfativas");
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "Debe seleccionar al menos una nota olfativa",
                        "status", 400,
                        "error", "Notas olfativas no proporcionadas"
                    ));
                }
                
                List<NotaOlfativa> notas = new ArrayList<>();
                System.out.println("Procesando " + notasIds.size() + " notas olfativas");
                
                for (Long notaId : notasIds) {
                    System.out.println("Buscando nota con ID: " + notaId);
                    Optional<NotaOlfativa> notaOpt = notaOlfativaRepository.findById(notaId);
                    
                    if (notaOpt.isPresent()) {
                        notas.add(notaOpt.get());
                        System.out.println("Nota añadida: " + notaOpt.get().getNombre());
                    } else {
                        System.out.println("Nota no encontrada con ID: " + notaId);
                    }
                }
                
                if (notas.isEmpty()) {
                    System.out.println("Error: No se encontraron notas olfativas válidas");
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "No se encontraron notas olfativas válidas",
                        "status", 400,
                        "error", "Notas olfativas inválidas"
                    ));
                }
                
                perfumePersonalizado.setNotas(notas);
                System.out.println("Añadidas " + notas.size() + " notas al perfume");
            } catch (Exception e) {
                System.err.println("Error al procesar notas olfativas: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Error al procesar las notas olfativas: " + e.getMessage(),
                    "status", 400,
                    "error", "Error procesando notas olfativas"
                ));
            }
            
            // 5. Procesar URL de imagen si existe
            if (imagenUrl != null && !imagenUrl.trim().isEmpty()) {
                System.out.println("Guardando URL de imagen externa: " + imagenUrl);
                perfumePersonalizado.setImagenUrl(imagenUrl.trim());
            } else {
                System.out.println("No se proporcionó URL de imagen");
                // Asignar imagen por defecto de placeholder.com con tamaño 300x300 si no hay URL
                perfumePersonalizado.setImagenUrl("https://via.placeholder.com/300?text=Perfume+Personalizado");
            }
            
            // 6. Calcular precio basado en el número de notas
            double precioBase = 50.0;
            precioBase += perfumePersonalizado.getNotas().size() * 10.0;
            perfumePersonalizado.setPrecio(precioBase);
            System.out.println("Precio calculado: " + precioBase + " euros");
            
            // 7. Guardar el perfume personalizado
            try {
                System.out.println("Guardando perfume personalizado en la base de datos...");
                PerfumePersonalizado savedPerfume = perfumePersonalizadoService.save(perfumePersonalizado);
                System.out.println("Perfume guardado con éxito. ID asignado: " + savedPerfume.getId());
                
                // 8. Construir respuesta simplificada
                Map<String, Object> response = new HashMap<>();
                response.put("id", savedPerfume.getId());
                response.put("nombre", savedPerfume.getNombre());
                response.put("precio", savedPerfume.getPrecio());
                response.put("fechaCreacion", savedPerfume.getFechaCreacion());
                response.put("aprobado", savedPerfume.isAprobado());
                response.put("mensaje", "Perfume personalizado creado con éxito");
                response.put("status", 200);
                response.put("imagenUrl", savedPerfume.getImagenUrl());
                
                System.out.println("==== Fin de procesamiento de creación de perfume personalizado (multipart) ====");
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                System.err.println("Error al guardar perfume personalizado: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of(
                    "message", "Error al guardar el perfume: " + e.getMessage(),
                    "status", 500,
                    "error", "Error guardando perfume"
                ));
            }
        } catch (Exception e) {
            System.err.println("Error general al crear perfume personalizado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "message", "Error interno del servidor: " + e.getMessage(),
                "status", 500,
                "error", "Error general"
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePerfumePersonalizado(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            System.out.println("========== INICIO ACTUALIZACIÓN PERFUME PERSONALIZADO ==========");
            System.out.println("Actualizando perfume personalizado con ID: " + id);
            System.out.println("Datos recibidos: " + datos);
            
            // Verificar que el perfume existe
            Optional<PerfumePersonalizado> perfumeOpt = perfumePersonalizadoService.findById(id);
            if (!perfumeOpt.isPresent()) {
                System.out.println("Error: Perfume no encontrado con ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            PerfumePersonalizado perfumeExistente = perfumeOpt.get();
            System.out.println("Perfume existente encontrado: " + perfumeExistente.getNombre());
            
            // Actualizar nombre si se proporciona
            if (datos.containsKey("nombre")) {
                String nombre = (String) datos.get("nombre");
                if (nombre != null && !nombre.trim().isEmpty()) {
                    System.out.println("Actualizando nombre de '" + perfumeExistente.getNombre() + "' a '" + nombre.trim() + "'");
                    perfumeExistente.setNombre(nombre.trim());
                }
            }
            
            // Actualizar descripción si se proporciona
            if (datos.containsKey("descripcion")) {
                String descripcion = (String) datos.get("descripcion");
                System.out.println("Actualizando descripción a: " + (descripcion != null ? descripcion : "vacío"));
                perfumeExistente.setDescripcion(descripcion != null ? descripcion.trim() : "");
            }
            
            // Procesar las notas olfativas si están presentes
            if (datos.containsKey("notasIds")) {
                try {
                    List<Long> notasIds = new ArrayList<>();
                    Object notasIdsObj = datos.get("notasIds");
                    
                    if (notasIdsObj instanceof List) {
                        List<?> lista = (List<?>) notasIdsObj;
                        System.out.println("Recibida lista de notasIds con " + lista.size() + " elementos");
                        
                        for (Object item : lista) {
                            if (item instanceof Number) {
                                notasIds.add(((Number) item).longValue());
                            } else if (item instanceof String) {
                                notasIds.add(Long.parseLong((String) item));
                            } else {
                                System.out.println("Ignorando elemento no reconocido en notasIds: " + item);
                            }
                        }
                    }
                    
                    if (!notasIds.isEmpty()) {
                        System.out.println("Procesando " + notasIds.size() + " notas olfativas");
                        List<NotaOlfativa> nuevasNotas = new ArrayList<>();
                        
                        for (Long notaId : notasIds) {
                            System.out.println("Buscando nota con ID: " + notaId);
                            Optional<NotaOlfativa> notaOpt = notaOlfativaRepository.findById(notaId);
                            
                            if (notaOpt.isPresent()) {
                                nuevasNotas.add(notaOpt.get());
                                System.out.println("Nota añadida: " + notaOpt.get().getNombre());
                            } else {
                                System.out.println("Nota no encontrada con ID: " + notaId);
                            }
                        }
                        
                        // Sólo establecer notas si se encontraron válidas
                        if (!nuevasNotas.isEmpty()) {
                            System.out.println("Estableciendo " + nuevasNotas.size() + " notas al perfume");
                            perfumeExistente.setNotas(nuevasNotas);
                            
                            // Actualizar precio basado en número de notas
                            double precioBase = 50.0;
                            precioBase += nuevasNotas.size() * 10.0;
                            perfumeExistente.setPrecio(precioBase);
                            System.out.println("Precio actualizado: " + precioBase);
                        } else {
                            System.out.println("No se encontraron notas válidas entre las proporcionadas");
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error al procesar notasIds: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Actualizar URL de imagen si el parámetro está presente
            if (datos.containsKey("imagenUrl")) {
                String imagenUrl = (String) datos.get("imagenUrl");
                
                if (imagenUrl == null || imagenUrl.trim().isEmpty()) {
                    // Si se proporciona una cadena vacía, asignar imagen por defecto
                    System.out.println("Se recibió URL de imagen vacía, asignando imagen por defecto");
                    perfumeExistente.setImagenUrl("https://via.placeholder.com/300?text=Perfume+Personalizado");
                } else {
                    // Si se proporciona una URL, guardarla
                    System.out.println("Actualizando URL de imagen a: " + imagenUrl.trim());
                    perfumeExistente.setImagenUrl(imagenUrl.trim());
                }
            } else {
                System.out.println("No se ha modificado la imagen, manteniendo URL actual: " + 
                                  (perfumeExistente.getImagenUrl() != null ? perfumeExistente.getImagenUrl() : "NULL"));
            }
            
            // Guardar los cambios usando saveAndFlush para garantizar la persistencia inmediata
            System.out.println("Guardando cambios en la base de datos con saveAndFlush()...");
            PerfumePersonalizado resultado = perfumePersonalizadoService.save(perfumeExistente);
            
            if (resultado == null) {
                System.err.println("Error: El servicio devolvió null después de la actualización");
                return ResponseEntity.status(500).body(Map.of(
                    "message", "Error al actualizar el perfume: No se pudo completar la operación",
                    "status", 500,
                    "error", "Error actualizando perfume"
                ));
            }
            
            System.out.println("Perfume actualizado correctamente con ID: " + resultado.getId());
            
            // Construir respuesta completa
            Map<String, Object> response = new HashMap<>();
            response.put("id", resultado.getId());
            response.put("nombre", resultado.getNombre());
            response.put("descripcion", resultado.getDescripcion());
            response.put("precio", resultado.getPrecio());
            response.put("imagenUrl", resultado.getImagenUrl());
            response.put("notas", resultado.getNotas().stream().map(nota -> Map.of(
                "id", nota.getId(),
                "nombre", nota.getNombre()
            )).collect(Collectors.toList()));
            response.put("mensaje", "Perfume actualizado con éxito");
            
            System.out.println("========== FIN ACTUALIZACIÓN PERFUME PERSONALIZADO ==========");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error al actualizar perfume personalizado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "message", "Error al actualizar el perfume: " + e.getMessage(),
                "status", 500,
                "error", "Error actualizando perfume"
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePerfumePersonalizado(@PathVariable Long id) {
        try {
            perfumePersonalizadoService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error al eliminar perfume personalizado: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error al eliminar el perfume personalizado: " + e.getMessage());
        }
    }
}